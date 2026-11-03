"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ArrowUpDown,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Code,
  CheckCircle2,
  X,
} from "lucide-react";
import { updateShopSettings } from "@/app/dashboard/actions";

const DEFAULT_VAT_RATES = [
  { country: "Afghanistan", rate: 0 },
  { country: "Afghanistan/Badakhshan", rate: 0 },
  { country: "Afghanistan/Badghis", rate: 0 },
  { country: "Afghanistan/Baghlan", rate: 0 },
  { country: "Afghanistan/Balkh", rate: 0 },
];

export function ShopSettingsClient({ initial = {} }) {
  const [shopName, setShopName] = useState(initial.shopName || "");
  const [shopDescription, setShopDescription] = useState(
    initial.shopDescription || ""
  );
  const [showWhatsApp, setShowWhatsApp] = useState(
    initial.showWhatsApp || "no"
  );
  const [whatsAppNumber, setWhatsAppNumber] = useState(
    initial.whatsAppNumber || ""
  );
  const [rssFeeds, setRssFeeds] = useState(initial.rssFeeds || "disable");

  const [fixedVat, setFixedVat] = useState(!!initial.fixedVat);
  const [vatSearch, setVatSearch] = useState("");
  const [vatRates, setVatRates] = useState(
    Array.isArray(initial.vatRates) && initial.vatRates.length > 0
      ? initial.vatRates
      : DEFAULT_VAT_RATES
  );

  const [vacationStatus, setVacationStatus] = useState(
    initial.vacationMode || "disable"
  );
  const [vacationMessage, setVacationMessage] = useState(
    initial.vacationMessage || ""
  );

  const [toastMessage, setToastMessage] = useState("");
  const [toastError, setToastError] = useState(false);
  // Melacak tombol mana yang sedang submit supaya semua Save btn bisa di-disable.
  const [savingSection, setSavingSection] = useState(null);

  const triggerToast = (msg, isError = false) => {
    setToastMessage(msg);
    setToastError(isError);
    setTimeout(() => setToastMessage(""), 3500);
  };

  // Payload lengkap dari state form saat ini (aksi menyimpan semuanya sekaligus).
  const buildPayload = () => ({
    shopName,
    shopDescription,
    whatsAppNumber,
    showWhatsApp,
    rssFeeds,
    vacationMode: vacationStatus,
    vacationMessage,
    fixedVat,
    vatRates,
  });

  const handleSave = async (section) => {
    if (savingSection) return;
    setSavingSection(section);
    const result = await updateShopSettings(buildPayload());
    setSavingSection(null);
    if (result?.success) {
      triggerToast(result.message || "Pengaturan toko berhasil diperbarui");
    } else {
      triggerToast(result?.error || "Gagal menyimpan pengaturan", true);
    }
  };

  const handleFormatVacation = (prefix, suffix = "") => {
    setVacationMessage((prev) => `${prev ? prev + " " : ""}${prefix}text${suffix}`);
  };

  const handleVatRateChange = (country, value) => {
    setVatRates((prev) =>
      prev.map((item) =>
        item.country === country ? { ...item, rate: Number(value) } : item
      )
    );
  };

  const filteredVat = vatRates.filter((item) =>
    item.country.toLowerCase().includes(vatSearch.toLowerCase())
  );

  const disabled = savingSection !== null;

  return (
    <div className="space-y-6">
      {/* Toast Feedback */}
      {toastMessage && (
        <div
          className={`fixed top-4 right-4 z-50 flex items-center gap-2 text-white px-4 py-3 rounded-lg shadow-lg text-sm transition-all duration-300 ${
            toastError ? "bg-red-600" : "bg-emerald-600"
          }`}
        >
          {toastError ? (
            <X className="size-4" />
          ) : (
            <CheckCircle2 className="size-4" />
          )}
          <span>{toastMessage}</span>
        </div>
      )}

      {savingSection && (
        <div className="sr-only" role="status">
          Menyimpan...
        </div>
      )}

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* ================= LEFT COLUMN ================= */}
        <div className="space-y-6">
          {/* Card: Shop Settings */}
          <Card className="border border-gray-200 shadow-sm bg-white">
            <CardHeader className="pb-3 border-b border-gray-100">
              <CardTitle className="text-base font-semibold text-gray-800">
                Shop Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-5 space-y-5">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Shop Name
                </label>
                <Input
                  value={shopName}
                  onChange={(e) => setShopName(e.target.value)}
                  className="bg-white border-gray-300 focus-visible:ring-teal-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Shop Description
                </label>
                <Textarea
                  value={shopDescription}
                  onChange={(e) => setShopDescription(e.target.value)}
                  rows={4}
                  className="bg-white border-gray-300 focus-visible:ring-teal-500 text-sm resize-none leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-2">
                  Show WhatsApp Button
                </label>
                <div className="flex items-center gap-8">
                  <label className="flex items-center gap-2.5 cursor-pointer text-sm text-gray-700">
                    <input
                      type="radio"
                      name="showWhatsApp"
                      value="yes"
                      checked={showWhatsApp === "yes"}
                      onChange={(e) => setShowWhatsApp(e.target.value)}
                      className="size-4 text-teal-600 focus:ring-teal-500 accent-teal-600"
                    />
                    <span>Yes</span>
                  </label>
                  <label className="flex items-center gap-2.5 cursor-pointer text-sm text-gray-700">
                    <input
                      type="radio"
                      name="showWhatsApp"
                      value="no"
                      checked={showWhatsApp === "no"}
                      onChange={(e) => setShowWhatsApp(e.target.value)}
                      className="size-4 text-teal-600 focus:ring-teal-500 accent-teal-600"
                    />
                    <span>No</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  WhatsApp Number
                </label>
                <Input
                  value={whatsAppNumber}
                  onChange={(e) => setWhatsAppNumber(e.target.value)}
                  className="bg-white border-gray-300 focus-visible:ring-teal-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-2">
                  RSS Feeds
                </label>
                <div className="flex items-center gap-8">
                  <label className="flex items-center gap-2.5 cursor-pointer text-sm text-gray-700">
                    <input
                      type="radio"
                      name="rssFeeds"
                      value="enable"
                      checked={rssFeeds === "enable"}
                      onChange={(e) => setRssFeeds(e.target.value)}
                      className="size-4 text-teal-600 focus:ring-teal-500 accent-teal-600"
                    />
                    <span>Enable</span>
                  </label>
                  <label className="flex items-center gap-2.5 cursor-pointer text-sm text-gray-700">
                    <input
                      type="radio"
                      name="rssFeeds"
                      value="disable"
                      checked={rssFeeds === "disable"}
                      onChange={(e) => setRssFeeds(e.target.value)}
                      className="size-4 text-teal-600 focus:ring-teal-500 accent-teal-600"
                    />
                    <span>Disable</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end pt-3">
                <Button
                  disabled={disabled}
                  onClick={() => handleSave("shop")}
                  className="bg-[#14B8A6] hover:bg-[#0D9488] disabled:opacity-50 text-white px-6 font-medium text-sm"
                >
                  {savingSection === "shop" ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Card: VAT (Value-Added Tax) */}
          <Card className="border border-gray-200 shadow-sm bg-white">
            <CardHeader className="pb-3 border-b border-gray-100">
              <CardTitle className="text-base font-semibold text-gray-800">
                VAT (Value-Added Tax)
              </CardTitle>
              <p className="text-xs text-gray-500 mt-0.5">
                Define VAT values for your products based on countries
              </p>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={fixedVat}
                  onChange={(e) => setFixedVat(e.target.checked)}
                  className="size-4 text-teal-600 rounded border-gray-300 focus:ring-teal-500 accent-teal-600"
                />
                <span>Set Fixed VAT Rate for All Countries</span>
              </label>

              <div>
                <Input
                  placeholder="Search"
                  value={vatSearch}
                  onChange={(e) => setVatSearch(e.target.value)}
                  className="bg-white border-gray-300 focus-visible:ring-teal-500 text-sm max-w-sm"
                />
              </div>

              <div className="border border-gray-200 rounded-lg overflow-hidden max-h-96 overflow-y-auto">
                <Table>
                  <TableHeader className="bg-gray-50/70 sticky top-0 z-10">
                    <TableRow>
                      <TableHead className="text-xs font-semibold text-gray-700">
                        <div className="flex items-center justify-between">
                          <span>Location</span>
                          <ArrowUpDown className="size-3 text-gray-400" />
                        </div>
                      </TableHead>
                      <TableHead className="w-36 text-xs font-semibold text-gray-700">
                        <div className="flex items-center justify-between">
                          <span>Tax Rate(%)</span>
                          <ArrowUpDown className="size-3 text-gray-400" />
                        </div>
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredVat.length > 0 ? (
                      filteredVat.map((loc) => {
                        const isMainCountry = !loc.country.includes("/");
                        return (
                          <TableRow key={loc.country} className="hover:bg-gray-50/40">
                            <TableCell
                              className={`text-sm py-2 ${
                                isMainCountry
                                  ? "font-bold text-gray-900"
                                  : "text-gray-600 pl-6"
                              }`}
                            >
                              {loc.country}
                            </TableCell>
                            <TableCell className="py-2">
                              <Input
                                type="number"
                                value={loc.rate}
                                onChange={(e) =>
                                  handleVatRateChange(loc.country, e.target.value)
                                }
                                className="h-8 w-24 text-sm bg-white border-gray-300 focus-visible:ring-teal-500"
                              />
                            </TableCell>
                          </TableRow>
                        );
                      })
                    ) : (
                      <TableRow>
                        <TableCell
                          colSpan={2}
                          className="text-center text-xs text-gray-400 py-6"
                        >
                          Tidak ada lokasi VAT.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>

              <div className="flex justify-end pt-2">
                <Button
                  disabled={disabled}
                  onClick={() => handleSave("vat")}
                  className="bg-[#14B8A6] hover:bg-[#0D9488] disabled:opacity-50 text-white px-6 font-medium text-sm"
                >
                  {savingSection === "vat" ? "Saving..." : "Save Changes"}
                </Button>
              </div>

              {/* Warning Alert Box */}
              <div className="bg-sky-50 border border-sky-200 text-sky-900 rounded-lg p-4 text-xs leading-relaxed">
                <span className="font-bold text-sky-950">Warning!</span> The VAT
                rate you set for a country will apply to all states within that
                country. However, if you want a state to have its own unique tax
                rate, you can specify a different VAT rate for that state.
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ================= RIGHT COLUMN ================= */}
        <div className="space-y-6">
          {/* Card: Membership Plan */}
          <Card className="border border-gray-200 shadow-sm bg-white">
            <CardHeader className="pb-3 border-b border-gray-100">
              <CardTitle className="text-base font-semibold text-gray-800">
                Membership Plan
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 pb-4">
              <div className="bg-sky-50 border border-sky-200 text-sky-800 rounded-lg p-4 text-sm">
                Admin role does not require a membership plan.
              </div>
            </CardContent>
          </Card>

          {/* Card: Vacation Mode */}
          <Card className="border border-gray-200 shadow-sm bg-white">
            <CardHeader className="pb-3 border-b border-gray-100">
              <CardTitle className="text-base font-semibold text-gray-800">
                Vacation Mode
              </CardTitle>
              <p className="text-xs text-gray-500 mt-0.5">
                Vacation mode allows you to pause your store for a certain period of
                time
              </p>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-2">
                  Status
                </label>
                <div className="flex items-center gap-8">
                  <label className="flex items-center gap-2.5 cursor-pointer text-sm text-gray-700">
                    <input
                      type="radio"
                      name="vacationStatus"
                      value="enable"
                      checked={vacationStatus === "enable"}
                      onChange={(e) => setVacationStatus(e.target.value)}
                      className="size-4 text-teal-600 focus:ring-teal-500 accent-teal-600"
                    />
                    <span>Enable</span>
                  </label>
                  <label className="flex items-center gap-2.5 cursor-pointer text-sm text-gray-700">
                    <input
                      type="radio"
                      name="vacationStatus"
                      value="disable"
                      checked={vacationStatus === "disable"}
                      onChange={(e) => setVacationStatus(e.target.value)}
                      className="size-4 text-teal-600 focus:ring-teal-500 accent-teal-600"
                    />
                    <span>Disable</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-2">
                  Vacation Message
                </label>
                {/* TinyMCE Mockup Box */}
                <div className="border border-gray-300 rounded-lg overflow-hidden bg-white shadow-sm">
                  {/* Toolbar */}
                  <div className="bg-gray-50/80 border-b border-gray-200 p-2 flex flex-wrap items-center gap-1.5 text-gray-600">
                    <button
                      type="button"
                      onClick={() => handleFormatVacation("<pre><code>", "</code></pre>")}
                      className="p-1 hover:bg-gray-200 rounded text-gray-600 cursor-pointer"
                      title="Code"
                    >
                      <Code className="size-3.5" />
                    </button>
                    <span className="w-px h-4 bg-gray-300 mx-1" />
                    <button
                      type="button"
                      onClick={() => handleFormatVacation("**", "**")}
                      className="p-1 hover:bg-gray-200 rounded text-gray-600 font-bold cursor-pointer"
                      title="Bold"
                    >
                      <Bold className="size-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleFormatVacation("*", "*")}
                      className="p-1 hover:bg-gray-200 rounded text-gray-600 italic cursor-pointer"
                      title="Italic"
                    >
                      <Italic className="size-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleFormatVacation("<u>", "</u>")}
                      className="p-1 hover:bg-gray-200 rounded text-gray-600 underline cursor-pointer"
                      title="Underline"
                    >
                      <Underline className="size-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleFormatVacation("~~", "~~")}
                      className="p-1 hover:bg-gray-200 rounded text-gray-600 line-through cursor-pointer"
                      title="Strikethrough"
                    >
                      <Strikethrough className="size-3.5" />
                    </button>
                  </div>
                  {/* Textarea */}
                  <textarea
                    rows={8}
                    value={vacationMessage}
                    onChange={(e) => setVacationMessage(e.target.value)}
                    className="w-full p-3 text-sm text-gray-700 focus:outline-none resize-none leading-relaxed"
                  />
                  {/* Status Bar */}
                  <div className="bg-gray-50 border-t border-gray-200 px-3 py-1 flex items-center justify-between text-[11px] text-gray-400">
                    <span>p</span>
                    <span className="font-semibold text-gray-500 flex items-center gap-1">
                      <span className="text-blue-500 font-black">⚡</span> tiny
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-3">
                <Button
                  disabled={disabled}
                  onClick={() => handleSave("vacation")}
                  className="bg-[#14B8A6] hover:bg-[#0D9488] disabled:opacity-50 text-white px-6 font-medium text-sm"
                >
                  {savingSection === "vacation" ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
