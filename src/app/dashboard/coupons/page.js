import { getCurrentUser } from "@/lib/mock-auth";
import { getSellerCoupons } from "@/lib/queries/coupons";
import { CouponsClient } from "@/components/dashboard/CouponsClient";

export default async function CouponsPage() {
  const user = await getCurrentUser();
  const coupons = user ? await getSellerCoupons(user.id) : [];
  return <CouponsClient initialCoupons={coupons} />;
}
