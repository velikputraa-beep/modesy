"use server";

import { getCurrentUser } from "@/lib/mock-auth";
import { deleteQuoteRequest, createRefundRequest } from "@/lib/queries/requests";

export async function deleteQuoteAction(id) {
  const user = await getCurrentUser();
  if (!user) return { error: "Login diperlukan" };
  return deleteQuoteRequest(user.id, id);
}

export async function createRefundAction({ orderNumber, reason }) {
  const user = await getCurrentUser();
  if (!user) return { error: "Login diperlukan" };
  return createRefundRequest(user.id, { orderNumber, reason });
}
