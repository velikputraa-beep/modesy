"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Building2,
  CreditCard,
  ChevronRight,
  CheckCircle2,
  ArrowLeft,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatPriceIDR } from "@/lib/utils";
import { topUpAction } from "@/app/wallet/actions";

export function DepositClient() {
  const router = useRouter();
  const [amount, setAmount] = useState("100000");
  const [method, setMethod] = useState("bank_transfer");
  const [toastMessage, setToastMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const quickAmounts = ["50000", "100000", "250000", "500000"];

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const nominal = Number(amount);
    if (!nominal || nominal <= 0) {
      triggerToast("Masukkan jumlah deposit yang valid!");
      return;
    }

    setIsSubmitting(true);
    const result = await topUpAction({ amount: nominal, method });
    setIsSubmitting(false);
    if (result.error) {
      triggerToast(result.error);
      return;
    }
    triggerToast(`Deposit sebesar ${formatPriceIDR(nominal)} berhasil diproses!`);
    setTimeout(() => {
      router.push("/wallet");
    }, 1200);
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

      <main className="flex-1 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
            <Link href="/" className="hover:text-teal-600 transition-colors">
              Home
            </Link>
            <ChevronRight className="size-3 text-gray-400" />
            <Link href="/wallet" className="hover:text-teal-600 transition-colors">
              Wallet
            </Link>
            <ChevronRight className="size-3 text-gray-400" />
            <span className="text-gray-800">Deposit</span>
          </nav>

          {/* Form Card */}
          <div className="max-w-md mx-auto">
            <div className="mb-4 flex items-center justify-between">
              <h1 className="text-2xl font-bold tracking-tight text-gray-900">
                Add Funds
              </h1>
              <Link
                href="/wallet"
                className="text-xs text-teal-600 hover:text-teal-700 font-semibold inline-flex items-center gap-1"
              >
                <ArrowLeft className="size-3.5" />
                <span>Back to Wallet</span>
              </Link>
            </div>

            <Card className="bg-white border border-gray-200/90 rounded-xl p-6 sm:p-7 shadow-xs">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Deposit Amount */}
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-gray-700 block">
                    Deposit Amount
                  </Label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 font-semibold text-xs">
                      Rp
                    </span>
                    <Input
                      type="number"
                      min="1"
                      step="any"
                      required
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="pl-10 text-sm font-semibold text-gray-900"
                      placeholder="0"
                    />
                  </div>

                  {/* Quick Select Buttons */}
                  <div className="grid grid-cols-4 gap-2 pt-1">
                    {quickAmounts.map((amt) => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => setAmount(amt)}
                        className={`py-1.5 text-xs font-semibold rounded-md border transition-all cursor-pointer ${
                          amount === amt
                            ? "bg-teal-50 border-teal-600 text-teal-700 shadow-2xs"
                            : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        {formatPriceIDR(Number(amt))}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Payment Methods (Radio cards) */}
                <div className="space-y-2.5">
                  <Label className="text-xs font-semibold text-gray-700 block">
                    Select Payment Method
                  </Label>

                  {/* Option 1: Bank Transfer */}
                  <div
                    onClick={() => setMethod("bank_transfer")}
                    className={`flex items-center justify-between p-3.5 rounded-lg border cursor-pointer transition-all ${
                      method === "bank_transfer"
                        ? "border-teal-600 bg-teal-50/40 ring-1 ring-teal-500/20"
                        : "border-gray-200 bg-white hover:bg-gray-50/70"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="size-9 rounded-lg bg-gray-100 flex items-center justify-center text-gray-700">
                        <Building2 className="size-5" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-gray-900">
                          Bank Transfer
                        </p>
                        <p className="text-[11px] text-gray-500">
                          Transfer directly to company virtual account
                        </p>
                      </div>
                    </div>
                    <div
                      className={`size-4 rounded-full border flex items-center justify-center ${
                        method === "bank_transfer"
                          ? "border-teal-600 bg-teal-600"
                          : "border-gray-300"
                      }`}
                    >
                      {method === "bank_transfer" && (
                        <div className="size-1.5 rounded-full bg-white" />
                      )}
                    </div>
                  </div>

                  {/* Option 2: PayPal */}
                  <div
                    onClick={() => setMethod("paypal")}
                    className={`flex items-center justify-between p-3.5 rounded-lg border cursor-pointer transition-all ${
                      method === "paypal"
                        ? "border-teal-600 bg-teal-50/40 ring-1 ring-teal-500/20"
                        : "border-gray-200 bg-white hover:bg-gray-50/70"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="size-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                        <CreditCard className="size-5" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-gray-900">
                          PayPal
                        </p>
                        <p className="text-[11px] text-gray-500">
                          Pay securely via PayPal account or Card
                        </p>
                      </div>
                    </div>
                    <div
                      className={`size-4 rounded-full border flex items-center justify-center ${
                        method === "paypal"
                          ? "border-teal-600 bg-teal-600"
                          : "border-gray-300"
                      }`}
                    >
                      {method === "paypal" && (
                        <div className="size-1.5 rounded-full bg-white" />
                      )}
                    </div>
                  </div>

                  {/* Option 3: Stripe */}
                  <div
                    onClick={() => setMethod("stripe")}
                    className={`flex items-center justify-between p-3.5 rounded-lg border cursor-pointer transition-all ${
                      method === "stripe"
                        ? "border-teal-600 bg-teal-50/40 ring-1 ring-teal-500/20"
                        : "border-gray-200 bg-white hover:bg-gray-50/70"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="size-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                        <CreditCard className="size-5" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-gray-900">
                          Stripe
                        </p>
                        <p className="text-[11px] text-gray-500">
                          Credit / Debit Card (Visa, Mastercard, Amex)
                        </p>
                      </div>
                    </div>
                    <div
                      className={`size-4 rounded-full border flex items-center justify-center ${
                        method === "stripe"
                          ? "border-teal-600 bg-teal-600"
                          : "border-gray-300"
                      }`}
                    >
                      {method === "stripe" && (
                        <div className="size-1.5 rounded-full bg-white" />
                      )}
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold py-2.5 text-xs shadow-xs"
                >
                  {isSubmitting ? "Processing..." : "Continue to Payment"}
                </Button>
              </form>
            </Card>
          </div>
        </div>
      </main>
    </>
  );
}
