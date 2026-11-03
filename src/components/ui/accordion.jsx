"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const AccordionContext = React.createContext({
  openItems: [],
  toggleItem: () => {},
});

function Accordion({
  type = "single",
  defaultValue,
  className,
  children,
  ...props
}) {
  const [openItems, setOpenItems] = React.useState(
    Array.isArray(defaultValue)
      ? defaultValue
      : defaultValue
      ? [defaultValue]
      : []
  );

  const toggleItem = (value) => {
    setOpenItems((prev) => {
      if (type === "single") {
        return prev.includes(value) ? [] : [value];
      }
      return prev.includes(value)
        ? prev.filter((item) => item !== value)
        : [...prev, item];
    });
  };

  return (
    <AccordionContext.Provider value={{ openItems, toggleItem }}>
      <div data-slot="accordion" className={cn("space-y-1", className)} {...props}>
        {children}
      </div>
    </AccordionContext.Provider>
  );
}

function AccordionItem({ value, className, children, ...props }) {
  return (
    <div
      data-slot="accordion-item"
      data-value={value}
      className={cn("border border-gray-200 rounded-lg overflow-hidden bg-white", className)}
      {...props}
    >
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, { itemValue: value });
        }
        return child;
      })}
    </div>
  );
}

function AccordionTrigger({
  itemValue,
  className,
  children,
  ...props
}) {
  const { openItems, toggleItem } = React.useContext(AccordionContext);
  const isOpen = openItems.includes(itemValue);

  return (
    <button
      type="button"
      data-slot="accordion-trigger"
      aria-expanded={isOpen}
      onClick={() => toggleItem(itemValue)}
      className={cn(
        "flex w-full items-center justify-between py-3.5 px-4 font-semibold text-sm text-gray-800 transition-all hover:bg-gray-50/80 cursor-pointer select-none",
        className
      )}
      {...props}
    >
      {children}
      <ChevronDown
        className={cn(
          "size-4 shrink-0 text-gray-500 transition-transform duration-200",
          isOpen && "rotate-180"
        )}
      />
    </button>
  );
}

import { motion, AnimatePresence } from "framer-motion";

function AccordionContent({
  itemValue,
  className,
  children,
  ...props
}) {
  const { openItems } = React.useContext(AccordionContext);
  const isOpen = openItems.includes(itemValue);

  return (
    <AnimatePresence initial={false}>
      {isOpen && (
        <motion.div
          key="accordion-content"
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.28, ease: "easeInOut" }}
          className="overflow-hidden"
        >
          <div
            data-slot="accordion-content"
            className={cn("px-4 pb-4 pt-1 text-sm border-t border-gray-100", className)}
            {...props}
          >
            {children}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
};
