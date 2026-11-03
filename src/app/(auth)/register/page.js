"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { User, Mail, Lock, AtSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

import { registerAction } from "@/app/(auth)/actions";

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isPending, setIsPending] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsPending(true);
    setError("");
    const result = await registerAction({ name, username, email, password });
    if (result?.error) {
      setError(result.error);
      setIsPending(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="w-full max-w-md"
    >
      <Card className="w-full rounded-2xl border border-gray-200 bg-white p-6 sm:p-8 shadow-xl">
        {/* Error Notification */}
        {error && (
          <div className="mb-5 flex items-center gap-2.5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-xs sm:text-sm font-medium text-red-700">
            <span>{error}</span>
          </div>
        )}

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
            Daftar Akun Modesy
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-gray-500">
            Mulai jual beli produk unik di marketplace terpercaya
          </p>
        </div>

        {/* Form Register */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full Name */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              Nama Lengkap
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Contoh: Budi Santoso"
                className="w-full rounded-lg border border-gray-200 py-2.5 pl-9 pr-3 text-sm text-gray-900 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all duration-200"
              />
            </div>
          </div>

          {/* Username */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              Username
            </label>
            <div className="relative">
              <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="budisantoso"
                className="w-full rounded-lg border border-gray-200 py-2.5 pl-9 pr-3 text-sm text-gray-900 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all duration-200"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              Alamat Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="budi@example.com"
                className="w-full rounded-lg border border-gray-200 py-2.5 pl-9 pr-3 text-sm text-gray-900 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all duration-200"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              Kata Sandi
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimal 8 karakter"
                className="w-full rounded-lg border border-gray-200 py-2.5 pl-9 pr-3 text-sm text-gray-900 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all duration-200"
              />
            </div>
          </div>

          {/* Role Select */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              Daftar Sebagai
            </label>
            <select
              defaultValue="buyer"
              className="w-full rounded-lg border border-gray-200 py-2.5 px-3 text-sm text-gray-900 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white transition-all duration-200"
            >
              <option value="buyer">Pembeli (Buyer) — Belanja Produk</option>
              <option value="seller">Penjual (Seller) — Buka Toko & Jual Produk</option>
            </select>
          </div>

          <Button
            type="submit"
            className="w-full h-11 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-lg shadow-sm gap-2 transition-all duration-200 hover:scale-105 hover:shadow-lg active:scale-95 mt-4 cursor-pointer"
          >
            Daftar
          </Button>
        </form>

        {/* Link ke Login */}
        <div className="mt-6 text-center text-xs sm:text-sm text-gray-500">
          Sudah punya akun?{" "}
          <Link
            href="/login"
            className="font-bold text-teal-600 hover:text-teal-700 hover:underline transition-colors"
          >
            Masuk di sini
          </Link>
        </div>
      </Card>
    </motion.div>
  );
}
