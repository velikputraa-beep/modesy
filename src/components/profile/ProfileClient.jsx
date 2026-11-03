"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  BadgeCheck,
  Star,
  ShoppingCart,
  MapPin,
  Calendar,
  Mail,
  Eye,
  EyeOff,
  MessageSquare,
  UserPlus,
  UserMinus,
  Filter,
  Rss,
  Check,
  ShieldCheck,
  Truck,
  RotateCcw,
  CreditCard,
  Lock,
  HelpCircle,
  PackageCheck,
  Globe,
  Headphones,
  Edit,
  Heart,
} from "lucide-react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { ProductCard } from "@/components/home/ProductCard";
import { formatPriceIDR } from "@/lib/utils";
import { followAction, unfollowAction } from "@/app/profile/[username]/actions";
import { getOrCreateConversationAction, sendMessageAction } from "@/app/messages/actions";

import { ROLE_COLORS, ROLE_LABELS } from "@/lib/permissions";

function buildFollowingMap(followData) {
  const all = [...(followData?.followers || []), ...(followData?.following || [])];
  return Object.fromEntries(all.map((u) => [u.id, !!u.isFollowing]));
}

export function ProfileClient({
  user,
  currentUser,
  sellerProducts = [],
  sellerReviews = [],
  followData = null,
}) {
  const router = useRouter();

  // Tab state
  const [activeTab, setActiveTab] = useState("products");

  // Follow state for current profile
  const [isFollowing, setIsFollowing] = useState(followData?.isFollowing || false);
  const [followBusy, setFollowBusy] = useState(false);

  // Show/Hide contact info
  const [showPhone, setShowPhone] = useState(false);

  // Ask Question Modal
  const [askModalOpen, setAskModalOpen] = useState(false);
  const [questionText, setQuestionText] = useState("");
  const [sendingQuestion, setSendingQuestion] = useState(false);
  const [toastMsg, setToastMsg] = useState("");

  // Filter state for products
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedCondition, setSelectedCondition] = useState("All");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [appliedPrice, setAppliedPrice] = useState({ min: null, max: null });
  const [sortBy, setSortBy] = useState("recent");
  const [visibleCount, setVisibleCount] = useState(12);

  // Followers & Following state
  const [followersList, setFollowersList] = useState(followData?.followers || []);
  const [followingList, setFollowingList] = useState(followData?.following || []);
  const [followingMap, setFollowingMap] = useState(() => buildFollowingMap(followData));
  const [followerCount, setFollowerCount] = useState(followData?.followerCount ?? 0);
  const [followingCount, setFollowingCount] = useState(followData?.followingCount ?? 0);

  // Reset state saat berpindah ke profil lain
  useEffect(() => {
    setIsFollowing(followData?.isFollowing || false);
    setFollowersList(followData?.followers || []);
    setFollowingList(followData?.following || []);
    setFollowingMap(buildFollowingMap(followData));
    setFollowerCount(followData?.followerCount ?? 0);
    setFollowingCount(followData?.followingCount ?? 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 3000);
  };

  const requireLogin = () => {
    showToast("Silakan login dulu untuk mengikuti seller ini.");
    router.push("/login");
  };

  const handleToggleFollow = async () => {
    if (!currentUser) return requireLogin();
    if (followBusy || !user?.id) return;
    const next = !isFollowing;
    setFollowBusy(true);
    setIsFollowing(next);
    setFollowerCount((c) => Math.max(0, c + (next ? 1 : -1)));
    const result = next ? await followAction(user.id) : await unfollowAction(user.id);
    setFollowBusy(false);
    if (result?.error) {
      setIsFollowing(!next);
      setFollowerCount((c) => Math.max(0, c + (next ? -1 : 1)));
      showToast(result.error);
      return;
    }
    showToast(next ? `You are now following ${user?.full_name}` : `Unfollowed ${user?.full_name}`);
  };

  const handleToggleUserFollow = async (uId, uName) => {
    if (!currentUser) return requireLogin();
    const nextVal = !followingMap[uId];
    setFollowingMap((prev) => ({ ...prev, [uId]: nextVal }));
    const result = nextVal ? await followAction(uId) : await unfollowAction(uId);
    if (result?.error) {
      setFollowingMap((prev) => ({ ...prev, [uId]: !nextVal }));
      showToast(result.error);
      return;
    }
    showToast(nextVal ? `Followed ${uName}` : `Unfollowed ${uName}`);
  };

  const handleSendQuestion = async (e) => {
    e.preventDefault();
    if (!questionText.trim()) return;
    if (!currentUser) return requireLogin();
    setSendingQuestion(true);
    const conv = await getOrCreateConversationAction({ sellerId: user.id });
    if (conv?.error) {
      setSendingQuestion(false);
      showToast(conv.error);
      return;
    }
    const sent = await sendMessageAction({ conversationId: conv.conversationId, content: questionText });
    setSendingQuestion(false);
    if (sent?.error) {
      showToast(sent.error);
      return;
    }
    setAskModalOpen(false);
    setQuestionText("");
    showToast("Your question has been sent to the seller!");
    router.push(`/messages?chat=${conv.conversationId}`);
  };

  // Kategori berasal dari produk seller di database
  const categoriesList = useMemo(
    () => [...new Set(sellerProducts.map((p) => p.category).filter(Boolean))].sort(),
    [sellerProducts]
  );

  // Breakdown rating dari review asli di database (persen per bintang)
  const ratingBreakdown = useMemo(() => {
    const counts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    sellerReviews.forEach((r) => {
      const star = Math.round(Number(r.rating) || 0);
      if (counts[star] !== undefined) counts[star] += 1;
    });
    const total = sellerReviews.length || 1;
    return Object.fromEntries(
      Object.entries(counts).map(([star, c]) => [star, Math.round((c / total) * 100)])
    );
  }, [sellerReviews]);

  // Filter & sort products
  const filteredProducts = sellerProducts
    .filter((p) => {
      if (selectedCategory !== "All" && p.category !== selectedCategory) return false;
      if (selectedCondition !== "All" && p.condition !== selectedCondition) return false;
      if (appliedPrice.min !== null && p.price < appliedPrice.min) return false;
      if (appliedPrice.max !== null && p.price > appliedPrice.max) return false;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === "price-asc") return a.price - b.price;
      if (sortBy === "price-desc") return b.price - a.price;
      if (sortBy === "rating") return (b.rating || 0) - (a.rating || 0);
      return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    });

  const displayedProducts = filteredProducts.slice(0, visibleCount);

  // Formatted join date
  const joinDate = user?.joined
    ? new Date(user.joined).toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      })
    : "July 2026";

  const bannerImg =
    user?.banner_url ||
    `https://picsum.photos/seed/banner-${user?.username || "modesy"}/1600/500`;

  const avatarImg =
    user?.avatar_url ||
    `https://picsum.photos/seed/avatar-${user?.username || "modesy"}/200/200`;

  // Dokumen kebijakan yang ditulis vendor di Dashboard → Shop Policies
  // (kolom profiles.shop_policies). Bila kosong, hanya ketentuan umum Modesy
  // yang tampil.
  const sellerPolicyDoc = String(user?.shop_policies?.returnPolicy || "").trim();

  return (
    <div className="flex-1 bg-gray-50/40 pb-16">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2 bg-emerald-600 text-white px-4 py-2.5 rounded-lg shadow-xl text-xs font-semibold animate-in fade-in slide-in-from-top-2">
          <Check className="size-4 shrink-0 stroke-[3]" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* ============================================================ */}
      {/* BAGIAN 1 — BANNER (Full width, h-48 md:h-60) */}
      {/* ============================================================ */}
      <motion.div
        initial={{ opacity: 0, scale: 1.05 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full h-48 md:h-60 relative overflow-hidden bg-gray-900"
      >
        <img
          src={bannerImg}
          alt={`${user?.full_name || "User"} Banner`}
          className="w-full h-full object-cover"
        />
      </motion.div>

      {/* ============================================================ */}
      {/* BAGIAN 2 — PROFILE HEADER (overlap banner) */}
      {/* ============================================================ */}
      <div className="max-w-6xl mx-auto px-4">
        <div className="bg-white rounded-lg border border-gray-200/90 shadow-2xs p-6 relative">
          <div className="flex flex-col md:flex-row items-start gap-6">
            {/* Avatar PERSEGI rounded-lg (size-36 = 144px), border putih 4px, shadow-lg, -mt-20 */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 350, damping: 20, bounce: 0.4 }}
              className="shrink-0 -mt-20 z-10"
            >
              <div className="size-36 rounded-lg overflow-hidden border-4 border-white shadow-lg bg-white">
                <img
                  src={avatarImg}
                  alt={user?.full_name || "Avatar"}
                  className="size-full object-cover"
                />
              </div>
            </motion.div>

            {/* Info User */}
            <div className="flex-1 min-w-0 space-y-2">
              {/* Row 1: Nama user + verified badge biru */}
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-1.5">
                  <span>{user?.full_name || user?.username || "Modesy User"}</span>
                  {user?.verified && (
                    <BadgeCheck
                      className="size-6 text-blue-500 fill-blue-500/20 shrink-0"
                      title="Verified User"
                    />
                  )}
                </h1>
                {user?.shop_name && (
                  <span className="text-sm font-semibold text-teal-600">
                    ({user.shop_name})
                  </span>
                )}
                {user?.role && (
                  <span
                    className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                      ROLE_COLORS[user.role] || "bg-teal-50 text-teal-700"
                    }`}
                  >
                    {ROLE_LABELS[user.role] || user.role}
                  </span>
                )}
              </div>

              {/* Row 2: Last seen */}
              <p className="text-xs text-gray-500 flex items-center gap-1.5">
                <span className="size-1.5 rounded-full bg-emerald-500 inline-block" />
                <span>Last seen: {user?.lastSeen || "Baru saja"}</span>
              </p>

              {/* Row 3: Rating stars + Review Count + Sales */}
              <div className="flex items-center gap-4 text-sm text-gray-600 pt-0.5">
                <div className="flex items-center gap-1">
                  <div className="flex items-center text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`size-4 ${
                          i < Math.floor(user?.rating || 0)
                            ? "fill-amber-400 text-amber-400"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-gray-500">
                    {user?.rating ? `${user.rating.toFixed(1)} ` : ""}
                    ({user?.reviewCount ?? 0} reviews)
                  </span>
                </div>

                <span className="text-gray-300">•</span>

                <div className="flex items-center gap-1.5 text-gray-600 text-xs sm:text-sm">
                  <ShoppingCart className="size-4 text-gray-400" />
                  <span>{user?.salesCount ?? 0} Sales</span>
                </div>
              </div>

              {/* Row 4: Bio / Deskripsi */}
              <p className="text-sm text-gray-600 max-w-3xl mt-2 leading-relaxed">
                {user?.bio ||
                  "Welcome to our store! We offer a wide range of high-quality products to meet all your needs, from the latest electronics and gadgets to stylish clothing and accessories."}
              </p>

              {/* Row 5: Member since, Show contact, Email */}
              <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 pt-2">
                <div className="flex items-center gap-1.5">
                  <Calendar className="size-3.5 text-gray-400" />
                  <span>Member since {joinDate}</span>
                </div>

                {user?.phone && (
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setShowPhone((prev) => !prev)}
                      className="flex items-center gap-1 text-gray-600 hover:text-teal-600 transition-colors cursor-pointer"
                    >
                      {showPhone ? (
                        <EyeOff className="size-3.5" />
                      ) : (
                        <Eye className="size-3.5" />
                      )}
                      <span>{showPhone ? user.phone : "Show contact"}</span>
                    </button>
                  </div>
                )}

                {user?.email && (
                  <div className="flex items-center gap-1.5">
                    <Mail className="size-3.5 text-gray-400" />
                    <span>{user.email}</span>
                  </div>
                )}
              </div>

              {/* Tombol Action Row: Edit Profile, Ask Question, Follow/Unfollow, RSS */}
              <div className="flex items-center gap-2 pt-3">
                {currentUser && (currentUser.username === user.username || currentUser.id === user.id) ? (
                  <Button
                    asChild
                    variant="outline"
                    className="border border-teal-600 bg-teal-50 hover:bg-teal-100 text-teal-700 px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 cursor-pointer shadow-2xs"
                  >
                    <Link href="/settings/edit-profile">
                      <Edit className="size-4" />
                      <span>Edit Profile</span>
                    </Link>
                  </Button>
                ) : (
                  <>
                    {/* Ask Question */}
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setAskModalOpen(true)}
                      className="border border-gray-300 hover:border-teal-600 hover:text-teal-600 text-gray-700 px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 cursor-pointer shadow-2xs"
                    >
                      <MessageSquare className="size-4" />
                      <span>Ask Question</span>
                    </Button>

                    {/* Unfollow / Follow Toggle */}
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleToggleFollow}
                      disabled={followBusy || !user?.id}
                      className={`border px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 shadow-2xs transition-all duration-200 hover:scale-105 active:scale-95 ${
                        followBusy || !user?.id
                          ? "opacity-60 pointer-events-none"
                          : "cursor-pointer"
                      } ${
                        isFollowing
                          ? "border-red-200 bg-red-50/50 text-red-600 hover:bg-red-100/50 hover:border-red-300"
                          : "border-gray-300 hover:border-teal-600 hover:text-teal-600 text-gray-700"
                      }`}
                    >
                      {isFollowing ? (
                        <>
                          <Heart className="size-4 fill-red-600 text-red-600 animate-heart-bounce" />
                          <span>Following</span>
                        </>
                      ) : (
                        <>
                          <UserPlus className="size-4" />
                          <span>Follow</span>
                        </>
                      )}
                    </Button>
                  </>
                )}

                {/* RSS Button */}
                <button
                  type="button"
                  onClick={() => showToast("Subscribed to store RSS feed!")}
                  aria-label="RSS Feed"
                  className="size-10 rounded-full border border-gray-300 hover:border-teal-600 text-gray-600 hover:text-teal-600 flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 cursor-pointer shrink-0"
                >
                  <Rss className="size-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ============================================================ */}
        {/* BAGIAN 3 — TAB NAVIGATION (Animated sliding underline) */}
        {/* ============================================================ */}
        <div className="mt-8">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <div className="overflow-x-auto no-scrollbar flex flex-nowrap border-b border-gray-200 bg-white rounded-t-lg px-2">
              {[
                { value: "products", label: `Products (${sellerProducts.length})` },
                { value: "followers", label: `Followers (${followerCount})` },
                { value: "following", label: `Following (${followingCount})` },
                { value: "reviews", label: `Reviews (${sellerReviews.length})` },
                { value: "shop-policies", label: "Shop Policies" },
              ].map((tab) => {
                const isActive = activeTab === tab.value;
                return (
                  <button
                    key={tab.value}
                    type="button"
                    onClick={() => setActiveTab(tab.value)}
                    className={`relative px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors cursor-pointer ${
                      isActive ? "text-teal-600 font-semibold" : "text-gray-500 hover:text-gray-800"
                    }`}
                  >
                    <span>{tab.label}</span>
                    {isActive && (
                      <motion.div
                        layoutId="profileTabUnderline"
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-teal-600 z-10"
                        transition={{ type: "spring", stiffness: 450, damping: 35 }}
                      />
                    )}
                  </button>
                );
              })}
            </div>

            {/* ========================================================= */}
            {/* TAB 1: PRODUCTS */}
            {/* ========================================================= */}
            <TabsContent value="products" className="pt-4">
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
                {/* KIRI (col-span-1): Sidebar Filter */}
                <div className="lg:col-span-1">
                  <div className="bg-white rounded-lg border border-gray-200 p-4 sticky top-24 shadow-2xs space-y-4">
                    <h3 className="font-semibold text-sm text-gray-900 pb-2 border-b border-gray-100 flex items-center gap-2">
                      <Filter className="size-4 text-teal-600" />
                      <span>Filter Products</span>
                    </h3>

                    <Accordion
                      type="multiple"
                      defaultValue={["category"]}
                      className="space-y-2"
                    >
                      {/* 1. Category Accordion (Default Open) */}
                      <AccordionItem value="category" className="border-none">
                        <AccordionTrigger className="py-2 px-0 text-sm font-semibold hover:bg-transparent">
                          Category
                        </AccordionTrigger>
                        <AccordionContent className="px-0 pt-2 pb-1 border-none space-y-1.5">
                          <button
                            type="button"
                            onClick={() => setSelectedCategory("All")}
                            className={`w-full text-left text-xs px-2 py-1.5 rounded transition-colors flex items-center justify-between ${
                              selectedCategory === "All"
                                ? "bg-teal-50 text-teal-700 font-semibold"
                                : "text-gray-600 hover:bg-gray-50"
                            }`}
                          >
                            <span>All Categories</span>
                            <span>{sellerProducts.length}</span>
                          </button>
                          {categoriesList.length === 0 && (
                            <p className="text-xs text-gray-400 px-2 py-1.5">
                              Belum ada produk.
                            </p>
                          )}
                          {categoriesList.map((cat) => {
                            const count = sellerProducts.filter(
                              (p) => p.category === cat
                            ).length;
                            return (
                              <button
                                key={cat}
                                type="button"
                                onClick={() => setSelectedCategory(cat)}
                                className={`w-full text-left text-xs px-2 py-1.5 rounded transition-colors flex items-center justify-between ${
                                  selectedCategory === cat
                                    ? "bg-teal-50 text-teal-700 font-semibold"
                                    : "text-gray-600 hover:bg-gray-50"
                                }`}
                              >
                                <span>{cat}</span>
                                <span className="text-gray-400">{count}</span>
                              </button>
                            );
                          })}
                        </AccordionContent>
                      </AccordionItem>

                      {/* 2. Price Accordion (Default Close) */}
                      <AccordionItem value="price" className="border-none">
                        <AccordionTrigger className="py-2 px-0 text-sm font-semibold hover:bg-transparent">
                          Price (Rp)
                        </AccordionTrigger>
                        <AccordionContent className="px-0 pt-2 pb-1 border-none space-y-2">
                          <div className="grid grid-cols-2 gap-2">
                            <input
                              type="number"
                              placeholder="Min"
                              value={minPrice}
                              onChange={(e) => setMinPrice(e.target.value)}
                              className="text-xs px-2 py-1.5 border border-gray-200 rounded focus:outline-none focus:border-teal-500"
                            />
                            <input
                              type="number"
                              placeholder="Max"
                              value={maxPrice}
                              onChange={(e) => setMaxPrice(e.target.value)}
                              className="text-xs px-2 py-1.5 border border-gray-200 rounded focus:outline-none focus:border-teal-500"
                            />
                          </div>
                          <Button
                            type="button"
                            size="sm"
                            onClick={() =>
                              setAppliedPrice({
                                min: minPrice ? parseFloat(minPrice) : null,
                                max: maxPrice ? parseFloat(maxPrice) : null,
                              })
                            }
                            className="w-full bg-teal-600 hover:bg-teal-700 text-white text-xs h-8"
                          >
                            Apply Price
                          </Button>
                        </AccordionContent>
                      </AccordionItem>

                      {/* 4. Condition Accordion (Default Close) */}
                      <AccordionItem value="condition" className="border-none">
                        <AccordionTrigger className="py-2 px-0 text-sm font-semibold hover:bg-transparent">
                          Condition
                        </AccordionTrigger>
                        <AccordionContent className="px-0 pt-2 pb-1 border-none space-y-1.5">
                          {["All", "Baru", "Bekas"].map((cond) => (
                            <label
                              key={cond}
                              className="flex items-center gap-2 text-xs text-gray-600 hover:text-gray-900 cursor-pointer py-0.5"
                            >
                              <input
                                type="radio"
                                name="condition"
                                checked={selectedCondition === cond}
                                onChange={() => setSelectedCondition(cond)}
                                className="accent-teal-600"
                              />
                              <span>{cond}</span>
                            </label>
                          ))}
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  </div>
                </div>

                {/* KANAN (col-span-3): Sort Bar & Product Cards */}
                <div className="lg:col-span-3">
                  {/* Top Bar Sort */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 bg-white p-3.5 rounded-lg border border-gray-200 shadow-2xs">
                    <span className="text-xs text-gray-500">
                      Showing{" "}
                      <strong className="text-gray-900">
                        {displayedProducts.length}
                      </strong>{" "}
                      of{" "}
                      <strong className="text-gray-900">
                        {filteredProducts.length}
                      </strong>{" "}
                      products
                    </span>

                    <div className="flex items-center gap-2">
                      <Filter className="size-3.5 text-gray-400" />
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="bg-white border border-gray-200 text-xs rounded-md px-3 py-1.5 text-gray-700 focus:outline-none focus:ring-1 focus:ring-teal-500 cursor-pointer shadow-2xs"
                      >
                        <option value="recent">Most Recent</option>
                        <option value="price-asc">Price: Low to High</option>
                        <option value="price-desc">Price: High to Low</option>
                        <option value="rating">Highest Rated</option>
                      </select>
                    </div>
                  </div>

                  {/* Product Cards Grid: 12 Produk Dummy */}
                  {displayedProducts.length === 0 ? (
                    <div className="bg-white rounded-lg border border-gray-200 p-12 text-center text-sm text-gray-500">
                      No products match your filter criteria.
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {displayedProducts.map((p) => (
                        <ProductCard key={p.id} product={p} />
                      ))}
                    </div>
                  )}

                  {/* Tombol Load More */}
                  {visibleCount < filteredProducts.length && (
                    <div className="mt-8 text-center">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setVisibleCount((prev) => prev + 12)}
                        className="px-6 py-2 border border-gray-300 text-gray-700 hover:border-teal-600 hover:text-teal-600 font-medium text-sm cursor-pointer shadow-2xs"
                      >
                        Load More
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            {/* ========================================================= */}
            {/* TAB 2: FOLLOWERS */}
            {/* ========================================================= */}
            <TabsContent value="followers" className="pt-4">
              {followersList.length === 0 && (
                <div className="bg-white rounded-lg border border-gray-200 p-12 text-center text-sm text-gray-500">
                  {user?.full_name} belum memiliki followers.
                </div>
              )}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {followersList.map((f) => {
                  const isUserFollowed = !!followingMap[f.id];
                  return (
                    <Card
                      key={f.id}
                      className="p-5 flex flex-col items-center text-center bg-white border border-gray-200 rounded-lg shadow-2xs hover:shadow-xs transition-shadow"
                    >
                      <Link
                        href={`/profile/${f.username}`}
                        className="group flex flex-col items-center"
                      >
                        <img
                          src={f.avatar || `https://picsum.photos/seed/avatar-${f.username}/200/200`}
                          alt={f.full_name}
                          className="size-16 rounded-full object-cover border-2 border-gray-100 group-hover:scale-105 transition-transform"
                        />
                        <h4 className="font-semibold text-sm text-gray-900 mt-3 group-hover:text-teal-600 transition-colors">
                          {f.full_name}
                        </h4>
                      </Link>

                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full mt-1 ${
                          ROLE_COLORS[f.role] || "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {ROLE_LABELS[f.role] || f.role}
                      </span>

                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleToggleUserFollow(f.id, f.full_name)}
                        className={`w-full mt-4 text-xs font-medium cursor-pointer ${
                          isUserFollowed
                            ? "bg-teal-50 border-teal-600 text-teal-700"
                            : "border-gray-300 hover:border-teal-600 hover:text-teal-600 text-gray-700"
                        }`}
                      >
                        {isUserFollowed ? "Following" : "Follow"}
                      </Button>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>

            {/* ========================================================= */}
            {/* TAB 3: FOLLOWING */}
            {/* ========================================================= */}
            <TabsContent value="following" className="pt-4">
              {followingList.length === 0 && (
                <div className="bg-white rounded-lg border border-gray-200 p-12 text-center text-sm text-gray-500">
                  {user?.full_name} belum mengikuti siapa pun.
                </div>
              )}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {followingList.map((f) => {
                  const isUnfollowed = followingMap[f.id] === false;
                  return (
                    <Card
                      key={f.id}
                      className="p-5 flex flex-col items-center text-center bg-white border border-gray-200 rounded-lg shadow-2xs hover:shadow-xs transition-shadow"
                    >
                      <Link
                        href={`/profile/${f.username}`}
                        className="group flex flex-col items-center"
                      >
                        <img
                          src={f.avatar}
                          alt={f.full_name}
                          className="size-16 rounded-full object-cover border-2 border-gray-100 group-hover:scale-105 transition-transform"
                        />
                        <h4 className="font-semibold text-sm text-gray-900 mt-3 group-hover:text-teal-600 transition-colors">
                          {f.full_name}
                        </h4>
                      </Link>

                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full mt-1 ${
                          ROLE_COLORS[f.role] || "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {ROLE_LABELS[f.role] || f.role}
                      </span>

                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleToggleUserFollow(f.id, f.full_name)}
                        className={`w-full mt-4 text-xs font-medium cursor-pointer ${
                          isUnfollowed
                            ? "border-gray-300 hover:border-teal-600 hover:text-teal-600 text-gray-700"
                            : "bg-gray-50 border-gray-300 text-gray-700 hover:bg-red-50 hover:text-red-600 hover:border-red-200"
                        }`}
                      >
                        {isUnfollowed ? "Follow" : "Unfollow"}
                      </Button>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>

            {/* ========================================================= */}
            {/* TAB 4: REVIEWS */}
            {/* ========================================================= */}
            <TabsContent value="reviews" className="pt-4">
              {/* Rating Summary Card */}
              <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6 shadow-2xs flex flex-col sm:flex-row items-center gap-8">
                {/* Kiri: Angka besar + 5 bintang kuning */}
                <div className="text-center sm:text-left shrink-0">
                  <div className="text-5xl font-extrabold text-gray-900 tracking-tight">
                    {(user?.rating || 0).toFixed(1)}
                  </div>
                  <div className="flex items-center gap-0.5 text-amber-400 mt-1.5 justify-center sm:justify-start">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`size-5 ${
                          i < Math.round(user?.rating || 0)
                            ? "fill-amber-400 text-amber-400"
                            : "text-gray-200"
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-1.5">
                    Based on {sellerReviews.length} reviews
                  </p>
                </div>

                {/* Kanan: Bar chart breakdown 5★ - 1★ */}
                <div className="flex-1 w-full space-y-2">
                  {[5, 4, 3, 2, 1].map((star) => {
                    const pct = ratingBreakdown[star] || 0;
                    return (
                      <div key={star} className="flex items-center gap-3 text-xs">
                        <span className="w-12 text-gray-600 font-medium">
                          {star} Stars
                        </span>
                        <div className="flex-1 h-2 rounded-full bg-gray-100 overflow-hidden">
                          <div
                            className="h-full bg-amber-400 rounded-full transition-all duration-500"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="w-8 text-right text-gray-500">
                          {pct}%
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* List Review dari database */}
              {sellerReviews.length === 0 && (
                <div className="bg-white rounded-lg border border-gray-200 p-12 text-center text-sm text-gray-500">
                  Belum ada review untuk seller ini.
                </div>
              )}
              <div className="space-y-3">
                {sellerReviews.map((rev) => (
                  <div
                    key={rev.id}
                    className="bg-white rounded-lg border border-gray-200 p-4 shadow-2xs"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={
                            rev.avatar ||
                            `https://picsum.photos/seed/avatar-${rev.reviewerUsername || rev.id}/100/100`
                          }
                          alt={rev.reviewer}
                          className="size-10 rounded-full object-cover border border-gray-100"
                        />
                        <div>
                          <Link
                            href={`/profile/${rev.reviewerUsername}`}
                            className="font-semibold text-sm text-gray-900 hover:text-teal-600 transition-colors"
                          >
                            {rev.reviewer}
                          </Link>
                          <p className="text-xs text-gray-400">{rev.date}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-0.5 text-amber-400">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`size-3.5 ${
                              i < Number(rev.rating)
                                ? "fill-amber-400 text-amber-400"
                                : "text-gray-200"
                            }`}
                          />
                        ))}
                      </div>
                    </div>

                    <p className="text-sm text-gray-700 mt-2.5 leading-relaxed">
                      {rev.comment}
                    </p>

                    {rev.product?.slug && (
                      <Link
                        href={`/products/${rev.product.slug}`}
                        className="inline-block mt-2 text-xs text-teal-600 hover:underline"
                      >
                        untuk: {rev.product.title}
                      </Link>
                    )}
                  </div>
                ))}
              </div>
            </TabsContent>

            {/* ========================================================= */}
            {/* TAB 5: SHOP POLICIES */}
            {/* ========================================================= */}
            <TabsContent value="shop-policies" className="pt-4">
              <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-2xs space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">
                    Store Policies & Guidelines
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">
                    Kebijakan ditulis oleh penjual melalui Dashboard → Shop Policies,
                    ditambah ketentuan umum Modesy.
                  </p>
                </div>

                {sellerPolicyDoc ? (
                  <div className="rounded-lg border border-teal-100 bg-teal-50/40 p-4">
                    <div className="flex items-center gap-2 mb-2 text-teal-700 font-semibold text-sm">
                      <ShieldCheck className="size-4" />
                      <span>Kebijakan {user?.shop_name || user?.full_name || "penjual"}</span>
                    </div>
                    <p className="text-xs text-gray-700 leading-relaxed whitespace-pre-line">
                      {sellerPolicyDoc}
                    </p>
                  </div>
                ) : (
                  <p className="text-xs text-gray-500 border border-dashed border-gray-200 rounded-lg p-4">
                    Penjual ini belum menuliskan kebijakan khusus. Berikut ketentuan
                    umum Modesy yang berlaku untuk semua toko.
                  </p>
                )}

                <h4 className="text-sm font-semibold text-gray-800 pt-2">
                  Ketentuan Umum Modesy
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                  {/* Section 1 */}
                  <div className="p-4 rounded-lg border border-gray-100 bg-gray-50/50">
                    <div className="flex items-center gap-2 mb-2 text-teal-600 font-semibold text-sm">
                      <Truck className="size-4" />
                      <span>1. Shipping Policy</span>
                    </div>
                    <p className="text-xs text-gray-600 leading-relaxed">
                      Orders are processed within 1-2 business days. Standard delivery takes 3-5 business days domestically. Tracking numbers are provided for all dispatched shipments.
                    </p>
                  </div>

                  {/* Section 2 */}
                  <div className="p-4 rounded-lg border border-gray-100 bg-gray-50/50">
                    <div className="flex items-center gap-2 mb-2 text-teal-600 font-semibold text-sm">
                      <RotateCcw className="size-4" />
                      <span>2. Returns & Exchanges</span>
                    </div>
                    <p className="text-xs text-gray-600 leading-relaxed">
                      We offer a 30-day money-back guarantee. If you are not satisfied with your purchase, items in original condition can be returned for a full refund or exchange.
                    </p>
                  </div>

                  {/* Section 3 */}
                  <div className="p-4 rounded-lg border border-gray-100 bg-gray-50/50">
                    <div className="flex items-center gap-2 mb-2 text-teal-600 font-semibold text-sm">
                      <CreditCard className="size-4" />
                      <span>3. Payment Methods Accepted</span>
                    </div>
                    <p className="text-xs text-gray-600 leading-relaxed">
                      We accept PayPal, Credit/Debit cards (Visa, MasterCard, Amex), Bank Transfer, and Modesy Wallet. All transactions are encrypted and secured.
                    </p>
                  </div>

                  {/* Section 4 */}
                  <div className="p-4 rounded-lg border border-gray-100 bg-gray-50/50">
                    <div className="flex items-center gap-2 mb-2 text-teal-600 font-semibold text-sm">
                      <PackageCheck className="size-4" />
                      <span>4. Order Cancellation Policy</span>
                    </div>
                    <p className="text-xs text-gray-600 leading-relaxed">
                      Orders can be cancelled free of charge before they are handed over to the courier. Once dispatched, the standard return process applies.
                    </p>
                  </div>

                  {/* Section 5 */}
                  <div className="p-4 rounded-lg border border-gray-100 bg-gray-50/50">
                    <div className="flex items-center gap-2 mb-2 text-teal-600 font-semibold text-sm">
                      <ShieldCheck className="size-4" />
                      <span>5. Custom Orders & Personalization</span>
                    </div>
                    <p className="text-xs text-gray-600 leading-relaxed">
                      Custom design requests require 3-5 extra business days for manufacturing. Customized items cannot be returned unless defective.
                    </p>
                  </div>

                  {/* Section 6 */}
                  <div className="p-4 rounded-lg border border-gray-100 bg-gray-50/50">
                    <div className="flex items-center gap-2 mb-2 text-teal-600 font-semibold text-sm">
                      <Lock className="size-4" />
                      <span>6. Privacy & Data Security</span>
                    </div>
                    <p className="text-xs text-gray-600 leading-relaxed">
                      Your personal data is strictly used for order processing and delivery. We never share customer information with third parties.
                    </p>
                  </div>

                  {/* Section 7 */}
                  <div className="p-4 rounded-lg border border-gray-100 bg-gray-50/50">
                    <div className="flex items-center gap-2 mb-2 text-teal-600 font-semibold text-sm">
                      <HelpCircle className="size-4" />
                      <span>7. Warranty & Guarantee</span>
                    </div>
                    <p className="text-xs text-gray-600 leading-relaxed">
                      All physical electronic and manufactured items carry a 6-month official store warranty covering hardware manufacturing defects.
                    </p>
                  </div>

                  {/* Section 8 */}
                  <div className="p-4 rounded-lg border border-gray-100 bg-gray-50/50">
                    <div className="flex items-center gap-2 mb-2 text-teal-600 font-semibold text-sm">
                      <PackageCheck className="size-4" />
                      <span>8. Damaged or Defective Items</span>
                    </div>
                    <p className="text-xs text-gray-600 leading-relaxed">
                      In the rare event of receiving damaged goods, please notify us within 48 hours with unboxing photos for an immediate replacement.
                    </p>
                  </div>

                  {/* Section 9 */}
                  <div className="p-4 rounded-lg border border-gray-100 bg-gray-50/50">
                    <div className="flex items-center gap-2 mb-2 text-teal-600 font-semibold text-sm">
                      <Globe className="size-4" />
                      <span>9. International Shipping & Customs</span>
                    </div>
                    <p className="text-xs text-gray-600 leading-relaxed">
                      International deliveries take 7-14 business days. Any customs duties, taxes, or local import fees are the responsibility of the buyer.
                    </p>
                  </div>

                  {/* Section 10 */}
                  <div className="p-4 rounded-lg border border-gray-100 bg-gray-50/50">
                    <div className="flex items-center gap-2 mb-2 text-teal-600 font-semibold text-sm">
                      <Headphones className="size-4" />
                      <span>10. Customer Support & Inquiries</span>
                    </div>
                    <p className="text-xs text-gray-600 leading-relaxed">
                      Our customer service team is available Monday to Friday from 09:00 to 18:00 WIB. Inquiries sent via the &quot;Ask Question&quot; form are replied to within 24 hours.
                    </p>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* ============================================================ */}
      {/* DIALOG ASK QUESTION */}
      {/* ============================================================ */}
      <Dialog open={askModalOpen} onOpenChange={setAskModalOpen}>
        <DialogContent className="max-w-md p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-gray-900">
              Ask a Question
            </DialogTitle>
            <DialogDescription className="text-xs text-gray-500">
              Send a direct inquiry to {user?.full_name || "the seller"}.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSendQuestion} className="space-y-4 mt-2">
            <div>
              <label className="text-xs font-semibold text-gray-700 block mb-1">
                Your Message
              </label>
              <textarea
                rows={4}
                required
                placeholder="Hi, I have a question regarding your products..."
                value={questionText}
                onChange={(e) => setQuestionText(e.target.value)}
                className="w-full text-xs p-3 border border-gray-200 rounded-md focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 resize-none"
              />
            </div>

            <DialogFooter className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setAskModalOpen(false);
                  router.push("/messages");
                }}
                className="text-xs text-teal-600 hover:text-teal-700 hover:bg-teal-50 order-2 sm:order-1"
              >
                Buka Chat di Messages →
              </Button>
              <div className="flex items-center gap-2 order-1 sm:order-2 w-full sm:w-auto justify-end">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setAskModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={sendingQuestion}
                  className="bg-teal-600 hover:bg-teal-700 text-white font-medium disabled:opacity-60"
                >
                  {sendingQuestion ? "Mengirim..." : "Send Message"}
                </Button>
              </div>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
