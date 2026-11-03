import Link from "next/link";
import { getCurrentUser } from "@/lib/mock-auth";
import { TopBarControls } from "@/components/layout/TopBarControls";

export async function TopBar() {
  const user = await getCurrentUser();

  return (
    <div className="border-b border-gray-200 bg-[#F9FAFB] text-xs text-gray-600">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2 sm:px-6 lg:px-8">
        {/* Sisi Kiri */}
        <div className="flex items-center gap-4 sm:gap-6">
          <Link
            href="/contact"
            className="transition-colors hover:text-[#14B8A6] cursor-pointer"
          >
            Contact
          </Link>
          <Link
            href={user ? "/dashboard/add-product" : "/login"}
            className="transition-colors hover:text-[#14B8A6] cursor-pointer"
          >
            Sell on Modesy
          </Link>
        </div>

        {/* Sisi Kanan */}
        <div className="flex items-center gap-4 sm:gap-5">
          {/* Interactive Location, Currency, Language Controls */}
          <TopBarControls />

          {/* Auth State: Hi, {name} atau Login / Register */}
          <div className="flex items-center gap-1.5 pl-2 border-l border-gray-200">
            {user ? (
              <span className="font-semibold text-gray-800">
                Hi, {user.name}
              </span>
            ) : (
              <>
                <Link
                  href="/login"
                  className="font-medium transition-colors hover:text-[#14B8A6]"
                >
                  Login
                </Link>
                <span className="text-gray-300">/</span>
                <Link
                  href="/register"
                  className="font-medium transition-colors hover:text-[#14B8A6]"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
