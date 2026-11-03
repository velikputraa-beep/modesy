"use client";

import Link from "next/link";
import { CheckCircle2, Package, ArrowRight, Home, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function CheckoutSuccessPage() {
  return (
    <div className="min-h-[80vh] bg-gray-50/60 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <Card className="bg-white p-8 sm:p-10 border border-gray-200/80 shadow-md rounded-2xl text-center">
          <div className="size-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-6 shadow-xs animate-in zoom-in duration-300">
            <CheckCircle2 className="size-10 stroke-[2.5]" />
          </div>

          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100/80 text-emerald-800 uppercase tracking-wider mb-3">
            Payment Completed
          </span>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
            Thank you for your order!
          </h1>
          <p className="mt-2 text-sm text-gray-600 max-w-md mx-auto">
            Your payment was successful and order <strong className="text-gray-900 font-semibold">#10034</strong> is now being processed. We have sent a confirmation email with invoice details.
          </p>

          <div className="mt-8 bg-gray-50/80 rounded-xl p-5 border border-gray-200/60 text-left text-sm space-y-3">
            <div className="flex justify-between items-center text-xs sm:text-sm">
              <span className="text-gray-500 font-medium">Order Number</span>
              <span className="font-semibold text-gray-900">#10034</span>
            </div>
            <Separator />
            <div className="flex justify-between items-center text-xs sm:text-sm">
              <span className="text-gray-500 font-medium">Payment Method</span>
              <span className="font-semibold text-gray-900">PayPal / Credit Card</span>
            </div>
            <Separator />
            <div className="flex justify-between items-center text-xs sm:text-sm">
              <span className="text-gray-500 font-medium">Total Paid</span>
              <span className="font-bold text-teal-700 text-base">$618.26</span>
            </div>
            <Separator />
            <div className="flex justify-between items-center text-xs sm:text-sm">
              <span className="text-gray-500 font-medium">Estimated Delivery</span>
              <span className="font-semibold text-emerald-600">3 - 5 Business Days</span>
            </div>
          </div>

          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild className="bg-teal-600 hover:bg-teal-700 text-white font-medium px-6 py-2.5 rounded-lg shadow-sm transition-all hover:scale-105">
              <Link href="/orders" className="flex items-center justify-center gap-2">
                <FileText className="size-4" />
                <span>View Order Details</span>
              </Link>
            </Button>
            <Button asChild variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-100 font-medium px-6 py-2.5 rounded-lg transition-all">
              <Link href="/products" className="flex items-center justify-center gap-2">
                <Package className="size-4" />
                <span>Continue Shopping</span>
              </Link>
            </Button>
            <Button asChild variant="ghost" className="text-gray-600 hover:text-gray-900">
              <Link href="/" className="flex items-center justify-center gap-1.5">
                <Home className="size-4" />
                <span>Home</span>
              </Link>
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
