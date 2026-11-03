import Link from "next/link";
import { getProductBySlug, getRelatedProducts } from "@/lib/queries/products";
import { getProductReviews, getProductComments } from "@/lib/queries/reviews";
import { formatPriceIDR } from "@/lib/utils";
import { TopBar } from "@/components/layout/TopBar";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ProductGallery } from "@/components/product/ProductGallery";
import { ProductTabs } from "@/components/product/ProductTabs";
import { FavoriteButton } from "@/components/product/FavoriteButton";
import { ContactSellerButton } from "@/components/product/ContactSellerButton";
import { BuyButton } from "@/components/product/BuyButton";
import { AddToCartButton } from "@/components/product/AddToCartButton";
import { ProductShareAndWhatsApp } from "@/components/product/ProductShareAndWhatsApp";
import { ProductCard } from "@/components/home/ProductCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/mock-auth";
import { isFavorite } from "@/lib/queries/favorites";
import { PageEntrance } from "@/components/common/PageEntrance";
import {
  MapPin,
  Clock,
  Star,
  ChevronRight,
  ShieldCheck,
  AlertCircle,
  Store,
} from "lucide-react";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    return {
      title: "Produk Tidak Ditemukan - Modesy",
    };
  }

  return {
    title: `${product.title} - Modesy`,
    description: `Beli ${product.title} seharga ${formatPriceIDR(product.price)} di Modesy Marketplace.`,
  };
}

