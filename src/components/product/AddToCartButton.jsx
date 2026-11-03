"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ShoppingCart, X, Star, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart-context";
import { formatPriceIDR } from "@/lib/utils";

export function AddToCartButton({ product, relatedProducts = [], className = "" }) {
  const router = useRouter();
  const { addToCart, subtotal: currentSubtotal } = useCart();
  const [isOpen, setIsOpen] = useState(false);

  const productPrice =
    typeof product?.price === "number" ? product.price : parseFloat(product?.price) || 0;

  const productImage = product?.image || (product?.images && product.images[0]) || "";

  const handleAddToCart = () => {
    addToCart(product, 1);
    setIsOpen(true);
  };

  const cartSubtotal = Number(currentSubtotal) || productPrice;

  // Rekomendasi dari produk terkait yang sudah dibaca dari Supabase
  const recommendations = relatedProducts.slice(0, 2);

  return (
    <>
      <Button
        type="button"
        onClick={handleAddToCart}
        className={`w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold flex items-center justify-center gap-2 h-12 text-base shadow-sm rounded-lg transition-all duration-200 hover:scale-105 hover:shadow-lg active:scale-95 cursor-pointer ${className}`}
      >
        <ShoppingCart className="size-5" />
        <span>Add to Cart</span>
      </Button>

      {/* POPUP ADD TO CART (Fixed bottom-right dengan slide-in kanan & fade) */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            role="dialog"
            aria-label="Product Added to Cart"
            initial={{ opacity: 0, x: 80, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 80, scale: 0.95 }}
            transition={{ duration: 0.28, ease: "easeOut" }}
            className="fixed bottom-5 right-5 z-50 w-[calc(100vw-2.5rem)] sm:w-[420px] max-w-md bg-white rounded-lg shadow-2xl border border-gray-200 p-4"
          >
            {/* Tombol Close X di pojok kanan atas */}
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 hover:bg-gray-100 p-1 rounded-md transition-transform duration-200 hover:rotate-90 cursor-pointer"
              aria-label="Tutup popup"
            >
              <X className="size-4" />
            </button>

            {/* Header */}
            <div className="flex items-center gap-1.5 text-green-600 font-medium text-sm mb-3.5 pr-6">
              <Check className="size-4 stroke-[2.5]" />
              <span>Product successfully added to your cart!</span>
            </div>

            {/* Grid 2 Kolom: KIRI (Produk) & KANAN (Cart Summary) */}
            <div className="grid grid-cols-2 gap-4 items-start">
              {/* KIRI */}
              <div className="flex flex-col">
                <div className="size-20 rounded-md overflow-hidden border border-gray-100 bg-gray-50 shrink-0">
                  {productImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={productImage}
                      alt={product?.title || "Product"}
                      className="size-full object-cover"
                    />
                  ) : null}
                </div>
                <h4 className="font-medium text-sm text-gray-900 mt-2 line-clamp-1">
                  {product?.title || "Product"}
                </h4>
                <p className="text-teal-600 font-bold text-sm mt-0.5">
                  {formatPriceIDR(productPrice)}
                </p>
              </div>

              {/* KANAN */}
              <div className="flex flex-col justify-center pt-1 border-l border-gray-100 pl-4">
                <span className="text-xs text-gray-500">Product cart summary:</span>
                <p className="text-sm text-gray-700 mt-2">Quantity: 1</p>
                <p className="text-sm font-semibold text-gray-900 mt-1">
                  Subtotal: {formatPriceIDR(cartSubtotal)}
                </p>
              </div>
            </div>

            {/* Tombol Grid 2 Kolom */}
            <div className="grid grid-cols-2 gap-2 mt-4">
              <Button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  router.push("/cart");
                }}
                className="w-full bg-teal-600 hover:bg-teal-700 text-white font-medium text-xs sm:text-sm py-2 rounded-md shadow-xs transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer"
              >
                View Cart
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsOpen(false);
                  router.push("/checkout");
                }}
                className="w-full border border-gray-300 hover:bg-gray-50 text-gray-800 font-medium text-xs sm:text-sm py-2 rounded-md transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer"
              >
                Checkout
              </Button>
            </div>

          {/* Section: You may also like */}
          {recommendations.length > 0 && (
            <div>
              <h5 className="font-medium text-sm text-gray-900 mb-2.5">
                You may also like
              </h5>
            <div className="grid grid-cols-2 gap-3">
              {recommendations.map((item) => (
                <Link
                  key={item.id}
                  href={`/products/${item.slug}`}
                  onClick={() => setIsOpen(false)}
                  className="flex gap-2.5 p-1.5 rounded-md hover:bg-gray-50 transition-colors border border-gray-100 group"
                >
                  <div className="size-12 rounded overflow-hidden shrink-0 bg-gray-100">
                    {item.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.image}
                        alt={item.title}
                        className="size-full object-cover group-hover:scale-105 transition-transform"
                      />
                    ) : null}
                  </div>
                  <div className="min-w-0 flex flex-col justify-center">
                    <p className="text-xs font-medium text-gray-900 truncate">
                      {item.title}
                    </p>
                    <div className="flex items-center gap-1 text-[11px] text-gray-500 mt-0.5">
                      <Star className="size-3 fill-amber-400 text-amber-400" />
                      <span>{item.rating}</span>
                    </div>
                    <p className="text-xs font-bold text-teal-600 mt-0.5">
                      {formatPriceIDR(item.price)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
            </div>
          )}
        </motion.div>
      )}
      </AnimatePresence>
    </>
  );
}
