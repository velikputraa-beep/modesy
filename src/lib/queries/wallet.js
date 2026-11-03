import { createClient } from "@/lib/supabase/server";

export async function getBalance(userId) {
  if (!userId) return 0;
  const supabase = await createClient();
  const { data } = await supabase
    .from("wallets")
    .select("balance")
    .eq("user_id", userId)
    .maybeSingle();
  return data ? Number(data.balance) : 0;
}

const TYPE_LABELS = {
  deposit: "Deposit",
  withdraw: "Penarikan",
  purchase: "Pembelian",
  earning: "Pendapatan",
  payout: "Pencairan",
};

export function mapTransaction(row) {
  const pad = (n) => String(n).padStart(2, "0");
  const d = new Date(row.created_at);
  const date = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  return {
    id: row.id,
    type: row.type,
    typeLabel: TYPE_LABELS[row.type] || row.type,
    amount: Number(row.amount),
    status: row.status,
    method: row.method,
    description: row.description || TYPE_LABELS[row.type] || row.type,
    date,
    createdAt: row.created_at,
  };
}

export async function getTransactions(userId) {
  if (!userId) return [];
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("wallet_transactions")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) return [];
  return (data || []).map(mapTransaction);
}

// Dipakai server actions di src/app/wallet/actions.js
export async function topUp({ amount, method }) {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("wallet_topup", {
    p_amount: amount,
    p_method: method || "bank_transfer",
  });
  if (error) return { error: error.message };
  return { transactionId: data };
}

export async function withdraw({ amount, account }) {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("wallet_withdraw", {
    p_amount: amount,
    p_account: account || null,
  });
  if (error) return { error: error.message };
  return { transactionId: data };
}
