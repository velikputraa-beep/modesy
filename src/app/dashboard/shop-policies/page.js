import { getCurrentUser } from "@/lib/mock-auth";
import { ShopPoliciesClient } from "@/components/dashboard/ShopPoliciesClient";

export default async function ShopPoliciesPage() {
  const user = await getCurrentUser();
  const policies = user?.shop_policies || {};

  return (
    <ShopPoliciesClient
      initialContent={policies.returnPolicy || ""}
      initialStatus="enable"
    />
  );
}
