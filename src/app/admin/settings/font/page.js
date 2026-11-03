import { AdminKvForm } from "@/components/admin/AdminKvForm";
import { getKvSettings } from "@/lib/queries/admin-settings";

export const metadata = { title: "Font Settings - Admin Modesy" };

const FIELDS = [
  {
    key: "primaryFont",
    label: "Primary Font Family (Body & Navigation)",
    type: "select",
    options: [
      { value: "Inter", label: "Inter (Clean Modern Sans)" },
      { value: "Roboto", label: "Roboto (Google Standard)" },
      { value: "Outfit", label: "Outfit (Geometric Premium)" },
      { value: "Poppins", label: "Poppins (Friendly Sans)" },
      { value: "Open Sans", label: "Open Sans (Classic Legibility)" },
    ],
  },
  {
    key: "secondaryFont",
    label: "Headings Font Family (H1-H6 Titles)",
    type: "select",
    options: [
      { value: "Outfit", label: "Outfit (Bold Display)" },
      { value: "Inter", label: "Inter (Neutral Consistent)" },
      { value: "Poppins", label: "Poppins (Rounded)" },
      { value: "Playfair Display", label: "Playfair Display (Serif Luxury)" },
    ],
  },
  {
    key: "baseFontSize",
    label: "Base Font Size",
    type: "select",
    options: [
      { value: "13px", label: "13px (Compact)" },
      { value: "14px", label: "14px (Standard Default)" },
      { value: "15px", label: "15px (Comfortable)" },
      { value: "16px", label: "16px (Large)" },
    ],
  },
  {
    key: "headingWeight",
    label: "Heading Font Weight",
    type: "select",
    options: [
      { value: "600", label: "600 (Semi Bold)" },
      { value: "700", label: "700 (Bold)" },
      { value: "800", label: "800 (Extra Bold)" },
    ],
  },
];

export default async function AdminFontSettingsPage() {
  const settings = await getKvSettings("fonts");

  return (
    <div className="space-y-6">
      <AdminKvForm
        kind="fonts"
        title="Font Settings"
        subtitle="Pengaturan keluarga font (Google Fonts), ukuran teks basis, dan ketebalan tipografi"
        note={
          "Pilihan dibatasi pada nilai yang valid lalu disimpan ke app_settings key fonts. " +
          "Storefront memuat font Inter lewat next/font, jadi nilai ini belum mengganti tipografi " +
          "situs secara langsung."
        }
        fields={FIELDS}
        initialSettings={settings}
      />

      <div className="max-w-2xl p-4 bg-white rounded-lg border border-gray-200 shadow-xs space-y-2">
        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
          Font Preview (nilai yang tersimpan)
        </p>
        <h4
          style={{ fontFamily: settings.secondaryFont, fontWeight: Number(settings.headingWeight) }}
          className="text-lg text-gray-900"
        >
          Koleksi Busana &amp; Produk Unggulan Modesy
        </h4>
        <p
          style={{ fontFamily: settings.primaryFont, fontSize: settings.baseFontSize }}
          className="text-gray-600"
        >
          Temukan pengalaman belanja multi-vendor yang mudah, aman, dan terpercaya dengan ribuan
          produk berkualitas.
        </p>
      </div>
    </div>
  );
}
