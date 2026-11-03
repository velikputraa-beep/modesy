import Link from "next/link";
import {
  Settings,
  Globe,
  Package,
  CreditCard,
  Coins,
  Mail,
  Share2,
  Palette,
  Type,
  Signpost,
  ChevronRight,
} from "lucide-react";

const settingCards = [
  { title: "General Settings", href: "/admin/settings/general", desc: "Nama aplikasi, timezone, kontak email, dan copyright", icon: Settings },
  { title: "Language Settings", href: "/admin/settings/language", desc: "Kelola bahasa default dan kamus terjemahan sistem", icon: Globe },
  { title: "Product Settings", href: "/admin/settings/product", desc: "Konfigurasi upload produk, review, komisi, dan approval", icon: Package },
  { title: "Payment Settings", href: "/admin/settings/payment", desc: "Gateway pembayaran (Stripe, PayPal, Midtrans, COD)", icon: CreditCard },
  { title: "Currency Settings", href: "/admin/settings/currency", desc: "Mata uang aktif, format simbol harga, dan nilai tukar", icon: Coins },
  { title: "Email Settings", href: "/admin/settings/email", desc: "Koneksi SMTP server, port, dan template email notifikasi", icon: Mail },
  { title: "Social Login", href: "/admin/settings/social", desc: "OAuth Client ID untuk Google, Facebook, dan Apple Login", icon: Share2 },
  { title: "Visual Settings", href: "/admin/settings/visual", desc: "Logo marketplace, favicon, dan skema warna primer", icon: Palette },
  { title: "Font Settings", href: "/admin/settings/font", desc: "Pemilihan Google Web Fonts dan ukuran tipografi", icon: Type },
  { title: "Route Settings", href: "/admin/settings/route", desc: "Kustomisasi slug URL untuk produk, profil, dan kategori", icon: Signpost },
];

export default function AdminSettingsOverviewPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <Settings className="size-5 text-blue-500" />
          Settings Overview
        </h1>
        <p className="text-xs text-gray-500 mt-1">
          Konfigurasi lengkap seluruh parameter sistem, gateway, integrasi, dan visual aplikasi Modesy
        </p>
      </div>

      {/* Grid of Settings Hub */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {settingCards.map((card) => {
          const Icon = card.icon;
          return (
            <Link
              key={card.href}
              href={card.href}
              className="bg-white p-5 rounded-lg border border-gray-200 hover:border-blue-400 hover:shadow-md transition-all group flex flex-col justify-between"
            >
              <div>
                <div className="p-2.5 bg-slate-100 group-hover:bg-blue-50 rounded-lg text-slate-700 group-hover:text-blue-600 inline-block transition-colors">
                  <Icon className="size-5" />
                </div>
                <h3 className="font-semibold text-gray-800 text-sm mt-3 group-hover:text-blue-600 transition-colors">
                  {card.title}
                </h3>
                <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                  {card.desc}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs font-semibold text-blue-600">
                <span>Atur Konfigurasi</span>
                <ChevronRight className="size-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
