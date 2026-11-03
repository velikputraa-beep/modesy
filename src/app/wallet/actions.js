"use server";

import { getCurrentUser } from "@/lib/mock-auth";
import {
  getBalance,
  getTransactions,
  topUp,
  withdraw,
} from "@/lib/queries/wallet";
import { createClient } from "@/lib/supabase/server";

export async function getWalletDataAction() {
  const user = await getCurrentUser();
  if (!user) return { balance: 0, transactions: [] };
  const [balance, transactions] = await Promise.all([
    getBalance(user.id),
    getTransactions(user.id),
  ]);
  return { balance, transactions };
}

export async function topUpAction({ amount, method }) {
  const user = await getCurrentUser();
  if (!user) return { error: "Silakan login terlebih dahulu" };
  const amt = Number(amount);
  if (!amt || amt <= 0) return { error: "Nominal tidak valid" };
  const result = await topUp({ amount: amt, method: method || "bank_transfer" });
  if (result.error) return { error: result.error };
  return { ok: true };
}

export async function withdrawAction({ amount }) {
  const user = await getCurrentUser();
  if (!user) return { error: "Silakan login terlebih dahulu" };

  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("payout_account")
    .eq("id", user.id)
    .maybeSingle();
  const account = profile?.payout_account || null;
  if (!account) {
    return { error: "Atur payout account dulu di halaman Wallet" };
  }

  const amt = Number(amount);
  if (!amt || amt <= 0) return { error: "Nominal tidak valid" };
  const result = await withdraw({ amount: amt, account });
  if (result.error) return { error: result.error };
  return { ok: true };
}

export async function savePayoutAccountAction(account) {
  const user = await getCurrentUser();
  if (!user) return { error: "Silakan login terlebih dahulu" };
  const { method, bankName, accountNumber, accountName } = account || {};
  if (!method || !bankName || !accountNumber || !accountName) {
    return { error: "Data akun payout tidak lengkap" };
  }
  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update({
      payout_account: { method, bankName, accountNumber, accountName },
    })
    .eq("id", user.id);
  if (error) return { error: error.message };
  return { ok: true };
}

export async function getPayoutAccountAction() {
  const user = await getCurrentUser();
  if (!user) return null;
  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("payout_account")
    .eq("id", user.id)
    .maybeSingle();
  return data?.payout_account || null;
}
