"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShoppingCart, Heart, MessageCircle } from "lucide-react";
import { LoginRequiredDialog } from "@/components/auth/LoginRequiredDialog";
import { isGuest } from "@/lib/auth-utils";
import { useCart } from "@/lib/cart-context";

export function NavbarIcons({ user }) {
  const router = useRouter();
  const { items } = useCart();
  const [dialogAction, setDialogAction] = useState(null);

  const cartCount = items?.length ?? 0;

  const handleCartClick = () => {
    if (isGuest(user)) {
      setDialogAction("cart");
    } else {
      router.push("/cart");
    }
  };

  const handleHeartClick = () => {
    if (isGuest(user)) {
      setDialogAction("wishlist");
    } else {
      router.push("/wishlist");
    }
  };

  const handleMessageClick = () => {
    if (isGuest(user)) {
      setDialogAction("chat");
    } else {
      router.push("/messages");
    }
  };

  return (
    <>
      <div className="flex items-center gap-4">
        {/* Cart Icon dengan Badge */}
        <button
          type="button"
          onClick={handleCartClick}
          className="group relative flex items-center text-gray-700 hover:text-teal-600 transition-all focus:outline-none cursor-pointer"
          aria-label="Keranjang Belanja"
        >
          <div className="relative flex items-center justify-center transition-transform duration-200 group-hover:scale-110 group-hover:rotate-6 group-active:scale-95">
            <ShoppingCart className="size-5 text-gray-700 group-hover:text-teal-600 transition-colors" />
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-2 flex size-4.5 items-center justify-center rounded-full bg-teal-600 text-[10px] font-bold text-white shadow-xs">
                {cartCount}
              </span>
            )}
          </div>
        </button>

        {/* Heart Icon */}
        <button
          type="button"
          onClick={handleHeartClick}
          className="group flex items-center text-gray-700 hover:text-teal-600 transition-all focus:outline-none cursor-pointer"
          aria-label="Wishlist"
        >
          <Heart className="size-5 text-gray-700 group-hover:text-teal-600 transition-transform duration-200 group-hover:scale-110 group-hover:rotate-6 group-active:scale-95" />
        </button>

        {/* MessageCircle Icon */}
        <button
          type="button"
          onClick={handleMessageClick}
          className="group flex items-center text-gray-700 hover:text-teal-600 transition-all focus:outline-none cursor-pointer"
          aria-label="Pesan"
        >
          <MessageCircle className="size-5 text-gray-700 group-hover:text-teal-600 transition-transform duration-200 group-hover:scale-110 group-hover:rotate-6 group-active:scale-95" />
        </button>
      </div>

      {/* LoginRequiredDialog */}
      <LoginRequiredDialog
        open={!!dialogAction}
        onOpenChange={(open) => {
          if (!open) setDialogAction(null);
        }}
        actionName={dialogAction || "cart"}
      />
    </>
  );
}
