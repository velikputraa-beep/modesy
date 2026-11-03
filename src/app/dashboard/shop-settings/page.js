import { getCurrentUser } from "@/lib/mock-auth";
import { ShopSettingsClient } from "@/components/dashboard/ShopSettingsClient";

export default async function ShopSettingsPage() {
  const user = await getCurrentUser();
  const settings = user?.shop_settings || {};

  const initial = {
    shopName: user?.shop_name || user?.name || "",
    shopDescription: user?.shop_description || "",
    whatsAppNumber: user?.phone || "",
    showWhatsApp: settings.showWhatsApp ? "yes" : "no",
    rssFeeds: settings.rssFeeds ? "enable" : "disable",
    vacationMode: settings.vacationMode ? "enable" : "disable",
    vacationMessage: settings.vacationMessage || "",
    fixedVat: !!settings.fixedVat,
    vatRates: Array.isArray(settings.vatRates) ? settings.vatRates : [],
  };

  return <ShopSettingsClient initial={initial} />;
}
