import Link from "next/link";
import { TopBar } from "@/components/layout/TopBar";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Cookie, Settings, ShieldCheck } from "lucide-react";

export const metadata = {
  title: "Cookie Policy - Modesy",
  description: "Learn how cookies and tracking technologies are used on Modesy Marketplace.",
};

export default function CookiePolicyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#F9FAFB] text-gray-900 font-sans">
      <TopBar />
      <Navbar />

      <main className="flex-1 py-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <nav className="text-sm text-gray-500 mb-6">
            <Link href="/" className="hover:text-gray-900 transition-colors">
              Home
            </Link>{" "}
            / <span className="text-gray-800 font-medium">Cookie Policy</span>
          </nav>

          <div className="bg-white rounded-xl border border-gray-200 p-6 sm:p-10 shadow-xs space-y-6">
            <div className="border-b border-gray-100 pb-6">
              <span className="text-xs font-bold uppercase tracking-wider text-teal-600 bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
                Transparency
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mt-3 tracking-tight">
                Modesy Cookie Policy
              </h1>
              <p className="text-xs sm:text-sm text-gray-400 mt-1">
                Last updated: 12 October 2026
              </p>
            </div>

            <section className="space-y-3 text-sm text-gray-600 leading-relaxed">
              <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <Cookie className="size-4 text-teal-600" />
                <span>1. What Are Cookies?</span>
              </h2>
              <p>
                Cookies are small text files stored on your browser or device when you browse websites. They enable the website to recognize your device, remember preferences (such as language, currency, and shopping cart items), and improve your navigation experience.
              </p>
            </section>

            <section className="space-y-3 text-sm text-gray-600 leading-relaxed">
              <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <ShieldCheck className="size-4 text-teal-600" />
                <span>2. Types of Cookies We Use</span>
              </h2>
              <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm text-gray-600">
                <li>
                  <strong className="text-gray-900">Essential Cookies:</strong> Necessary for core site functionality like session management, login security, and cart preservation.
                </li>
                <li>
                  <strong className="text-gray-900">Preference Cookies:</strong> Remember your choices such as currency display and region filters.
                </li>
                <li>
                  <strong className="text-gray-900">Analytics Cookies:</strong> Help us understand aggregate page visitor statistics to improve marketplace speed and reliability.
                </li>
              </ul>
            </section>

            <section className="space-y-3 text-sm text-gray-600 leading-relaxed">
              <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <Settings className="size-4 text-teal-600" />
                <span>3. Managing Your Cookie Preferences</span>
              </h2>
              <p>
                You can configure or block cookies through your browser settings at any time. Note that blocking essential cookies may affect features like cart checkout and account logins.
              </p>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
