"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function ProductGallery({ images = [], title = "Product Image" }) {
  const displayImages = images.length > 0 ? images.slice(0, 4) : [];
  const [selectedImage, setSelectedImage] = useState(displayImages[0] || "");

  // Fallback jika produk belum punya gambar
  const activeImage = selectedImage || displayImages[0] || "/placeholder.svg";
  const currentIndex = displayImages.indexOf(activeImage);

  const handlePrev = (e) => {
    e.stopPropagation();
    if (displayImages.length <= 1) return;
    const nextIdx = currentIndex <= 0 ? displayImages.length - 1 : currentIndex - 1;
    setSelectedImage(displayImages[nextIdx]);
  };

  const handleNext = (e) => {
    e.stopPropagation();
    if (displayImages.length <= 1) return;
    const nextIdx = currentIndex >= displayImages.length - 1 ? 0 : currentIndex + 1;
    setSelectedImage(displayImages[nextIdx]);
  };

  return (
    <div className="flex flex-col w-full">
      {/* Gambar Utama Besar dengan Prev / Next Button */}
      <div className="relative aspect-square w-full overflow-hidden rounded-xl border border-gray-200 bg-gray-50 shadow-xs group">
        <AnimatePresence mode="wait">
          <motion.img
            key={activeImage}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            src={activeImage}
            alt={title}
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = "/placeholder.svg";
            }}
            className="h-full w-full object-cover"
          />
        </AnimatePresence>

        {displayImages.length > 1 && (
          <>
            {/* Tombol Prev */}
            <button
              type="button"
              onClick={handlePrev}
              aria-label="Previous image"
              className="absolute left-3 top-1/2 -translate-y-1/2 flex size-9 items-center justify-center rounded-full bg-white/85 text-gray-800 shadow-md backdrop-blur-xs transition-all duration-200 hover:bg-white hover:scale-110 active:scale-95 cursor-pointer opacity-90 hover:opacity-100"
            >
              <ChevronLeft className="size-5" />
            </button>

            {/* Tombol Next */}
            <button
              type="button"
              onClick={handleNext}
              aria-label="Next image"
              className="absolute right-3 top-1/2 -translate-y-1/2 flex size-9 items-center justify-center rounded-full bg-white/85 text-gray-800 shadow-md backdrop-blur-xs transition-all duration-200 hover:bg-white hover:scale-110 active:scale-95 cursor-pointer opacity-90 hover:opacity-100"
            >
              <ChevronRight className="size-5" />
            </button>
          </>
        )}
      </div>

      {/* 4 Thumbnail di Bawah Gambar Utama */}
      {displayImages.length > 1 && (
        <div className="mt-3 grid grid-cols-4 gap-2 sm:gap-3">
          {displayImages.map((img, index) => {
            const isSelected = activeImage === img;
            return (
              <button
                key={index}
                type="button"
                onClick={() => setSelectedImage(img)}
                aria-label={`Lihat gambar produk ${index + 1}`}
                className={`relative aspect-square overflow-hidden rounded-lg border bg-gray-50 transition-all duration-200 cursor-pointer hover:border-teal-600 hover:scale-105 active:scale-95 ${
                  isSelected
                    ? "border-teal-600 border-2 ring-2 ring-teal-500/30 shadow-xs scale-102"
                    : "border-gray-200"
                }`}
              >
                <img
                  src={img}
                  alt={`${title} thumbnail ${index + 1}`}
                  className="h-full w-full object-cover transition-transform duration-200 hover:scale-105"
                />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
