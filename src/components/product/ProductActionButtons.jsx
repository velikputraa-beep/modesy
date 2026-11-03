"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MessageCircle, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast-context";

export function ProductActionButtons({ product }) {
  const router = useRouter();
  const { toast } = useToast();
  const [isWishlisted, setIsWishlisted] = useState(false);

  const toggleWishlist = () => {
    setIsWishlisted((prev) => {
      const next = !prev;
      toast(next ? `"${product?.title || "Produk"}" ditambahkan ke wishlist` : `"${product?.title || "Produk"}" dihapus dari wishlist`);
      return next;
    });
  };

  const handleContactSeller = () => {
    router.push("/messages");
  };

  return (
    <div className="flex items-center gap-3 w-full">
      <Button
        type="button"
        onClick={handleContactSeller}
        className="flex-1 h-12 bg-teal-600 hover:bg-teal-700 text-white font-semibold text-base shadow-sm gap-2 rounded-lg transition-all cursor-pointer"
      >
        <MessageCircle className="size-5" />
        <span>Hubungi Seller</span>
      </Button>

      <Button
        type="button"
        variant="outline"
        onClick={toggleWishlist}
        aria-label="Tambah ke wishlist"
        className={`size-12 rounded-lg border transition-all shrink-0 cursor-pointer ${
          isWishlisted
            ? "border-red-300 bg-red-50 text-red-500 hover:bg-red-100 hover:text-red-600"
            : "border-gray-300 text-gray-700 hover:bg-gray-100 hover:text-teal-600"
        }`}
      >
        <Heart
          className={`size-5 ${isWishlisted ? "fill-red-500 text-red-500" : ""}`}
        />
      </Button>
    </div>
  );
}
