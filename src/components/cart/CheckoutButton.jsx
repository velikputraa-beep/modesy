"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Info, ArrowRight } from "lucide-react";
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
import { isGuest, isSeller } from "@/lib/auth-utils";

export function CheckoutButton({ user }) {
  const router = useRouter();
  const [openLoginDialog, setOpenLoginDialog] = useState(false);
  const [openSellerDialog, setOpenSellerDialog] = useState(false);

  const handleCheckout = () => {
    if (isGuest(user)) {
      setOpenLoginDialog(true);
      return;
    }

    if (isSeller(user)) {
      setOpenSellerDialog(true);
      return;
    }

    // Buyer atau Admin boleh checkout
    router.push("/checkout");
  };

  return (
    <>
      <Button
        type="button"
        onClick={handleCheckout}
        className="w-full h-12 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-lg shadow-sm text-base flex items-center justify-center gap-2 transition-all duration-200 hover:scale-105 hover:shadow-lg active:scale-95 cursor-pointer"
      >
        <span>Checkout</span>
        <ArrowRight className="size-4" />
      </Button>

      {/* Login Required Dialog jika Guest */}
      <LoginRequiredDialog
        open={openLoginDialog}
        onOpenChange={setOpenLoginDialog}
        actionName="checkout"
      />

      {/* Dialog Info untuk Seller */}
      <Dialog open={openSellerDialog} onOpenChange={setOpenSellerDialog}>
        <DialogContent className="max-w-md sm:max-w-md p-6">
          <DialogHeader className="flex flex-col items-center text-center">
            <div className="flex size-14 items-center justify-center rounded-full bg-amber-50 text-amber-600 p-3 mx-auto">
              <Info className="size-7" />
            </div>
            <DialogTitle className="text-center text-xl font-bold mt-4 text-gray-900">
              Perhatian
            </DialogTitle>
            <DialogDescription className="text-center text-gray-600 mt-2 text-sm">
              Seller nggak bisa checkout
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="w-full mt-4 bg-transparent border-t-0 p-0 m-0">
            <Button
              type="button"
              onClick={() => setOpenSellerDialog(false)}
              className="w-full bg-teal-600 hover:bg-teal-700 text-white font-medium h-10"
            >
              Mengerti
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
