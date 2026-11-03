"use client";

import { useState } from "react";
import { Mail, Send } from "lucide-react";

import { useToast } from "@/components/ui/toast-context";
import { subscribeNewsletterAction } from "@/app/actions";

export function NewsletterSection({ config = {}, title }) {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (saving) return;

    const value = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value)) {
      toast.error("Masukkan alamat email yang valid");
      return;
    }

    setSaving(true);
    const res = await subscribeNewsletterAction(value);
    setSaving(false);

    if (res?.success) {
      if (res.duplicate) toast.info(res.message);
      else toast.success(res.message);
      setEmail("");
    } else {
      toast.error(res?.error || "Email belum tersimpan");
    }
  };

  return (
    <section className="bg-gray-50/60 py-8 sm:py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl rounded-2xl border border-gray-100 bg-white p-6 text-center shadow-xs sm:p-8">
          <span className="mx-auto flex size-11 items-center justify-center rounded-full bg-teal-50 text-[#14B8A6]">
            <Mail className="size-5" />
          </span>

          <h2 className="mt-4 text-xl font-bold tracking-tight text-gray-900 sm:text-2xl">
            {title || "Newsletter"}
          </h2>
          <p className="mx-auto mt-1.5 max-w-md text-xs text-gray-500 sm:text-sm">
            {config.subtitle || "Dapatkan info produk baru dan promo selektif langsung ke inbox Anda."}
          </p>

          <form onSubmit={handleSubmit} className="mx-auto mt-5 flex max-w-md flex-col gap-2.5 sm:flex-row">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Alamat email Anda"
              aria-label="Alamat email"
              className="w-full rounded-md border border-gray-300 px-3.5 py-2 text-xs text-gray-900 placeholder:text-gray-400 focus:border-[#14B8A6] focus:outline-none focus:ring-1 focus:ring-[#14B8A6] sm:text-sm"
            />
            <button
              type="submit"
              disabled={saving}
              className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-md bg-[#14B8A6] px-4 py-2 text-xs font-medium text-white shadow-xs transition-colors hover:bg-teal-600 disabled:opacity-60 sm:text-sm cursor-pointer"
            >
              <Send className="size-3.5" />
              {saving ? "Menyimpan..." : "Subscribe"}
            </button>
          </form>

          <p className="mt-3 text-[11px] text-gray-400">
            Email disimpan di tabel newsletter_subscribers dan bisa dihentikan lewat admin.
          </p>
        </div>
      </div>
    </section>
  );
}
