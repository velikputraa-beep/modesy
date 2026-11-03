import { TopBar } from "@/components/layout/TopBar";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { DepositClient } from "@/components/wallet/DepositClient";

export const metadata = {
  title: "Add Funds - Modesy Wallet",
  description: "Deposit funds into your Modesy Wallet",
};

export default function DepositPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#F9FAFB] text-gray-900 font-sans">
      <TopBar />
      <Navbar />
      <DepositClient />
      <Footer />
    </div>
  );
}
