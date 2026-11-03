"use client";

import { useState } from "react";
import { Heart, CheckCircle2 } from "lucide-react";
import { LoginRequiredDialog } from "@/components/auth/LoginRequiredDialog";
import { isGuest } from "@/lib/auth-utils";
import { toggleFavoriteAction } from "@/app/wishlist/actions";

export function FavoriteButton({ product, user, size = "md", initialFavorited = false }) {
  const [openDialog, setOpenDialog] = useState(false);
  const [isFavorited, setIsFavorited] = useState(initialFavorited);
  const [toastMessage, setToastMessage] = useState("");

  const handleToggle = async (e) => {
    e?.preventDefault();
    e?.stopPropagation();

    if (isGuest(user)) {
      setOpenDialog(true);
      return;
    }

    const nextState = !isFavorited;
    setIsFavorited(nextState);

    const res = await toggleFavoriteAction(product?.id, nextState);
    if (res?.error) {
      setIsFavorited(!nextState);
      setToastMessage(res.error);
    } else {
      const msg = nextState
        ? `"${product?.title || "Produk"}" ditambahkan ke wishlist`
        : `"${product?.title || "Produk"}" dihapus dari wishlist`;
      setToastMessage(msg);
    }
    setTimeout(() => {
      setToastMessage("");
    }, 3000);
  };

  const sizeClasses = {
    sm: "size-8",
    md: "size-10",
    lg: "size-12",
  };

  const iconSizes = {
    sm: "size-4",
    md: "size-5",
    lg: "size-6",
  };

  return (
    <>
      <button
        type="button"
        onClick={handleToggle}
        aria-label={isFavorited ? "Hapus dari wishlist" : "Tambah ke wishlist"}
        className={`inline-flex items-center justify-center rounded-lg border border-gray-200 bg-white transition-all duration-200 hover:scale-105 active:scale-95 hover:bg-gray-50 focus:outline-none shrink-0 cursor-pointer ${
          sizeClasses[size] || sizeClasses.md
        } ${
          isFavorited
            ? "border-red-200 bg-red-50/50 text-red-500 shadow-xs"
            : "text-gray-400 hover:text-red-500"
        }`}
      >
        <Heart
          className={`${iconSizes[size] || iconSizes.md} ${
            isFavorited
              ? "fill-red-500 text-red-500 animate-heart-bounce"
              : "text-gray-400 transition-colors"
          }`}
        />
      </button>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-lg bg-gray-900 px-4 py-3 text-xs sm:text-sm font-medium text-white shadow-lg animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="size-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Login Required Dialog */}
      <LoginRequiredDialog
        open={openDialog}
        onOpenChange={setOpenDialog}
        actionName="wishlist"
      />
    </>
  );
}
