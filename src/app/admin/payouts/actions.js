"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/mock-auth";

const ADMIN_ROLES = ["admin", "moderator"];
const PAYOUT_METHODS = ["bank_transfer", "paypal", "stripe"];
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user) return { error: "Login diperlukan" };
  if (!ADMIN_ROLES.includes(user.role)) return { error: "Akses ditolak: khusus admin/moderator" };
  return { user };
}

function rupiah(value) {
  return `Rp ${Number(value).toLocaleString("id-ID")}`;
}

export async function createPayoutAction(payload) {
  const guard = await requireAdmin();
  if (guard.error) return { success: false, error: guard.error };

  const sellerId = String(payload?.sellerId || "");
  if (!UUID_RE.test(sellerId)) return { success: false, error: "Pilih penjual yang valid" };

  const amount = Number(payload?.amount);
  if (!Number.isFinite(amount) || amount <= 0) return { success: false, error: "Nominal payout tidak valid" };

  const method = PAYOUT_METHODS.includes(payload?.method) ? payload.method : "bank_transfer";
  const description = String(payload?.note || "").trim().slice(0, 300);

  const supabase = await createClient();

  const { data: setting } = await supabase
    .from("app_settings")
    .select("value")
    .eq("key", "payout")
    .maybeSingle();
  const minimum = Number(
    method === "paypal" ? setting?.value?.minPayoutPaypal : setting?.value?.minPayoutBank
  );
  if (Number.isFinite(minimum) && minimum > 0 && amount < minimum) {
    return { success: false, error: `Minimal payout ${method} adalah ${rupiah(minimum)}` };
  }

  const { data, error } = await supabase.rpc("admin_create_payout", {
    p_seller_id: sellerId,
    p_amount: amount,
    p_method: method,
    p_description: description,
  });
  if (error) return { success: false, error: error.message };

  ["/admin/payouts", "/admin/payouts/requests", "/admin/payouts/add", "/wallet", "/admin"].forEach((p) =>
    revalidatePath(p)
  );
  return { success: true, message: `Payout ${rupiah(amount)} dibuat dan menunggu persetujuan`, txId: data };
}

export async function savePayoutSettingsAction(payload) {
  const guard = await requireAdmin();
  if (guard.error) return { success: false, error: guard.error };

  const asInt = (value, fallback) => {
    const num = Number(value);
    return Number.isFinite(num) && num >= 0 ? Math.round(num) : fallback;
  };

  const current = {
    minPayoutBank: 100000,
    minPayoutPaypal: 150000,
    processingDays: 3,
    payoutFeePercentage: 0,
    autoPayoutEnabled: false,
  };

  const value = {
    minPayoutBank: asInt(payload?.minPayoutBank, current.minPayoutBank),
    minPayoutPaypal: asInt(payload?.minPayoutPaypal, current.minPayoutPaypal),
    processingDays: asInt(payload?.processingDays, current.processingDays),
    payoutFeePercentage: asInt(payload?.payoutFeePercentage, current.payoutFeePercentage),
    autoPayoutEnabled: !!payload?.autoPayoutEnabled,
  };

  const supabase = await createClient();
  const { error } = await supabase.rpc("admin_save_setting", { p_key: "payout", p_value: value });
  if (error) return { success: false, error: error.message };

  ["/admin/payouts/settings", "/admin/payouts", "/admin"].forEach((p) => revalidatePath(p));
  return { success: true, message: "Pengaturan Payout berhasil disimpan!" };
}
