import { AdminCurrencySettingsClient } from "@/components/admin/AdminCurrencySettingsClient";
import { getCurrenciesAdmin } from "@/lib/queries/admin-settings";

export default async function AdminCurrencySettingsPage() {
  const currencies = await getCurrenciesAdmin();

  return <AdminCurrencySettingsClient initialCurrencies={currencies} />;
}
