"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Plus,
  ChevronDown,
  Trash2,
  Edit,
  Eye,
  CheckCircle2,
  XCircle,
  Star,
} from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/components/ui/toast-context";
import { formatPriceIDR } from "@/lib/utils";
import {
  approveProduct,
  rejectProduct,
  deleteProduct,
  setProductFeatured,
} from "@/app/admin/actions";

const STATUS_STYLES = {
  published: "bg-emerald-50 text-emerald-700 border-emerald-200",
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  draft: "bg-gray-100 text-gray-600 border-gray-200",
  hidden: "bg-slate-100 text-slate-600 border-slate-200",
  sold: "bg-blue-50 text-blue-700 border-blue-200",
  rejected: "bg-rose-50 text-rose-700 border-rose-200",
};

export function AdminProductsClient({ initialProducts = [] }) {
  const { toast } = useToast();
  const [productsList, setProductsList] = useState(initialProducts);
  const [busyKey, setBusyKey] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setProductsList(initialProducts);
  }, [initialProducts]);

  const categoriesList = useMemo(
    () => [...new Set(productsList.map((p) => p.category).filter(Boolean))].sort(),
    [productsList]
  );

  const filteredProducts = productsList.filter((p) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      (p.title || "").toLowerCase().includes(q) ||
      (p.slug || "").toLowerCase().includes(q);
    const matchesCategory =
      selectedCategory === "All" || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredProducts.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredProducts.map((p) => p.id));
    }
  };

  const toggleSelectOne = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((item) => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const runAction = async (product, name, fn) => {
    const key = `${product.id}:${name}`;
    if (busyKey) return;
    setBusyKey(key);
    const res = await fn();
    setBusyKey(null);
    if (res?.success) {
      toast.success(res.message);
      if (name === "delete") {
        setProductsList((prev) => prev.filter((p) => p.id !== product.id));
        setSelectedIds((prev) => prev.filter((id) => id !== product.id));
      }
    } else {
      toast.error(res?.error || "Aksi gagal dilakukan");
    }
  };

  const handleDelete = (product) => {
    if (!confirm(`Yakin ingin menghapus produk "${product.title}"?`)) return;
    runAction(product, "delete", () => deleteProduct(product.id));
  };

  const isBusy = (id, name) => busyKey === `${id}:${name}`;

  return (
    <div className="space-y-6">
      {/* Page Title & Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Products</h1>
        <Link
          href="/dashboard/add-product"
          className="inline-flex items-center gap-1.5 rounded-md bg-[#0284C7] hover:bg-[#0369A1] px-4 py-2 text-xs font-semibold text-white shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
        >
          <Plus className="size-4" />
          <span>+ Add Product</span>
        </Link>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-xs p-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3 text-xs">
          <div>
            <label className="block text-[11px] font-semibold text-gray-600 mb-1">Show</label>
            <select className="w-full border border-gray-200 rounded p-1.5 bg-white text-gray-700">
              <option>15</option>
              <option>30</option>
              <option>50</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-gray-600 mb-1">Listing Type</label>
            <select className="w-full border border-gray-200 rounded p-1.5 bg-white text-gray-700">
              <option>All</option>
              <option>Sell to Everyone</option>
              <option>Ordinary Listing</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-gray-600 mb-1">Product Type</label>
            <select className="w-full border border-gray-200 rounded p-1.5 bg-white text-gray-700">
              <option>All</option>
              <option>Physical</option>
              <option>Digital</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-gray-600 mb-1">Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full border border-gray-200 rounded p-1.5 bg-white text-gray-700"
            >
              <option value="All">All</option>
              {categoriesList.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-gray-600 mb-1">Stock</label>
            <select className="w-full border border-gray-200 rounded p-1.5 bg-white text-gray-700">
              <option>All</option>
              <option>In Stock</option>
              <option>Out of Stock</option>
            </select>
          </div>

          <div className="col-span-2 sm:col-span-2">
            <label className="block text-[11px] font-semibold text-gray-600 mb-1">Search</label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full border border-gray-200 rounded px-2.5 py-1.5 text-xs text-gray-800"
              />
              <button
                type="button"
                onClick={() => toast.success("Filter produk diterapkan")}
                className="bg-[#4F46E5] hover:bg-[#4338CA] text-white px-3 py-1.5 rounded text-xs font-semibold shrink-0 cursor-pointer"
              >
                Filter
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Products Table Card */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-600">
            <thead className="bg-gray-50/75 border-b border-gray-200 text-gray-700 font-semibold text-[11px]">
              <tr>
                <th className="p-3 w-8">
                  <input
                    type="checkbox"
                    checked={
                      filteredProducts.length > 0 &&
                      selectedIds.length === filteredProducts.length
                    }
                    onChange={toggleSelectAll}
                    className="rounded text-blue-600"
                  />
                </th>
                <th className="p-3 w-10">Id</th>
                <th className="p-3 min-w-[240px]">Product</th>
                <th className="p-3">Condition</th>
                <th className="p-3">Category</th>
                <th className="p-3">User</th>
                <th className="p-3">Harga (Rp)</th>
                <th className="p-3">Stock</th>
                <th className="p-3">Date</th>
                <th className="p-3 text-right">Options</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredProducts.length === 0 && (
                <tr>
                  <td colSpan={10} className="p-10 text-center text-gray-400">
                    {productsList.length === 0
                      ? "Belum ada produk tersimpan di database."
                      : "Tidak ada produk yang cocok dengan filter."}
                  </td>
                </tr>
              )}
              {filteredProducts.map((p) => {
                const isSelected = selectedIds.includes(p.id);
                return (
                  <tr
                    key={p.id}
                    className={`hover:bg-gray-50/70 transition-colors ${
                      isSelected ? "bg-blue-50/40" : ""
                    }`}
                  >
                    <td className="p-3">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelectOne(p.id)}
                        className="rounded text-blue-600"
                      />
                    </td>
                    <td className="p-3 font-semibold text-gray-500">
                      {String(p.id).slice(0, 8)}
                    </td>
                    <td className="p-3">
                      <div className="flex items-start gap-3">
                        {p.image ? (
                          <img
                            src={p.image}
                            alt={p.title}
                            className="size-12 rounded object-cover border border-gray-200 shrink-0"
                          />
                        ) : (
                          <div className="size-12 rounded bg-gray-100 border border-gray-200 shrink-0" />
                        )}
                        <div className="min-w-0">
                          <p className="font-semibold text-gray-900 line-clamp-1">{p.title}</p>
                          <p className="text-[11px] text-gray-400 mt-0.5">
                            Slug: {p.slug || "N/A"}
                          </p>
                          <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                            <span
                              className={`text-[10px] font-bold px-1.5 py-0.2 rounded border ${
                                STATUS_STYLES[p.status] || STATUS_STYLES.draft
                              }`}
                            >
                              {p.status}
                            </span>
                            {p.isFeatured && (
                              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-teal-50 text-teal-700 border border-teal-200">
                                Featured
                              </span>
                            )}
                            {p.discountPercentage != null && (
                              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-50 text-amber-700 border border-amber-200">
                                -{p.discountPercentage}%
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="p-3 font-medium text-gray-700">{p.condition}</td>
                    <td className="p-3 text-gray-600">{p.category}</td>
                    <td className="p-3 font-medium text-gray-800">
                      {p.seller?.name || "-"}
                    </td>
                    <td className="p-3 font-bold text-gray-900">
                      {formatPriceIDR(p.price)}
                    </td>
                    <td className="p-3">
                      <span
                        className={
                          p.stock > 0
                            ? "text-emerald-700 font-semibold"
                            : "text-rose-600 font-semibold"
                        }
                      >
                        {p.stock}
                      </span>
                    </td>
                    <td className="p-3 text-gray-500 whitespace-nowrap">{p.timeAgo}</td>
                    <td className="p-3 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger className="inline-flex items-center gap-1 bg-[#6366F1] hover:bg-[#4F46E5] text-white text-[11px] font-semibold px-2.5 py-1 rounded shadow-xs transition-colors cursor-pointer focus:outline-none">
                          <span>Select an option</span>
                          <ChevronDown className="size-3" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-44 p-1 text-xs">
                          <DropdownMenuItem asChild>
                            <Link href={`/products/${p.slug}`} className="flex items-center gap-2 cursor-pointer">
                              <Eye className="size-3.5 text-gray-500" />
                              <span>View</span>
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href="/dashboard/add-product" className="flex items-center gap-2 cursor-pointer">
                              <Edit className="size-3.5 text-blue-500" />
                              <span>Edit</span>
                            </Link>
                          </DropdownMenuItem>
                          {p.status !== "published" && (
                            <DropdownMenuItem
                              data-disabled={isBusy(p.id, "approve") ? "true" : undefined}
                              onClick={() =>
                                runAction(p, "approve", () => approveProduct(p.id))
                              }
                              className="flex items-center gap-2 text-emerald-600 hover:text-emerald-700 cursor-pointer font-medium"
                            >
                              <CheckCircle2 className="size-3.5 text-emerald-500" />
                              <span>{isBusy(p.id, "approve") ? "Memproses..." : "Approve"}</span>
                            </DropdownMenuItem>
                          )}
                          {p.status !== "rejected" && (
                            <DropdownMenuItem
                              data-disabled={isBusy(p.id, "reject") ? "true" : undefined}
                              onClick={() =>
                                runAction(p, "reject", () => rejectProduct(p.id))
                              }
                              className="flex items-center gap-2 text-orange-600 hover:text-orange-700 cursor-pointer font-medium"
                            >
                              <XCircle className="size-3.5 text-orange-500" />
                              <span>{isBusy(p.id, "reject") ? "Memproses..." : "Reject"}</span>
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem
                            data-disabled={isBusy(p.id, "featured") ? "true" : undefined}
                            onClick={() =>
                              runAction(p, "featured", () =>
                                setProductFeatured(p.id, !p.isFeatured)
                              )
                            }
                            className="flex items-center gap-2 text-teal-600 hover:text-teal-700 cursor-pointer font-medium"
                          >
                            <Star className="size-3.5 text-teal-500" />
                            <span>
                              {isBusy(p.id, "featured")
                                ? "Memproses..."
                                : p.isFeatured
                                ? "Hapus Featured"
                                : "Jadikan Featured"}
                            </span>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            data-disabled={isBusy(p.id, "delete") ? "true" : undefined}
                            onClick={() => handleDelete(p)}
                            className="flex items-center gap-2 text-red-600 hover:text-red-700 cursor-pointer font-medium"
                          >
                            <Trash2 className="size-3.5 text-red-500" />
                            <span>{isBusy(p.id, "delete") ? "Menghapus..." : "Delete"}</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-3.5 border-t border-gray-200 flex items-center justify-between text-xs text-gray-500 bg-gray-50/50">
          <div>
            Showing 1 to {filteredProducts.length} of {filteredProducts.length} entries
          </div>
          <div className="flex items-center gap-1">
            {[1, 2, 3].map((page) => (
              <button
                key={page}
                type="button"
                onClick={() => setCurrentPage(page)}
                className={`px-2.5 py-1 text-xs rounded transition-colors cursor-pointer ${
                  currentPage === page
                    ? "bg-blue-600 text-white font-bold"
                    : "border border-gray-200 hover:bg-white text-gray-700"
                }`}
              >
                {page}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.min(3, p + 1))}
              className="px-2.5 py-1 text-xs border border-gray-200 hover:bg-white rounded text-gray-700 cursor-pointer"
            >
              &gt;
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
