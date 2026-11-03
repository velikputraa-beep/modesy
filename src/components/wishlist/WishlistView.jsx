"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Heart, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/home/ProductCard";
import { clearWishlistAction } from "@/app/wishlist/actions";

export function WishlistView({ initialItems = [] }) {
  const [wishlistItems, setWishlistItems] = useState(initialItems);
  const [clearing, setClearing] = useState(false);
  const router = useRouter();

  const handleClear = async () => {
    setClearing(true);
    const res = await clearWishlistAction();
    if (!res?.error) {
      setWishlistItems([]);
      router.refresh();
    }
    setClearing(false);
  };

  if (wishlistItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
        <div className="size-20 rounded-full bg-red-50 text-red-500 flex items-center justify-center mb-5">
          <Heart className="size-10" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Wishlist kamu masih kosong
        </h2>
        <p className="text-gray-500 max-w-sm mb-6 text-sm">
          Simpan produk-produk favoritmu di sini agar mudah ditemukan dan dibeli
          nanti!
        </p>
        <Button asChild className="bg-teal-600 hover:bg-teal-700 text-white font-semibold px-6 py-2.5 rounded-lg shadow-sm cursor-pointer">
          <Link href="/products">
            Mulai Belanja
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <span className="text-sm font-semibold text-gray-500">
          Menampilkan {wishlistItems.length} produk tersimpan
        </span>

        <Button
          variant="outline"
          size="sm"
          onClick={handleClear}
          disabled={clearing}
          className="text-xs text-red-600 hover:bg-red-50 hover:text-red-700 border-gray-200"
        >
          Kosongkan Wishlist
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {wishlistItems.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
