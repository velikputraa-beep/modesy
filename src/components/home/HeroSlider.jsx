"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";

export function HeroSlider({ banners = [] }) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev === banners.length - 1 ? 0 : prev + 1));
  }, [banners.length]);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev === 0 ? banners.length - 1 : prev - 1));
  }, [banners.length]);

  useEffect(() => {
    if (isPaused || banners.length === 0) return;

    const timer = setInterval(() => {
      nextSlide();
    }, 5000);

    return () => clearInterval(timer);
  }, [nextSlide, isPaused, banners.length]);

  if (banners.length === 0) return null;

  return (
    <div
      className="relative w-full overflow-hidden bg-gray-900 select-none h-[380px] sm:h-[460px] md:h-[500px]"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Slides Container */}
      <div className="relative h-full w-full">
        {banners.map((banner, index) => {
          const isActive = index === currentSlide;
          return (
            <div
              key={banner.id}
              className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                isActive ? "opacity-100 z-10 pointer-events-auto" : "opacity-0 z-0 pointer-events-none"
              }`}
            >
              {/* Gambar Background Full-Width */}
              <img
                src={banner.image}
                alt={banner.title}
                className="h-full w-full object-cover object-center"
              />

              {/* Overlay Gradient Elegan */}
              <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/50 to-transparent" />

              {/* Konten Teks */}
              <div className="absolute inset-0 flex items-center">
                <div className="mx-auto w-full max-w-7xl px-6 sm:px-8 lg:px-12">
                  <div className="max-w-2xl space-y-4">
                    {/* Badge Tag */}
                    <span className="inline-block rounded-full bg-[#14B8A6] px-3 py-1 text-xs font-semibold uppercase tracking-wider text-white shadow-xs">
                      {banner.tag}
                    </span>

                    {/* Judul Hero Slider */}
                    <h2 className="text-3xl font-black tracking-tight text-white sm:text-4xl md:text-5xl lg:text-6xl drop-shadow-sm">
                      {banner.title}
                    </h2>

                    {/* Deskripsi */}
                    <p className="text-sm font-normal text-gray-200 sm:text-base md:text-lg leading-relaxed drop-shadow-xs">
                      {banner.subtitle}
                    </p>

                    {/* Tombol Aksi */}
                    <div className="pt-2">
                      <Button
                        asChild
                        size="lg"
                        className="bg-white text-gray-900 hover:bg-[#14B8A6] hover:text-white font-semibold transition-all duration-200 shadow-lg px-6 h-11 text-sm sm:text-base group cursor-pointer"
                      >
                        <Link href={banner.buttonLink || "/products"}>
                          {banner.buttonText}
                          <ArrowRight className="ml-1 size-4 transition-transform group-hover:translate-x-1" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Tombol Navigasi Prev (Bulat di Kiri) */}
      <button
        type="button"
        onClick={prevSlide}
        aria-label="Previous Slide"
        className="absolute left-4 top-1/2 z-20 flex size-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/85 text-gray-800 shadow-md backdrop-blur-xs transition-all duration-200 hover:bg-teal-600 hover:text-white hover:scale-110 active:scale-95 cursor-pointer"
      >
        <ChevronLeft className="size-6" />
      </button>

      {/* Tombol Navigasi Next (Bulat di Kanan) */}
      <button
        type="button"
        onClick={nextSlide}
        aria-label="Next Slide"
        className="absolute right-4 top-1/2 z-20 flex size-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/85 text-gray-800 shadow-md backdrop-blur-xs transition-all duration-200 hover:bg-teal-600 hover:text-white hover:scale-110 active:scale-95 cursor-pointer"
      >
        <ChevronRight className="size-6" />
      </button>

      {/* Indikator Titik (Dots) di Bawah */}
      <div className="absolute bottom-5 left-1/2 z-20 flex -translate-x-1/2 gap-2">
        {banners.map((_, index) => (
          <button
            key={index}
            type="button"
            onClick={() => setCurrentSlide(index)}
            aria-label={`Go to slide ${index + 1}`}
            className={`h-2.5 rounded-full transition-all duration-300 ${
              index === currentSlide
                ? "w-8 bg-[#14B8A6]"
                : "w-2.5 bg-white/60 hover:bg-white"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
