import { TopBar } from "@/components/layout/TopBar";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { PayoutClient } from "@/components/wallet/PayoutClient";

export const metadata = {
  title: "Request Payout - Modesy Wallet",
  description: "Request withdrawal of funds from your Modesy Wallet",
};

export default function PayoutPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#F9FAFB] text-gray-900 font-sans">
      <TopBar />
      <Navbar />
      <PayoutClient />
      <Footer />
    </div>
  );
}
