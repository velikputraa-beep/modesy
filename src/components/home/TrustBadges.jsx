import { ShieldCheck, Truck, Clock, RefreshCw } from "lucide-react";

const BADGES = [
  { icon: Truck, title: "Fast Delivery", text: "Reliable courier shipping" },
  { icon: ShieldCheck, title: "Secure Payment", text: "100% protected transactions" },
  { icon: RefreshCw, title: "Easy Return", text: "Hassle-free guarantee" },
  { icon: Clock, title: "24/7 Support", text: "Dedicated customer help" },
];

export function TrustBadges() {
  return (
    <section className="border-t border-gray-100 bg-white py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-6 md:grid-cols-4 lg:gap-8">
          {BADGES.map(({ icon: Icon, title, text }) => (
            <div key={title} className="flex items-center gap-3">
              <div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-teal-50 text-[#14B8A6]">
                <Icon className="size-5" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-gray-900">{title}</h4>
                <p className="text-[11px] text-gray-500">{text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
