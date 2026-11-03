"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/mock-auth";
import { updateSellerRefundRequest } from "@/lib/queries/requests";

const LABELS = {
  requested: "Requested",
  processing: "Processing",
  approved: "Approved",
  rejected: "Rejected",
};

export async function updateSellerRefundAction({ id, status } = {}) {
  const user = await getCurrentUser();
  if (!user) return { error: "Login diperlukan" };
  if (!id) return { error: "ID pengajuan tidak valid" };

  const result = await updateSellerRefundRequest(user.id, String(id), status);
  if (result.error) return { error: result.error };

  revalidatePath("/dashboard/refund-requests");
  revalidatePath("/orders/refund-requests");
  return { ok: true, message: `Refund ${LABELS[status] || status}` };
}