export default async function ProductDetailPage({ params }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  const user = await getCurrentUser();
  const favorited = user && product ? await isFavorite(user.id, product.id) : false;

  // Jika produk tidak ditemukan
  if (!product) {
    return (
      <div className="flex min-h-screen flex-col bg-white">
        <TopBar />
        <Navbar />
        <main className="flex-1 flex flex-col items-center justify-center py-20 px-4 text-center">
          <div className="size-16 rounded-full bg-red-50 text-red-500 flex items-center justify-center mb-4">
            <AlertCircle className="size-8" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            Produk Tidak Ditemukan
          </h1>
          <p className="text-gray-500 max-w-md mb-6 text-sm">
            Maaf, produk dengan slug &quot;{slug}&quot; tidak dapat ditemukan atau
            sudah dihapus oleh penjual.
          </p>
          <Button asChild className="bg-teal-600 hover:bg-teal-700 text-white font-medium px-6 py-2">
            <Link href="/">
              Kembali ke Beranda
            </Link>
          </Button>
        </main>
        <Footer />
      </div>
    );
  }

  const relatedProducts = await getRelatedProducts(product.categorySlug, product.slug);
  const [productReviews, productComments] = await Promise.all([
    getProductReviews(product.id),
    getProductComments(product.id),
  ]);
  const images =
    product.images && product.images.length > 0
      ? product.images
      : [product.image].filter(Boolean);

  return (
    <div className="flex min-h-screen flex-col bg-gray-50/50">
      {/* 1. TopBar & Navbar */}
      <TopBar />
      <Navbar />

      <main className="flex-1 py-6 sm:py-8">
        <PageEntrance className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <nav
            aria-label="Breadcrumb"
            className="mb-5 flex items-center gap-1.5 text-xs text-gray-500 sm:text-sm overflow-x-auto whitespace-nowrap"
          >
            <Link
              href="/"
              className="hover:text-teal-600 transition-colors shrink-0"
            >
              Beranda
            </Link>
            <ChevronRight className="size-3.5 text-gray-400 shrink-0" />
            <Link
              href={`/products?category=${encodeURIComponent(product.category)}`}
              className="text-gray-600 hover:text-teal-600 transition-colors shrink-0"
            >
              {product.category}
            </Link>
            <ChevronRight className="size-3.5 text-gray-400 shrink-0" />
            <span className="font-medium text-gray-900 truncate">
              {product.title}
            </span>
          </nav>

          {/* Section Atas: 2 Kolom (Desktop), 1 Kolom (Mobile) */}
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-10">
            {/* KIRI: Product Gallery (5 Kolom Desktop) */}
            <div className="lg:col-span-5">
              <ProductGallery images={images} title={product.title} />
            </div>

            {/* KANAN: Info Produk (7 Kolom Desktop) */}
            <div className="lg:col-span-7 flex flex-col">
              <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-xs flex-1 flex flex-col">
                {/* Badges: Kondisi & Featured */}
                <div className="flex items-center gap-2 mb-3">
                  <Badge
                    variant="condition"
                    className={
                      product.condition === "Baru"
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : "bg-amber-50 text-amber-700 border-amber-200"
                    }
                  >
                    {product.condition || "Baru"}
                  </Badge>

                  {product.isFeatured && (
                    <Badge variant="featured" className="bg-teal-600 text-white">
                      Featured
                    </Badge>
                  )}

                  <span className="text-xs text-gray-400 ml-auto flex items-center gap-1">
                    <Clock className="size-3.5" />
                    <span>{product.timeAgo || "2 hari lalu"}</span>
                  </span>
                </div>

                {/* Title Produk */}
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-950 leading-tight">
                  {product.title}
                </h1>

                {/* Rating & Lokasi Baris */}
                <div className="mt-3 flex flex-wrap items-center gap-4 text-xs sm:text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <Star className="size-4 fill-amber-400 text-amber-400" />
                    <span className="font-semibold text-gray-800">
                      {product.rating?.toFixed(1) || "5.0"}
                    </span>
                    <span className="text-gray-400">
                      ({product.reviewsCount || 0} Ulasan)
                    </span>
                  </div>

                  <span className="text-gray-300">•</span>

                  <div className="flex items-center gap-1.5 text-gray-600">
                    <MapPin className="size-4 text-teal-600" />
                    <span>{product.location}</span>
                  </div>
                </div>

                {/* Harga */}
                <div className="mt-5 pb-5 border-b border-gray-100 flex items-baseline gap-3">
                  <span className="text-3xl font-bold text-teal-600">
                    {formatPriceIDR(product.price)}
                  </span>
                  {product.originalPrice && (
                    <div className="flex items-center gap-2">
                      <span className="text-base text-gray-400 line-through">
                        {formatPriceIDR(product.originalPrice)}
                      </span>
                      {product.discountPercentage && (
                        <span className="text-xs font-bold text-red-500 bg-red-50 px-2 py-0.5 rounded-full">
                          -{product.discountPercentage}%
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Card Seller */}
                {(() => {
                  const sellerRawName =
                    product.seller?.name ||
                    (typeof product.seller === "string" ? product.seller : "Trendshop");
                  const sellerUsername =
                    product.seller?.username ||
                    (sellerRawName.toLowerCase().includes("trendshop")
                      ? "daniel-jones"
                      : sellerRawName.toLowerCase().includes("admin")
                      ? "admin"
                      : "daniel-jones");

                  return (
                    <div className="my-5 rounded-lg border border-gray-100 bg-gray-50/70 p-4 flex items-center justify-between gap-4">
                      <Link
                        href={`/profile/${sellerUsername}`}
                        className="flex items-center gap-3 min-w-0 group"
                      >
                        <img
                          src={
                            product.seller?.avatar ||
                            "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
                          }
                          alt={sellerRawName}
                          className="size-12 rounded-full object-cover border border-gray-200 shrink-0 group-hover:scale-105 transition-transform"
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <h4 className="text-sm font-bold text-gray-900 truncate group-hover:text-teal-600 group-hover:underline transition-colors">
                              {sellerRawName}
                            </h4>
                            {product.seller?.verified && (
                              <ShieldCheck
                                className="size-4 text-teal-600 shrink-0"
                                title="Verified Seller"
                              />
                            )}
                          </div>
                          <p className="text-xs text-gray-500">
                            {product.seller?.rating || "Verified Seller"}
                          </p>
                        </div>
                      </Link>

                      <Button
                        asChild
                        variant="outline"
                        size="sm"
                        className="shrink-0 border-gray-300 text-gray-700 hover:border-teal-600 hover:text-teal-600 cursor-pointer"
                      >
                        <Link href={`/profile/${sellerUsername}`}>
                          <Store className="size-3.5 mr-1" />
                          <span>Lihat Toko</span>
                        </Link>
                      </Button>
                    </div>
                  );
                })()}

                {/* Susunan tombol: Add to Cart, BuyButton, ContactSellerButton, FavoriteButton */}
                <div className="mt-auto pt-4 space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <AddToCartButton product={product} relatedProducts={relatedProducts} />
                    <BuyButton product={product} user={user} />
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex-1">
                      <ContactSellerButton product={product} user={user} />
                    </div>
                    <FavoriteButton
                      product={product}
                      user={user}
                      size="lg"
                      initialFavorited={favorited}
                    />
                  </div>

                  {/* WhatsApp and Social Media Share */}
                  <ProductShareAndWhatsApp product={product} />
                </div>
              </div>
            </div>
          </div>

          {/* Section Bawah (Full Width): Tab Deskripsi & Info Produk */}
          <div className="mt-10">
            <ProductTabs
              description={product.description}
              productInfo={product.productInfo}
              productId={product.id}
              initialReviews={productReviews}
              initialComments={productComments}
              currentUser={user}
            />
          </div>

          {/* Section Produk Serupa */}
          {relatedProducts.length > 0 && (
            <section className="mt-12 sm:mt-16">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-gray-900">
                    Produk Serupa
                  </h2>
                  <p className="mt-1 text-xs sm:text-sm text-gray-500">
                    Temukan produk lainnya dalam kategori {product.category}
                  </p>
                </div>
              </div>

              {/* Grid 4 Kolom Produk Serupa */}
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {relatedProducts.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            </section>
          )}
        </PageEntrance>
      </main>

      <Footer />
    </div>
  );
}
