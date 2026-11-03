import { getCurrentUser } from "@/lib/mock-auth";
import { ShippingSettingsClient } from "@/components/dashboard/ShippingSettingsClient";

export default async function ShippingSettingsPage() {
  const user = await getCurrentUser();
  const settings = user?.shipping_settings || {};

  return (
    <ShippingSettingsClient
      initialZones={Array.isArray(settings.zones) ? settings.zones : []}
      initialDeliveryTimes={
        Array.isArray(settings.deliveryTimes) ? settings.deliveryTimes : []
      }
    />
  );
}
