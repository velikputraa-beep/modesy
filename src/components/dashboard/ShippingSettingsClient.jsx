"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Plus, Edit, Trash2, CheckCircle2, X, Save } from "lucide-react";
import { updateShippingSettings } from "@/app/dashboard/actions";

export function ShippingSettingsClient({
  initialZones = [],
  initialDeliveryTimes = [],
}) {
  const [zones, setZones] = useState(
    Array.isArray(initialZones) ? initialZones : []
  );
  const [deliveryTimes, setDeliveryTimes] = useState(
    Array.isArray(initialDeliveryTimes) ? initialDeliveryTimes : []
  );

  const [zoneSearch, setZoneSearch] = useState("");
  const [zonePageSize, setZonePageSize] = useState("15");

  // Modals state
  const [addZoneOpen, setAddZoneOpen] = useState(false);
  const [newZoneName, setNewZoneName] = useState("");
  const [newZoneRegions, setNewZoneRegions] = useState("");
  const [newZoneMethods, setNewZoneMethods] = useState("");

  const [addTimeOpen, setAddTimeOpen] = useState(false);
  const [newTimeOption, setNewTimeOption] = useState("");

  const [toastMessage, setToastMessage] = useState("");
  const [toastError, setToastError] = useState(false);
  const [saving, setSaving] = useState(false);

  const triggerToast = (msg, isError = false) => {
    setToastMessage(msg);
    setToastError(isError);
    setTimeout(() => setToastMessage(""), 3000);
  };

  const handleAddZone = (e) => {
    e.preventDefault();
    if (!newZoneName) return;
    const newZone = {
      id: Date.now(),
      name: newZoneName,
      regions: newZoneRegions
        ? newZoneRegions.split(",").map((r) => r.trim()).filter(Boolean)
        : ["Global"],
      methods: newZoneMethods || "Free Shipping, Flat Rate",
    };
    setZones([...zones, newZone]);
    setNewZoneName("");
    setNewZoneRegions("");
    setNewZoneMethods("");
    setAddZoneOpen(false);
    triggerToast("Zone ditambahkan. Klik Save Changes untuk menyimpan.");
  };

  const handleDeleteZone = (id) => {
    setZones(zones.filter((z) => z.id !== id));
    triggerToast("Zone dihapus. Klik Save Changes untuk menyimpan.");
  };

  const handleAddTime = (e) => {
    e.preventDefault();
    if (!newTimeOption) return;
    const newTime = {
      id: Date.now(),
      option: newTimeOption,
    };
    setDeliveryTimes([...deliveryTimes, newTime]);
    setNewTimeOption("");
    setAddTimeOpen(false);
    triggerToast("Delivery time ditambahkan. Klik Save Changes untuk menyimpan.");
  };

  const handleDeleteTime = (id) => {
    setDeliveryTimes(deliveryTimes.filter((t) => t.id !== id));
    triggerToast("Delivery time dihapus. Klik Save Changes untuk menyimpan.");
  };

  const handleSave = async () => {
    if (saving) return;
    setSaving(true);
    const result = await updateShippingSettings({ zones, deliveryTimes });
    setSaving(false);
    if (result?.success) {
      triggerToast(result.message || "Pengaturan pengiriman berhasil disimpan");
    } else {
      triggerToast(result?.error || "Gagal menyimpan pengaturan pengiriman", true);
    }
  };

  const handleEditUnavailable = () => {
    triggerToast("Edit belum tersedia", true);
  };

  const filteredZones = zones.filter(
    (z) =>
      String(z.name || "").toLowerCase().includes(zoneSearch.toLowerCase()) ||
      (z.regions || []).some((r) =>
        String(r).toLowerCase().includes(zoneSearch.toLowerCase())
      )
  );

  return (
    <div className="space-y-8">
      {/* Toast Alert */}
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

      {/* Save bar */}
      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          disabled={saving}
          className="bg-[#14B8A6] hover:bg-[#0D9488] disabled:opacity-50 text-white text-xs h-9 px-4 flex items-center gap-1.5"
        >
          <Save className="size-4" />
          <span>{saving ? "Saving..." : "Save Changes"}</span>
        </Button>
      </div>

      {/* ================= CARD 1: SHIPPING ZONES ================= */}
      <Card className="border border-gray-200 shadow-sm bg-white">
        <CardHeader className="pb-3 border-b border-gray-100 flex flex-row items-center justify-between">
          <CardTitle className="text-base font-semibold text-gray-800">
            Shipping Zones
          </CardTitle>
          <Button
            onClick={() => setAddZoneOpen(true)}
            className="bg-[#14B8A6] hover:bg-[#0D9488] text-white text-xs h-9 px-4 flex items-center gap-1.5"
          >
            <Plus className="size-4" />
            <span>Add Shipping Zone</span>
          </Button>
        </CardHeader>

        <CardContent className="pt-4 space-y-4">
          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs text-gray-600">
            <div className="flex items-center gap-2">
              <span>Show</span>
              <select
                value={zonePageSize}
                onChange={(e) => setZonePageSize(e.target.value)}
                className="border border-gray-300 rounded px-2 py-1 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-teal-500"
              >
                <option value="15">15</option>
                <option value="30">30</option>
                <option value="50">50</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <span>Search:</span>
              <Input
                value={zoneSearch}
                onChange={(e) => setZoneSearch(e.target.value)}
                className="h-8 w-44 text-xs bg-white border-gray-300 focus-visible:ring-teal-500"
              />
            </div>
          </div>

          {/* Zones Table */}
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <Table>
              <TableHeader className="bg-gray-50/70">
                <TableRow>
                  <TableHead className="w-48 text-xs font-semibold text-gray-700">
                    Zone Name
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-gray-700">
                    Regions
                  </TableHead>
                  <TableHead className="w-80 text-xs font-semibold text-gray-700">
                    Shipping Methods
                  </TableHead>
                  <TableHead className="w-28 text-center text-xs font-semibold text-gray-700">
                    Options
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredZones.length > 0 ? (
                  filteredZones.map((zone) => (
                    <TableRow key={zone.id} className="hover:bg-gray-50/50">
                      <TableCell className="text-sm font-medium text-gray-800">
                        {zone.name}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1.5">
                          {(zone.regions || []).map((reg, idx) => (
                            <span
                              key={idx}
                              className="inline-block bg-gray-100 text-gray-700 border border-gray-200 text-xs px-2.5 py-0.5 rounded font-normal"
                            >
                              {reg}
                            </span>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {zone.methods}
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={handleEditUnavailable}
                            className="p-1.5 bg-gray-100 hover:bg-gray-200 rounded text-gray-700 transition-colors"
                            title="Edit"
                          >
                            <Edit className="size-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteZone(zone.id)}
                            className="p-1.5 bg-gray-100 hover:bg-red-50 hover:text-red-600 rounded text-gray-700 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="size-3.5" />
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="text-center text-xs text-gray-400 py-6"
                    >
                      No shipping zones found!
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="flex justify-end pt-2">
            <div className="flex items-center border border-gray-200 rounded overflow-hidden text-xs">
              <button
                type="button"
                disabled
                className="px-2.5 py-1 text-gray-400 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                ‹
              </button>
              <button type="button" className="px-3 py-1 bg-[#14B8A6] text-white font-medium">
                1
              </button>
              <button
                type="button"
                disabled
                className="px-2.5 py-1 text-gray-400 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                ›
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ================= CARD 2: SHIPPING DELIVERY TIMES ================= */}
      <Card className="border border-gray-200 shadow-sm bg-white">
        <CardHeader className="pb-3 border-b border-gray-100 flex flex-row items-center justify-between">
          <CardTitle className="text-base font-semibold text-gray-800">
            Shipping Delivery Times
          </CardTitle>
          <Button
            onClick={() => setAddTimeOpen(true)}
            className="bg-[#14B8A6] hover:bg-[#0D9488] text-white text-xs h-9 px-4 flex items-center gap-1.5"
          >
            <Plus className="size-4" />
            <span>Add Delivery Time</span>
          </Button>
        </CardHeader>

        <CardContent className="pt-4 space-y-4">
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <Table>
              <TableHeader className="bg-gray-50/70">
                <TableRow>
                  <TableHead className="text-xs font-semibold text-gray-700">
                    Option
                  </TableHead>
                  <TableHead className="w-28 text-center text-xs font-semibold text-gray-700">
                    Options
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {deliveryTimes.length > 0 ? (
                  deliveryTimes.map((item) => (
                    <TableRow key={item.id} className="hover:bg-gray-50/50">
                      <TableCell className="text-sm text-gray-700">
                        {item.option}
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={handleEditUnavailable}
                            className="p-1.5 bg-gray-100 hover:bg-gray-200 rounded text-gray-700 transition-colors"
                            title="Edit"
                          >
                            <Edit className="size-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteTime(item.id)}
                            className="p-1.5 bg-gray-100 hover:bg-red-50 hover:text-red-600 rounded text-gray-700 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="size-3.5" />
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={2}
                      className="text-center text-xs text-gray-400 py-6"
                    >
                      No delivery times found!
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="flex justify-end pt-2">
            <div className="flex items-center border border-gray-200 rounded overflow-hidden text-xs">
              <button
                type="button"
                disabled
                className="px-2.5 py-1 text-gray-400 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                ‹
              </button>
              <button type="button" className="px-3 py-1 bg-[#14B8A6] text-white font-medium">
                1
              </button>
              <button
                type="button"
                disabled
                className="px-2.5 py-1 text-gray-400 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                ›
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Info Callout */}
      <div className="bg-sky-50 border border-sky-200 text-sky-800 rounded-lg p-4 text-sm leading-relaxed">
        You can add shipping delivery times from here (E.g: Ready to ship in 1 Business Day)
      </div>

      {/* Dialog Add Shipping Zone */}
      <Dialog open={addZoneOpen} onOpenChange={setAddZoneOpen}>
        <DialogContent className="max-w-md bg-white">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold text-gray-900">
              Add Shipping Zone
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddZone} className="space-y-4 pt-2">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Zone Name
              </label>
              <Input
                placeholder="e.g. Asia Pacific"
                value={newZoneName}
                onChange={(e) => setNewZoneName(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Regions (comma separated)
              </label>
              <Input
                placeholder="e.g. Japan, South Korea, Singapore"
                value={newZoneRegions}
                onChange={(e) => setNewZoneRegions(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Shipping Methods
              </label>
              <Input
                placeholder="e.g. Express, Standard Delivery"
                value={newZoneMethods}
                onChange={(e) => setNewZoneMethods(e.target.value)}
              />
            </div>
            <DialogFooter className="pt-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setAddZoneOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-[#14B8A6] hover:bg-[#0D9488] text-white"
              >
                Add Zone
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog Add Delivery Time */}
      <Dialog open={addTimeOpen} onOpenChange={setAddTimeOpen}>
        <DialogContent className="max-w-md bg-white">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold text-gray-900">
              Add Delivery Time
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddTime} className="space-y-4 pt-2">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Option Label
              </label>
              <Input
                placeholder="e.g. Ready to ship in 1-2 Business Days"
                value={newTimeOption}
                onChange={(e) => setNewTimeOption(e.target.value)}
                required
              />
            </div>
            <DialogFooter className="pt-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setAddTimeOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-[#14B8A6] hover:bg-[#0D9488] text-white"
              >
                Save
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
