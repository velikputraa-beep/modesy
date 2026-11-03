import { AdminBrandsClient } from "@/components/admin/AdminBrandsClient";
import { getBrandsAdmin } from "@/lib/queries/admin-cms";

export default async function AdminBrandsPage() {
  const brands = await getBrandsAdmin();

  return <AdminBrandsClient initialBrands={brands} />;
}
