import Link from "next/link";
import { TopBar } from "@/components/layout/TopBar";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import {
  HelpCircle,
  ShoppingBag,
  Store,
  CreditCard,
  Truck,
  ShieldCheck,
  Search,
  MessageCircle,
} from "lucide-react";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Help Center - Modesy",
  description: "Find answers, buyer guides, and seller support in Modesy Help Center.",
};

const faqs = [
  {
    category: "Buyers & Shopping",
    icon: ShoppingBag,
    questions: [
      {
        q: "How do I place an order on Modesy?",
        a: "Browse products, select your desired quantity or variations, and click 'Add to Cart'. Proceed to checkout, specify your shipping address, select your payment method, and confirm your payment.",
      },
      {
        q: "What payment methods are supported?",
        a: "We support Credit/Debit Cards, PayPal, Stripe, Bank Transfers, and Wallet balances depending on your region.",
      },
      {
        q: "Can I cancel or modify my order?",
        a: "You can request cancellation directly from your Orders page or message the seller through the Messages tab before the order has been dispatched.",
      },
    ],
  },
  {
    category: "Sellers & Vendors",
    icon: Store,
    questions: [
      {
        q: "How can I start selling on Modesy?",
        a: "Register an account, navigate to 'Sell Now', complete your shop profile, and start adding products through the Vendor Dashboard.",
      },
      {
        q: "When and how do I receive my payouts?",
        a: "Payouts are transferred according to your configured Payout Account in the Wallet section once the buyer confirms delivery of their order.",
      },
      {
        q: "Are digital downloads supported?",
        a: "Yes! Sellers can list digital products, audio, graphics, and code templates with instant download delivery for buyers upon payment.",
      },
    ],
  },
  {
    category: "Shipping & Delivery",
    icon: Truck,
    questions: [
      {
        q: "How do I track my shipment?",
        a: "Once the vendor marks your order as shipped, a tracking number and courier details will be provided in your Order Details page.",
      },
      {
        q: "What is Buyer Protection Guarantee?",
        a: "Modesy protects all transactions with a 100% money-back guarantee if the item is not received or significantly not as described.",
      },
    ],
  },
];

export default function HelpCenterPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#F9FAFB] text-gray-900 font-sans">
      <TopBar />
      <Navbar />

      <main className="flex-1 py-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <nav className="text-sm text-gray-500 mb-6">
            <Link href="/" className="hover:text-gray-900 transition-colors">
              Home
            </Link>{" "}
            / <span className="text-gray-800 font-medium">Help Center</span>
          </nav>

          {/* Header */}
          <div className="mb-10 text-center max-w-2xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-600 bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
              Customer Support
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mt-3 tracking-tight">
              How can we help you today?
            </h1>
            <p className="text-sm sm:text-base text-gray-500 mt-2">
              Browse frequently asked questions or reach out to our dedicated support team.
            </p>
          </div>

          {/* FAQ Sections */}
          <div className="space-y-8">
            {faqs.map((sec, idx) => {
              const Icon = sec.icon;
              return (
                <div
                  key={idx}
                  className="bg-white rounded-xl border border-gray-200 p-6 shadow-xs"
                >
                  <div className="flex items-center gap-3 mb-4 pb-3 border-b border-gray-100">
                    <div className="size-9 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
                      <Icon className="size-5" />
                    </div>
                    <h2 className="text-lg font-bold text-gray-900">
                      {sec.category}
                    </h2>
                  </div>

                  <Accordion type="single" collapsible className="w-full">
                    {sec.questions.map((item, qIdx) => (
                      <AccordionItem key={qIdx} value={`item-${idx}-${qIdx}`}>
                        <AccordionTrigger className="text-sm font-semibold text-gray-800 hover:text-teal-600 text-left">
                          {item.q}
                        </AccordionTrigger>
                        <AccordionContent className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                          {item.a}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </div>
              );
            })}
          </div>

          {/* Still Need Help Box */}
          <div className="mt-12 rounded-2xl bg-gradient-to-r from-teal-600 to-teal-700 text-white p-8 text-center sm:flex sm:items-center sm:justify-between sm:text-left shadow-md">
            <div>
              <h3 className="text-xl font-bold">Still have questions?</h3>
              <p className="text-xs sm:text-sm text-teal-100 mt-1">
                Our support team is available 24/7 to assist with your orders and inquiries.
              </p>
            </div>
            <div className="mt-5 sm:mt-0 shrink-0">
              <Button
                asChild
                className="bg-white text-teal-700 hover:bg-gray-100 font-semibold px-6 cursor-pointer shadow-sm"
              >
                <Link href="/contact">
                  <MessageCircle className="size-4 mr-2" />
                  <span>Contact Support</span>
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
