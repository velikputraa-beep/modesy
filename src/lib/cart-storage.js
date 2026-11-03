// Penyimpanan cart di localStorage.
//
// Cart dulu disimpan di satu key flat tanpa penanda pemilik, jadi cart akun A masih
// terbaca setelah logout dan langsung "waris" ke akun B yang login di browser yang sama.
// Setiap cart sekarang ditempel owner id (uid atau "guest"); beda pemilik = dibuang.
// Pengecualian: cart "guest" dipertahankan saat tamu login, supaya item yang sudah
// dipilih tidak hilang di tengah jalan (nanti di-merge ke cart DB milik user itu).

const CART_KEY = "modesy_cart";
const OWNER_KEY = "modesy_cart_owner";

export const GUEST_OWNER = "guest";

export function getLocalCart(expectedOwner) {
  let items = [];
  try {
    const owner = localStorage.getItem(OWNER_KEY) ?? GUEST_OWNER;
    const saved = localStorage.getItem(CART_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) items = parsed;
    }
    if (owner !== expectedOwner) {
      const guestUpgraded = owner === GUEST_OWNER && expectedOwner !== GUEST_OWNER;
      if (!guestUpgraded) {
        localStorage.removeItem(CART_KEY);
        items = [];
      }
      localStorage.setItem(OWNER_KEY, expectedOwner);
    }
  } catch (e) {}
  return items;
}

export function saveLocalCart(items, owner) {
  try {
    localStorage.setItem(CART_KEY, JSON.stringify(items));
    localStorage.setItem(OWNER_KEY, owner);
  } catch (e) {}
}

export function clearLocalCart() {
  try {
    localStorage.removeItem(CART_KEY);
    localStorage.removeItem(OWNER_KEY);
  } catch (e) {}
}
