import { AdminKvForm } from "@/components/admin/AdminKvForm";
import { getKvSettings } from "@/lib/queries/admin-settings";

export const metadata = { title: "Product Settings - Admin Modesy" };

const FIELDS = [
  {
    key: "commissionRate",
    label: "Standard Marketplace Commission Rate (%)",
    type: "number",
    min: 0,
    max: 90,
    help: "Persentase komisi yang dipotong otomatis dari setiap pesanan terjual",
  },
  { key: "maxImageUpload", label: "Maximum Image Uploads Per Product", type: "number", min: 1, max: 20 },
  { key: "maxFileSizeMb", label: "Maximum File Size (MB)", type: "number", min: 1, max: 100 },
  { key: "digitalDownloadAttempts", label: "Digital Files Download Attempt Limit", type: "number", min: 1, max: 50 },
  {
    key: "approveBeforePublish",
    label: "Approve Products Before Publishing",
    type: "bool",
    help: "Preferensi tersimpan ke database; alur unggah produk belum membaca nilai ini",
  },
  { key: "allowGuestReviews", label: "Allow Guest Reviews", type: "bool", help: "Ulasan tetap wajib login karena tabel reviews memakai auth.uid()" },
  { key: "enableProductComments", label: "Enable Product Comments & Discussions", type: "bool" },
  { key: "enableWishlist", label: "Enable Wishlist System", type: "bool" },
];

export default async function AdminProductSettingsPage() {
  const settings = await getKvSettings("product");

  return (
    <AdminKvForm
      kind="product"
      title="Product Settings"
      subtitle="Pengaturan global katalog, komisi, persetujuan, dan batas unggah"
      note={
        "Seluruh nilai tersimpan permanen ke app_settings key product dan dibaca ulang setiap kali " +
        "halaman ini dibuka. Form unggah produk saat ini masih memakai aturan tetap di kode, " +
        "jadi batas jumlah gambar dan status approval belum diambil dari nilai di sini."
      }
      fields={FIELDS}
      initialSettings={settings}
    />
  );
}
