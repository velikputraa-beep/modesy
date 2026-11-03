"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Eye, ShoppingBag } from "lucide-react";

import { formatPriceIDR } from "@/lib/utils";

export function AdminSoldProductsClient({ initialProducts = [] }) {
  const [products, setProducts] = useState(initialProducts);

  useEffect(() => {
    setProducts(initialProducts);
  }, [initialProducts]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <ShoppingBag className="size-5 text-emerald-600" />
          Sold Products
        </h1>
        <p className="text-xs text-gray-500 mt-1">
          Daftar produk unik atau limited edition yang stoknya telah habis terjual
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
                <th className="py-3 px-4">Sale Price</th>
                <th className="py-3 px-4">Seller</th>
                <th className="py-3 px-4">Buyer</th>
                <th className="py-3 px-4">Sold Date</th>
                <th className="py-3 px-4 w-20 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {products.length === 0 && (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-gray-500">
                    Belum ada produk yang terjual.
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
                        alt={p.name}
                        className="size-10 rounded object-cover border border-gray-200 shadow-2xs"
                      />
                    ) : (
                      <div className="size-10 rounded border border-gray-200 bg-gray-100" />
                    )}
                  </td>
                  <td className="py-3 px-4 font-semibold text-gray-900 max-w-xs">{p.name}</td>
                  <td className="py-3 px-4 text-gray-600 font-medium">{p.category}</td>
                  <td className="py-3 px-4 font-bold text-gray-900">{formatPriceIDR(p.price)}</td>
                  <td className="py-3 px-4 text-gray-700">{p.seller}</td>
                  <td className="py-3 px-4 font-medium text-blue-600">{p.buyer}</td>
                  <td className="py-3 px-4 text-gray-500 whitespace-nowrap">{p.soldDate}</td>
                  <td className="py-3 px-4 text-right">
                    <Link
                      href={`/products/${p.slug}`}
                      className="inline-flex p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                      title="Lihat Detail"
                    >
                      <Eye className="size-3.5" />
                    </Link>
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
