"use client";

import * as React from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

function Checkbox({
  className,
  checked,
  defaultChecked = false,
  onCheckedChange,
  id,
  disabled = false,
  ...props
}) {
  const [internalChecked, setInternalChecked] = React.useState(defaultChecked);
  const isControlled = checked !== undefined;
  const isChecked = isControlled ? checked : internalChecked;

  const handleClick = (e) => {
    if (disabled) return;
    const nextVal = !isChecked;
    if (!isControlled) {
      setInternalChecked(nextVal);
    }
    if (onCheckedChange) {
      onCheckedChange(nextVal);
    }
  };

  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={isChecked}
      data-state={isChecked ? "checked" : "unchecked"}
      disabled={disabled}
      id={id}
      onClick={handleClick}
      className={cn(
        "peer size-4 shrink-0 rounded border border-gray-300 ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 flex items-center justify-center transition-colors cursor-pointer",
        isChecked
          ? "border-teal-600 bg-teal-600 text-white"
          : "bg-white hover:border-gray-400",
        className
      )}
      {...props}
    >
      {isChecked && <Check className="size-3 text-white stroke-[3]" />}
    </button>
  );
}

export { Checkbox };
