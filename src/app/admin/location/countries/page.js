import { AdminCountriesClient } from "@/components/admin/AdminCountriesClient";
import { getCountriesAdmin } from "@/lib/queries/admin-cms";

export default async function AdminCountriesPage() {
  const countries = await getCountriesAdmin();

  return <AdminCountriesClient initialCountries={countries} />;
}
