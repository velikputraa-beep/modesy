"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, Copy, ArrowRight } from "lucide-react";

export function MyCouponsClient({ initialCoupons = [] }) {
  const [toastMessage, setToastMessage] = useState("");
  const [copiedCode, setCopiedCode] = useState(null);

  const formatValidDate = (dateStr) => {
    if (!dateStr) return "Tanpa batas waktu";
    // expiresAt berupa ISO timestamp; ambil bagian tanggalnya saja
    const datePart = String(dateStr).split("T")[0];
    const parts = datePart.split("-");
    if (parts.length === 3) {
      const year = parts[0];
      const month = parseInt(parts[1], 10);
      const day = parseInt(parts[2], 10);
      const months = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
      ];
      if (month >= 1 && month <= 12) {
        return `${day} ${months[month - 1]} ${year}`;
      }
    }
    return dateStr;
  };

  const handleCopy = async (code) => {
    try {
      if (typeof window !== "undefined" && navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(code);
      }
    } catch (err) {
      console.error("Clipboard copy error:", err);
    }
    setCopiedCode(code);
    setToastMessage("Kode coupon dicopy!");
    setTimeout(() => {
      setToastMessage("");
    }, 3000);
    setTimeout(() => {
      setCopiedCode(null);
    }, 2000);
  };

  if (!initialCoupons || initialCoupons.length === 0) {
    return (
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center bg-white">
        <p className="text-sm text-gray-500">
          Belum ada kupon yang tersedia untuk akun Anda saat ini.
        </p>
      </div>
    );
  }

  return (
    <>
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2 bg-teal-600 text-white px-4 py-3 rounded-lg shadow-xl text-xs font-semibold animate-in fade-in slide-in-from-top-2">
          <Check className="size-4 shrink-0 stroke-[2.5]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Grid: grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {initialCoupons.map((coupon) => (
          <div
            key={coupon.id}
            className={`border-2 border-dashed rounded-lg p-4 bg-white flex flex-col justify-between ${
              coupon.used ? "border-gray-200 opacity-60" : "border-gray-300"
            }`}
          >
            {/* Flex row items-start gap-3 */}
            <div className="flex items-start gap-3">
              {/* Kiri: Ikon bulat */}
              <div
                className={`size-16 rounded-full ${
                  coupon.used ? "bg-gray-100" : "bg-yellow-100"
                } flex items-center justify-center text-2xl shrink-0 select-none`}
              >
                <span>{coupon.used ? "✓" : "％"}</span>
              </div>

              {/* Garis pembatas vertikal dashed */}
              <div className="border-r border-dashed border-gray-300 self-stretch my-0.5" />

              {/* Kanan (flex-1) */}
              <div className="flex-1 min-w-0">
                {/* Nama penjual / platform */}
                <span className="text-xs font-bold uppercase text-gray-700 block truncate">
                  {coupon.sellerName}
                </span>

                {/* Nilai diskon */}
                <div className="text-2xl font-bold text-gray-900 mt-1">
                  <span>
                    {coupon.discountType === "percent"
                      ? `${coupon.discountValue}%`
                      : `Rp ${Number(coupon.discountValue).toLocaleString("id-ID")}`}
                  </span>{" "}
                  <span className="font-semibold text-lg text-gray-800">
                    Coupon
                  </span>
                </div>

                {/* Masa berlaku */}
                <p className="text-xs text-teal-600 font-medium mt-1">
                  {coupon.used
                    ? "✓ Sudah kamu pakai"
                    : `✓ Valid till: ${formatValidDate(coupon.expiresAt)}`}
                </p>

                {/* Minimal pembelian */}
                {coupon.minPurchase > 0 && (
                  <p className="text-[11px] text-gray-400 mt-0.5">
                    Min. belanja Rp{" "}
                    {Number(coupon.minPurchase).toLocaleString("id-ID")}
                  </p>
                )}

                {/* "See Products →" */}
                <Link
                  href="/products"
                  className="inline-flex items-center gap-1 text-xs font-medium text-gray-700 hover:text-teal-600 hover:underline mt-2 transition-colors"
                >
                  <span>See Products</span>
                  <ArrowRight className="size-3" />
                </Link>
              </div>
            </div>

            {/* Divider border-dashed horizontal */}
            <div className="border-t border-dashed border-gray-300 my-3.5" />

            {/* Row bawah */}
            <div className="flex items-center gap-2">
              {/* Kode coupon */}
              <div className="bg-gray-100 rounded px-3 py-2 text-sm font-mono text-gray-800 flex-1 truncate font-semibold select-all">
                {coupon.code}
              </div>

              {/* Tombol "COPY CODE" */}
              <button
                type="button"
                onClick={() => handleCopy(coupon.code)}
                disabled={coupon.used}
                className="bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white text-xs px-4 py-2 rounded font-semibold cursor-pointer transition-colors whitespace-nowrap flex items-center gap-1.5 disabled:opacity-50 disabled:pointer-events-none"
              >
                {copiedCode === coupon.code ? (
                  <>
                    <Check className="size-3.5 stroke-[2.5]" />
                    <span>COPIED</span>
                  </>
                ) : (
                  <>
                    <Copy className="size-3.5" />
                    <span>COPY CODE</span>
                  </>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
