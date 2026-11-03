"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Edit2, Trash2, Star } from "lucide-react";

import { useToast } from "@/components/ui/toast-context";
import { formatPriceIDR } from "@/lib/utils";
import { setProductFeatured } from "@/app/admin/actions";

export function AdminFeaturedProductsClient({ initialProducts = [] }) {
  const { toast } = useToast();
  const [products, setProducts] = useState(initialProducts);
  const [busyId, setBusyId] = useState(null);

  useEffect(() => {
    setProducts(initialProducts);
  }, [initialProducts]);

  const handleRemoveFeatured = async (p) => {
    if (busyId) return;
    setBusyId(p.id);
    const res = await setProductFeatured(p.id, false);
    setBusyId(null);
    if (res?.success) {
      setProducts((prev) => prev.filter((item) => item.id !== p.id));
      toast.success(res.message);
    } else {
      toast.error(res?.error || "Gagal melepas Featured");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <Star className="size-5 text-amber-500 fill-amber-500" />
          Featured Products
        </h1>
        <p className="text-xs text-gray-500 mt-1">
          Daftar produk unggulan yang ditampilkan di banner showcase utama
        </p>
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-600">
            <thead className="bg-gray-50 text-gray-700 font-semibold border-b border-gray-200 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4 w-14 text-center">Id</th>
                <th className="py-3 px-4 w-16">Image</th>
                <th className="py-3 px-4">Product Name</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Harga (Rp)</th>
                <th className="py-3 px-4">Seller</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 w-24 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {products.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-10 px-4 text-center text-gray-400">
                    Belum ada produk yang ditandai Featured.
                  </td>
                </tr>
              )}
              {products.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50/60 transition-colors">
                  <td className="py-3 px-4 text-center text-gray-500 font-medium">
                    {String(p.id).slice(0, 8)}
                  </td>
                  <td className="py-3 px-4">
                    {p.image ? (
                      <img
                        src={p.image}
                        alt={p.title}
                        className="size-10 rounded object-cover border border-gray-200 shadow-2xs"
                      />
                    ) : (
                      <div className="size-10 rounded bg-gray-100 border border-gray-200" />
                    )}
                  </td>
                  <td className="py-3 px-4 font-semibold text-gray-900 max-w-xs">{p.title}</td>
                  <td className="py-3 px-4 text-gray-600 font-medium">{p.category}</td>
                  <td className="py-3 px-4 font-bold text-gray-900">{formatPriceIDR(p.price)}</td>
                  <td className="py-3 px-4 text-gray-700">{p.seller?.name || "-"}</td>
                  <td className="py-3 px-4 text-center">
                    <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800">
                      Featured
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Link
                        href="/dashboard/products"
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors inline-flex"
                        title="Edit"
                      >
                        <Edit2 className="size-3.5" />
                      </Link>
                      <button
                        type="button"
                        onClick={() => handleRemoveFeatured(p)}
                        disabled={busyId === p.id}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors disabled:opacity-50 disabled:pointer-events-none"
                        title="Hapus dari Featured"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
