import { createClient } from "@supabase/supabase-js";

// Server-only. Jangan pernah diimpor dari client component:
// key service role bypass RLS dan tidak boleh dikirim ke browser.
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY;

  if (!url || !key) return null;

  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false, storageKey: "modesy-admin" },
  });
}
