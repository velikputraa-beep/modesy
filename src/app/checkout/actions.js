"use server";

import { placeOrder, getOrderById } from "@/lib/queries/orders";
import { validateCoupon } from "@/lib/queries/coupons";
import { getBalance } from "@/lib/queries/wallet";
import { getCurrentUser } from "@/lib/mock-auth";
import { clearCartDb } from "@/lib/queries/cart";
import { addAddress, updateAddress, removeAddress } from "@/lib/queries/content";
import { getStorefrontPaymentOptions, orderPaymentMethodFor } from "@/lib/queries/payment";

export async function saveAddressAction({ id, label, address }) {
  const user = await getCurrentUser();
  if (!user) return { error: "Login diperlukan" };
  if (!address) return { error: "Alamat wajib diisi" };

  return id
    ? updateAddress(user.id, id, { label, address })
    : addAddress(user.id, { label, address });
}

export async function deleteAddressAction(id) {
  const user = await getCurrentUser();
  if (!user) return { error: "Login diperlukan" };
  return removeAddress(user.id, id);
}

export async function placeOrderAction({ items, shippingAddress, paymentMethod, couponCode, buyNow }) {
  const user = await getCurrentUser();
  if (!user) return { error: "Login diperlukan untuk checkout" };
  if (!items || items.length === 0) return { error: "Keranjang kosong" };

  // Metode bayar divalidasi server against payment_settings, bukan cuma dari client.
  // Wallet bukan gateway, jadi tidak dicek ke payment_settings; saldo + pemotongannya
  // divalidasi RPC place_order (SECURITY DEFINER) di dalam satu transaksi.
  const storedMethod = orderPaymentMethodFor(paymentMethod);
  if (!storedMethod) return { error: "Metode pembayaran tidak dikenal" };
  if (paymentMethod !== "wallet") {
    const { options } = await getStorefrontPaymentOptions();
    if (!options.some((option) => option.id === paymentMethod)) {
      return { error: "Metode pembayaran tersebut sedang tidak aktif" };
    }
  }

  const result = await placeOrder({
    items,
    shippingAddress,
    paymentMethod: storedMethod,
    couponCode,
  });
  if (result.error) return { error: result.error };

  // Kosongkan cart DB setelah order sukses (cart client dikosongkan oleh komponen).
  // Alur "Beli Sekarang" tidak membaca cart sama sekali, jadi isinya tidak boleh
  // ikut terhapus saat order satu produk selesai.
  if (!buyNow) await clearCartDb(user.id);

  const order = result.orderId ? await getOrderById(result.orderId) : null;
  return { orderId: result.orderId, orderNumber: order?.orderNumber || null };
}

export async function validateCouponAction(code, subtotal) {
  const user = await getCurrentUser();
  return validateCoupon(code, subtotal, user?.id);
}

export async function getWalletBalanceAction() {
  const user = await getCurrentUser();
  if (!user) return { balance: 0 };
  const balance = await getBalance(user.id);
  return { balance };
}
