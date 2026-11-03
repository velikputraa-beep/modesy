import { Inter } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/lib/cart-context";
import { ToastProvider } from "@/components/ui/toast-context";
import { getCurrentUser } from "@/lib/mock-auth";
import { getSeoSettingsServer } from "@/lib/queries/admin-settings";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export async function generateMetadata() {
  const seo = await getSeoSettingsServer();

  return {
    title: seo.metaTitle,
    description: seo.metaDescription,
    keywords: seo.metaKeywords,
  };
}

export default async function RootLayout({ children }) {
  const user = await getCurrentUser();

  return (
    <html lang="id" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans bg-[#F9FAFB] text-gray-900 antialiased">
        <ToastProvider>
          <CartProvider user={user}>{children}</CartProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
