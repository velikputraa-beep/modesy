"use client";

import { useState } from "react";
import {
  UploadCloud,
  FileSpreadsheet,
  BookOpen,
  Check,
  X,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { bulkImportProductsAction } from "@/app/dashboard/actions";

const HEADERS = [
  "title",
  "category",
  "price",
  "old_price",
  "stock",
  "condition",
  "location",
  "description",
];

const EXAMPLE_ROWS = [
  {
    title: "Contoh Kaos Katun Polos",
    category: "clothing",
    price: "120000",
    old_price: "150000",
    stock: "25",
    condition: "new",
    location: "Bandung",
    description: "Kaos katun 30s, jahitan rangkap, tersedia ukuran M dan L.",
  },
  {
    title: "Contoh Lampu Meja Minimalis",
    category: "home-living",
    price: "275000",
    old_price: "",
    stock: "8",
    condition: "used",
    location: "Jakarta",
    description: "Lampu meja bekas pakai, kondisi 95%, kabel baru.",
  },
];

const COLUMN_GUIDE = `Panduan kolom CSV Bulk Product Upload Modesy

title        (wajib)   Nama produk. Baris tanpa judul akan dilewati.
category     (opsional) Slug kategori, contoh: clothing, shoes, home-living,
                        jewelry-accessories, toys-entertainment, graphics-photos,
                        video-audio, web-templates-code. Slug tidak dikenal => kategori kosong.
price        (wajib)   Harga rupiah, angka saja tanpa titik ribuan (contoh: 120000).
old_price    (opsional) Harga coret, boleh dikosongkan.
stock        (opsional) Jumlah stok, default 0.
condition    (opsional) "new" atau "used", default "used".
location     (opsional) Kota penjual, default mengikuti profil toko.
description  (opsional) Deskripsi produk, boleh memakai koma jika diapit tanda kutip.

Catatan penting
- Setiap baris menjadi produk baru berstatus "pending" dan harus disetujui admin
  sebelum tampil di storefront.
- Gambar produk tidak diimpor lewat CSV. Setelah impor, buka Dashboard -> Products
  lalu edit produk untuk menambahkan gambar (maksimal 6 gambar per produk).
- Sebaiknya hapus baris contoh sebelum file dipakai untuk impor sungguhan.
- Batas 100 produk per sekali impor.`;

// Parse CSV sederhana dengan dukungan tanda kutip dan koma di dalam nilai.
function parseCsv(text) {
  const rows = [];
  let row = [];
  let value = "";
  let quoted = false;

  const pushValue = () => {
    row.push(value.trim());
    value = "";
  };
  const pushRow = () => {
    if (row.some((cell) => cell !== "")) rows.push(row);
    row = [];
  };

  const source = String(text || "").replace(/\r\n?/g, "\n");
  for (let i = 0; i < source.length; i += 1) {
    const char = source[i];
    if (quoted) {
      if (char === '"') {
        if (source[i + 1] === '"') {
          value += '"';
          i += 1;
        } else {
          quoted = false;
        }
      } else {
        value += char;
      }
      continue;
    }
    if (char === '"') {
      quoted = true;
    } else if (char === ",") {
      pushValue();
    } else if (char === "\n") {
      pushValue();
      pushRow();
    } else {
      value += char;
    }
  }
  pushValue();
  pushRow();

  if (rows.length < 2) return [];

  const header = rows[0].map((h) => h.toLowerCase().replace(/\s+/g, "_"));
  return rows.slice(1).map((cells) => {
    const item = {};
    header.forEach((key, index) => {
      item[key] = cells[index] ?? "";
    });
    return item;
  });
}

function toCsv(rows) {
  const escape = (cell) => `"${String(cell ?? "").replace(/"/g, '""')}"`;
  return [HEADERS.join(","), ...rows.map((r) => HEADERS.map((h) => escape(r[h])).join(","))].join(
    "\n",
  );
}

function downloadFile(filename, content, mime) {
  const blob = new Blob([content], { type: `${mime};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export default function BulkProductUploadPage() {
  const [action, setAction] = useState("add");
  const [listingType, setListingType] = useState("sale");
  const [currency, setCurrency] = useState("IDR");
  const [file, setFile] = useState(null);
  const [toastMessage, setToastMessage] = useState("");
  const [toastError, setToastError] = useState(false);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null);

  const showToast = (message, isError = false) => {
    setToastMessage(message);
    setToastError(isError);
    setTimeout(() => setToastMessage(""), 4000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (busy) return;

    if (action !== "add") {
      showToast("Bulk impor saat ini hanya mendukung aksi “Add New Products”.", true);
      return;
    }
    if (listingType !== "sale" && listingType !== "ordinary") {
      showToast("Tipe listing Quote dan License Keys belum mendukung impor CSV.", true);
      return;
    }
    if (!file) {
      showToast("Pilih file CSV terlebih dahulu.", true);
      return;
    }

    setBusy(true);
    setResult(null);
    try {
      const rows = parseCsv(await file.text());
      if (rows.length === 0) {
        showToast("CSV kosong atau header tidak dikenali.", true);
        return;
      }
      const response = await bulkImportProductsAction(rows);
      if (response?.error) {
        showToast(response.error, true);
        return;
      }
      setResult(response);
      showToast(response.message);
      setFile(null);
    } catch (error) {
      showToast(`Impor gagal: ${error.message}`, true);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {toastMessage && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 text-white text-xs font-semibold px-4 py-3 rounded-lg shadow-xl animate-in fade-in slide-in-from-bottom-2 ${
            toastError ? "bg-rose-600" : "bg-teal-600"
          }`}
        >
          {toastError ? <X className="size-4 shrink-0" /> : <Check className="size-4 shrink-0" />}
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-8">
          <Card className="border border-gray-200 bg-white rounded-lg p-6 sm:p-7 space-y-6 shadow-xs">
            <div>
              <h1 className="text-xl font-bold tracking-tight text-gray-900">
                Bulk Product Upload
              </h1>
              <p className="text-xs text-gray-500 mt-1">
                You can add your products with a CSV file from this section
              </p>
            </div>

            {result && (
              <div className="rounded-lg border border-teal-200 bg-teal-50/60 p-4 text-xs text-teal-900 space-y-1.5">
                <p className="font-semibold">{result.message}</p>
                {result.skipped?.length > 0 && (
                  <ul className="list-disc pl-4 text-teal-800 space-y-0.5">
                    {result.skipped.slice(0, 10).map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                    {result.skipped.length > 10 && (
                      <li>+{result.skipped.length - 10} baris lain dilewati</li>
                    )}
                  </ul>
                )}
                <p className="text-teal-700">
                  Buka Products → Pending untuk melihat dan melengkapi gambar produk.
                </p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <Label className="text-xs font-semibold text-gray-700 block mb-1.5">
                  Select Action
                </Label>
                <select
                  value={action}
                  onChange={(e) => setAction(e.target.value)}
                  className="w-full h-10 rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="add">Add New Products</option>
                  <option value="update">Update Existing Products</option>
                </select>
              </div>

              <div>
                <Label className="text-xs font-semibold text-gray-700 block mb-1.5">
                  Listing Type
                </Label>
                <select
                  value={listingType}
                  onChange={(e) => setListingType(e.target.value)}
                  className="w-full h-10 rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="sale">Add a Product for Sale</option>
                  <option value="ordinary">Ordinary Listing</option>
                  <option value="quote">Quote (Price) Requests</option>
                  <option value="license">License Keys</option>
                </select>
              </div>

              <div>
                <Label className="text-xs font-semibold text-gray-700 block mb-1.5">
                  Currency
                </Label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full h-10 rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="IDR">IDR (Rp)</option>
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                </select>
                <p className="text-[11px] text-gray-400 mt-1">
                  Nilai harga di CSV disimpan apa adanya; marketplace ini memakai Rupiah.
                </p>
              </div>

              <div>
                <Label className="text-xs font-semibold text-gray-700 block mb-1.5">
                  CSV File
                </Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-10 text-center bg-gray-50/20 hover:border-teal-500 transition-colors flex flex-col items-center justify-center">
                  <div className="size-12 rounded-full bg-slate-100 flex items-center justify-center mb-2 text-slate-500">
                    <UploadCloud className="size-7" />
                  </div>
                  <p className="text-xs text-gray-500 mb-3">Drag and drop file here or</p>
                  <label className="border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 text-xs font-semibold px-4 py-2 rounded-md shadow-xs cursor-pointer transition-colors">
                    <span>Browse Files</span>
                    <input
                      type="file"
                      accept=".csv,text/csv"
                      onChange={(e) => {
                        setFile(e.target.files?.[0] || null);
                        setResult(null);
                      }}
                      className="hidden"
                    />
                  </label>
                  {file && (
                    <div className="mt-3 text-xs font-semibold text-teal-600 flex items-center gap-1.5">
                      <FileSpreadsheet className="size-4" />
                      <span>{file.name}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  disabled={busy}
                  className="bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold px-5 h-9 shadow-xs disabled:opacity-60"
                >
                  {busy ? "Importing..." : "Upload & Import"}
                </Button>
              </div>
            </form>
          </Card>
        </div>

        <div className="lg:col-span-4">
          <Card className="border border-gray-200 bg-white rounded-lg p-6 space-y-4 shadow-xs">
            <div>
              <h2 className="text-base font-bold tracking-tight text-gray-900">
                Help Documents
              </h2>
              <p className="text-xs text-gray-500 mt-1">
                You can use these documents to generate your CSV file
              </p>
            </div>

            <div className="space-y-2.5 pt-2">
              <Button
                type="button"
                onClick={() =>
                  downloadFile(
                    "modesy-bulk-upload-template.csv",
                    toCsv([]),
                    "text/csv",
                  )
                }
                className="w-full h-10 bg-[#10b981] hover:bg-[#059669] text-white text-xs font-semibold rounded-md shadow-xs justify-center cursor-pointer"
              >
                Download CSV Template
              </Button>

              <Button
                type="button"
                onClick={() =>
                  downloadFile(
                    "modesy-bulk-upload-example.csv",
                    toCsv(EXAMPLE_ROWS),
                    "text/csv",
                  )
                }
                className="w-full h-10 bg-[#3b82f6] hover:bg-[#2563eb] text-white text-xs font-semibold rounded-md shadow-xs justify-center cursor-pointer"
              >
                Download CSV Example
              </Button>

              <Button
                type="button"
                onClick={() =>
                  downloadFile("modesy-bulk-upload-guide.txt", COLUMN_GUIDE, "text/plain")
                }
                className="w-full h-10 bg-[#64748b] hover:bg-[#475569] text-white text-xs font-semibold rounded-md shadow-xs justify-center cursor-pointer"
              >
                Documentation
              </Button>
            </div>

            <div className="pt-1 flex gap-2 text-[11px] text-gray-500 leading-relaxed">
              <BookOpen className="size-4 shrink-0 text-gray-400" />
              <p>
                Template, contoh, dan panduan kolom diunduh sebagai file asli dari
                browser. Impor CSV menulis ke tabel{" "}
                <span className="font-mono">products</span> dengan status pending.
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
