"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ChevronRight,
  CheckCircle2,
  ArrowLeft,
  Wallet,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatPriceIDR } from "@/lib/utils";
import {
  getWalletDataAction,
  getPayoutAccountAction,
  withdrawAction,
} from "@/app/wallet/actions";

export function PayoutClient() {
  const router = useRouter();
  const [amount, setAmount] = useState("50000");
  const [balance, setBalance] = useState(0);
  const [payoutAccount, setPayoutAccount] = useState(null);
  const [toastMessage, setToastMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    Promise.all([getWalletDataAction(), getPayoutAccountAction()]).then(
      ([wallet, account]) => {
        setBalance(wallet.balance || 0);
        setPayoutAccount(account);
      }
    );
  }, []);

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const withdrawAmount = Number(amount);
    if (!withdrawAmount || withdrawAmount <= 0) {
      triggerToast("Masukkan jumlah penarikan yang valid!");
      return;
    }
    if (withdrawAmount > balance) {
      triggerToast("Jumlah penarikan melebihi saldo yang tersedia!");
      return;
    }

    setIsSubmitting(true);
    const result = await withdrawAction({ amount: withdrawAmount });
    setIsSubmitting(false);
    if (result.error) {
      triggerToast(result.error);
      return;
    }
    triggerToast(
      `Permintaan penarikan dana sebesar ${formatPriceIDR(withdrawAmount)} berhasil diajukan!`
    );
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
            <span className="text-gray-800">Payout</span>
          </nav>

          {/* Form Card */}
          <div className="max-w-md mx-auto">
            <div className="mb-4 flex items-center justify-between">
              <h1 className="text-2xl font-bold tracking-tight text-gray-900">
                Request Payout
              </h1>
              <Link
                href="/wallet"
                className="text-xs text-teal-600 hover:text-teal-700 font-semibold inline-flex items-center gap-1"
              >
                <ArrowLeft className="size-3.5" />
                <span>Back to Wallet</span>
              </Link>
            </div>

            <Card className="bg-white border border-gray-200/90 rounded-xl p-6 sm:p-7 shadow-xs space-y-5">
              {/* Balance Summary Box */}
              <div className="bg-teal-50/60 border border-teal-100 rounded-lg p-3.5 flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-semibold text-teal-800 uppercase tracking-wider">
                    Available Balance
                  </p>
                  <p className="text-lg font-extrabold text-teal-950 mt-0.5">
                    {formatPriceIDR(balance)}
                  </p>
                </div>
                <div className="size-9 rounded-lg bg-teal-600 text-white flex items-center justify-center">
                  <Wallet className="size-5" />
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Withdrawal Amount */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-gray-700 block">
                    Withdrawal Amount
                  </Label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 font-semibold text-xs">
                      Rp
                    </span>
                    <Input
                      type="number"
                      min="1"
                      max={balance || undefined}
                      step="any"
                      required
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="pl-10 text-sm font-semibold text-gray-900"
                      placeholder="0"
                    />
                  </div>
                </div>

                {/* Payout Account */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-gray-700 block">
                    Payout Account
                  </Label>
                  {payoutAccount ? (
                    <div className="w-full bg-gray-50 border border-gray-200 rounded-md px-3.5 py-2.5 text-xs text-gray-800">
                      {payoutAccount.bankName} - {payoutAccount.accountNumber} (
                      {payoutAccount.accountName})
                    </div>
                  ) : (
                    <div className="w-full bg-amber-50 border border-amber-200 rounded-md px-3.5 py-2.5 text-xs text-amber-700">
                      Belum ada payout account. Atur dulu di halaman Wallet.
                    </div>
                  )}
                  <div className="pt-1 flex justify-between items-center text-[11px]">
                    <span className="text-gray-400">Need to change account?</span>
                    <Link
                      href="/wallet"
                      className="text-teal-600 hover:underline font-medium"
                    >
                      Set Payout Account →
                    </Link>
                  </div>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold py-2.5 text-xs shadow-xs"
                >
                  {isSubmitting ? "Submitting..." : "Submit Request"}
                </Button>
              </form>
            </Card>
          </div>
        </div>
      </main>
    </>
  );
}
