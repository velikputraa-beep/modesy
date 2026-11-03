"use client";

import { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { getCartAction, syncCartAction } from "@/app/cart/actions";
import { GUEST_OWNER, getLocalCart, saveLocalCart } from "@/lib/cart-storage";

const CartContext = createContext(null);

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Item cart warisan data mock (id numerik seperti "1") tidak ada di DB dan
// membuat syncCart/place_order gagal di kolom uuid, jadi dibuang di sini.
function isRealProduct(item) {
  return UUID_RE.test(String(item?.productId ?? item?.id ?? ""));
}

export function CartProvider({ children, user = null }) {
  const [items, setItems] = useState([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const userId = user?.id || null;
  const syncTimer = useRef(null);
  const ownerRef = useRef(undefined);

  // Load: user login → merge cart DB + localStorage; guest → localStorage saja
  useEffect(() => {
    let cancelled = false;

    async function load() {
      // getLocalCart membuang cart yang pemiliknya beda (cart akun A tidak pernah
      // dibaca sebagai cart akun B), kecuali upgrade guest -> user.
      const localItems = getLocalCart(userId ?? GUEST_OWNER).filter(isRealProduct);

      if (userId) {
        const { items: dbItems } = await getCartAction();
        if (cancelled) return;

        // DB adalah sumber kebenaran. Item lokal hanya dimasukkan bila belum
        // ada di DB — menjumlahkan qty di sini membuatnya menggandakan diri
        // setiap kali halaman dimuat (bug qty 512 = 2^9).
        const merged = [...(dbItems || [])];
        for (const local of localItems) {
          if (!merged.some((m) => m.id === local.id)) {
            merged.push(local);
          }
        }
        setItems(merged);
        // Sinkronisasi hasil merge ke DB
        await syncCartAction(merged);
      } else {
        setItems(localItems);
      }
      if (!cancelled) setIsInitialized(true);
    }

    load();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  // Simpan: guest → localStorage; login → localStorage + DB (debounced)
  useEffect(() => {
    if (!isInitialized) return;
    const owner = userId ?? GUEST_OWNER;
    // Ganti akun / logout: efek ini masih menerima state render lama (item milik
    // pemilik sebelumnya), jadi satu siklus tulisannya dilewati. load() yang menyiapkan
    // cart untuk pemilik baru, jadi tidak ada data yang hilang.
    if (ownerRef.current !== undefined && ownerRef.current !== owner) {
      ownerRef.current = owner;
      return;
    }
    ownerRef.current = owner;
    saveLocalCart(items, owner);

    if (userId) {
      if (syncTimer.current) clearTimeout(syncTimer.current);
      syncTimer.current = setTimeout(() => {
        syncCartAction(items);
      }, 600);
    }
  }, [items, isInitialized, userId]);

  const addToCart = useCallback((product, quantity = 1) => {
    setItems((prev) => {
      if (!UUID_RE.test(String(product?.id ?? ""))) return prev;

      const priceNum =
        typeof product.price === "number"
          ? product.price
          : parseFloat(product.price) || 0;

      const existingIndex = prev.findIndex(
        (item) =>
          item.id === product.id ||
          (product.slug && item.slug === product.slug) ||
          item.title === product.title
      );

      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: (updated[existingIndex].quantity || 1) + quantity,
        };
        return updated;
      }

      const newItem = {
        id: product.id || Date.now(),
        productId: product.id,
        slug: product.slug || "product",
        title: product.title || product.name || "Product",
        price: priceNum,
        originalPrice: product.originalPrice || null,
        seller:
          typeof product.seller === "object"
            ? product.seller?.name
            : product.seller || "Penjual",
        sellerId: product.sellerId || product.seller?.id || null,
        image:
          product.image ||
          (product.images && product.images[0]) ||
          "https://picsum.photos/seed/product/200/200",
        quantity: quantity,
      };

      return [...prev, newItem];
    });
  }, []);

  const updateQuantity = useCallback((id, delta) => {
    setItems((prev) =>
      prev
        .map((item) => {
          if (item.id === id) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean)
    );
  }, []);

  const removeItem = useCallback((id) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = items.length > 0 ? 20000 : 0;
  const total = subtotal + shipping;

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        updateQuantity,
        removeItem,
        clearCart,
        subtotal,
        shipping,
        total,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    return {
      items: [],
      addToCart: () => {},
      updateQuantity: () => {},
      removeItem: () => {},
      clearCart: () => {},
      subtotal: 0,
      shipping: 0,
      total: 0,
    };
  }
  return context;
}
