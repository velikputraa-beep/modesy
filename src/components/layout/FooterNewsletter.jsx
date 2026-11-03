"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast-context";
import { subscribeNewsletterAction } from "@/app/actions";

export function FooterNewsletter() {
  const [email, setEmail] = useState("");
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const handleSubscribe = async (e) => {
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
    <form onSubmit={handleSubscribe} className="mt-4 space-y-2">
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Enter your email"
        className="w-full rounded-md border border-gray-300 bg-white px-3.5 py-2 text-xs text-gray-900 placeholder:text-gray-400 focus:border-[#14B8A6] focus:outline-none focus:ring-1 focus:ring-[#14B8A6] sm:text-sm"
      />
      <Button
        type="submit"
        disabled={saving}
        className="w-full bg-[#14B8A6] text-white hover:bg-teal-600 font-medium py-2 text-xs sm:text-sm shadow-xs cursor-pointer disabled:opacity-60"
      >
        {saving ? "Menyimpan..." : "Subscribe"}
      </Button>
    </form>
  );
}
