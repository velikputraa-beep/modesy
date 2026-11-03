import { createClient } from "@/lib/supabase/server";
import { timeAgo } from "@/lib/utils";

const PRODUCT_SELECT =
  "*, category:categories(*), seller:profiles(*), images:product_images(*), reviews:reviews(rating)";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function computeDiscount(price, oldPrice) {
  const oldNum = Number(oldPrice);
  const priceNum = Number(price);
  if (!oldNum || oldNum <= priceNum) return null;
  return Math.round(((oldNum - priceNum) / oldNum) * 100);
}

export function mapProduct(row) {
  const images = (row.images || [])
    .sort((a, b) => (b.is_primary ? 1 : 0) - (a.is_primary ? 1 : 0))
    .map((img) => img.url);
  const ratings = row.reviews || [];
  const ratingSum = ratings.reduce((acc, r) => acc + (r.rating || 0), 0);

  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    price: Number(row.price),
    originalPrice: row.old_price ? Number(row.old_price) : null,
    discountPercentage: computeDiscount(row.price, row.old_price),
    stock: row.stock ?? 0,
    category: row.category?.name || "",
    categorySlug: row.category?.slug || "",
    brand: row.brand || "",
    condition: row.condition === "new" ? "Baru" : "Bekas",
    location: row.location || "",
    status: row.status,
    views: row.views ?? 0,
    timeAgo: timeAgo(row.created_at),
    rating: ratings.length ? Math.round((ratingSum / ratings.length) * 10) / 10 : 0,
    reviewsCount: ratings.length,
    wishlistCount: 0,
    isFeatured: row.featured || false,
    image: images[0] || "",
    images,
    description: row.description || "",
    shortDescription: row.short_description || "",
    productInfo: [],
    seller: row.seller
      ? {
          name: row.seller.full_name || row.seller.username,
          username: row.seller.username,
          avatar: row.seller.avatar_url,
          phone: row.seller.phone || "",
          verified: row.seller.verified || false,
          rating: "Verified Seller",
        }
      : null,
    sellerId: row.seller_id,
    createdAt: row.created_at,
  };
}

export async function getProducts({
  category,
  search,
  sort,
  page = 1,
  limit = 12,
  sellerId,
  status = "published",
  featured,
} = {}) {
  const supabase = await createClient();

  let query = supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .order("created_at", { ascending: false });

  if (status) query = query.eq("status", status);
  if (sellerId) query = query.eq("seller_id", sellerId);
  if (featured) query = query.eq("featured", true);
  if (search) query = query.ilike("title", `%${search}%`);

  if (category) {
    const { data: cat } = await supabase
      .from("categories")
      .select("id")
      .eq("slug", category)
      .maybeSingle();
    if (cat) query = query.eq("category_id", cat.id);
  }

  if (sort === "price_asc") query = query.order("price", { ascending: true });
  if (sort === "price_desc") query = query.order("price", { ascending: false });

  const from = (page - 1) * limit;
  query = query.range(from, from + limit - 1);

  const { data, error } = await query;
  if (error) return [];
  return (data || []).map(mapProduct);
}

export async function getProductBySlug(slug) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .eq("slug", slug)
    .maybeSingle();

  if (error || !data) return null;
  return mapProduct(data);
}

// Dipakai alur "Beli Sekarang": /checkout menerima product_id dari query
// parameter, jadi barangnya dimuat server-side (harga & stok dari DB, bukan
// dari client) sebelum masuk ringkasan pesanan.
export async function getProductById(id) {
  if (!UUID_RE.test(String(id ?? ""))) return null;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .eq("id", id)
    .maybeSingle();

  if (error || !data) return null;
  return mapProduct(data);
}

// PostgREST tidak bisa membandingkan dua kolom, jadi produk ber-old_price diambil
// lalu disaring (old_price > price) di sisi server.
export async function getSpecialOffers({ limit = 8 } = {}) {
  const supabase = await createClient();
  const fetchSize = Math.min(Math.max(Number(limit) * 4, 20), 60);

  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .eq("status", "published")
    .not("old_price", "is", null)
    .order("created_at", { ascending: false })
    .limit(fetchSize);

  if (error) return [];

  return (data || [])
    .map(mapProduct)
    .filter((p) => p.discountPercentage && p.discountPercentage > 0)
    .slice(0, limit);
}

export async function getRelatedProducts(categorySlug, currentSlug, limit = 4) {
  const supabase = await createClient();

  let categoryId = null;
  if (categorySlug) {
    const { data: cat } = await supabase
      .from("categories")
      .select("id")
      .eq("slug", categorySlug)
      .maybeSingle();
    categoryId = cat?.id;
  }

  let query = supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .eq("status", "published")
    .neq("slug", currentSlug)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (categoryId) query = query.eq("category_id", categoryId);

  const { data, error } = await query;
  if (error) return [];
  return (data || []).map(mapProduct);
}
