"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

const DropdownMenuContext = React.createContext({
  open: false,
  setOpen: () => {},
});

export function DropdownMenu({ children }) {
  const [open, setOpen] = React.useState(false);
  const containerRef = React.useRef(null);

  React.useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  return (
    <DropdownMenuContext.Provider value={{ open, setOpen }}>
      <div ref={containerRef} className="relative inline-block text-left">
        {children}
      </div>
    </DropdownMenuContext.Provider>
  );
}

export function DropdownMenuTrigger({ asChild, children, className, ...props }) {
  const { open, setOpen } = React.useContext(DropdownMenuContext);

  const handleClick = (e) => {
    e.stopPropagation();
    setOpen(!open);
  };

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, {
      onClick: handleClick,
      "aria-expanded": open,
      className: cn(children.props.className, className),
      ...props,
    });
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-expanded={open}
      className={cn("outline-none", className)}
      {...props}
    >
      {children}
    </button>
  );
}

import { motion, AnimatePresence } from "framer-motion";

export function DropdownMenuContent({
  align = "end",
  className,
  children,
  ...props
}) {
  const { open } = React.useContext(DropdownMenuContext);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          role="menu"
          initial={{ opacity: 0, y: -10, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.98 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className={cn(
            "absolute z-50 mt-2 min-w-[14rem] overflow-hidden rounded-xl border border-gray-200 bg-white p-1 text-gray-900 shadow-xl",
            align === "end" ? "right-0" : "left-0",
            className
          )}
          {...props}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function DropdownMenuItem({
  asChild = false,
  className,
  inset,
  onClick,
  children,
  ...props
}) {
  const { setOpen } = React.useContext(DropdownMenuContext);

  const handleClick = (e) => {
    if (onClick) onClick(e);
    setOpen(false);
  };

  const itemClassName = cn(
    "relative flex cursor-pointer select-none items-center rounded-lg px-3 py-2 text-xs sm:text-sm font-medium outline-none transition-colors hover:bg-gray-100 hover:text-gray-900 data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
    inset && "pl-8",
    className
  );

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, {
      role: "menuitem",
      onClick: (e) => {
        children.props?.onClick?.(e);
        handleClick(e);
      },
      className: cn(itemClassName, children.props?.className),
      ...props,
    });
  }

  return (
    <div
      role="menuitem"
      onClick={handleClick}
      className={itemClassName}
      {...props}
    >
      {children}
    </div>
  );
}

export function DropdownMenuLabel({ className, inset, ...props }) {
  return (
    <div
      className={cn(
        "px-3 py-2 text-xs font-semibold text-gray-500",
        inset && "pl-8",
        className
      )}
      {...props}
    />
  );
}

export function DropdownMenuSeparator({ className, ...props }) {
  return (
    <div
      role="separator"
      className={cn("-mx-1 my-1 h-px bg-gray-100", className)}
      {...props}
    />
  );
}
