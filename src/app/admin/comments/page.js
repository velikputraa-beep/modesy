import Link from "next/link";
import { getAdminComments } from "@/lib/queries/admin";

import { Package, BookOpen, ChevronRight } from "lucide-react";

export default async function AdminCommentsOverviewPage() {
  const productComments = await getAdminComments({ limit: 100 });
  const productCommentsCount = productComments.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-xl font-bold text-gray-800">Comments Moderation</h1>
        <p className="text-xs text-gray-500 mt-1">
          Moderasi interaksi komentar pembeli pada etalase produk dan artikel blog Modesy
        </p>
      </div>

      {/* 2 Main Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
              <Package className="size-6" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-800 text-sm">Product Comments</h3>
              <p className="text-2xl font-bold text-gray-900 mt-0.5">{productCommentsCount} Komentar</p>
            </div>
          </div>
          <Link
            href="/admin/comments/product"
            className="mt-4 pt-3 border-t border-gray-100 text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center justify-between"
          >
            Kelola Komentar Produk <ChevronRight className="size-4" />
          </Link>
        </div>

        <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-50 text-purple-600 rounded-lg">
              <BookOpen className="size-6" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-800 text-sm">Blog Comments</h3>
              <p className="text-2xl font-bold text-gray-900 mt-0.5">0 Komentar</p>
            </div>
          </div>
          <Link
            href="/admin/comments/blog"
            className="mt-4 pt-3 border-t border-gray-100 text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center justify-between"
          >
            Kelola Komentar Blog <ChevronRight className="size-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
