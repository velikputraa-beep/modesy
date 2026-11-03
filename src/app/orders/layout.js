import { TopBar } from "@/components/layout/TopBar";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { OrdersSidebar } from "@/components/orders/OrdersSidebar";
import { PageEntrance } from "@/components/common/PageEntrance";

export const metadata = {
  title: "Orders - Modesy",
  description: "User Orders, Quote Requests, Downloads and Refund Requests",
};

export default function OrdersLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-[#F9FAFB] text-gray-900 font-sans">
      <TopBar />
      <Navbar />

      <main className="flex-1 py-8">
        <PageEntrance>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
              {/* Sidebar Kiri (col-span-1) */}
              <div className="md:col-span-1">
                <OrdersSidebar />
              </div>

              {/* Konten Kanan (col-span-3) */}
              <div className="md:col-span-3 min-w-0">
                {children}
              </div>
            </div>
          </div>
        </PageEntrance>
      </main>

      <Footer />
    </div>
  );
}
