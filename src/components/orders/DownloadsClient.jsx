"use client";

import { useState } from "react";
import Link from "next/link";
import { Download, Star, ChevronRight, CheckCircle2 } from "lucide-react";
import { createReviewAction } from "@/app/products/[slug]/actions";

import { Card } from "@/components/ui/card";

export function DownloadsClient({ initialDownloads = [] }) {
  const [downloads, setDownloads] = useState(initialDownloads);
  const [toastMessage, setToastMessage] = useState("");

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3000);
  };

  const handleRate = (item, rating) => {
    if (!item.productId) return;
    setDownloads((prev) =>
      prev.map((d) => (d.id === item.id ? { ...d, rating } : d))
    );
    createReviewAction({ productId: item.productId, rating, comment: "" }).then((res) => {
      if (res?.error) triggerToast(res.error);
      else triggerToast(`Rating ${rating} bintang tersimpan`);
    });
  };

  const handleDownload = (item) => {
    if (!item.fileUrl) {
      triggerToast("File belum tersedia untuk produk ini");
      return;
    }
    window.open(item.fileUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <>
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2 bg-teal-600 text-white px-4 py-3 rounded-lg shadow-xl text-xs font-semibold animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="size-4 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      <div>
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-xs text-gray-500 font-medium mb-3">
          <Link href="/" className="hover:text-teal-600 transition-colors">
            Home
          </Link>
          <ChevronRight className="size-3 text-gray-400" />
          <span className="text-gray-800">Downloads</span>
        </nav>

        {/* Title */}
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 mb-6">
          Downloads
        </h1>

        {/* Downloads List */}
        {downloads.length === 0 ? (
          <Card className="bg-white border border-gray-200/90 rounded-lg p-12 text-center text-xs text-gray-500">
            Belum ada produk digital yang bisa diunduh.
          </Card>
        ) : (
        <div className="space-y-3">
          {downloads.map((item) => (
            <Card
              key={item.id}
              className="bg-white border border-gray-200/90 rounded-lg p-4 shadow-2xs hover:shadow-xs transition-shadow"
            >
              <div className="grid grid-cols-12 gap-3 sm:gap-4 items-center">
                {/* Col 1: Thumbnail (col-span-3 sm:col-span-1) */}
                <div className="col-span-3 sm:col-span-1">
                  <img
                    src={item.image}
                    alt={item.productName}
                    className="size-16 sm:size-20 rounded-lg object-cover bg-gray-100 border border-gray-100"
                  />
                </div>

                {/* Col 2: Info (col-span-9 sm:col-span-5 space-y-0.5 min-w-0"> */}
                <div className="col-span-9 sm:col-span-5 min-w-0">
                  <h3 className="text-sm font-semibold text-gray-900 truncate">
                    {item.productName}
                  </h3>
                  <p className="text-xs text-gray-500">{item.seller}</p>
                </div>

                {/* Col 3: Rating (col-span-7 sm:col-span-4 space-y-1"> */}
                <div className="col-span-7 sm:col-span-4">
                  <p className="text-[11px] text-gray-500">Rate this product:</p>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => {
                      const isFilled = star <= item.rating;
                      return (
                        <button
                          key={star}
                          type="button"
                          onClick={() => handleRate(item, star)}
                          className="text-amber-400 hover:scale-110 transition-transform cursor-pointer"
                          title={`Rate ${star} stars`}
                        >
                          <Star
                            className={`size-4 ${
                              isFilled
                                ? "fill-amber-400 text-amber-400"
                                : "text-gray-300 fill-none"
                            }`}
                          />
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Col 4: Download Button (col-span-5 sm:col-span-2 text-right) */}
                <div className="col-span-5 sm:col-span-2 text-right">
                  <button
                    type="button"
                    onClick={() => handleDownload(item)}
                    className="inline-flex items-center gap-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded px-3.5 py-2 text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                  >
                    <Download className="size-4" />
                    <span>Download</span>
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
        )}
      </div>
    </>
  );
}
