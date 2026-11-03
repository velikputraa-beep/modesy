import { createClient } from "@/lib/supabase/server";

// payment_settings hanya terbaca admin, jadi storefront membaca daftar
// gateway aktif lewat RPC whitelist storefront_payment_options().
export const GATEWAY_IDS = ["stripe", "paypal", "midtrans", "bank", "cod"];

// id gateway -> nilai payment_method yang disimpan di tabel orders
const ORDER_PAYMENT_METHOD = {
  stripe: "stripe",
  paypal: "paypal",
  midtrans: "midtrans",
  bank: "bank_transfer",
  cod: "cod",
  wallet: "wallet",
};

export function orderPaymentMethodFor(id) {
  return ORDER_PAYMENT_METHOD[id] ?? null;
}

// Bank transfer tetap ditawarkan kalau RPC gagal supaya checkout tidak
// pernah kehilangan seluruh metode bayar.
const FALLBACK = [{ id: "bank", mode: "live", instructions: "", note: "" }];

export async function getStorefrontPaymentOptions() {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("storefront_payment_options");

  if (error) {
    console.error("[checkout] gagal membaca payment_settings:", error.message);
    return { activeGateway: null, options: FALLBACK };
  }

  const raw = Array.isArray(data?.options) ? data.options : [];
  const options = raw
    .filter((row) => row && GATEWAY_IDS.includes(row.id))
    .map((row) => ({
      id: row.id,
      mode: row.mode ?? "live",
      instructions: row.instructions ?? "",
      note: row.note ?? "",
    }));

  const active = GATEWAY_IDS.includes(data?.activeGateway) ? data.activeGateway : null;
  return { activeGateway: active, options };
}
