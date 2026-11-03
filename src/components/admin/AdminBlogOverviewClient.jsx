"use client";

import Link from "next/link";
import { BookOpen, Layers } from "lucide-react";

export function AdminBlogOverviewClient({ initialPosts = [] }) {
  const posts = initialPosts || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-200 pb-4">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Blog Overview</h1>
          <p className="text-xs text-gray-500 mt-1">
            Kelola artikel editorial, panduan belanja, dan kategori blog Modesy
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/admin/blog/posts"
            className="inline-flex items-center gap-1.5 bg-blue-500 hover:bg-blue-600 text-white text-xs font-semibold px-4 py-2 rounded shadow-xs transition-colors"
          >
            <BookOpen className="size-3.5" />
            Manage Posts
          </Link>
          <Link
            href="/admin/blog/categories"
            className="inline-flex items-center gap-1.5 border border-gray-300 hover:bg-gray-50 text-gray-700 text-xs font-semibold px-3 py-2 rounded shadow-2xs transition-colors"
          >
            <Layers className="size-3.5" />
            Blog Categories
          </Link>
        </div>
      </div>

      {/* Grid Posts Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {posts.slice(0, 6).map((post) => (
          <div
            key={post.id}
            className="bg-white rounded-lg border border-gray-200 shadow-xs overflow-hidden flex flex-col justify-between hover:shadow-md transition-shadow"
          >
            <div>
              <div className="aspect-16/9 bg-slate-100 overflow-hidden">
                <img
                  src={post.image}
                  alt={post.title}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="p-4">
                <div className="flex items-center justify-between text-[11px] text-gray-500 mb-1.5">
                  <span className="font-semibold text-blue-600">{post.category}</span>
                  <span>{post.date}</span>
                </div>
                <h3 className="font-semibold text-gray-800 text-sm line-clamp-2">
                  {post.title}
                </h3>
                <p className="text-xs text-gray-500 mt-1">Oleh: {post.author}</p>
              </div>
            </div>
            <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between text-xs">
              <span className="text-gray-500 font-mono text-[11px]">
                {post.views} views
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                {post.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
