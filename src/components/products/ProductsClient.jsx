"use client";

import { useState, useMemo, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ChevronDown,
  ChevronUp,
  Filter,
  X,
  Search,
  RotateCcw,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ProductCard } from "@/components/home/ProductCard";

const CONDITIONS = ["New", "Used"];

// Tautan kategori ada yang memakai nama ("Home & Living") dan ada yang memakai
// slug ("home-living", misalnya link banner di tabel banners), jadi keduanya
// diterima saat mencocokkan filter.
const slugify = (value) =>
  String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const categoryMatches = (label, wanted) => {
  const a = String(label || "").toLowerCase();
  const b = String(wanted || "").toLowerCase();
  if (!a || !b) return false;
  return a === b || slugify(a) === slugify(b);
};

const RATINGS = [
  { label: "★★★★★ (5 Stars)", value: 5 },
  { label: "★★★★☆ (4 Stars & Up)", value: 4 },
  { label: "★★★☆☆ (3 Stars & Up)", value: 3 },
];

export function ProductsClient({
  initialProducts = [],
  initialBrands = [],
  initialCategories = [],
}) {
  return (
    <Suspense fallback={<div className="py-20 text-center text-gray-500">Loading products...</div>}>
      <ProductsContent
        initialProducts={initialProducts}
        initialBrands={initialBrands}
        initialCategories={initialCategories}
      />
    </Suspense>
  );
}

