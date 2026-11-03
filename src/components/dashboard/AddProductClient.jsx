"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  UploadCloud,
  Info,
  Sparkles,
  Image as ImageIcon,
  Check,
  Search,
  ChevronDown,
  X,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  List,
  ListOrdered,
  Link as LinkIcon,
  RotateCcw,
  RotateCw,
  Eye,
  Maximize2,
  Code,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast-context";
import { createProduct, updateProduct } from "@/app/dashboard/actions";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";

const CATEGORY_FALLBACK = [];

export function AddProductClient({ categories = CATEGORY_FALLBACK, product = null }) {
  const router = useRouter();
  const { toast } = useToast();
  const isEdit = Boolean(product?.id);

  const [productType, setProductType] = useState("physical");
  const [listingType, setListingType] = useState("sale");
  const [category, setCategory] = useState(product?.category || "");
  const [categorySlug, setCategorySlug] = useState(product?.categorySlug || "");
  const [categorySearch, setCategorySearch] = useState("");
  const [categoryOpen, setCategoryOpen] = useState(false);

  // Form Details: English
  const [title, setTitle] = useState(product?.title || "");
  const [shortDesc, setShortDesc] = useState(product?.shortDescription || "");
  const [tags, setTags] = useState("");
  const [description, setDescription] = useState(product?.description || "");

  // Harga & stok (kolom yang benar-benar ada di tabel products)
  const [price, setPrice] = useState(product?.price ? String(product.price) : "");
  const [oldPrice, setOldPrice] = useState(
    product?.originalPrice ? String(product.originalPrice) : ""
  );
  const [stock, setStock] = useState(product?.stock != null ? String(product.stock) : "");
  const [condition, setCondition] = useState(product?.condition === "Baru" ? "new" : "used");
  const [location, setLocation] = useState(product?.location || "");

  // Form Details: Arabic
  const [titleAr, setTitleAr] = useState("");
  const [shortDescAr, setShortDescAr] = useState("");
  const [tagsAr, setTagsAr] = useState("");
  const [descriptionAr, setDescriptionAr] = useState("");

  // Notification / saved state
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isAiGenerating, setIsAiGenerating] = useState(false);

  const filteredCategories = categories.filter((cat) =>
    cat.name.toLowerCase().includes(categorySearch.toLowerCase())
  );

  const [aiNote, setAiNote] = useState("");

  const handleGenerateAi = () => {
    setIsAiGenerating(true);
    setAiNote("Konten otomatis dengan AI belum terhubung ke model. Silakan isi manual.");
    setTimeout(() => setIsAiGenerating(false), 500);
  };

  // Images state (unggahan baru berupa File, yang sudah ada hanya URL)
  const [images, setImages] = useState(() =>
    (product?.images || []).map((url, idx) => ({
      id: `existing-${idx}`,
      file: null,
      url,
      name: `Gambar ${idx + 1}`,
      isMain: idx === 0,
    }))
  );
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    return () => {
      images.forEach((img) => {
        if (img?.url) URL.revokeObjectURL(img.url);
      });
    };
  }, [images]);

  const handleFiles = (files) => {
    if (!files || files.length === 0) return;
    const fileList = Array.from(files).filter((file) =>
      file.type.startsWith("image/")
    );
    if (fileList.length === 0) {
      toast.error("File tidak didukung. Unggah gambar (PNG/JPG/WebP).");
      return;
    }
    if (fileList.length < files.length) {
      toast.error("Beberapa file bukan gambar dan dilewati.");
    }

    const newImages = fileList.map((file, idx) => ({
      id: `${Date.now()}-${idx}-${Math.random().toString(36).slice(2, 7)}`,
      file,
      url: URL.createObjectURL(file),
      name: file.name,
      isMain: false,
    }));

    setImages((prev) => {
      const combined = [...prev, ...newImages];
      if (!combined.some((img) => img.isMain) && combined.length > 0) {
        combined[0].isMain = true;
      }
      return combined;
    });
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer?.files) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleSetMain = (id) => {
    setImages((prev) =>
      prev.map((img) => ({
        ...img,
        isMain: img.id === id,
      }))
    );
  };

  const handleDeleteImage = (id, e) => {
    e.stopPropagation();
    setImages((prev) => {
      const target = prev.find((img) => img.id === id);
      if (target?.url) {
        URL.revokeObjectURL(target.url);
      }
      const filtered = prev.filter((img) => img.id !== id);
      if (filtered.length > 0 && !filtered.some((img) => img.isMain)) {
        filtered[0].isMain = true;
      }
      return filtered;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSaving) return;
    if (!title.trim()) {
      setSaveError("Judul produk wajib diisi");
      return;
    }

    setIsSaving(true);
    setSaveError("");

    const fd = new FormData();
    fd.set("title", title.trim());
    fd.set("shortDescription", shortDesc);
    fd.set("description", description);
    fd.set("price", price || "0");
    fd.set("oldPrice", oldPrice || "0");
    fd.set("stock", stock || "0");
    fd.set("condition", condition);
    fd.set("location", location);
    fd.set("categorySlug", categorySlug);
    images.forEach((img) => {
      if (img.file) fd.append("images", img.file);
    });

    const result = isEdit
      ? await updateProduct(product.id, fd)
      : await createProduct(fd);

    setIsSaving(false);

    if (result?.success) {
      setSavedSuccess(true);
      setTimeout(() => {
        setSavedSuccess(false);
        router.push("/dashboard/products");
      }, 1200);
    } else {
      setSaveError(result?.error || "Gagal menyimpan produk");
    }
  };

  const handleFormat = (prefix, suffix = "") => {
    setDescription((prev) => `${prev ? prev + " " : ""}${prefix}text${suffix}`);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      {/* Toast Notification */}
      {savedSuccess && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-emerald-600 text-white text-xs font-semibold px-4 py-3 rounded-lg shadow-xl animate-in fade-in slide-in-from-bottom-2">
          <Check className="size-4 shrink-0" />
          <span>
            {isEdit
              ? "Perubahan produk tersimpan!"
              : "Produk tersimpan dan menunggu persetujuan admin!"}
          </span>
        </div>
      )}

      {/* Judul Add Product */}
      <h1 className="text-2xl font-bold tracking-tight text-gray-900 text-center mb-6">
        {isEdit ? "Edit Product" : "Add Product"}
      </h1>

      {/* Step Indicator 2 Step */}
      <div className="max-w-md mx-auto mb-8 relative">
        {/* Connecting bar */}
        <div className="absolute top-5 left-1/4 right-1/4 h-0.5 -translate-y-1/2 flex -z-0">
          <div className="w-1/2 bg-teal-500 h-full" />
          <div className="w-1/2 bg-gray-300 h-full" />
        </div>

        <div className="relative flex justify-around">
          {/* Step 1: General Information (Aktif) */}
          <div className="flex flex-col items-center">
            <div className="size-10 rounded-full bg-teal-600 text-white flex items-center justify-center font-bold text-sm shadow-xs z-10 ring-4 ring-teal-50">
              1
            </div>
            <span className="text-xs font-semibold text-gray-800 mt-2">
              General Information
            </span>
          </div>

          {/* Step 2: Details (Inactive) */}
          <div className="flex flex-col items-center">
            <div className="size-10 rounded-full bg-gray-300 text-gray-600 flex items-center justify-center font-bold text-sm z-10">
              2
            </div>
            <span className="text-xs font-medium text-gray-400 mt-2">
              Details
            </span>
          </div>
        </div>
      </div>

      {/* Card Utama Add Product */}
      <Card className="border border-gray-200 bg-white rounded-lg p-6 sm:p-8 space-y-7 shadow-xs">
        {/* ========================================================= */}
        {/* SECTION IMAGES */}
        {/* ========================================================= */}
        <div>
          <Label className="text-sm font-semibold text-gray-800 block mb-2">
            Images
          </Label>

          {/* Hidden File Input */}
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            onChange={(e) => {
              if (e.target.files) handleFiles(e.target.files);
              e.target.value = "";
            }}
            className="hidden"
          />

          {/* Dropzone Area */}
          <div
            onClick={() => fileInputRef.current?.click()}
            onDragOver={handleDragOver}
            onDragEnter={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-lg p-10 sm:p-12 text-center transition-all cursor-pointer group select-none ${
              isDragging
                ? "border-teal-500 bg-teal-50/40 ring-4 ring-teal-50 scale-[1.005]"
                : "border-gray-300 hover:border-teal-500 bg-gray-50/30"
            }`}
          >
            <UploadCloud
              className={`size-12 mx-auto mb-3 stroke-1 transition-all ${
                isDragging
                  ? "text-teal-600 scale-110"
                  : "text-gray-400 group-hover:text-teal-600"
              }`}
            />
            <p className="text-sm text-gray-600">
              {isDragging ? (
                <span className="text-teal-600 font-semibold">
                  Drop images here to upload
                </span>
              ) : (
                <>
                  Drag and drop images here or{" "}
                  <span
                    onClick={(e) => {
                      e.stopPropagation();
                      fileInputRef.current?.click();
                    }}
                    className="text-teal-600 underline font-semibold cursor-pointer hover:text-teal-700"
                  >
                    Browse Files
                  </span>
                </>
              )}
            </p>
          </div>

          <p className="text-xs text-gray-500 flex items-center gap-1.5 mt-2.5">
            <Info className="size-3.5 text-blue-500 shrink-0" />
            <span>
              You can click on the &quot;Main&quot; button on the images to select the main image of your product
            </span>
          </p>

          {/* Uploaded Images Gallery */}
          {images.length > 0 && (
            <div className="mt-4 pt-3 border-t border-gray-100">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-gray-700">
                  Uploaded Images ({images.length})
                </span>
                <span className="text-[11px] text-gray-400">
                  Click &quot;Main&quot; to set the primary product image
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
                {images.map((img) => (
                  <div
                    key={img.id}
                    className={`relative group rounded-lg overflow-hidden border-2 bg-white aspect-square shadow-2xs transition-all ${
                      img.isMain
                        ? "border-teal-500 ring-2 ring-teal-500/20"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <img
                      src={img.url}
                      alt={img.name}
                      className="w-full h-full object-cover"
                    />

                    {/* Delete button */}
                    <button
                      type="button"
                      onClick={(e) => handleDeleteImage(img.id, e)}
                      className="absolute top-1.5 right-1.5 size-6 rounded-full bg-black/60 hover:bg-red-600 text-white flex items-center justify-center transition-colors shadow-sm"
                      title="Delete image"
                    >
                      <X className="size-3.5" />
                    </button>

                    {/* Main button / badge */}
                    <div className="absolute bottom-1.5 inset-x-1.5">
                      {img.isMain ? (
                        <div className="w-full text-center bg-teal-600 text-white text-[10px] font-bold py-1 rounded shadow-xs tracking-wider uppercase">
                          Main
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSetMain(img.id);
                          }}
                          className="w-full text-center bg-white/95 hover:bg-teal-600 hover:text-white text-gray-700 text-[10px] font-semibold py-1 rounded shadow-xs border border-gray-200 transition-colors"
                        >
                          Main
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ========================================================= */}
        {/* SECTION PRODUCT TYPE (Grid 2 Kolom) */}
        {/* ========================================================= */}
        <div>
          <Label className="text-sm font-semibold text-gray-800 block mb-2.5">
            Product Type
          </Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Physical */}
            <label
              className={`flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition-all ${
                productType === "physical"
                  ? "border-teal-500 bg-teal-50/20 shadow-xs"
                  : "border-gray-200 hover:border-gray-300 bg-white"
              }`}
            >
              <input
                type="radio"
                name="productType"
                checked={productType === "physical"}
                onChange={() => setProductType("physical")}
                className="mt-1 size-4 accent-teal-600 cursor-pointer"
              />
              <div>
                <div className="text-sm font-semibold text-gray-900">Physical</div>
                <div className="text-xs text-gray-500 mt-0.5 leading-relaxed">
                  A tangible product that you will ship to buyers
                </div>
              </div>
            </label>

            {/* Digital */}
            <label
              className={`flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition-all ${
                productType === "digital"
                  ? "border-teal-500 bg-teal-50/20 shadow-xs"
                  : "border-gray-200 hover:border-gray-300 bg-white"
              }`}
            >
              <input
                type="radio"
                name="productType"
                checked={productType === "digital"}
                onChange={() => setProductType("digital")}
                className="mt-1 size-4 accent-teal-600 cursor-pointer"
              />
              <div>
                <div className="text-sm font-semibold text-gray-900">Digital</div>
                <div className="text-xs text-gray-500 mt-0.5 leading-relaxed">
                  A digital file that buyers will download
                </div>
              </div>
            </label>
          </div>
        </div>

        {/* ========================================================= */}
        {/* SECTION LISTING TYPE (Grid 2 Kolom) */}
        {/* ========================================================= */}
        <div>
          <Label className="text-sm font-semibold text-gray-800 block mb-2.5">
            Listing Type
          </Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 1. Add a Product for Sale */}
            <label
              className={`flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition-all ${
                listingType === "sale"
                  ? "border-teal-500 bg-teal-50/20 shadow-xs"
                  : "border-gray-200 hover:border-gray-300 bg-white"
              }`}
            >
              <input
                type="radio"
                name="listingType"
                checked={listingType === "sale"}
                onChange={() => setListingType("sale")}
                className="mt-1 size-4 accent-teal-600 cursor-pointer"
              />
              <div>
                <div className="text-sm font-semibold text-gray-900">
                  Add a Product for Sale
                </div>
                <div className="text-xs text-gray-500 mt-0.5 leading-relaxed">
                  Add a product to sell on the site
                </div>
              </div>
            </label>

            {/* 2. Ordinary Listing */}
            <label
              className={`flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition-all ${
                listingType === "ordinary"
                  ? "border-teal-500 bg-teal-50/20 shadow-xs"
                  : "border-gray-200 hover:border-gray-300 bg-white"
              }`}
            >
              <input
                type="radio"
                name="listingType"
                checked={listingType === "ordinary"}
                onChange={() => setListingType("ordinary")}
                className="mt-1 size-4 accent-teal-600 cursor-pointer"
              />
              <div>
                <div className="text-sm font-semibold text-gray-900">
                  Add a Product or Service as an Ordinary Listing
                </div>
                <div className="text-xs text-gray-500 mt-0.5 leading-relaxed">
                  Add a product or service without buy option
                </div>
              </div>
            </label>

            {/* 3. Quote Requests */}
            <label
              className={`flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition-all ${
                listingType === "quote"
                  ? "border-teal-500 bg-teal-50/20 shadow-xs"
                  : "border-gray-200 hover:border-gray-300 bg-white"
              }`}
            >
              <input
                type="radio"
                name="listingType"
                checked={listingType === "quote"}
                onChange={() => setListingType("quote")}
                className="mt-1 size-4 accent-teal-600 cursor-pointer"
              />
              <div>
                <div className="text-sm font-semibold text-gray-900">
                  Add a Product to Receive Quote (Price) Requests
                </div>
                <div className="text-xs text-gray-500 mt-0.5 leading-relaxed">
                  Add a product without adding a price to get price requests from customers
                </div>
              </div>
            </label>

            {/* 4. License Keys */}
            <label
              className={`flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition-all ${
                listingType === "license"
                  ? "border-teal-500 bg-teal-50/20 shadow-xs"
                  : "border-gray-200 hover:border-gray-300 bg-white"
              }`}
            >
              <input
                type="radio"
                name="listingType"
                checked={listingType === "license"}
                onChange={() => setListingType("license")}
                className="mt-1 size-4 accent-teal-600 cursor-pointer"
              />
              <div>
                <div className="text-sm font-semibold text-gray-900">
                  Add a Product to Sell License Keys
                </div>
                <div className="text-xs text-gray-500 mt-0.5 leading-relaxed">
                  Add a product to sell only license keys
                </div>
              </div>
            </label>
          </div>
        </div>

        {/* ========================================================= */}
        {/* SECTION CATEGORY (Custom Dropdown with Search) */}
        {/* ========================================================= */}
        <div>
          <Label className="text-sm font-semibold text-gray-800 block mb-2">
            Category
          </Label>
          <div className="relative">
            <button
              type="button"
              onClick={() => setCategoryOpen(!categoryOpen)}
              className="flex h-10 w-full items-center justify-between rounded-md border border-gray-300 bg-white px-3.5 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-teal-500 cursor-pointer transition-colors"
            >
              <span className={category ? "text-gray-900 font-medium" : "text-gray-400"}>
                {category || "Select Category"}
              </span>
              <ChevronDown className="size-4 text-gray-400 shrink-0" />
            </button>

            {categoryOpen && (
              <div className="absolute left-0 top-full z-50 mt-1 w-full rounded-md border border-gray-200 bg-white shadow-xl ring-1 ring-black/5 overflow-hidden">
                {/* Search input in dropdown */}
                <div className="p-2 border-b border-gray-100 flex items-center gap-2 bg-gray-50/50">
                  <Search className="size-4 text-gray-400 shrink-0" />
                  <input
                    type="text"
                    placeholder="Search category..."
                    value={categorySearch}
                    onChange={(e) => setCategorySearch(e.target.value)}
                    className="w-full text-xs bg-transparent border-none outline-none text-gray-800 placeholder:text-gray-400"
                    autoFocus
                  />
                </div>

                <div className="max-h-56 overflow-y-auto py-1">
                  {filteredCategories.length > 0 ? (
                    filteredCategories.map((cat) => (
                      <div
                        key={cat.slug}
                        onClick={() => {
                          setCategory(cat.name);
                          setCategorySlug(cat.slug);
                          setCategoryOpen(false);
                        }}
                        className={`px-3.5 py-2 text-sm cursor-pointer transition-colors flex items-center justify-between ${
                          category === cat.name
                            ? "bg-teal-50 text-teal-700 font-semibold"
                            : "text-gray-700 hover:bg-gray-50 hover:text-teal-600"
                        }`}
                      >
                        <span>{cat.name}</span>
                        {category === cat.name && <Check className="size-4 text-teal-600" />}
                      </div>
                    ))
                  ) : (
                    <div className="px-3.5 py-3 text-xs text-gray-400 text-center">
                      {categories.length === 0
                        ? "Belum ada kategori di database"
                        : "No categories found"}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ========================================================= */}
        {/* SECTION HARGA & STOK (kolom nyata di tabel products) */}
        {/* ========================================================= */}
        <div>
          <Label className="text-sm font-semibold text-gray-800 block mb-2">
            Pricing &amp; Inventory
          </Label>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <Label className="text-xs font-semibold text-gray-700 block mb-1.5">
                Harga (Rp)
              </Label>
              <Input
                type="number"
                min="0"
                step="1000"
                placeholder="150000"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
            </div>

            <div>
              <Label className="text-xs font-semibold text-gray-700 block mb-1.5">
                Harga Coret (Opsional)
              </Label>
              <Input
                type="number"
                min="0"
                step="1000"
                placeholder="200000"
                value={oldPrice}
                onChange={(e) => setOldPrice(e.target.value)}
              />
            </div>

            <div>
              <Label className="text-xs font-semibold text-gray-700 block mb-1.5">
                Stok
              </Label>
              <Input
                type="number"
                min="0"
                step="1"
                placeholder="10"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
              />
            </div>

            <div>
              <Label className="text-xs font-semibold text-gray-700 block mb-1.5">
                Kondisi
              </Label>
              <select
                value={condition}
                onChange={(e) => setCondition(e.target.value)}
                className="h-9 w-full rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="used">Bekas</option>
                <option value="new">Baru</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <Label className="text-xs font-semibold text-gray-700 block mb-1.5">
                Lokasi Penjual
              </Label>
              <Input
                placeholder="Jakarta Selatan"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>
          </div>
          <p className="text-[11px] text-gray-400 mt-2">
            Tipe produk dan tipe listing di atas belum memiliki kolom di database Modesy,
            jadi tidak ikut tersimpan.
          </p>
        </div>

        {/* ========================================================= */}
        {/* ACCORDION DETAILS (English & Arabic) */}
        {/* ========================================================= */}
        <Accordion type="single" defaultValue="details-en" className="space-y-4 pt-2">
          {/* Accordion "Details: English" (Default Open) */}
          <AccordionItem value="details-en">
            <AccordionTrigger className="bg-gray-50/60 font-semibold text-gray-800">
              <span>Details: English</span>
            </AccordionTrigger>
            <AccordionContent className="pt-4 space-y-4">
              {/* Tombol "Generate with AI" di kanan atas */}
              <div className="flex flex-col items-end gap-1.5 mb-2">
                <Button
                  type="button"
                  onClick={handleGenerateAi}
                  disabled={isAiGenerating}
                  className="bg-blue-500 hover:bg-blue-600 text-white text-xs font-semibold px-3.5 py-1.5 rounded-md flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                >
                  <Sparkles className="size-3.5 text-white" />
                  <span>{isAiGenerating ? "Generating..." : "Generate with AI"}</span>
                </Button>
                {aiNote && <p className="text-[11px] text-amber-600 font-medium">{aiNote}</p>}
              </div>

              {/* Title */}
              <div>
                <Label className="text-xs font-semibold text-gray-700 block mb-1.5">
                  Title
                </Label>
                <Input
                  placeholder="Title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              {/* Short Description */}
              <div>
                <Label className="text-xs font-semibold text-gray-700 block mb-1.5">
                  Short Description
                </Label>
                <Input
                  placeholder="Short Description"
                  value={shortDesc}
                  onChange={(e) => setShortDesc(e.target.value)}
                />
              </div>

              {/* Tags */}
              <div>
                <Label className="text-xs font-semibold text-gray-700 block mb-1">
                  Tags
                </Label>
                <p className="text-[11px] text-gray-400 mb-1.5">
                  (Add relevant keywords for your product to increase visibility in search results)
                </p>
                <Input
                  placeholder="Type tag and hit enter"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                />
              </div>

              {/* Description (Rich text editor toolbar mockup + textarea) */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-xs font-semibold text-gray-700">
                    Description
                  </Label>
                  <Button
                    type="button"
                    onClick={() => handleFormat("![Image](https://", ")")}
                    variant="outline"
                    size="sm"
                    className="bg-teal-500 hover:bg-teal-600 text-white border-teal-500 text-xs font-semibold h-7 px-2.5 gap-1.5 shadow-xs cursor-pointer"
                  >
                    <ImageIcon className="size-3.5" />
                    <span>Add Image</span>
                  </Button>
                </div>

                {/* Editor Box */}
                <div className="border border-gray-300 rounded-md overflow-hidden bg-white shadow-xs">
                  {/* Menu bar */}
                  <div className="px-3 py-1 bg-gray-50 border-b border-gray-200 text-xs text-gray-600 flex items-center gap-4 select-none">
                    <span className="hover:text-gray-900 cursor-pointer">File</span>
                    <span className="hover:text-gray-900 cursor-pointer">Insert</span>
                    <span className="hover:text-gray-900 cursor-pointer">Format</span>
                    <span className="hover:text-gray-900 cursor-pointer">Table</span>
                  </div>

                  {/* Toolbar icons */}
                  <div className="px-2 py-1.5 bg-gray-50/60 border-b border-gray-200 flex flex-wrap items-center gap-1 text-gray-600 select-none">
                    <button type="button" onClick={() => handleFormat("<pre><code>", "</code></pre>")} className="p-1 hover:bg-gray-200 rounded cursor-pointer" title="Code block">
                      <Code className="size-3.5" />
                    </button>
                    <span className="w-px h-4 bg-gray-300 mx-0.5" />
                    <button type="button" onClick={() => handleFormat("**", "**")} className="p-1 hover:bg-gray-200 rounded font-bold cursor-pointer" title="Bold">
                      <Bold className="size-3.5" />
                    </button>
                    <button type="button" onClick={() => handleFormat("*", "*")} className="p-1 hover:bg-gray-200 rounded italic cursor-pointer" title="Italic">
                      <Italic className="size-3.5" />
                    </button>
                    <button type="button" onClick={() => handleFormat("<u>", "</u>")} className="p-1 hover:bg-gray-200 rounded underline cursor-pointer" title="Underline">
                      <Underline className="size-3.5" />
                    </button>
                    <button type="button" onClick={() => handleFormat("~~", "~~")} className="p-1 hover:bg-gray-200 rounded line-through cursor-pointer" title="Strikethrough">
                      <Strikethrough className="size-3.5" />
                    </button>
                    <span className="w-px h-4 bg-gray-300 mx-0.5" />
                    <button type="button" onClick={() => handleFormat("\n- ")} className="p-1 hover:bg-gray-200 rounded cursor-pointer" title="Unordered list">
                      <List className="size-3.5" />
                    </button>
                    <button type="button" onClick={() => handleFormat("\n1. ")} className="p-1 hover:bg-gray-200 rounded cursor-pointer" title="Ordered list">
                      <ListOrdered className="size-3.5" />
                    </button>
                    <button type="button" onClick={() => handleFormat("[Link](https://", ")")} className="p-1 hover:bg-gray-200 rounded cursor-pointer" title="Insert link">
                      <LinkIcon className="size-3.5" />
                    </button>
                  </div>

                  {/* Textarea content */}
                  <textarea
                    rows={6}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Write detailed product specifications, materials, warranty, and features..."
                    className="w-full p-3 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none resize-y min-h-[160px]"
                  />

                  {/* Editor status footer */}
                  <div className="px-3 py-1 bg-gray-50 border-t border-gray-200 text-[11px] text-gray-400 flex items-center justify-between select-none">
                    <span>p</span>
                    <span className="font-semibold text-gray-500">tiny</span>
                  </div>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Accordion "Details: Arabic (Optional)" (Default Closed) */}
          <AccordionItem value="details-ar">
            <AccordionTrigger className="bg-gray-50/60 font-semibold text-gray-800">
              <span>Details: Arabic (Optional)</span>
            </AccordionTrigger>
            <AccordionContent className="pt-4 space-y-4" dir="rtl">
              <p className="text-[11px] text-gray-400 text-left" dir="ltr">
                Teks bahasa Arab tidak punya kolom di database Modesy, jadi tidak tersimpan.
              </p>
              <div>
                <Label className="text-xs font-semibold text-gray-700 block mb-1.5 text-right">
                  العنوان
                </Label>
                <Input
                  placeholder="عنوان المنتج"
                  value={titleAr}
                  onChange={(e) => setTitleAr(e.target.value)}
                  className="text-right"
                />
              </div>

              <div>
                <Label className="text-xs font-semibold text-gray-700 block mb-1.5 text-right">
                  الوصف المختصر
                </Label>
                <Input
                  placeholder="وصف مختصر للمنتج"
                  value={shortDescAr}
                  onChange={(e) => setShortDescAr(e.target.value)}
                  className="text-right"
                />
              </div>

              <div>
                <Label className="text-xs font-semibold text-gray-700 block mb-1.5 text-right">
                  الكلمات الدلالية
                </Label>
                <Input
                  placeholder="الوسوم (مفصولة بفواصل)"
                  value={tagsAr}
                  onChange={(e) => setTagsAr(e.target.value)}
                  className="text-right"
                />
              </div>

              <div>
                <Label className="text-xs font-semibold text-gray-700 block mb-1.5 text-right">
                  التفاصيل
                </Label>
                <textarea
                  rows={4}
                  value={descriptionAr}
                  onChange={(e) => setDescriptionAr(e.target.value)}
                  placeholder="تفاصيل المنتج باللغة العربية..."
                  className="w-full p-3 text-sm text-gray-800 border border-gray-300 rounded-md placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 text-right"
                />
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        {/* Tombol Save and Continue (Kanan Bawah) */}
        <div className="flex flex-col items-end gap-3 pt-4 border-t border-gray-100">
          {saveError && (
            <p className="text-xs font-semibold text-red-600 self-end">{saveError}</p>
          )}
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={isSaving}
            className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold px-6 py-2.5 rounded-md flex items-center gap-2 shadow-xs cursor-pointer transition-colors disabled:opacity-60"
          >
            <Check className="size-4" />
            <span>{isSaving ? "Menyimpan..." : isEdit ? "Save Changes" : "Save and Continue"}</span>
          </Button>
        </div>
      </Card>
    </div>
  );
}
