import { createClient } from "@/lib/supabase/server";
import { timeAgo } from "@/lib/utils";

const PRODUCT_SELECT =
  "id, title, slug, price, status, views, created_at, deleted_at, expires_at, " +
  "category:categories(name), seller:profiles!products_seller_id_fkey(full_name, username, shop_name), " +
  "images:product_images(url, is_primary)";

function shortDate(value) {
  return value ? String(value).slice(0, 10) : "-";
}

function toRow(row) {
  const images = (row.images || []).slice().sort((a, b) => (b.is_primary ? 1 : 0) - (a.is_primary ? 1 : 0));
  const seller = row.seller || {};

  return {
    id: row.id,
    name: row.title,
    slug: row.slug,
    category: row.category?.name || "-",
    price: Number(row.price) || 0,
    seller: seller.shop_name || seller.full_name || seller.username || "-",
    image: images[0]?.url || "",
    date: shortDate(row.created_at),
    timeAgo: timeAgo(row.created_at),
    status: row.status,
    deletedDate: shortDate(row.deleted_at),
    expiredDate: shortDate(row.expires_at),
  };
}

async function selectStatus(status) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .eq("status", status)
    .order("created_at", { ascending: false })
    .limit(200);

  if (error) return [];
  return (data || []).map(toRow);
}

// Pembeli produk 'sold' diambil dari baris order_items -> orders -> profiles.
async function withBuyers(rows) {
  if (!rows.length) return rows;
  const supabase = await createClient();
  const { data: items, error } = await supabase
    .from("order_items")
    .select(
      "product_id, quantity, order:orders(created_at, payment_status, buyer:profiles!orders_buyer_id_fkey(full_name, username))"
    )
    .in(
      "product_id",
      rows.map((r) => r.id)
    );

  if (error || !items) return rows.map((r) => ({ ...r, buyer: "-", soldDate: "-" }));

  const latest = {};
  for (const item of items) {
    const soldDate = item.order?.created_at;
    const current = latest[item.product_id];
    if (!current || (soldDate && soldDate > current.order?.created_at)) latest[item.product_id] = item;
  }

  return rows.map((r) => {
    const buyer = latest[r.id]?.order?.buyer;
    return {
      ...r,
      buyer: buyer?.full_name || buyer?.username || "-",
      soldDate: shortDate(latest[r.id]?.order?.created_at),
    };
  });
}

export async function getDraftProductsAdmin() {
  return selectStatus("draft");
}

export async function getPendingProductsAdmin() {
  return selectStatus("pending");
}

export async function getHiddenProductsAdmin() {
  return selectStatus("hidden");
}

export async function getExpiredProductsAdmin() {
  return selectStatus("expired");
}

export async function getDeletedProductsAdmin() {
  return selectStatus("deleted");
}

export async function getSoldProductsAdmin() {
  return withBuyers(await selectStatus("sold"));
}
