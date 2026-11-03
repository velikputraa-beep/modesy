"use client";

import { useEffect, useState } from "react";
import { Trash2, Tag } from "lucide-react";

import { useToast } from "@/components/ui/toast-context";
import { formatPriceIDR } from "@/lib/utils";
import { deleteProduct } from "@/app/admin/actions";

export function AdminSpecialOffersClient({ initialProducts = [] }) {
  const { toast } = useToast();
  const [products, setProducts] = useState(initialProducts);
  const [busyId, setBusyId] = useState(null);

  useEffect(() => {
    setProducts(initialProducts);
  }, [initialProducts]);

  const handleDelete = async (p) => {
    if (busyId) return;
    setBusyId(p.id);
    const res = await deleteProduct(p.id);
    setBusyId(null);
    if (res?.success) {
      setProducts((prev) => prev.filter((item) => item.id !== p.id));
      toast.success(res.message);
    } else {
      toast.error(res?.error || "Gagal menghapus produk");
    }
  };

  const rows = products || [];

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <Tag className="size-5 text-rose-500" />
          Special Offers
        </h1>
        <p className="text-xs text-gray-500 mt-1">
          Daftar produk dengan diskon khusus dan flash sale penawaran terbatas
        </p>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-600">
            <thead className="bg-gray-50 text-gray-700 font-semibold border-b border-gray-200 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4 w-14 text-center">Id</th>
                <th className="py-3 px-4 w-16">Image</th>
                <th className="py-3 px-4">Product Name</th>
                <th className="py-3 px-4 text-center">Discount</th>
                <th className="py-3 px-4">Original Price</th>
                <th className="py-3 px-4">Discounted Price</th>
                <th className="py-3 px-4">Seller</th>
                <th className="py-3 px-4 w-24 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {rows.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-10 px-4 text-center text-gray-400">
                    Belum ada produk dengan harga coret (diskon) di database.
                  </td>
                </tr>
              )}
              {rows.map((p) => (
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
                  <td className="py-3 px-4 text-center">
                    <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-700">
                      -{p.discountPercentage || 0}%
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-400 line-through">
                    {formatPriceIDR(p.originalPrice)}
                  </td>
                  <td className="py-3 px-4 font-bold text-rose-600">{formatPriceIDR(p.price)}</td>
                  <td className="py-3 px-4 text-gray-700">{p.seller?.name || "-"}</td>
                  <td className="py-3 px-4 text-right">
                    <button
                      type="button"
                      onClick={() => handleDelete(p)}
                      disabled={busyId === p.id}
                      className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors disabled:opacity-50 disabled:pointer-events-none"
                      title="Hapus Penawaran"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
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
