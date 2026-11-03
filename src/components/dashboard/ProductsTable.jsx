"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Plus,
  Edit,
  Trash2,
  ChevronRight,
  ChevronLeft,
  ExternalLink,
  Download,
  Check,
} from "lucide-react";
import { formatPriceIDR } from "@/lib/utils";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { deleteProduct } from "@/app/dashboard/actions";

export function ProductsTable({ title = "Products", products = [] }) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [productTypeFilter, setProductTypeFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [stockFilter, setStockFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [toastMessage, setToastMessage] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  const pageSize = 15;
  const categoriesInData = [...new Set(products.map((p) => p.category).filter(Boolean))];

  // Filter produk (status difilter di server, sisanya di client)
  const filteredProducts = products.filter((product) => {
    if (
      search &&
      !product.title.toLowerCase().includes(search.toLowerCase()) &&
      !String(product.sku || "").toLowerCase().includes(search.toLowerCase())
    ) {
      return false;
    }
    if (
      productTypeFilter !== "all" &&
      product.productType.toLowerCase() !== productTypeFilter.toLowerCase()
    ) {
      return false;
    }
    if (
      categoryFilter !== "all" &&
      product.category.toLowerCase() !== categoryFilter.toLowerCase()
    ) {
      return false;
    }
    if (stockFilter === "in-stock" && !(product.stock > 0)) return false;
    if (stockFilter === "out-of-stock" && product.stock > 0) return false;
    return true;
  });

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const pagedProducts = filteredProducts.slice((safePage - 1) * pageSize, safePage * pageSize);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3000);
  };

  const handleDelete = async (id) => {
    if (!confirm("Apakah Anda yakin ingin menghapus produk ini?")) return;
    if (deletingId) return;
    setDeletingId(id);
    const result = await deleteProduct(id);
    setDeletingId(null);
    if (result?.success) {
      showToast(result.message || "Produk berhasil dihapus");
      router.refresh();
    } else {
      showToast(result?.error || "Gagal menghapus produk");
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast message */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-teal-600 text-white text-xs font-semibold px-4 py-3 rounded-lg shadow-xl animate-in fade-in slide-in-from-bottom-2">
          <Check className="size-4 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Page */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold tracking-tight text-gray-800">
          {title}
        </h1>
        <Button asChild className="bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold gap-1.5 shadow-xs">
          <Link href="/dashboard/add-product">
            <Plus className="size-4" />
            <span>Add Product</span>
          </Link>
        </Button>
      </div>

      {/* Main Content Card */}
      <Card className="border border-gray-200 bg-white rounded-lg p-5 shadow-xs space-y-4">
        {/* Filter Controls (Persis references/products-submenu-products.png) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 text-xs items-end">
          {/* Kondisi */}
          <div>
            <label className="font-semibold text-gray-700 block mb-1">
              Kondisi
            </label>
            <select
              value={productTypeFilter}
              onChange={(e) => setProductTypeFilter(e.target.value)}
              className="w-full h-9 rounded-md border border-gray-300 bg-white px-2.5 text-xs text-gray-800 focus:outline-none focus:ring-1 focus:ring-teal-500"
            >
              <option value="all">All</option>
              <option value="baru">Baru</option>
              <option value="bekas">Bekas</option>
            </select>
          </div>

          {/* Category */}
          <div>
            <label className="font-semibold text-gray-700 block mb-1">
              Category
            </label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full h-9 rounded-md border border-gray-300 bg-white px-2.5 text-xs text-gray-800 focus:outline-none focus:ring-1 focus:ring-teal-500"
            >
              <option value="all">All</option>
              {categoriesInData.map((name) => (
                <option key={name} value={name.toLowerCase()}>
                  {name}
                </option>
              ))}
            </select>
          </div>

          {/* Stock */}
          <div>
            <label className="font-semibold text-gray-700 block mb-1">
              Stock
            </label>
            <select
              value={stockFilter}
              onChange={(e) => setStockFilter(e.target.value)}
              className="w-full h-9 rounded-md border border-gray-300 bg-white px-2.5 text-xs text-gray-800 focus:outline-none focus:ring-1 focus:ring-teal-500"
            >
              <option value="all">All</option>
              <option value="in-stock">In Stock</option>
              <option value="out-of-stock">Out of Stock</option>
            </select>
          </div>

          {/* Search */}
          <div>
            <label className="font-semibold text-gray-700 block mb-1">
              Search
            </label>
            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-9 rounded-md border border-gray-300 bg-white px-2.5 text-xs text-gray-800 focus:outline-none focus:ring-1 focus:ring-teal-500"
            />
          </div>

          {/* Buttons: Refresh & Export */}
          <div className="flex gap-2">
            <Button
              type="button"
              onClick={() => {
                router.refresh();
                showToast("Data produk dimuat ulang");
              }}
              className="h-9 px-3.5 bg-[#5b5fe4] hover:bg-[#4d51cb] text-white text-xs font-semibold rounded-md shadow-xs cursor-pointer"
            >
              Reload
            </Button>
            <Button
              type="button"
              onClick={() => showToast("Ekspor CSV belum tersedia di versi Supabase")}
              variant="outline"
              className="h-9 px-3 text-gray-700 border-gray-300 hover:bg-gray-50 text-xs font-semibold rounded-md shadow-xs cursor-pointer gap-1"
            >
              <Download className="size-3.5" />
              <span>Export</span>
            </Button>
          </div>
        </div>

        {/* Table Products */}
        <div className="overflow-x-auto border-t border-gray-100 pt-2">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 text-[11px] font-semibold text-gray-600 border-b border-gray-200">
              <tr>
                <th className="px-3 py-3 w-10">Id</th>
                <th className="px-3 py-3 min-w-[200px]">Product</th>
                <th className="px-3 py-3">Kondisi</th>
                <th className="px-3 py-3">Category</th>
                <th className="px-3 py-3">Status</th>
                <th className="px-3 py-3">Price</th>
                <th className="px-3 py-3">Stock/Status</th>
                <th className="px-3 py-3">Page Views</th>
                <th className="px-3 py-3 whitespace-nowrap">Date</th>
                <th className="px-3 py-3 text-right">Options</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-700">
              {pagedProducts.length > 0 ? (
                pagedProducts.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50/70 transition-colors">
                    {/* Id */}
                    <td className="px-3 py-3 text-gray-500 font-medium">
                      {String(p.id).slice(0, 8)}
                    </td>

                    {/* Product: Image + Title + SKU + Badges */}
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={p.image || "/placeholder.svg"}
                          alt={p.title}
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = "/placeholder.svg";
                          }}
                          className="size-12 rounded object-cover border border-gray-200 shrink-0 bg-gray-50"
                        />
                        <div className="min-w-0">
                          <p className="font-medium text-gray-900 leading-snug truncate max-w-[220px]">
                            {p.title}
                          </p>
                          <p className="text-[11px] font-semibold text-gray-600 mt-0.5">
                            SKU: <span className="font-normal text-gray-500">{p.sku}</span>
                          </p>
                          <div className="flex items-center gap-1.5 mt-1">
                            {p.badge && (
                              <span className="inline-block px-1.5 py-0.2 rounded text-[10px] font-bold bg-teal-50 text-teal-700 border border-teal-200">
                                {p.badge}
                              </span>
                            )}
                            {p.discountBadge && (
                              <span className="inline-block px-1.5 py-0.2 rounded text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                                {p.discountBadge}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Kondisi */}
                    <td className="px-3 py-3 text-gray-600">
                      {p.productType}
                    </td>

                    {/* Category */}
                    <td className="px-3 py-3 text-gray-600">
                      {p.category || "—"}
                    </td>

                    {/* Status */}
                    <td className="px-3 py-3">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold capitalize ${
                          p.statusKey === "published"
                            ? "bg-emerald-100 text-emerald-800"
                            : p.statusKey === "pending"
                              ? "bg-amber-100 text-amber-800"
                              : p.statusKey === "rejected"
                                ? "bg-red-100 text-red-700"
                                : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {p.statusKey}
                      </span>
                    </td>

                    {/* Price */}
                    <td className="px-3 py-3 font-semibold text-gray-900">
                      {formatPriceIDR(p.price)}
                    </td>

                    {/* Stock/Status */}
                    <td className="px-3 py-3">
                      <span className="text-teal-700 font-medium">
                        {p.stockStatus}
                      </span>
                    </td>

                    {/* Page Views */}
                    <td className="px-3 py-3 text-gray-600">
                      {p.pageViews}
                    </td>

                    {/* Date */}
                    <td className="px-3 py-3 text-gray-500 whitespace-nowrap">
                      <div>{p.date}</div>
                    </td>

                    {/* Options (Edit, View, Delete) */}
                    <td className="px-3 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          href={`/dashboard/add-product?edit=${p.id}`}
                          className="p-1.5 text-gray-500 hover:text-teal-600 hover:bg-gray-100 rounded transition-colors"
                          title="Edit"
                        >
                          <Edit className="size-3.5" />
                        </Link>
                        <Link
                          href={`/products/${p.slug}`}
                          className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-gray-100 rounded transition-colors"
                          title="Lihat publik"
                        >
                          <ExternalLink className="size-3.5" />
                        </Link>
                        <button
                          type="button"
                          disabled={deletingId === p.id}
                          onClick={() => handleDelete(p.id)}
                          className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-gray-100 rounded transition-colors disabled:opacity-40"
                          title="Delete"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={10} className="px-4 py-8 text-center text-xs text-gray-400">
                    No products found!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer: Count & Pagination */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-3 border-t border-gray-100 text-xs text-gray-500">
          <div>
            Number of Entries:{" "}
            <span className="font-semibold text-gray-800">
              {filteredProducts.length}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={safePage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="p-1 rounded border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40"
            >
              <ChevronLeft className="size-3.5" />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .slice(0, 5)
              .map((page) => (
                <button
                  key={page}
                  type="button"
                  onClick={() => setCurrentPage(page)}
                  className={`size-7 rounded font-semibold text-xs flex items-center justify-center transition-colors cursor-pointer ${
                    safePage === page
                      ? "bg-teal-600 text-white shadow-xs"
                      : "border border-gray-200 text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {page}
                </button>
              ))}
            <button
              type="button"
              disabled={safePage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="p-1 rounded border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40"
            >
              <ChevronRight className="size-3.5" />
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
}