function ProductsContent({ initialProducts = [], initialBrands = [], initialCategories = [] }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const categories = initialCategories;
  const locations = useMemo(
    () => [...new Set(initialProducts.map((p) => p.location).filter(Boolean))].sort(),
    [initialProducts],
  );

  // URL Query Sync
  const urlSearch = searchParams.get("search") || searchParams.get("q") || "";
  const urlCategory = searchParams.get("category") || "";

  // State Filters
  const [searchQuery, setSearchQuery] = useState(urlSearch);
  const [selectedCategory, setSelectedCategory] = useState(urlCategory);
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [brandSearch, setBrandSearch] = useState("");
  const [minPriceInput, setMinPriceInput] = useState("");
  const [maxPriceInput, setMaxPriceInput] = useState("");
  const [appliedPriceRange, setAppliedPriceRange] = useState({ min: null, max: null });
  const [selectedConditions, setSelectedConditions] = useState([]);
  const [selectedLocations, setSelectedLocations] = useState([]);
  const [selectedRatings, setSelectedRatings] = useState([]);
  const [sortBy, setSortBy] = useState("most-recent");
  const [currentPage, setCurrentPage] = useState(1);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Accordion state
  const [isCategoryOpen, setIsCategoryOpen] = useState(true);
  const [isBrandOpen, setIsBrandOpen] = useState(true);
  const [isPriceOpen, setIsPriceOpen] = useState(false);
  const [isConditionOpen, setIsConditionOpen] = useState(false);
  const [isLocationOpen, setIsLocationOpen] = useState(false);
  const [isRatingOpen, setIsRatingOpen] = useState(false);

  // Sync when searchParams change from outside (e.g. Navbar search submit)
  useEffect(() => {
    setSearchQuery(urlSearch);
  }, [urlSearch]);

  useEffect(() => {
    setSelectedCategory(urlCategory);
  }, [urlCategory]);

  // Check if any filter is active
  const hasActiveFilters = Boolean(
    searchQuery ||
    selectedCategory ||
    selectedBrands.length > 0 ||
    appliedPriceRange.min !== null ||
    appliedPriceRange.max !== null ||
    selectedConditions.length > 0 ||
    selectedLocations.length > 0 ||
    selectedRatings.length > 0
  );

  // Handlers
  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedCategory("");
    setSelectedBrands([]);
    setBrandSearch("");
    setMinPriceInput("");
    setMaxPriceInput("");
    setAppliedPriceRange({ min: null, max: null });
    setSelectedConditions([]);
    setSelectedLocations([]);
    setSelectedRatings([]);
    setSortBy("most-recent");
    setCurrentPage(1);
    router.push("/products");
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    if (selectedCategory) {
      router.push(`/products?category=${encodeURIComponent(selectedCategory)}`);
    } else {
      router.push("/products");
    }
  };

  const handleToggleCategory = (cat) => {
    setSelectedCategory((prev) => (prev === cat ? "" : cat));
    setCurrentPage(1);
  };

  const handleToggleBrand = (brand) => {
    setSelectedBrands((prev) =>
      prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand]
    );
    setCurrentPage(1);
  };

  const handleToggleCondition = (cond) => {
    setSelectedConditions((prev) =>
      prev.includes(cond) ? prev.filter((c) => c !== cond) : [...prev, cond]
    );
    setCurrentPage(1);
  };

  const handleToggleLocation = (loc) => {
    setSelectedLocations((prev) =>
      prev.includes(loc) ? prev.filter((l) => l !== loc) : [...prev, loc]
    );
    setCurrentPage(1);
  };

  const handleToggleRating = (rate) => {
    setSelectedRatings((prev) =>
      prev.includes(rate) ? prev.filter((r) => r !== rate) : [...prev, rate]
    );
    setCurrentPage(1);
  };

  const handleApplyPrice = (e) => {
    e.preventDefault();
    setAppliedPriceRange({
      min: minPriceInput ? Number(minPriceInput) : null,
      max: maxPriceInput ? Number(maxPriceInput) : null,
    });
    setCurrentPage(1);
  };

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return initialProducts.filter((product) => {
      // 1. Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const titleMatch = product.title?.toLowerCase().includes(q);
        const descMatch = product.description?.toLowerCase().includes(q);
        const brandMatch = product.brand?.toLowerCase().includes(q);
        const catMatch = product.category?.toLowerCase().includes(q);
        if (!titleMatch && !descMatch && !brandMatch && !catMatch) {
          return false;
        }
      }

      // 2. Category
      if (selectedCategory) {
        if (!categoryMatches(product.category, selectedCategory)) {
          return false;
        }
      }

      // 3. Brand
      if (selectedBrands.length > 0) {
        if (!selectedBrands.includes(product.brand)) {
          return false;
        }
      }

      // 4. Price
      if (appliedPriceRange.min !== null && product.price < appliedPriceRange.min) {
        return false;
      }
      if (appliedPriceRange.max !== null && product.price > appliedPriceRange.max) {
        return false;
      }

      // 5. Condition
      if (selectedConditions.length > 0) {
        const prodCond = (product.condition || "").toLowerCase();
        const matchesCondition = selectedConditions.some((c) => {
          if (c === "New") return prodCond.includes("baru") || prodCond.includes("new");
          if (c === "Used") return prodCond.includes("bekas") || prodCond.includes("used");
          return false;
        });
        if (!matchesCondition) return false;
      }

      // 6. Location
      if (selectedLocations.length > 0) {
        const prodLoc = (product.location || "").toLowerCase();
        const matchesLocation = selectedLocations.some((loc) =>
          prodLoc.includes(loc.toLowerCase())
        );
        if (!matchesLocation) return false;
      }

      // 7. Rating
      if (selectedRatings.length > 0) {
        const minRating = Math.min(...selectedRatings);
        if ((product.rating || 0) < minRating) {
          return false;
        }
      }

      return true;
    });
  }, [
    initialProducts,
    searchQuery,
    selectedCategory,
    selectedBrands,
    appliedPriceRange,
    selectedConditions,
    selectedLocations,
    selectedRatings,
  ]);

  // Sorted Products
  const sortedProducts = useMemo(() => {
    const list = [...filteredProducts];
    switch (sortBy) {
      case "price-low":
        return list.sort((a, b) => a.price - b.price);
      case "price-high":
        return list.sort((a, b) => b.price - a.price);
      case "rating":
        return list.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      case "newest":
        return list.sort((a, b) => b.id - a.id);
      case "most-recent":
      default:
        return list;
    }
  }, [filteredProducts, sortBy]);

  // Brand list for search in sidebar
  const filteredBrandsList = useMemo(() => {
    if (!brandSearch.trim()) return initialBrands;
    return initialBrands.filter((b) =>
      b.toLowerCase().includes(brandSearch.toLowerCase().trim())
    );
  }, [brandSearch, initialBrands]);

  return (
    <div>
      {/* Mobile Filter Toggle Button */}
      <div className="md:hidden mb-4 flex items-center justify-between">
        <button
          type="button"
          onClick={() => setIsMobileFilterOpen(!isMobileFilterOpen)}
          className="inline-flex items-center gap-2 border border-gray-200 rounded-md px-3.5 py-2 text-xs font-semibold bg-white text-gray-700 shadow-2xs cursor-pointer hover:bg-gray-50 transition-colors"
        >
          <Filter className="size-3.5 text-teal-600" />
          <span>Filter Produk</span>
          {hasActiveFilters && (
            <span className="size-2 rounded-full bg-teal-600"></span>
          )}
        </button>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={handleResetFilters}
            className="text-xs text-gray-500 hover:text-teal-600 font-medium"
          >
            Reset Filters
          </button>
        )}
      </div>

      {/* Main Grid: 1/4 Kiri (Sidebar Filter) + 3/4 Kanan (Grid Produk) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
        {/* ======================================================== */}
        {/* SIDEBAR FILTER (KIRI) */}
        {/* ======================================================== */}
        <aside
          className={`${
            isMobileFilterOpen ? "block" : "hidden md:block"
          } col-span-1 bg-white border border-gray-200 rounded-lg p-4 md:sticky md:top-20 shadow-xs space-y-4`}
        >
          {/* 1. CATEGORY */}
          <div className="border-b border-gray-100 pb-4">
            <button
              type="button"
              onClick={() => setIsCategoryOpen(!isCategoryOpen)}
              className="flex w-full items-center justify-between text-sm font-semibold text-gray-900 hover:text-teal-600 transition-colors cursor-pointer select-none"
            >
              <span>Category</span>
              {isCategoryOpen ? (
                <ChevronUp className="size-4 text-gray-400" />
              ) : (
                <ChevronDown className="size-4 text-gray-400" />
              )}
            </button>

            <AnimatePresence initial={false}>
              {isCategoryOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25, ease: "easeInOut" }}
                  className="overflow-hidden"
                >
                  <ul className="mt-3 space-y-1">
                    {categories.map((cat) => {
                      const isSelected = categoryMatches(cat, selectedCategory);
                      return (
                        <li key={cat}>
                          <button
                            type="button"
                            onClick={() => handleToggleCategory(cat)}
                            className={`w-full text-left text-sm py-1.5 transition-colors cursor-pointer block truncate ${
                              isSelected
                                ? "text-teal-600 font-semibold"
                                : "text-gray-700 hover:text-teal-600"
                            }`}
                          >
                            {cat}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* 2. BRAND */}
          <div className="border-b border-gray-100 pb-4">
            <button
              type="button"
              onClick={() => setIsBrandOpen(!isBrandOpen)}
              className="flex w-full items-center justify-between text-sm font-semibold text-gray-900 hover:text-teal-600 transition-colors cursor-pointer select-none"
            >
              <span>Brand</span>
              {isBrandOpen ? (
                <ChevronUp className="size-4 text-gray-400" />
              ) : (
                <ChevronDown className="size-4 text-gray-400" />
              )}
            </button>

            <AnimatePresence initial={false}>
              {isBrandOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25, ease: "easeInOut" }}
                  className="overflow-hidden"
                >
                  <div className="mt-3">
                    <input
                      type="text"
                      placeholder="Search Brand"
                      value={brandSearch}
                      onChange={(e) => setBrandSearch(e.target.value)}
                      className="w-full rounded border border-gray-200 px-3 py-1.5 text-xs text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-teal-500 mb-2.5 transition-colors"
                    />

                    <div className="max-h-48 overflow-y-auto space-y-1 pr-1">
                      {filteredBrandsList.length === 0 ? (
                        <p className="text-xs text-gray-400 py-1">No brands found</p>
                      ) : (
                        filteredBrandsList.map((brand) => (
                          <label
                            key={brand}
                            className="flex items-center gap-2 py-1 cursor-pointer hover:text-gray-900 select-none text-xs sm:text-sm text-gray-700 group"
                          >
                            <input
                              type="checkbox"
                              checked={selectedBrands.includes(brand)}
                              onChange={() => handleToggleBrand(brand)}
                              className="size-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500 accent-teal-600 cursor-pointer transition-transform duration-150 group-hover:scale-110 active:scale-95"
                            />
                            <span>{brand}</span>
                          </label>
                        ))
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* 3. PRICE */}
          <div className="border-b border-gray-100 pb-4">
            <button
              type="button"
              onClick={() => setIsPriceOpen(!isPriceOpen)}
              className="flex w-full items-center justify-between text-sm font-semibold text-gray-900 hover:text-teal-600 transition-colors cursor-pointer select-none"
            >
              <span>Price</span>
              {isPriceOpen ? (
                <ChevronUp className="size-4 text-gray-400" />
              ) : (
                <ChevronDown className="size-4 text-gray-400" />
              )}
            </button>

            <AnimatePresence initial={false}>
              {isPriceOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25, ease: "easeInOut" }}
                  className="overflow-hidden"
                >
                  <form onSubmit={handleApplyPrice} className="mt-3 space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="number"
                        placeholder="Min"
                        value={minPriceInput}
                        onChange={(e) => setMinPriceInput(e.target.value)}
                        className="w-full rounded border border-gray-200 px-2.5 py-1.5 text-xs text-gray-800 focus:outline-none focus:border-teal-500 transition-colors"
                      />
                      <input
                        type="number"
                        placeholder="Max"
                        value={maxPriceInput}
                        onChange={(e) => setMaxPriceInput(e.target.value)}
                        className="w-full rounded border border-gray-200 px-2.5 py-1.5 text-xs text-gray-800 focus:outline-none focus:border-teal-500 transition-colors"
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold py-1.5 rounded transition-all duration-200 hover:scale-102 active:scale-95 cursor-pointer shadow-xs"
                    >
                      Apply
                    </button>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* 4. CONDITION */}
          <div className="border-b border-gray-100 pb-4">
            <button
              type="button"
              onClick={() => setIsConditionOpen(!isConditionOpen)}
              className="flex w-full items-center justify-between text-sm font-semibold text-gray-900 hover:text-teal-600 transition-colors cursor-pointer select-none"
            >
              <span>Condition</span>
              {isConditionOpen ? (
                <ChevronUp className="size-4 text-gray-400" />
              ) : (
                <ChevronDown className="size-4 text-gray-400" />
              )}
            </button>

            <AnimatePresence initial={false}>
              {isConditionOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25, ease: "easeInOut" }}
                  className="overflow-hidden"
                >
                  <div className="mt-3 space-y-1">
                    {CONDITIONS.map((cond) => (
                      <label
                        key={cond}
                        className="flex items-center gap-2 py-1 cursor-pointer hover:text-gray-900 select-none text-xs sm:text-sm text-gray-700 group"
                      >
                        <input
                          type="checkbox"
                          checked={selectedConditions.includes(cond)}
                          onChange={() => handleToggleCondition(cond)}
                          className="size-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500 accent-teal-600 cursor-pointer transition-transform duration-150 group-hover:scale-110 active:scale-95"
                        />
                        <span>{cond}</span>
                      </label>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* 5. LOCATION */}
          <div className="border-b border-gray-100 pb-4">
            <button
              type="button"
              onClick={() => setIsLocationOpen(!isLocationOpen)}
              className="flex w-full items-center justify-between text-sm font-semibold text-gray-900 hover:text-teal-600 transition-colors cursor-pointer select-none"
            >
              <span>Location</span>
              {isLocationOpen ? (
                <ChevronUp className="size-4 text-gray-400" />
              ) : (
                <ChevronDown className="size-4 text-gray-400" />
              )}
            </button>

            <AnimatePresence initial={false}>
              {isLocationOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25, ease: "easeInOut" }}
                  className="overflow-hidden"
                >
                  <div className="mt-3 space-y-1 max-h-40 overflow-y-auto pr-1">
                    {locations.map((loc) => (
                      <label
                        key={loc}
                        className="flex items-center gap-2 py-1 cursor-pointer hover:text-gray-900 select-none text-xs sm:text-sm text-gray-700 group"
                      >
                        <input
                          type="checkbox"
                          checked={selectedLocations.includes(loc)}
                          onChange={() => handleToggleLocation(loc)}
                          className="size-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500 accent-teal-600 cursor-pointer transition-transform duration-150 group-hover:scale-110 active:scale-95"
                        />
                        <span>{loc}</span>
                      </label>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* 6. RATING */}
          <div>
            <button
              type="button"
              onClick={() => setIsRatingOpen(!isRatingOpen)}
              className="flex w-full items-center justify-between text-sm font-semibold text-gray-900 hover:text-teal-600 transition-colors cursor-pointer select-none"
            >
              <span>Rating</span>
              {isRatingOpen ? (
                <ChevronUp className="size-4 text-gray-400" />
              ) : (
                <ChevronDown className="size-4 text-gray-400" />
              )}
            </button>

            <AnimatePresence initial={false}>
              {isRatingOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25, ease: "easeInOut" }}
                  className="overflow-hidden"
                >
                  <div className="mt-3 space-y-1">
                    {RATINGS.map((rate) => (
                      <label
                        key={rate.value}
                        className="flex items-center gap-2 py-1 cursor-pointer hover:text-gray-900 select-none text-xs sm:text-sm text-gray-700 group"
                      >
                        <input
                          type="checkbox"
                          checked={selectedRatings.includes(rate.value)}
                          onChange={() => handleToggleRating(rate.value)}
                          className="size-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500 accent-teal-600 cursor-pointer transition-transform duration-150 group-hover:scale-110 active:scale-95"
                        />
                        <span className="text-amber-500 font-medium">
                          {rate.label}
                        </span>
                      </label>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </aside>

        {/* ======================================================== */}
        {/* GRID PRODUK (KANAN) */}
        {/* ======================================================== */}
        <section className="col-span-1 md:col-span-3">
          {/* 1. TOP BAR */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6 bg-white p-3.5 rounded-lg border border-gray-200/80 shadow-2xs">
            {/* KIRI: Search Chip & Reset Filters */}
            <div className="flex flex-wrap items-center gap-2">
              {searchQuery && (
                <span className="inline-flex items-center gap-1.5 bg-gray-100 hover:bg-gray-200/70 transition-colors rounded-full px-3 py-1 text-xs text-gray-800 font-medium shadow-2xs">
                  <button
                    type="button"
                    onClick={handleClearSearch}
                    className="hover:text-gray-950 cursor-pointer -ml-0.5"
                    aria-label="Clear search query"
                  >
                    <X className="size-3.5 text-gray-500 hover:text-gray-800" />
                  </button>
                  <span>Search: {searchQuery}</span>
                </span>
              )}

              {selectedCategory && (
                <span className="inline-flex items-center gap-1.5 bg-gray-100 hover:bg-gray-200/70 transition-colors rounded-full px-3 py-1 text-xs text-gray-800 font-medium shadow-2xs">
                  <button
                    type="button"
                    onClick={() => setSelectedCategory("")}
                    className="hover:text-gray-950 cursor-pointer -ml-0.5"
                    aria-label="Clear category filter"
                  >
                    <X className="size-3.5 text-gray-500 hover:text-gray-800" />
                  </button>
                  <span>Category: {selectedCategory}</span>
                </span>
              )}

              {selectedBrands.map((b) => (
                <span
                  key={b}
                  className="inline-flex items-center gap-1.5 bg-gray-100 hover:bg-gray-200/70 transition-colors rounded-full px-3 py-1 text-xs text-gray-800 font-medium shadow-2xs"
                >
                  <button
                    type="button"
                    onClick={() => handleToggleBrand(b)}
                    className="hover:text-gray-950 cursor-pointer -ml-0.5"
                    aria-label={`Clear brand ${b}`}
                  >
                    <X className="size-3.5 text-gray-500 hover:text-gray-800" />
                  </button>
                  <span>Brand: {b}</span>
                </span>
              ))}

              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="text-xs sm:text-sm text-gray-500 hover:text-teal-600 font-medium hover:underline transition-all duration-200 cursor-pointer ml-1 inline-flex items-center gap-1 active:scale-95"
                >
                  <RotateCcw className="size-3 text-gray-400 group-hover:rotate-180 transition-transform duration-300" />
                  <span>Reset Filters</span>
                </button>
              )}
            </div>

            {/* KANAN: Sort Dropdown */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 border border-gray-200 rounded-md px-3 py-1.5 bg-white text-xs sm:text-sm text-gray-700 shadow-2xs hover:border-teal-500 focus-within:ring-2 focus-within:ring-teal-500/20 focus-within:border-teal-500 transition-all duration-200">
                <Filter className="size-3.5 text-gray-400 shrink-0" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-transparent border-none outline-none cursor-pointer font-medium text-gray-800 pr-1 text-xs sm:text-sm transition-colors"
                  aria-label="Sort products"
                >
                  <option value="most-recent">Most Recent</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="rating">Best Rating</option>
                  <option value="newest">Newest</option>
                </select>
              </div>
            </div>
          </div>

          {/* 2. GRID PRODUK / EMPTY STATE */}
          {sortedProducts.length === 0 ? (
            <div className="py-24 text-center">
              <p className="text-gray-500 text-base font-medium">
                No products found!
              </p>
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-teal-600 hover:underline transition-all duration-200 cursor-pointer"
                >
                  Reset all filters
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-5">
                {sortedProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {/* 3. PAGINATION */}
              <div className="flex items-center justify-center gap-1.5 sm:gap-2 mt-10 text-xs sm:text-sm">
                <button
                  type="button"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="px-3 py-1.5 border border-gray-200 rounded hover:bg-teal-600 hover:text-white hover:border-teal-600 hover:scale-105 active:scale-95 disabled:opacity-40 disabled:hover:scale-100 disabled:hover:bg-white disabled:hover:text-gray-700 disabled:hover:border-gray-200 cursor-pointer disabled:cursor-not-allowed font-semibold text-gray-700 transition-all duration-200"
                  aria-label="Previous page"
                >
                  &lt;
                </button>

                {[1, 2, 3].map((page) => (
                  <button
                    key={page}
                    type="button"
                    onClick={() => setCurrentPage(page)}
                    className={`px-3 py-1.5 border rounded font-semibold cursor-pointer transition-all duration-200 hover:scale-105 active:scale-95 ${
                      currentPage === page
                        ? "bg-teal-600 text-white border-teal-600 shadow-sm"
                        : "border-gray-200 hover:bg-teal-600 hover:text-white hover:border-teal-600 text-gray-700"
                    }`}
                  >
                    {page}
                  </button>
                ))}

                <button
                  type="button"
                  disabled={currentPage === 3}
                  onClick={() => setCurrentPage((p) => Math.min(3, p + 1))}
                  className="px-3 py-1.5 border border-gray-200 rounded hover:bg-teal-600 hover:text-white hover:border-teal-600 hover:scale-105 active:scale-95 disabled:opacity-40 disabled:hover:scale-100 disabled:hover:bg-white disabled:hover:text-gray-700 disabled:hover:border-gray-200 cursor-pointer disabled:cursor-not-allowed font-semibold text-gray-700 transition-all duration-200"
                  aria-label="Next page"
                >
                  &gt;
                </button>
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  );
}
