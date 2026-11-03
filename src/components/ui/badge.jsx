import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-teal-500 text-white shadow hover:bg-teal-600",
        secondary:
          "border-transparent bg-gray-100 text-gray-800 hover:bg-gray-200",
        destructive:
          "border-transparent bg-red-500 text-white shadow hover:bg-red-600",
        outline: "border-gray-200 text-gray-700",
        teal: "border-transparent bg-[#14B8A6] text-white",
        condition: "border-emerald-200 bg-emerald-50 text-emerald-700 font-medium",
        featured: "border-transparent bg-[#14B8A6] text-white font-medium text-[11px] px-2 py-0.5 uppercase tracking-wide",
        discount: "border-transparent bg-red-500 text-white font-semibold text-[11px] px-1.5 py-0.5",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

function Badge({ className, variant = "default", ...props }) {
  return (
    <div
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  );
}

export { Badge, badgeVariants };
