"use client";

import Link from "next/link";

export function SellNowButton({ user }) {
  const href = user ? "/dashboard/add-product" : "/login";

  return (
    <Link
      href={href}
      className="bg-teal-500 hover:bg-teal-600 text-white px-4 py-2 rounded-md font-medium text-sm transition-colors inline-flex items-center justify-center whitespace-nowrap cursor-pointer"
    >
      Sell Now
    </Link>
  );
}
