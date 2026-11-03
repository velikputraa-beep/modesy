import Link from "next/link";
import { CreditCard, Award, Zap, ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Payments - Modesy",
};

export default function PaymentsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight text-gray-800">
        Payments
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Membership Payments Card */}
        <Card className="p-6 bg-white border border-gray-200 shadow-xs flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="size-12 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
              <Award className="size-6" />
            </div>
            <h2 className="text-lg font-bold text-gray-900">
              Membership Payments
            </h2>
            <p className="text-xs text-gray-500 leading-relaxed">
              View your subscription and membership plan transaction history, renewal dates, and payment receipts.
            </p>
          </div>
          <Button asChild className="w-full bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold gap-2">
            <Link href="/dashboard/payments/membership">
              <span>View Membership Payments</span>
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </Card>

        {/* Promotion Payments Card */}
        <Card className="p-6 bg-white border border-gray-200 shadow-xs flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="size-12 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Zap className="size-6" />
            </div>
            <h2 className="text-lg font-bold text-gray-900">
              Promotion Payments
            </h2>
            <p className="text-xs text-gray-500 leading-relaxed">
              Track sponsored listing fees, featured badges, and homepage carousel promotion purchases.
            </p>
          </div>
          <Button asChild className="w-full bg-[#0099ad] hover:bg-[#008294] text-white text-xs font-semibold gap-2">
            <Link href="/dashboard/payments/promotion">
              <span>View Promotion Payments</span>
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </Card>
      </div>
    </div>
  );
}
