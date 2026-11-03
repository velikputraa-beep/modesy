"use client";

import { useState } from "react";
import { MapPin, ChevronDown, Check } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/components/ui/toast-context";

export function TopBarControls() {
  const { toast } = useToast();
  const [location, setLocation] = useState("Indonesia");
  const [currency, setCurrency] = useState("IDR (Rp)");
  const [language, setLanguage] = useState({ code: "ID", name: "Indonesia", flag: "🇮🇩" });

  const locations = ["Indonesia", "United States", "United Kingdom", "Singapore", "Malaysia"];
  const currencies = ["IDR (Rp)", "USD ($)", "EUR (€)", "GBP (£)"];
  const languages = [
    { code: "ID", name: "Indonesia", flag: "🇮🇩" },
    { code: "EN", name: "English", flag: "🇺🇸" },
    { code: "JA", name: "Japanese", flag: "🇯🇵" },
  ];

  return (
    <div className="flex items-center gap-3 sm:gap-4">
      {/* Location Selector */}
      <DropdownMenu>
        <DropdownMenuTrigger className="flex items-center gap-1.5 transition-colors hover:text-[#14B8A6] cursor-pointer focus:outline-none">
          <MapPin className="size-3.5 text-gray-400" />
          <span className="hidden sm:inline">{location}</span>
          <ChevronDown className="size-3 text-gray-400" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-36 bg-white border border-gray-200 shadow-md">
          {locations.map((loc) => (
            <DropdownMenuItem
              key={loc}
              onClick={() => {
                setLocation(loc);
                toast.success(`Location set to ${loc}`);
              }}
              className="flex items-center justify-between text-xs cursor-pointer py-1.5"
            >
              <span>{loc}</span>
              {location === loc && <Check className="size-3 text-teal-600" />}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Currency Selector */}
      <DropdownMenu>
        <DropdownMenuTrigger className="flex items-center gap-1 transition-colors hover:text-[#14B8A6] cursor-pointer focus:outline-none">
          <span>{currency}</span>
          <ChevronDown className="size-3 text-gray-400" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-32 bg-white border border-gray-200 shadow-md">
          {currencies.map((curr) => (
            <DropdownMenuItem
              key={curr}
              onClick={() => {
                setCurrency(curr);
                toast.success(`Currency switched to ${curr}`);
              }}
              className="flex items-center justify-between text-xs cursor-pointer py-1.5"
            >
              <span>{curr}</span>
              {currency === curr && <Check className="size-3 text-teal-600" />}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Language Selector */}
      <DropdownMenu>
        <DropdownMenuTrigger className="flex items-center gap-1.5 transition-colors hover:text-[#14B8A6] cursor-pointer focus:outline-none">
          <span className="text-xs leading-none">{language.flag}</span>
          <span className="hidden sm:inline">{language.name}</span>
          <ChevronDown className="size-3 text-gray-400" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-32 bg-white border border-gray-200 shadow-md">
          {languages.map((lang) => (
            <DropdownMenuItem
              key={lang.code}
              onClick={() => {
                setLanguage(lang);
                toast.success(`Language changed to ${lang.name}`);
              }}
              className="flex items-center justify-between text-xs cursor-pointer py-1.5"
            >
              <span className="flex items-center gap-2">
                <span>{lang.flag}</span>
                <span>{lang.name}</span>
              </span>
              {language.code === lang.code && <Check className="size-3 text-teal-600" />}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
