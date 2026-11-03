"use client";

import Link from "next/link";
import {
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  ArrowRight,
  ShieldCheck,
  Truck,
  Heart,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatPriceIDR } from "@/lib/utils";

import { useCart } from "@/lib/cart-context";
import { useToast } from "@/components/ui/toast-context";
import { CheckoutButton } from "@/components/cart/CheckoutButton";

function CartContent({ user }) {
  const { items, updateQuantity, removeItem, subtotal, shipping, total } =
    useCart();
  const { toast } = useToast();

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
        <div className="size-20 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center mb-5">
          <ShoppingBag className="size-10" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Cart kamu kosong
        </h2>
        <p className="text-gray-500 max-w-sm mb-6 text-sm">
          Belum ada produk impian yang kamu masukkan ke keranjang belanja. Yuk,
          mulai eksplorasi sekarang!
        </p>
        <Button asChild className="bg-teal-600 hover:bg-teal-700 text-white font-semibold px-6 py-2.5 rounded-lg shadow-sm cursor-pointer">
          <Link href="/products">
            Mulai Belanja
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-10">
      {/* Kolom Kiri: Daftar Produk di Cart (8 Kolom) */}
      <div className="lg:col-span-8 space-y-4">
        <div className="rounded-xl border border-gray-200 bg-white overflow-hidden shadow-xs">
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
            <h2 className="text-sm font-bold text-gray-900">
              Daftar Barang ({items.length} Produk)
            </h2>
            <span className="text-xs text-gray-500">Harga Satuan</span>
          </div>

          <div className="divide-y divide-gray-100">
            {items.map((item) => (
              <div
                key={item.id}
                className="p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors duration-200 hover:bg-gray-50"
              >
                {/* Gambar & Nama Produk */}
                <div className="flex items-center gap-4 min-w-0">
                  <Link
                    href={`/products/${item.slug}`}
                    className="size-20 sm:size-24 shrink-0 overflow-hidden rounded-lg border border-gray-200 bg-gray-100 block transition-transform duration-200 hover:scale-105"
                  >
                    <img
                      src={item.image}
                      alt={item.title}
                      className="h-full w-full object-cover"
                    />
                  </Link>

                  <div className="min-w-0">
                    <span className="text-[11px] font-semibold text-teal-600 uppercase tracking-wide">
                      {item.seller}
                    </span>
                    <Link
                      href={`/products/${item.slug}`}
                      className="block text-sm sm:text-base font-bold text-gray-900 hover:text-teal-600 transition-colors line-clamp-2 mt-0.5"
                    >
                      {item.title}
                    </Link>
                    <p className="mt-1 text-sm font-bold text-teal-600 sm:hidden">
                      {formatPriceIDR(item.price)}
                    </p>
                  </div>
                </div>

                {/* Sisi Kanan: Harga, Quantity & Hapus */}
                <div className="flex items-center justify-between sm:justify-end gap-6 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-100">
                  {/* Harga Desktop */}
                  <div className="hidden sm:block text-right">
                    <p className="text-base font-bold text-gray-900">
                      {formatPriceIDR(item.price)}
                    </p>
                    {item.originalPrice && (
                      <p className="text-xs text-gray-400 line-through">
                        {formatPriceIDR(item.originalPrice)}
                      </p>
                    )}
                  </div>

                  {/* Quantity Controller */}
                  <div className="flex items-center rounded-lg border border-gray-200 bg-white shadow-2xs">
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.id, -1)}
                      className="flex size-8 items-center justify-center text-gray-600 hover:bg-gray-100 hover:text-teal-600 transition-all duration-150 active:scale-95 rounded-l-lg cursor-pointer"
                      aria-label="Kurangi kuantitas"
                    >
                      <Minus className="size-3.5" />
                    </button>
                    <span className="w-10 text-center text-xs sm:text-sm font-semibold text-gray-900">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.id, 1)}
                      className="flex size-8 items-center justify-center text-gray-600 hover:bg-gray-100 hover:text-teal-600 transition-all duration-150 active:scale-95 rounded-r-lg cursor-pointer"
                      aria-label="Tambah kuantitas"
                    >
                      <Plus className="size-3.5" />
                    </button>
                  </div>

                  {/* Action Buttons: Wishlist & Hapus */}
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => {
                        removeItem(item.id);
                        toast.success(`"${item.title}" dipindahkan ke wishlist!`);
                      }}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 hover:scale-110 active:scale-95 rounded-lg transition-all duration-200 cursor-pointer"
                      aria-label="Pindahkan ke wishlist"
                      title="Pindahkan ke Wishlist"
                    >
                      <Heart className="size-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        removeItem(item.id);
                        toast.info(`"${item.title}" dihapus dari keranjang`);
                      }}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 hover:scale-110 active:scale-95 rounded-lg transition-all duration-200 cursor-pointer"
                      aria-label="Hapus barang"
                      title="Hapus"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Info Tambahan Proteksi */}
        <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-4 text-xs text-gray-600 shadow-xs">
          <ShieldCheck className="size-5 text-teal-600 shrink-0" />
          <span>
            Setiap transaksi di Modesy dilindungi garansi 100% uang kembali jika
            pesanan tidak sesuai deskripsi.
          </span>
        </div>
      </div>

      {/* Kolom Kanan: Summary Card (4 Kolom) */}
      <div className="lg:col-span-4">
        <Card className="rounded-xl border border-gray-200 bg-white p-6 shadow-xs sticky top-24">
          <h3 className="text-base font-bold text-gray-900 pb-4 border-b border-gray-100">
            Ringkasan Belanja
          </h3>

          <div className="mt-4 space-y-3 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>Total Harga ({items.length} barang)</span>
              <span className="font-semibold text-gray-900">
                {formatPriceIDR(subtotal)}
              </span>
            </div>

            <div className="flex justify-between text-gray-600">
              <span className="flex items-center gap-1.5">
                <Truck className="size-4 text-teal-600" />
                <span>Ongkos Kirim</span>
              </span>
              <span className="font-semibold text-gray-900">
                {formatPriceIDR(shipping)}
              </span>
            </div>

            <div className="pt-4 border-t border-gray-100 flex justify-between items-baseline">
              <span className="text-base font-bold text-gray-900">Total</span>
              <span className="text-2xl font-bold text-teal-600">
                {formatPriceIDR(total)}
              </span>
            </div>
          </div>

          <div className="mt-6">
            <CheckoutButton user={user} />
          </div>

          <div className="mt-4 text-center">
            <Link
              href="/products"
              className="text-xs font-semibold text-teal-600 hover:text-teal-700 hover:underline cursor-pointer"
            >
              ← Continue Shopping
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}

export function CartView({ user }) {
  return <CartContent user={user} />;
}
