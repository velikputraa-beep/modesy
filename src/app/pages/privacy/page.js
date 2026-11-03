import Link from "next/link";
import { TopBar } from "@/components/layout/TopBar";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Shield, Lock, Eye, FileText } from "lucide-react";

export const metadata = {
  title: "Privacy Policy - Modesy",
  description: "Privacy Policy and data protection terms of Modesy Marketplace.",
};

export default function PrivacyPolicyPage() {
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
            / <span className="text-gray-800 font-medium">Privacy Policy</span>
          </nav>

          <div className="bg-white rounded-xl border border-gray-200 p-6 sm:p-10 shadow-xs space-y-6">
            <div className="border-b border-gray-100 pb-6">
              <span className="text-xs font-bold uppercase tracking-wider text-teal-600 bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
                Data Protection
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mt-3 tracking-tight">
                Modesy Privacy Policy
              </h1>
              <p className="text-xs sm:text-sm text-gray-400 mt-1">
                Last updated: 12 October 2026
              </p>
            </div>

            <section className="space-y-3 text-sm text-gray-600 leading-relaxed">
              <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <Shield className="size-4 text-teal-600" />
                <span>1. Information We Collect</span>
              </h2>
              <p>
                We collect information you provide directly to us when creating an account, updating your profile, listing products, communicating with other users, or making a purchase on Modesy. This includes name, email address, postal address, phone number, and transaction history.
              </p>
            </section>

            <section className="space-y-3 text-sm text-gray-600 leading-relaxed">
              <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <Lock className="size-4 text-teal-600" />
                <span>2. How We Use Your Information</span>
              </h2>
              <p>
                We use the information we collect to provide, maintain, and improve our marketplace services, process payment transactions, deliver buyer protection, prevent fraud, and send notifications regarding your orders and shop activities.
              </p>
            </section>

            <section className="space-y-3 text-sm text-gray-600 leading-relaxed">
              <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <Eye className="size-4 text-teal-600" />
                <span>3. Sharing of Information</span>
              </h2>
              <p>
                We do not sell your personal data. We only share details necessary to complete orders (such as providing your shipping address to the seller or logistics courier) and with payment gateway providers strictly for payment processing.
              </p>
            </section>

            <section className="space-y-3 text-sm text-gray-600 leading-relaxed">
              <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <FileText className="size-4 text-teal-600" />
                <span>4. Your Privacy Rights</span>
              </h2>
              <p>
                You can access, modify, or delete your personal account data at any time through your Profile Settings or by reaching out to our customer support team.
              </p>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
