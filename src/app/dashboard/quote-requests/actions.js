"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/mock-auth";
import { updateSellerQuoteRequest } from "@/lib/queries/requests";

const STATUS_MESSAGES = {
  accepted: "Penawaran diterima",
  rejected: "Penawaran ditolak",
  cancelled: "Penawaran dibatalkan",
  pending: "Harga penawaran dikirim",
  new: "Penawaran dibuka kembali",
};

export async function updateSellerQuoteAction({ id, status, bid } = {}) {
  const user = await getCurrentUser();
  if (!user) return { error: "Login diperlukan" };
  if (!id) return { error: "ID permintaan tidak valid" };

  const result = await updateSellerQuoteRequest(user.id, String(id), { status, bid });
  if (result.error) return { error: result.error };

  revalidatePath("/dashboard/quote-requests");
  revalidatePath("/orders/quote-requests");

  const savedBid = result.quote?.bid === null || result.quote?.bid === undefined ? null : Number(result.quote.bid);
  const message =
    status === "pending" && savedBid
      ? `Harga penawaran ${savedBid.toLocaleString("id-ID")} tersimpan`
      : STATUS_MESSAGES[status] || "Status penawaran diperbarui";

  return { ok: true, message, status: result.quote.status, bid: savedBid };
}
