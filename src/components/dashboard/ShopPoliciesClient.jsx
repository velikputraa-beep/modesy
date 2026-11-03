"use client";

import { useState } from "react";
import {
  CheckCircle,
  Circle,
  Check,
  X,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  List,
  ListOrdered,
  Link as LinkIcon,
  Code,
  Image as ImageIcon,
  Video,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { updateShopPolicies } from "@/app/dashboard/actions";

const DEFAULT_SHOP_POLICIES = `Welcome to the Modesy e-commerce platform! As a vendor, establishing clear shop policies is essential to building trust with your customers and ensuring a smooth and transparent transaction process. This guide will help you create effective shop policies tailored to your unique business needs on the Modesy platform.

1. Shipping Policy
Processing Time: Clearly state the time it takes to prepare and ship orders. This might vary depending on the product type and availability. For example, "All orders are processed within 2-3 business days."
Shipping Methods: Outline the available shipping options, including standard, express, and any international shipping services you offer. Include estimated delivery times and the carriers used (e.g., USPS, FedEx, DHL).
Shipping Fees: Specify if you offer free shipping or if fees apply. If applicable, include details about flat-rate shipping, weight-based pricing, or any other shipping fee structure.
International Shipping: If you ship internationally, mention any restrictions, additional fees, or customs duties that may apply.

2. Returns & Exchanges Policy
Return Window: State the duration within which customers can request returns or exchanges (e.g., "Returns accepted within 14 days of delivery").
Condition of Items: Clarify that returned items must be in their original, unused condition with all tags and original packaging intact.
Return Shipping Costs: Specify whether the customer or the seller is responsible for return shipping costs.
Non-Returnable Items: List any items that cannot be returned (e.g., custom orders, digital downloads, or intimate goods).

3. Payment Policy
Accepted Methods: Modesy supports secure payment methods including credit/debit cards, bank transfers, and digital wallets.
Payment Timing: Payments are processed immediately upon order placement to confirm the purchase.

4. Order Cancellation Policy
Cancellation Window: Specify if buyers can cancel orders before shipment (e.g., "Cancellations accepted within 2 hours of purchase").
After Shipment: Once an order has shipped, it cannot be cancelled but may be returned according to our Returns Policy.

5. Privacy & Data Protection
Customer Information: We treat customer privacy seriously. Personal details such as shipping addresses and contact information are used exclusively for order fulfillment and communication.

6. Customer Service & Communication
Response Time: We strive to reply to all buyer inquiries and quote requests within 24 hours on business days.
Contact Channels: Please use the Modesy on-platform messaging system for all official questions and support requests.

7. Store Rules & Buyer Conduct
Fair Trading: We are committed to honesty and mutual respect. Misleading claims, harassment, or abusive behavior will be reported to Modesy administration.

8. Custom Orders & Personalization
Lead Time: Customized products may require an additional 3-5 business days for production before shipment.
Approval: Proof designs will be sent via chat for buyer confirmation before physical manufacturing begins.

9. Digital Products Policy
Instant Access: Digital purchases are delivered electronically immediately upon completed payment verification.
Non-Refundable: Because of the nature of digital goods, downloaded digital items are non-refundable.

10. Legal Compliance & Disclaimer
Platform Rules: All sales adhere to Modesy Terms of Service and applicable local commercial laws.`;

export function ShopPoliciesClient({ initialContent = "", initialStatus = "enable" }) {
  // Status enable/disable TIDAK punya kolom backend, jadi hanya state lokal.
  const [status, setStatus] = useState(initialStatus || "enable");
  const [content, setContent] = useState(initialContent || DEFAULT_SHOP_POLICIES);
  const [toastMessage, setToastMessage] = useState("");
  const [toastError, setToastError] = useState(false);
  const [saving, setSaving] = useState(false);

  const showToast = (msg, isError = false) => {
    setToastMessage(msg);
    setToastError(isError);
    setTimeout(() => {
      setToastMessage("");
    }, 3500);
  };

  const handleSave = async () => {
    if (saving) return;
    setSaving(true);
    // Halaman ini hanya punya satu dokumen kebijakan gabungan; disimpan ke slot
    // `returnPolicy` karena aksi tidak punya field "general".
    const result = await updateShopPolicies({
      returnPolicy: content,
      cancellationPolicy: "",
      shippingPolicy: "",
      faq: "",
    });
    setSaving(false);
    if (result?.success) {
      showToast(result.message || "Kebijakan toko berhasil diperbarui");
    } else {
      showToast(result?.error || "Gagal menyimpan kebijakan toko", true);
    }
  };

  const handleFormat = (prefix, suffix = "") => {
    setContent((prev) => `${prev ? prev + "\n" : ""}${prefix}text${suffix}`);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      {/* Toast popup */}
      {toastMessage && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-2.5 text-white text-xs font-semibold px-4 py-3 rounded-lg shadow-xl animate-in fade-in slide-in-from-bottom-2 ${
            toastError ? "bg-red-600" : "bg-teal-600"
          }`}
        >
          {toastError ? (
            <X className="size-4 shrink-0" />
          ) : (
            <Check className="size-4 shrink-0" />
          )}
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Judul Halaman */}
      <h1 className="text-2xl font-bold tracking-tight text-gray-800 mb-6">
        Shop Policies
      </h1>

      {/* Card Utama */}
      <Card className="border border-gray-200 bg-white rounded-lg p-6 space-y-6 shadow-xs">
        {/* Form Group "Status" */}
        <div>
          <Label className="text-sm font-semibold text-gray-800 block mb-2.5">
            Status
          </Label>
          <div className="flex items-center gap-8">
            {/* Enable Radio */}
            <label
              onClick={() => setStatus("enable")}
              className="flex items-center gap-2 cursor-pointer font-medium text-sm text-gray-800 select-none group"
            >
              {status === "enable" ? (
                <CheckCircle className="size-5 text-teal-600 fill-teal-100" />
              ) : (
                <Circle className="size-5 text-gray-300 group-hover:text-gray-400" />
              )}
              <span>Enable</span>
            </label>

            {/* Disable Radio */}
            <label
              onClick={() => setStatus("disable")}
              className="flex items-center gap-2 cursor-pointer font-medium text-sm text-gray-600 hover:text-gray-800 select-none group"
            >
              {status === "disable" ? (
                <CheckCircle className="size-5 text-teal-600 fill-teal-100" />
              ) : (
                <Circle className="size-5 text-gray-300 group-hover:text-gray-400" />
              )}
              <span>Disable</span>
            </label>
          </div>
          <p className="text-[11px] text-gray-400 mt-2">
            Catatan: status Enable/Disable belum disimpan ke server (belum ada
            kolomnya).
          </p>
        </div>

        {/* Form Group "Content" */}
        <div>
          <Label className="text-sm font-semibold text-gray-800 block mb-2">
            Content
          </Label>

          {/* TinyMCE-styled Editor Box */}
          <div className="border border-gray-300 rounded-md overflow-hidden bg-white shadow-xs">
            {/* Menubar */}
            <div className="px-3 py-1.5 bg-gray-50 border-b border-gray-200 text-xs text-gray-600 flex items-center gap-4 select-none">
              <span className="hover:text-gray-900 cursor-pointer">File</span>
              <span className="hover:text-gray-900 cursor-pointer">Insert</span>
              <span className="hover:text-gray-900 cursor-pointer">Format</span>
              <span className="hover:text-gray-900 cursor-pointer">Table</span>
            </div>

            {/* Toolbar */}
            <div className="px-2 py-1.5 bg-gray-50/60 border-b border-gray-200 flex flex-wrap items-center gap-1 text-gray-600 select-none">
              <button type="button" onClick={() => handleFormat("<pre><code>", "</code></pre>")} className="p-1 hover:bg-gray-200 rounded cursor-pointer" title="Code">
                <Code className="size-3.5" />
              </button>
              <span className="w-px h-4 bg-gray-300 mx-0.5" />
              <button type="button" onClick={() => handleFormat("**", "**")} className="p-1 hover:bg-gray-200 rounded font-bold cursor-pointer" title="Bold">
                <Bold className="size-3.5" />
              </button>
              <button type="button" onClick={() => handleFormat("*", "*")} className="p-1 hover:bg-gray-200 rounded italic cursor-pointer" title="Italic">
                <Italic className="size-3.5" />
              </button>
              <button type="button" onClick={() => handleFormat("<u>", "</u>")} className="p-1 hover:bg-gray-200 rounded underline cursor-pointer" title="Underline">
                <Underline className="size-3.5" />
              </button>
              <button type="button" onClick={() => handleFormat("~~", "~~")} className="p-1 hover:bg-gray-200 rounded line-through cursor-pointer" title="Strikethrough">
                <Strikethrough className="size-3.5" />
              </button>
              <span className="w-px h-4 bg-gray-300 mx-0.5" />
              <button type="button" onClick={() => handleFormat("\n- ")} className="p-1 hover:bg-gray-200 rounded cursor-pointer" title="List">
                <List className="size-3.5" />
              </button>
              <button type="button" onClick={() => handleFormat("\n1. ")} className="p-1 hover:bg-gray-200 rounded cursor-pointer" title="Ordered list">
                <ListOrdered className="size-3.5" />
              </button>
              <button type="button" onClick={() => handleFormat("[Link](https://", ")")} className="p-1 hover:bg-gray-200 rounded cursor-pointer" title="Insert link">
                <LinkIcon className="size-3.5" />
              </button>
              <button type="button" onClick={() => handleFormat("![Image](https://", ")")} className="p-1 hover:bg-gray-200 rounded cursor-pointer" title="Insert image">
                <ImageIcon className="size-3.5" />
              </button>
              <button type="button" onClick={() => handleFormat("[Video](https://", ")")} className="p-1 hover:bg-gray-200 rounded cursor-pointer" title="Insert video">
                <Video className="size-3.5" />
              </button>
            </div>

            {/* Textarea Besar (h-96) */}
            <textarea
              rows={16}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full h-96 p-4 text-sm text-gray-800 leading-relaxed placeholder:text-gray-400 focus:outline-none resize-y font-sans"
            />

            {/* Footer status */}
            <div className="px-3 py-1 bg-gray-50 border-t border-gray-200 text-[11px] text-gray-400 flex items-center justify-between select-none">
              <span>p</span>
              <span className="font-semibold text-gray-500">tiny</span>
            </div>
          </div>
        </div>

        {/* Tombol Save Changes (bg-teal-500, Kanan Bawah) */}
        <div className="flex justify-end pt-3">
          <Button
            type="button"
            disabled={saving}
            onClick={handleSave}
            className="bg-teal-500 hover:bg-teal-600 disabled:opacity-50 text-white text-sm font-semibold px-5 py-2.5 rounded-md flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
          >
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </Card>
    </div>
  );
}
