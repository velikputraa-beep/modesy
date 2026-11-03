"use client";

import Link from "next/link";
import { Lock } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const defaultMessages = {
  wishlist: "Kamu harus login dulu untuk menambahkan produk ke wishlist",
  chat: "Kamu harus login dulu untuk menghubungi seller",
  beli: "Kamu harus login dulu untuk membeli produk",
  cart: "Kamu harus login dulu untuk mengakses keranjang",
  checkout: "Kamu harus login dulu untuk checkout",
  moderate: "Kamu harus login sebagai Moderator atau Admin untuk aksi ini",
  vendor: "Kamu harus login sebagai Vendor untuk aksi ini",
};

export function LoginRequiredDialog({
  open,
  onOpenChange,
  actionName = "wishlist",
  message,
}) {
  const displayMessage =
    message ||
    defaultMessages[actionName] ||
    "Kamu harus login dulu untuk melanjutkan tindakan ini";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md sm:max-w-md p-6">
        <DialogHeader className="flex flex-col items-center text-center">
          <div className="flex size-14 items-center justify-center rounded-full bg-teal-50 text-teal-600 p-3 mx-auto">
            <Lock className="size-7" />
          </div>
          <DialogTitle className="text-center text-xl font-bold mt-4 text-gray-900">
            Login Diperlukan
          </DialogTitle>
          <DialogDescription className="text-center text-gray-600 mt-2 text-sm">
            {displayMessage}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="grid grid-cols-1 gap-2 sm:grid-cols-1 sm:justify-stretch w-full mt-4 bg-transparent border-t-0 p-0 m-0">
          <Button
            asChild
            className="w-full bg-teal-600 hover:bg-teal-700 text-white font-medium h-10 cursor-pointer"
          >
            <Link href="/login">Masuk</Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className="w-full border-gray-200 hover:bg-gray-50 text-gray-700 h-10 cursor-pointer"
          >
            <Link href="/register">Daftar</Link>
          </Button>
          <Button
            variant="ghost"
            type="button"
            className="w-full text-gray-500 hover:text-gray-700 h-10 cursor-pointer"
            onClick={() => onOpenChange?.(false)}
          >
            Batal
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
