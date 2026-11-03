import { AdminSliderClient } from "@/components/admin/AdminSliderClient";
import { getSlidersAdmin } from "@/lib/queries/admin-cms";

export default async function AdminSliderPage() {
  const sliders = await getSlidersAdmin();

  return <AdminSliderClient initialSliders={sliders} />;
}
