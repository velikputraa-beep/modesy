import { AdminCitiesClient } from "@/components/admin/AdminCitiesClient";
import { getCitiesAdmin, getStatesAdmin } from "@/lib/queries/admin-cms";

export default async function AdminCitiesPage() {
  const [cities, states] = await Promise.all([getCitiesAdmin(), getStatesAdmin()]);

  return <AdminCitiesClient initialCities={cities} initialStates={states} />;
}
