import { AdminKvForm } from "@/components/admin/AdminKvForm";
import { getKvSettings } from "@/lib/queries/admin-settings";

export const metadata = { title: "Route Settings - Admin Modesy" };

const FIELDS = [
  { key: "productSlug", label: "Products Route Slug Prefix", mono: true, help: "https://modesy.com/<slug>/item-slug" },
  { key: "categorySlug", label: "Categories Route Slug Prefix", mono: true, help: "https://modesy.com/<slug>/cat-name" },
  { key: "profileSlug", label: "User Profile Route Slug Prefix", mono: true, help: "https://modesy.com/<slug>/username" },
  { key: "blogSlug", label: "Blog Route Slug Prefix", mono: true, help: "https://modesy.com/<slug>/post-slug" },
  { key: "cartSlug", label: "Cart / Checkout Route Slug", mono: true, help: "https://modesy.com/<slug>" },
];

export default async function AdminRouteSettingsPage() {
  const settings = await getKvSettings("routes");

  return (
    <AdminKvForm
      kind="routes"
      title="Route Settings"
      subtitle="Kustomisasi struktur slug awalan URL peramban untuk SEO localization dan keramahan tautan"
      note={
        "Nilai divalidasi (huruf kecil, angka, tanda hubung, unik) lalu disimpan permanen ke " +
        "app_settings key routes. Struktur URL aplikasi Next.js ini ditentukan oleh folder src/app, " +
        "jadi mengganti nilai di sini belum memindahkan rute yang sudah aktif."
      }
      fields={FIELDS}
      initialSettings={settings}
    />
  );
}
