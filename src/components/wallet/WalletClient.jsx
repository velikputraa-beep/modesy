"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Wallet,
  Plus,
  ArrowUpRight,
  CheckCircle2,
  ChevronRight,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatPriceIDR } from "@/lib/utils";
import {
  getWalletDataAction,
  getPayoutAccountAction,
  savePayoutAccountAction,
} from "@/app/wallet/actions";
import { motion } from "framer-motion";

const EMPTY_ACCOUNT = {
  method: "Bank Transfer",
  bankName: "",
  accountNumber: "",
  accountName: "",
};

export function WalletClient() {
  const [activeTab, setActiveTab] = useState("earnings");
  const [toastMessage, setToastMessage] = useState("");

  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Payout Account Form State
  const [accountForm, setAccountForm] = useState(EMPTY_ACCOUNT);
  const [savingAccount, setSavingAccount] = useState(false);

  const walletTabs = [
    { id: "earnings", label: "Earnings" },
    { id: "deposits", label: "Deposits" },
    { id: "expenses", label: "Expenses" },
    { id: "payouts", label: "Payouts" },
    { id: "set-payout-account", label: "Set Payout Account" },
  ];

  useEffect(() => {
    Promise.all([getWalletDataAction(), getPayoutAccountAction()]).then(
      ([wallet, account]) => {
        setBalance(wallet.balance || 0);
        setTransactions(wallet.transactions || []);
        if (account) setAccountForm(account);
        setLoading(false);
      }
    );
  }, []);

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3000);
  };

  const deposits = transactions.filter((t) => t.type === "deposit");
  const expenses = transactions.filter((t) => t.type === "purchase");
  const payouts = transactions.filter(
    (t) => t.type === "withdraw" || t.type === "payout"
  );
  const earnings = transactions.filter((t) => t.type === "earning");

  const handleSaveAccount = async (e) => {
    e.preventDefault();
    setSavingAccount(true);
    const result = await savePayoutAccountAction(accountForm);
    setSavingAccount(false);
    if (result.error) {
      triggerToast(result.error);
      return;
    }
    triggerToast("Akun payout berhasil disimpan");
    // "Set Payout Account" adalah tab, bukan dialog — berpindah ke tab
    // Payouts memberi efek modal tertutup setelah save.
    setActiveTab("payouts");
  };

  const EmptyRow = ({ colSpan, label }) => (
    <tr>
      <td
        colSpan={colSpan}
        className="px-5 py-10 text-center text-gray-400 text-xs"
      >
        {label}
      </td>
    </tr>
  );

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
            <span className="text-gray-800">Wallet</span>
          </nav>

          {/* Page Title */}
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">
              Wallet
            </h1>
          </div>

          {/* Card Wallet Balance (Center) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="max-w-md mx-auto"
          >
            <Card className="bg-white border border-gray-200/90 rounded-xl p-8 text-center relative shadow-xs">
              {/* Tombol Add Funds (Top Right) */}
              <Link
                href="/wallet/deposit"
                className="absolute top-4 right-4 inline-flex items-center gap-1.5 text-xs font-semibold text-gray-700 bg-gray-50 hover:bg-gray-100 border border-gray-200 px-3 py-1.5 rounded-md transition-all duration-200 hover:scale-105 hover:shadow-md active:scale-95 shadow-2xs"
              >
                <Wallet className="size-3.5 text-gray-600" />
                <span>Add Funds</span>
              </Link>

              {/* Wallet Icon Besar */}
              <div className="size-16 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center mx-auto mb-4 border border-teal-100 shadow-inner">
                <Wallet className="size-8" />
              </div>

              {/* Label */}
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                Wallet Balance
              </p>

              {/* Angka Besar */}
              <p className="text-4xl font-extrabold text-gray-950 mt-1">
                {formatPriceIDR(balance)}
              </p>
            </Card>
          </motion.div>

          {/* Tab Navigation (Centered Buttons with animated sliding indicator) */}
          <div className="flex justify-center pt-2">
            <div className="inline-flex flex-wrap items-center justify-center gap-1.5 bg-gray-100/80 p-1.5 rounded-lg border border-gray-200/60 shadow-2xs">
              {walletTabs.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`relative text-xs font-semibold px-4 py-2 rounded-md transition-colors cursor-pointer ${
                      isActive
                        ? "text-white"
                        : "text-gray-600 hover:text-teal-600 hover:bg-white/40"
                    }`}
                  >
                    {isActive && (
                      <motion.span
                        layoutId="walletTabIndicator"
                        className="absolute inset-0 bg-teal-600 rounded-md shadow-xs z-0"
                        transition={{ type: "spring", stiffness: 450, damping: 35 }}
                      />
                    )}
                    <span className="relative z-10">{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* TAB 1: EARNINGS */}
          {activeTab === "earnings" && (
            <Card className="bg-white border border-gray-200/90 rounded-xl overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-50/80 border-b border-gray-200 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                    <tr>
                      <th className="px-5 py-3.5">Order</th>
                      <th className="px-5 py-3.5">Earned Amount</th>
                      <th className="px-5 py-3.5">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-gray-700">
                    {loading ? (
                      <EmptyRow colSpan={3} label="Memuat data..." />
                    ) : earnings.length === 0 ? (
                      <EmptyRow colSpan={3} label="Belum ada pendapatan" />
                    ) : (
                      earnings.map((row) => (
                        <tr
                          key={row.id}
                          className="hover:bg-gray-50/70 transition-colors"
                        >
                          <td className="px-5 py-4 font-semibold text-gray-900">
                            {row.description}
                          </td>
                          <td className="px-5 py-4 text-green-600 font-bold whitespace-nowrap">
                            +{formatPriceIDR(row.amount)}
                          </td>
                          <td className="px-5 py-4 text-gray-500 whitespace-nowrap">
                            {row.date}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          )}

          {/* TAB 2: DEPOSITS */}
          {activeTab === "deposits" && (
            <Card className="bg-white border border-gray-200/90 rounded-xl overflow-hidden shadow-xs">
              <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <span className="text-xs font-semibold text-gray-700">
                  Deposit Transactions
                </span>
                <Button
                  asChild
                  size="sm"
                  className="bg-teal-600 hover:bg-teal-700 text-white text-xs h-8 px-3.5 gap-1.5"
                >
                  <Link href="/wallet/deposit">
                    <Plus className="size-3.5" />
                    <span>New Deposit</span>
                  </Link>
                </Button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-50 text-[11px] font-bold text-gray-500 uppercase tracking-wider border-b border-gray-200">
                    <tr>
                      <th className="px-5 py-3.5">ID</th>
                      <th className="px-5 py-3.5">Payment Method</th>
                      <th className="px-5 py-3.5">Amount</th>
                      <th className="px-5 py-3.5">Status</th>
                      <th className="px-5 py-3.5">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-gray-700">
                    {loading ? (
                      <EmptyRow colSpan={5} label="Memuat data..." />
                    ) : deposits.length === 0 ? (
                      <EmptyRow colSpan={5} label="Belum ada deposit" />
                    ) : (
                      deposits.map((dep) => (
                        <tr
                          key={dep.id}
                          className="hover:bg-gray-50/70 transition-colors"
                        >
                          <td className="px-5 py-3.5 font-semibold text-gray-900">
                            #{dep.id.slice(0, 8)}
                          </td>
                          <td className="px-5 py-3.5 font-medium text-gray-800 capitalize">
                            {dep.method?.replace("_", " ") || "Bank Transfer"}
                          </td>
                          <td className="px-5 py-3.5 font-bold text-teal-600">
                            {formatPriceIDR(dep.amount)}
                          </td>
                          <td className="px-5 py-3.5">
                            <span
                              className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${
                                dep.status === "completed"
                                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                  : "bg-amber-50 text-amber-700 border-amber-200"
                              }`}
                            >
                              {dep.status === "completed" ? "Completed" : "Pending"}
                            </span>
                          </td>
                          <td className="px-5 py-3.5 text-gray-500">{dep.date}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          )}

          {/* TAB 3: EXPENSES */}
          {activeTab === "expenses" && (
            <Card className="bg-white border border-gray-200/90 rounded-xl overflow-hidden shadow-xs">
              <div className="p-4 border-b border-gray-100 bg-gray-50/50">
                <span className="text-xs font-semibold text-gray-700">
                  Wallet Expenses
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-50 text-[11px] font-bold text-gray-500 uppercase tracking-wider border-b border-gray-200">
                    <tr>
                      <th className="px-5 py-3.5">ID</th>
                      <th className="px-5 py-3.5">Description</th>
                      <th className="px-5 py-3.5">Amount</th>
                      <th className="px-5 py-3.5">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-gray-700">
                    {loading ? (
                      <EmptyRow colSpan={4} label="Memuat data..." />
                    ) : expenses.length === 0 ? (
                      <EmptyRow colSpan={4} label="Belum ada pengeluaran" />
                    ) : (
                      expenses.map((exp) => (
                        <tr
                          key={exp.id}
                          className="hover:bg-gray-50/70 transition-colors"
                        >
                          <td className="px-5 py-3.5 font-semibold text-gray-900">
                            #{exp.id.slice(0, 8)}
                          </td>
                          <td className="px-5 py-3.5 font-medium text-gray-800">
                            {exp.description}
                          </td>
                          <td className="px-5 py-3.5 font-bold text-red-500">
                            -{formatPriceIDR(exp.amount)}
                          </td>
                          <td className="px-5 py-3.5 text-gray-500">{exp.date}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          )}

          {/* TAB 4: PAYOUTS */}
          {activeTab === "payouts" && (
            <Card className="bg-white border border-gray-200/90 rounded-xl overflow-hidden shadow-xs">
              <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <span className="text-xs font-semibold text-gray-700">
                  Payout History
                </span>
                <Button
                  asChild
                  size="sm"
                  className="bg-teal-600 hover:bg-teal-700 text-white text-xs h-8 px-3.5 gap-1.5"
                >
                  <Link href="/wallet/payout">
                    <ArrowUpRight className="size-3.5" />
                    <span>Request Payout</span>
                  </Link>
                </Button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-50 text-[11px] font-bold text-gray-500 uppercase tracking-wider border-b border-gray-200">
                    <tr>
                      <th className="px-5 py-3.5">ID</th>
                      <th className="px-5 py-3.5">Amount</th>
                      <th className="px-5 py-3.5">Date</th>
                      <th className="px-5 py-3.5">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-gray-700">
                    {loading ? (
                      <EmptyRow colSpan={4} label="Memuat data..." />
                    ) : payouts.length === 0 ? (
                      <EmptyRow colSpan={4} label="Belum ada pencairan dana" />
                    ) : (
                      payouts.map((pay) => (
                        <tr
                          key={pay.id}
                          className="hover:bg-gray-50/70 transition-colors"
                        >
                          <td className="px-5 py-3.5 font-semibold text-gray-900">
                            #{pay.id.slice(0, 8)}
                          </td>
                          <td className="px-5 py-3.5 font-bold text-gray-900">
                            {formatPriceIDR(pay.amount)}
                          </td>
                          <td className="px-5 py-3.5 text-gray-500">{pay.date}</td>
                          <td className="px-5 py-3.5">
                            <span
                              className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${
                                pay.status === "completed"
                                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                  : "bg-amber-50 text-amber-700 border-amber-200"
                              }`}
                            >
                              {pay.status === "completed" ? "Completed" : "Pending"}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          )}

          {/* TAB 5: SET PAYOUT ACCOUNT */}
          {activeTab === "set-payout-account" && (
            <Card className="max-w-xl mx-auto bg-white border border-gray-200/90 rounded-xl p-6 sm:p-8 shadow-xs">
              <div className="mb-6 border-b border-gray-100 pb-4">
                <h3 className="text-base font-bold text-gray-900">
                  Set Payout Account
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Specify where you want to withdraw your earned wallet balance
                </p>
              </div>

              <form onSubmit={handleSaveAccount} className="space-y-4">
                {/* Method */}
                <div>
                  <Label className="text-xs font-semibold text-gray-700 block mb-1.5">
                    Payout Method
                  </Label>
                  <select
                    value={accountForm.method}
                    onChange={(e) =>
                      setAccountForm({ ...accountForm, method: e.target.value })
                    }
                    className="w-full bg-white border border-gray-200 rounded-md px-3.5 py-2 text-xs text-gray-800 focus:outline-none focus:ring-1 focus:ring-teal-500"
                  >
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="PayPal">PayPal</option>
                  </select>
                </div>

                {/* Bank / Service Name */}
                <div>
                  <Label className="text-xs font-semibold text-gray-700 block mb-1.5">
                    {accountForm.method === "PayPal"
                      ? "PayPal Email Account"
                      : "Bank Name"}
                  </Label>
                  <Input
                    required
                    value={accountForm.bankName}
                    onChange={(e) =>
                      setAccountForm({ ...accountForm, bankName: e.target.value })
                    }
                    placeholder={
                      accountForm.method === "PayPal"
                        ? "e.g. yourname@paypal.com"
                        : "e.g. Bank Central Asia (BCA)"
                    }
                  />
                </div>

                {/* Account Number */}
                <div>
                  <Label className="text-xs font-semibold text-gray-700 block mb-1.5">
                    Account Number / IBAN
                  </Label>
                  <Input
                    required
                    value={accountForm.accountNumber}
                    onChange={(e) =>
                      setAccountForm({
                        ...accountForm,
                        accountNumber: e.target.value,
                      })
                    }
                    placeholder="e.g. 1234567890"
                  />
                </div>

                {/* Account Name */}
                <div>
                  <Label className="text-xs font-semibold text-gray-700 block mb-1.5">
                    Account Holder Name
                  </Label>
                  <Input
                    required
                    value={accountForm.accountName}
                    onChange={(e) =>
                      setAccountForm({
                        ...accountForm,
                        accountName: e.target.value,
                      })
                    }
                    placeholder="e.g. John Doe"
                  />
                </div>

                <div className="pt-3 flex justify-end">
                  <Button
                    type="submit"
                    disabled={savingAccount}
                    className="bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold px-6 shadow-xs"
                  >
                    {savingAccount ? "Menyimpan..." : "Save Account"}
                  </Button>
                </div>
              </form>
            </Card>
          )}
        </div>
      </main>
    </>
  );
}
