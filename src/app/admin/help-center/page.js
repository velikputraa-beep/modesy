import Link from "next/link";
import { getSupportTicketsAdmin, getKnowledgeBaseAdmin } from "@/lib/queries/admin-cms";

import { HelpCircle, LifeBuoy, BookOpen, ChevronRight } from "lucide-react";

export default async function AdminHelpCenterOverviewPage() {
  const [tickets, articles] = await Promise.all([getSupportTicketsAdmin(), getKnowledgeBaseAdmin()]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-xl font-bold text-gray-800">Help Center & Support</h1>
        <p className="text-xs text-gray-500 mt-1">
          Pusat bantuan pelanggan, tiket dukungan (support ticket), dan artikel dokumentasi (knowledge base)
        </p>
      </div>

      {/* 2 Main Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-rose-50 text-rose-600 rounded-lg">
              <LifeBuoy className="size-6" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-800 text-sm">Support Tickets</h3>
              <p className="text-2xl font-bold text-gray-900 mt-0.5">
                {tickets.length} Tiket Terdaftar
              </p>
            </div>
          </div>
          <Link
            href="/admin/help-center/tickets"
            className="mt-4 pt-3 border-t border-gray-100 text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center justify-between"
          >
            Buka Antrean Tiket <ChevronRight className="size-4" />
          </Link>
        </div>

        <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
              <BookOpen className="size-6" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-800 text-sm">Knowledge Base</h3>
              <p className="text-2xl font-bold text-gray-900 mt-0.5">
                {articles.length} Artikel Panduan
              </p>
            </div>
          </div>
          <Link
            href="/admin/help-center/knowledge-base"
            className="mt-4 pt-3 border-t border-gray-100 text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center justify-between"
          >
            Kelola Knowledge Base <ChevronRight className="size-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
