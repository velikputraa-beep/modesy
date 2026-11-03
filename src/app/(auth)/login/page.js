"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Mail, Lock, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { loginAction } from "@/app/(auth)/actions";

export default function LoginPage() {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  const handleManualSubmit = (e) => {
    e.preventDefault();
    setError("");
    const formData = new FormData(e.target);
    startTransition(async () => {
      const result = await loginAction({
        email: formData.get("email"),
        password: formData.get("password"),
      });
      if (result?.error) setError(result.error);
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="w-full max-w-md"
    >
      <Card className="w-full rounded-2xl border border-gray-200 bg-white p-6 sm:p-8 shadow-xl">
        {/* Logo Modesy di atas (text-center) */}
        <div className="text-center mb-6">
          <Link href="/" className="inline-block select-none mb-2 transition-transform duration-200 hover:scale-105 active:scale-95">
            <span className="text-3xl font-black tracking-tight text-gray-950 font-sans">
              <span className="text-teal-600">M</span>
              odes
              <span className="text-teal-600">y</span>
            </span>
          </Link>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
            Masuk ke Modesy
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-gray-500">
            Gunakan akun terdaftar Anda untuk masuk
          </p>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-5 flex items-center gap-2.5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-xs sm:text-sm font-medium text-red-700">
            <span>{error}</span>
          </div>
        )}

        {/* Form Email + Password */}
        <form onSubmit={handleManualSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
              <input
                type="email"
                name="email"
                required
                placeholder="nama@email.com"
                className="w-full rounded-lg border border-gray-200 py-2.5 pl-9 pr-3 text-sm text-gray-900 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all duration-200"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
              <input
                type="password"
                name="password"
                required
                placeholder="••••••••"
                className="w-full rounded-lg border border-gray-200 py-2.5 pl-9 pr-3 text-sm text-gray-900 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all duration-200"
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={isPending}
            className="w-full h-11 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-lg shadow-sm gap-2 transition-all duration-200 hover:scale-105 hover:shadow-lg active:scale-95 mt-2 cursor-pointer"
          >
            {isPending ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                <span>Memproses...</span>
              </>
            ) : (
              <span>Masuk</span>
            )}
          </Button>
        </form>

        {/* Link ke Register */}
        <div className="mt-6 text-center text-xs sm:text-sm text-gray-500">
          Belum punya akun?{" "}
          <Link
            href="/register"
            className="font-bold text-teal-600 hover:text-teal-700 hover:underline transition-colors"
          >
            Daftar sekarang
          </Link>
        </div>
      </Card>
    </motion.div>
  );
}
