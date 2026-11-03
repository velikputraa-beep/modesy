import { TopBar } from "@/components/layout/TopBar";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { WalletClient } from "@/components/wallet/WalletClient";

export const metadata = {
  title: "Wallet - Modesy",
  description: "Modesy User Wallet, Earnings, and Payouts",
};

export default function WalletPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#F9FAFB] text-gray-900 font-sans">
      <TopBar />
      <Navbar />
      <WalletClient />
      <Footer />
    </div>
  );
}
