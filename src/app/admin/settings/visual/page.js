import { AdminKvForm } from "@/components/admin/AdminKvForm";
import { getKvSettings } from "@/lib/queries/admin-settings";

export const metadata = { title: "Visual Settings - Admin Modesy" };

const FIELDS = [
  { key: "primaryColor", label: "Primary Brand Color", type: "color" },
  { key: "secondaryColor", label: "Secondary Accent Color", type: "color" },
  {
    key: "darkModeSupport",
    label: "Dark Mode Support",
    type: "bool",
    help: "Preferensi tamu untuk tampilan gelap belum diimplementasikan di storefront",
  },
];

export default async function AdminVisualSettingsPage() {
  const settings = await getKvSettings("visual");

  return (
    <AdminKvForm
      kind="visual"
      title="Visual Settings"
      subtitle="Palet warna branding marketplace, tersimpan di app_settings key visual"
      note={
        "Logo dan favicon dikelola di tab General Settings. Nilai warna di sini tersimpan permanen " +
        "ke database, tetapi storefront masih memakai class Tailwind tetap, jadi pergantian warna " +
        "belum mengubah tampilan situs."
      }
      fields={FIELDS}
      initialSettings={settings}
    />
  );
}
