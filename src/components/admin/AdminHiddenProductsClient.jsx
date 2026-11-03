"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Trash2 } from "lucide-react";

import { useToast } from "@/components/ui/toast-context";
import { formatPriceIDR } from "@/lib/utils";
import { trashProduct, updateProductStatus } from "@/app/admin/actions";

export function AdminHiddenProductsClient({ initialProducts = [] }) {
  const { toast } = useToast();
  const router = useRouter();

  const [products, setProducts] = useState(initialProducts);
  const [busyId, setBusyId] = useState(null);

  useEffect(() => {
    setProducts(initialProducts);
  }, [initialProducts]);

  const run = async (product, action) => {
    if (busyId) return;
    setBusyId(product.id);
    const res = await action();
    setBusyId(null);

    if (res?.success) {
      toast.success(res.message);
      setProducts((prev) => prev.filter((p) => p.id !== product.id));
      router.refresh();
    } else {
      toast.error(res?.error || "Gagal memproses");
    }
  };

  const handleUnhide = (product) =>
    run(product, () => updateProductStatus(product.id, "published"));

  const handleDelete = (product) => run(product, () => trashProduct(product.id));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <EyeOff className="size-5 text-gray-500" />
          Hidden Products
        </h1>
        <p className="text-xs text-gray-500 mt-1">
          Daftar produk yang disembunyikan sementara dari etalase publik oleh admin atau seller
        </p>
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-xs overflow-hidden">
        {products.length === 0 ? (
          <div className="p-8 text-center text-gray-500 text-xs">
            Tidak ada produk yang disembunyikan saat ini.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-600">
              <thead className="bg-gray-50 text-gray-700 font-semibold border-b border-gray-200 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-4 w-14 text-center">Id</th>
                  <th className="py-3 px-4 w-16">Image</th>
                  <th className="py-3 px-4">Product Name</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Price</th>
                  <th className="py-3 px-4">Seller</th>
                  <th className="py-3 px-4">Tanggal Dibuat</th>
                  <th className="py-3 px-4 w-32 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {products.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="py-3 px-4 text-center text-gray-500 font-medium">
                      {String(p.id).slice(0, 8)}
                    </td>
                    <td className="py-3 px-4">
                      {p.image ? (
                        <img
                          src={p.image}
                          alt={p.name}
                          className="size-10 rounded object-cover border border-gray-200 shadow-2xs opacity-80"
                        />
                      ) : (
                        <div className="size-10 rounded border border-gray-200 bg-gray-100" />
                      )}
                    </td>
                    <td className="py-3 px-4 font-semibold text-gray-900 max-w-xs">{p.name}</td>
                    <td className="py-3 px-4 text-gray-600 font-medium">{p.category}</td>
                    <td className="py-3 px-4 font-bold text-gray-900">{formatPriceIDR(p.price)}</td>
                    <td className="py-3 px-4 text-gray-700">{p.seller}</td>
                    <td className="py-3 px-4 text-gray-500 whitespace-nowrap">{p.date}</td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleUnhide(p)}
                          disabled={busyId === p.id}
                          className="inline-flex items-center gap-1 bg-blue-500 hover:bg-blue-600 text-white text-[11px] font-medium px-2 py-1 rounded transition-colors shadow-2xs cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                          title="Tampilkan Kembali"
                        >
                          <Eye className="size-3" />
                          Unhide
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(p)}
                          disabled={busyId === p.id}
                          className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                          title="Hapus"
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
        )}
      </div>
    </div>
  );
}
