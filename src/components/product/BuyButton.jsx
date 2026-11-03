"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShoppingBag, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { LoginRequiredDialog } from "@/components/auth/LoginRequiredDialog";
import { isGuest, isVendor, isModerator } from "@/lib/auth-utils";

export function BuyButton({ product, user }) {
  const router = useRouter();
  const [openLoginDialog, setOpenLoginDialog] = useState(false);
  const [dialogNotice, setDialogNotice] = useState(null);

  const handleBuy = () => {
    if (isGuest(user)) {
      setOpenLoginDialog(true);
      return;
    }

    if (isVendor(user)) {
      setDialogNotice("Kamu login sebagai Vendor. Vendor nggak bisa membeli produk.");
      return;
    }

    if (isModerator(user)) {
      setDialogNotice("Moderator nggak bisa beli. Gunakan akun Member untuk berbelanja.");
      return;
    }

    // Member atau Admin boleh checkout. Beli Sekarang melewati keranjang:
    // produk dikirim lewat query parameter, dibaca /checkout di server.
    router.push(`/checkout?buyNow=${product.id}&qty=1`);
  };

  return (
    <>
      <Button
        type="button"
        onClick={handleBuy}
        className="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold flex items-center justify-center gap-2 h-12 text-base shadow-sm cursor-pointer"
      >
        <ShoppingBag className="size-5" />
        <span>Beli Sekarang</span>
      </Button>

      {/* Dialog Login Required jika Guest */}
      <LoginRequiredDialog
        open={openLoginDialog}
        onOpenChange={setOpenLoginDialog}
        actionName="beli"
      />

      {/* Dialog Peringatan Role untuk Vendor & Moderator */}
      <Dialog
        open={!!dialogNotice}
        onOpenChange={(open) => {
          if (!open) setDialogNotice(null);
        }}
      >
        <DialogContent className="max-w-md sm:max-w-md p-6">
          <DialogHeader className="flex flex-col items-center text-center">
            <div className="flex size-14 items-center justify-center rounded-full bg-amber-50 text-amber-600 p-3 mx-auto">
              <Info className="size-7" />
            </div>
            <DialogTitle className="text-center text-xl font-bold mt-4 text-gray-900">
              Perhatian
            </DialogTitle>
            <DialogDescription className="text-center text-gray-600 mt-2 text-sm">
              {dialogNotice}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="w-full mt-4 bg-transparent border-t-0 p-0 m-0">
            <Button
              type="button"
              onClick={() => setDialogNotice(null)}
              className="w-full bg-teal-600 hover:bg-teal-700 text-white font-medium h-10 cursor-pointer"
            >
              Mengerti
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
