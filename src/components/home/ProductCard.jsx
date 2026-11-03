"use client";

import { useState } from "react";
import Link from "next/link";
import { Heart, ShoppingCart, Star, MapPin } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatPriceIDR } from "@/lib/utils";

import { useCart } from "@/lib/cart-context";
import { useToast } from "@/components/ui/toast-context";

export function ProductCard({ product }) {
  const {
    slug,
    title,
    price,
    originalPrice,
    discountPercentage,
    seller,
    location,
    condition,
    rating = 5.0,
    reviewsCount = 0,
    wishlistCount = 0,
    isFeatured,
    image,
  } = product;

  const { addToCart } = useCart();
  const { toast } = useToast();
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [likes, setLikes] = useState(wishlistCount);

  const handleWishlistToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsWishlisted((prev) => {
      const next = !prev;
      setLikes((c) => (next ? c + 1 : c - 1));
      toast(next ? `"${title}" ditambahkan ke wishlist` : `"${title}" dihapus dari wishlist`);
      return next;
    });
  };

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, 1);
    toast.success(`"${title}" berhasil ditambahkan ke keranjang!`);
  };

  const productSlug = slug || product.id || "1";

  return (
    <Link
      href={`/products/${productSlug}`}
      className="group block h-full focus:outline-none"
    >
      <Card className="relative flex h-full flex-col overflow-hidden border border-gray-200 bg-white transition-all duration-300 hover:-translate-y-1 hover:border-gray-300 hover:shadow-xl cursor-pointer">
        {/* Container Gambar */}
        <div className="relative aspect-square w-full overflow-hidden bg-gray-100">
          {/* Badges di Atas Gambar */}
          <div className="absolute left-2.5 top-2.5 z-10 flex flex-col gap-1.5 items-start">
            {isFeatured && (
              <Badge variant="featured" className="bg-[#14B8A6]">
                Featured
              </Badge>
            )}
            {discountPercentage && (
              <Badge variant="discount">
                -{discountPercentage}%
              </Badge>
            )}
          </div>

          {/* Badge Kondisi di Kanan Atas */}
          {condition && (
            <div className="absolute right-2.5 top-2.5 z-10">
              <Badge
                variant="condition"
                className={
                  condition === "Baru"
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    : "bg-amber-50 text-amber-700 border border-amber-200"
                }
              >
                {condition}
              </Badge>
            </div>
          )}

          {/* Gambar Produk dengan placeholder saat URL kosong/rusak */}
          <img
            src={image || "/placeholder.svg"}
            alt={title}
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = "/placeholder.svg";
            }}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />

          {/* Action Overlay saat Hover (Wishlist & Cart dengan Slide-Up) */}
          <div className="absolute inset-0 flex items-center justify-center gap-2.5 bg-black/25 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            <button
              type="button"
              onClick={handleAddToCart}
              aria-label="Add to cart"
              className="transform translate-y-3 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 flex size-9 items-center justify-center rounded-full bg-white text-gray-800 shadow-md hover:bg-[#14B8A6] hover:text-white hover:scale-110 active:scale-95 cursor-pointer"
            >
              <ShoppingCart className="size-4" />
            </button>
            <button
              type="button"
              onClick={handleWishlistToggle}
              aria-label="Add to wishlist"
              className={`transform translate-y-3 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 delay-75 flex size-9 items-center justify-center rounded-full bg-white shadow-md hover:bg-[#14B8A6] hover:text-white hover:scale-110 active:scale-95 cursor-pointer ${
                isWishlisted ? "text-red-500 hover:text-red-500" : "text-gray-800"
              }`}
            >
              <Heart
                className={`size-4 ${
                  isWishlisted ? "fill-red-500 text-red-500 animate-heart-bounce" : ""
                }`}
              />
            </button>
          </div>
        </div>

        {/* Konten Card */}
        <div className="flex flex-1 flex-col p-4">
          {/* Penjual & Rating */}
          <div className="flex items-center justify-between text-xs text-gray-500 mb-1.5">
            <span className="font-medium text-gray-600 hover:text-[#14B8A6] transition-colors truncate max-w-[120px]">
              {seller?.name || "Modesy Seller"}
            </span>
            <div className="flex items-center gap-1">
              <div className="flex text-amber-400">
                <Star className="size-3.5 fill-amber-400 text-amber-400" />
              </div>
              <span className="font-semibold text-gray-700 text-xs">
                {rating?.toFixed(1)}
              </span>
              <span className="text-gray-400 text-[11px]">
                ({reviewsCount})
              </span>
            </div>
          </div>

          {/* Judul Produk */}
          <h3 className="text-sm font-semibold text-gray-900 group-hover:text-[#14B8A6] transition-colors line-clamp-2 leading-snug">
            {title}
          </h3>

          {/* Lokasi */}
          <div className="mt-2 flex items-center gap-1 text-xs text-gray-500">
            <MapPin className="size-3.5 shrink-0 text-gray-400" />
            <span className="truncate">{location}</span>
          </div>

          {/* Harga & Strikethrough di Bawah */}
          <div className="mt-auto pt-3 flex items-baseline justify-between border-t border-gray-100">
            <div className="flex flex-col">
              <span className="text-base font-bold text-[#14B8A6]">
                {typeof price === "number" && price < 1000
                  ? `$${price}`
                  : formatPriceIDR(price)}
              </span>
              {originalPrice && (
                <span className="text-xs text-gray-400 line-through">
                  {typeof originalPrice === "number" && originalPrice < 1000
                    ? `$${originalPrice}`
                    : formatPriceIDR(originalPrice)}
                </span>
              )}
            </div>

            {/* Suka/Wishlist counter */}
            <div
              className={`flex items-center gap-1 text-xs transition-colors ${
                isWishlisted ? "text-red-500 font-semibold" : "text-gray-400"
              }`}
            >
              <Heart
                className={`size-3.5 ${
                  isWishlisted ? "fill-red-500 text-red-500 animate-heart-bounce" : ""
                }`}
              />
              <span>{likes}</span>
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
}
