"use client";

import { useEffect, useState } from "react";
import { MessageSquare, Share2, Check, Copy } from "lucide-react";
import { useToast } from "@/components/ui/toast-context";

function WhatsAppIcon(props) {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" {...props}>
      <path d="M17.472 14.382c-.301-.15-1.78-.878-2.056-.979-.276-.1-.476-.15-.676.15-.2.301-.776.979-.952 1.18-.175.2-.351.226-.652.075-.301-.15-1.27-.468-2.42-1.494-.894-.799-1.5-1.786-1.675-2.087-.175-.301-.019-.464.132-.614.136-.135.301-.351.451-.527.151-.175.201-.301.301-.501.1-.2.05-.376-.025-.526-.075-.15-.676-1.63-.927-2.232-.244-.587-.493-.507-.676-.516l-.577-.01c-.2 0-.526.075-.802.376-.275.301-1.052 1.028-1.052 2.507 0 1.48 1.077 2.909 1.228 3.109.15.2 2.12 3.238 5.136 4.542.717.311 1.277.496 1.713.635.72.229 1.375.197 1.893.119.578-.087 1.78-.727 2.03-1.43.25-.702.25-1.304.175-1.43-.075-.125-.275-.2-.576-.35zM12.04 2C6.519 2 2.03 6.486 2.03 12.008c0 1.763.46 3.484 1.334 5.002L2 22l5.132-1.347c1.467.8 3.12 1.223 4.908 1.223 5.52 0 10.01-4.486 10.01-10.008C22.05 6.486 17.56 2 12.04 2z" />
    </svg>
  );
}

function FacebookIcon(props) {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" {...props}>
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

function TwitterIcon(props) {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" {...props}>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

export function ProductShareAndWhatsApp({ product }) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const [shareUrl, setShareUrl] = useState("");

  const productTitle = product?.title || "Produk Modesy";

  useEffect(() => {
    if (typeof window !== "undefined") setShareUrl(window.location.href);
  }, []);

  // Nomor WhatsApp seller diambil dari profiles.phone; kalau seller tidak
  // mengisi nomor, tombol mengarah ke percakapan chat di situs.
  const waNumber = String(product?.seller?.phone || "").replace(/\D/g, "");
  const waHref = waNumber
    ? `https://wa.me/${waNumber}?text=${encodeURIComponent(
        `Halo, saya tertarik dengan produk "${productTitle}" di Modesy!`
      )}`
    : `/chat${product?.seller?.username ? `?to=${encodeURIComponent(product.seller.username)}` : ""}`;

  const facebookHref = shareUrl
    ? `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`
    : "#";
  const twitterHref = shareUrl
    ? `https://twitter.com/intent/tweet?text=${encodeURIComponent(productTitle)}&url=${encodeURIComponent(shareUrl)}`
    : "#";

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard?.writeText(window.location.href);
      setCopied(true);
      toast.success("Link produk berhasil disalin!");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="pt-3 border-t border-gray-100 flex flex-wrap items-center justify-between gap-3 text-xs">
      {/* WhatsApp Button */}
      <a
        href={waHref}
        target={waNumber ? "_blank" : undefined}
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 hover:scale-105 active:scale-95 border border-emerald-200/80 px-3.5 py-2 font-medium transition-all duration-200 cursor-pointer shadow-2xs hover:shadow-xs"
      >
        <WhatsAppIcon className="text-emerald-600 size-4" />
        <span>{waNumber ? "Tanya via WhatsApp" : "Chat Seller"}</span>
      </a>

      {/* Social Share Icons */}
      <div className="flex items-center gap-1.5 text-gray-500">
        <span className="text-[11px] font-medium mr-1 text-gray-400">Bagikan:</span>
        <a
          href={facebookHref}
          target="_blank"
          rel="noopener noreferrer"
          className="size-7 rounded-full bg-gray-100 text-gray-600 hover:bg-[#1877F2] hover:text-white hover:scale-110 active:scale-95 flex items-center justify-center transition-all duration-200 cursor-pointer shadow-2xs"
          aria-label="Share to Facebook"
        >
          <FacebookIcon />
        </a>
        <a
          href={twitterHref}
          target="_blank"
          rel="noopener noreferrer"
          className="size-7 rounded-full bg-gray-100 text-gray-600 hover:bg-black hover:text-white hover:scale-110 active:scale-95 flex items-center justify-center transition-all duration-200 cursor-pointer shadow-2xs"
          aria-label="Share to Twitter"
        >
          <TwitterIcon />
        </a>
        <button
          type="button"
          onClick={handleCopyLink}
          className="size-7 rounded-full bg-gray-100 hover:bg-teal-600 hover:text-white hover:scale-110 active:scale-95 flex items-center justify-center transition-all duration-200 cursor-pointer shadow-2xs"
          aria-label="Copy link"
          title="Salin Link"
        >
          {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
        </button>
      </div>
    </div>
  );
}
