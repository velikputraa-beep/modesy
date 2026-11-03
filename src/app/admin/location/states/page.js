import { AdminStatesClient } from "@/components/admin/AdminStatesClient";
import { getStatesAdmin, getCountriesAdmin } from "@/lib/queries/admin-cms";

export default async function AdminStatesPage() {
  const [states, countries] = await Promise.all([getStatesAdmin(), getCountriesAdmin()]);

  return <AdminStatesClient initialStates={states} initialCountries={countries} />;
}
