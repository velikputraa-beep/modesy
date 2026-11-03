"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LoginRequiredDialog } from "@/components/auth/LoginRequiredDialog";
import { isGuest } from "@/lib/auth-utils";
import { getOrCreateConversationAction } from "@/app/messages/actions";

export function ContactSellerButton({ product, user }) {
  const router = useRouter();
  const [openDialog, setOpenDialog] = useState(false);
  const [starting, setStarting] = useState(false);

  const handleClick = async () => {
    if (isGuest(user)) {
      setOpenDialog(true);
      return;
    }
    if (!product?.sellerId || starting) return;

    setStarting(true);
    const result = await getOrCreateConversationAction({
      sellerId: product.sellerId,
      productId: product.id,
    });
    setStarting(false);

    if (result.error || !result.conversationId) {
      router.push("/messages");
      return;
    }
    router.push(`/messages?chat=${result.conversationId}`);
  };

  return (
    <>
      <Button
        type="button"
        onClick={handleClick}
        disabled={starting}
        className="w-full bg-teal-600 hover:bg-teal-700 text-white font-medium flex items-center justify-center gap-2 h-11"
      >
        <MessageCircle className="size-5" />
        <span>{starting ? "Membuka chat..." : "Hubungi Seller"}</span>
      </Button>

      <LoginRequiredDialog
        open={openDialog}
        onOpenChange={setOpenDialog}
        actionName="chat"
      />
    </>
  );
}
