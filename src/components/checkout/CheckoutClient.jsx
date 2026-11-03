"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Check,
  Edit,
  Trash2,
  Plus,
  Store,
  CreditCard,
  Download,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  X,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/components/ui/toast-context";
import { useCart } from "@/lib/cart-context";
import { formatPriceIDR } from "@/lib/utils";
import {
  placeOrderAction,
  validateCouponAction,
  getWalletBalanceAction,
  saveAddressAction,
  deleteAddressAction,
} from "@/app/checkout/actions";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

// place_order menyimpan payment_status='paid' hanya untuk wallet; metode lain tetap
// 'pending' sampai dikonfirmasi, jadi dialog sukses tidak boleh klaim "Completed (Paid)"
// untuk semua cara bayar — status ditampilkan per metode.
function paymentStatusFor(methodId) {
  const m = String(methodId || "").toLowerCase();
  if (m === "wallet") return { label: "Selesai", className: "text-emerald-600" };
  if (m === "cod") return { label: "Bayar saat Pengiriman", className: "text-sky-600" };
  if (m === "bank" || m === "bank_transfer")
    return { label: "Menunggu Konfirmasi Admin", className: "text-amber-600" };
  return { label: "Menunggu Pembayaran", className: "text-amber-600" };
}

// Brand badges
function VisaBadge() {
  return (
    <span className="inline-flex items-center justify-center px-1.5 py-0.5 rounded border border-blue-200 bg-white text-[#1A1F71] font-black italic text-[11px] tracking-wider leading-none shadow-2xs">
      VISA
    </span>
  );
}

function MastercardBadge() {
  return (
    <span className="inline-flex items-center justify-center px-1.5 py-0.5 rounded border border-gray-200 bg-white leading-none shadow-2xs">
      <span className="flex items-center -space-x-1.5">
        <span className="size-3 rounded-full bg-[#EB001B] inline-block opacity-90" />
        <span className="size-3 rounded-full bg-[#F79E1B] inline-block opacity-90" />
      </span>
    </span>
  );
}

function AmexBadge() {
  return (
    <span className="inline-flex items-center justify-center px-1.5 py-0.5 rounded bg-[#006FCF] text-white font-bold text-[9px] uppercase tracking-tight leading-none shadow-2xs">
      AMEX
    </span>
  );
}

function PaypalBadge() {
  return (
    <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded border border-blue-100 bg-[#003087]/5 text-[#003087] font-black italic text-[11px] leading-none">
      <span className="text-[#0079C1]">Pay</span>Pal
    </span>
  );
}

function StripeBadge() {
  return (
    <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-[#635BFF] text-white font-bold text-[10px] lowercase tracking-tight leading-none shadow-2xs">
      stripe
    </span>
  );
}

function MidtransBadge() {
  return (
    <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-[#002D62] text-white font-bold text-[10px] leading-none">
      midtrans
    </span>
  );
}

function DiscoverBadge() {
  return (
    <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-[#FF6000] text-white font-bold text-[9px] leading-none">
      DISCOVER
    </span>
  );
}

// Label & badge per id gateway yang dikenal payment_settings.
const GATEWAY_META = {
  stripe: {
    title: "Stripe",
    subtitle: "Bayar dengan kartu kredit atau debit.",
    badges: [<VisaBadge key="v" />, <MastercardBadge key="m" />, <AmexBadge key="a" />, <DiscoverBadge key="d" />, <StripeBadge key="s" />],
  },
  paypal: {
    title: "PayPal",
    subtitle: "Bayar menggunakan akun PayPal.",
    badges: [<VisaBadge key="v" />, <MastercardBadge key="m" />, <AmexBadge key="a" />, <PaypalBadge key="p" />],
  },
  midtrans: {
    title: "Midtrans",
    subtitle: "Bayar dengan kartu, transfer bank, atau e-wallet.",
    badges: [<VisaBadge key="v" />, <MastercardBadge key="m" />, <AmexBadge key="a" />, <MidtransBadge key="mid" />],
  },
  bank: {
    title: "Bank Transfer",
    subtitle: "Make your payment directly into our bank account.",
  },
  cod: {
    title: "Cash on Delivery",
    subtitle: "Bayar saat barang tiba di alamat pengiriman.",
  },
};

const CARD_GATEWAYS = ["stripe", "paypal", "midtrans"];

export function CheckoutClient({
  user,
  initialAddresses = [],
  paymentSettings = { activeGateway: null, options: [] },
  buyNowItem = null,
  buyNowError = "",
}) {
  const router = useRouter();
  const { toast } = useToast();
  const { items: cartItems, subtotal, clearCart } = useCart();

  // "Beli Sekarang" memakai 1 produk dari server dan mengabaikan keranjang.
  const orderItems = buyNowItem ? [buyNowItem] : cartItems;
  const orderSubtotal = buyNowItem ? buyNowItem.price * buyNowItem.quantity : subtotal;

  // Active step (1: Shipping, 2: Payment Method, 3: Payment)
  const [activeStep, setActiveStep] = useState(1);

  // Step 1: Addresses
  const [addresses, setAddresses] = useState(initialAddresses);
  const [selectedAddressId, setSelectedAddressId] = useState(
    initialAddresses.find((a) => a.isDefault)?.id || initialAddresses[0]?.id || ""
  );
  const [sameAsBilling, setSameAsBilling] = useState(true);

  // Step 1: Shipping Methods (per penjual)
  const [shippingBySeller, setShippingBySeller] = useState({});

  // Step 2: Payment Method (id dipilih dari daftar hasil payment_settings)
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [agreedTerms, setAgreedTerms] = useState(false);

  // Dialogs
  const [isAddAddressOpen, setIsAddAddressOpen] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState(null);
  const [newAddressTitle, setNewAddressTitle] = useState("");
  const [newAddressText, setNewAddressText] = useState("");
  const [paymentSuccessOpen, setPaymentSuccessOpen] = useState(false);
  const [paymentTypeChosen, setPaymentTypeChosen] = useState("PayPal");

  // Order placement
  const [placing, setPlacing] = useState(false);
  const [orderResult, setOrderResult] = useState(null);

  // Kupon
  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState("");

  // Saldo wallet untuk opsi pembayaran wallet
  const [walletBalance, setWalletBalance] = useState(0);
  const [walletLoaded, setWalletLoaded] = useState(false);

  useEffect(() => {
    getWalletBalanceAction().then((r) => {
      setWalletBalance(r?.balance || 0);
      setWalletLoaded(true);
    });
  }, []);

  // Kelompokkan item pesanan per penjual (cart atau item Buy Now)
  const sellerGroups = useMemo(() => {
    const map = new Map();
    for (const item of orderItems) {
      const key = item.seller || "Penjual";
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(item);
    }
    return Array.from(map.entries());
  }, [orderItems]);

  const shippingCost = orderItems.length > 0 ? 20000 * sellerGroups.length : 0;
  const discount = appliedCoupon?.discount || 0;
  const total = Math.max(0, orderSubtotal + shippingCost - discount);
  // Saldo belum dimuat → jangan langsung menyebut wallet kurang saldo.
  const walletShort = walletLoaded && walletBalance < total;

  const handleApplyCoupon = async () => {
    setCouponError("");
    if (!couponInput.trim()) return;
    const result = await validateCouponAction(couponInput, orderSubtotal);
    if (result.error) {
      setCouponError(result.error);
      setAppliedCoupon(null);
      return;
    }
    setAppliedCoupon({ code: result.coupon.code, discount: result.discount });
    toast.success(`Kupon ${result.coupon.code} berhasil dipakai`);
  };

  // Setelah order selesai/dibatalkan, buyNow tidak boleh tertinggal di URL:
  // kalau tidak, refresh membuat order ulang untuk produk yang sama.
  const exitBuyNow = () => {
    if (!buyNowItem) return;
    setAppliedCoupon(null);
    setCouponInput("");
    router.replace("/checkout");
  };

  const handleExecutePayment = async (type) => {
    if (placing) return;
    if (orderItems.length === 0) {
      toast.error(buyNowItem ? "Produk Beli Sekarang tidak valid" : "Keranjang kosong");
      return;
    }
    const address = addresses.find((a) => a.id === selectedAddressId);
    if (!address) {
      toast.error("Pilih atau tambahkan alamat pengiriman dulu");
      return;
    }
    // RPC place_order tetap memvalidasi saldo (sumber kebenaran = DB); guard ini
    // hanya mencegah klik yang pasti gagal + memberi pesan yang jelas.
    if (chosenPayment.id === "wallet" && walletShort) {
      toast.error(
        `Saldo wallet ${formatPriceIDR(walletBalance)} tidak cukup untuk tagihan ${formatPriceIDR(total)}`
      );
      return;
    }
    setPlacing(true);
    const result = await placeOrderAction({
      items: orderItems.map((it) => ({
        productId: it.productId || it.id,
        quantity: it.quantity,
      })),
      shippingAddress: `${address.label}: ${address.address}`,
      paymentMethod: chosenPayment.id,
      couponCode: appliedCoupon?.code || null,
      buyNow: Boolean(buyNowItem),
    });
    setPlacing(false);

    if (result.error) {
      toast.error(result.error);
      return;
    }

    setPaymentTypeChosen(type);
    setOrderResult({ ...result, total, paymentMethod: chosenPayment.id });
    setPaymentSuccessOpen(true);
    // Beli Sekarang tidak menyentuh keranjang user; pembelian dari cart seperti biasa.
    if (buyNowItem) {
      exitBuyNow();
    } else {
      clearCart();
    }
    toast.success("Pesanan berhasil dibuat!");
  };

  const handleAddNewAddress = async (e) => {
    e.preventDefault();
    if (!newAddressTitle || !newAddressText) return;
    if (!user) {
      toast.error("Login diperlukan untuk menyimpan alamat");
      return;
    }

    const result = await saveAddressAction({
      id: editingAddressId,
      label: newAddressTitle,
      address: newAddressText,
    });
    if (result?.error) {
      toast.error(result.error);
      return;
    }

    const saved = result.data;
    setAddresses((prev) =>
      editingAddressId
        ? prev.map((a) => (a.id === saved.id ? saved : a))
        : [...prev, saved]
    );
    setSelectedAddressId(saved.id);
    setNewAddressTitle("");
    setNewAddressText("");
    setEditingAddressId(null);
    setIsAddAddressOpen(false);
    toast.success("Alamat berhasil disimpan");
  };

  const handleEditAddress = (addr, e) => {
    e.stopPropagation();
    setEditingAddressId(addr.id);
    setNewAddressTitle(addr.label);
    setNewAddressText(addr.address);
    setIsAddAddressOpen(true);
  };

  const handleDeleteAddress = async (id, e) => {
    e.stopPropagation();
    if (addresses.length <= 1) return;

    const result = await deleteAddressAction(id);
    if (result?.error) {
      toast.error(result.error);
      return;
    }

    const updated = addresses.filter((a) => a.id !== id);
    setAddresses(updated);
    if (selectedAddressId === id) {
      setSelectedAddressId(updated[0].id);
    }
  };

  // Metode bayar diambil dari payment_settings, bukan daftar statis
  const paymentMethodsList = useMemo(() => {
    const gateways = paymentSettings.options
      .filter((option) => GATEWAY_META[option.id])
      .map((option) => {
        const meta = GATEWAY_META[option.id];
        const description = option.instructions || option.note || meta.subtitle;
        const modeNote = option.mode && option.mode !== "live" ? `Mode: ${option.mode}.` : "";
        return {
          id: option.id,
          title: meta.title,
          subtitle: `${description} ${modeNote}`.trim(),
          badges: meta.badges ?? null,
        };
      });

    return [
      ...gateways,
      {
        id: "wallet",
        title: `Wallet Balance (Balance: ${formatPriceIDR(walletBalance)})`,
        subtitle: walletShort
          ? `Saldo tidak cukup — tagihan ${formatPriceIDR(total)}`
          : "Pay with your wallet balance",
        disabled: walletShort,
      },
    ];
  }, [paymentSettings, walletBalance, total, walletShort]);

  // Urutan preferensi: pilihan user > gateway aktif di admin > gateway enabled pertama
  const chosenPayment =
    paymentMethodsList.find((pm) => pm.id === (selectedPayment ?? paymentSettings.activeGateway)) ??
    paymentMethodsList[0];
  const isCardGateway = CARD_GATEWAYS.includes(chosenPayment.id);
  const walletNotEnough = chosenPayment.id === "wallet" && walletShort;

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* ============================================================ */}
        {/* KIRI (col-span-2): Checkout Steps Accordion */}
        {/* ============================================================ */}
        <div className="lg:col-span-2">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Checkout</h1>

          {/* ------------------------------------------------------------ */}
          {/* STEP 1 — Shipping Information */}
          {/* ------------------------------------------------------------ */}
          <div className="rounded-lg border border-gray-200 bg-white p-6 mb-4 shadow-2xs transition-all">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-medium text-gray-900 flex items-center gap-2.5">
                <span
                  className={`inline-flex items-center justify-center size-6 rounded-full text-xs font-bold transition-all duration-300 ${
                    activeStep === 1
                      ? "bg-teal-600 text-white scale-110 shadow-sm"
                      : activeStep > 1
                      ? "bg-teal-50 text-teal-700"
                      : "bg-gray-100 text-gray-700"
                  }`}
                >
                  1
                </span>
                <span>Shipping Information</span>
                {activeStep > 1 && (
                  <span className="flex size-5 items-center justify-center rounded-full bg-teal-50 text-teal-600 text-xs animate-in fade-in duration-200">
                    <Check className="size-3.5 stroke-[2.5]" />
                  </span>
                )}
              </h2>
              {activeStep !== 1 && (
                <button
                  type="button"
                  onClick={() => setActiveStep(1)}
                  className="text-sm font-medium text-teal-600 hover:text-teal-700 hover:underline cursor-pointer transition-colors"
                >
                  Edit
                </button>
              )}
            </div>

            {/* Content saat Step 1 Terbuka */}
            <AnimatePresence mode="wait">
              {activeStep === 1 && (
                <motion.div
                  key="step-1"
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 16 }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                  className="mt-5 space-y-6"
                >
                  {/* Header Sub & Add Address */}
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-gray-800">
                      Shipping Address
                    </h3>
                    <button
                      type="button"
                      onClick={() => setIsAddAddressOpen(true)}
                      className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium text-teal-600 hover:text-teal-700 hover:underline cursor-pointer transition-all hover:scale-102"
                    >
                      <Plus className="size-3.5" />
                      <span>Add New Address</span>
                    </button>
                  </div>

                  {/* Radio Cards Alamat */}
                  <div className="space-y-3">
                    {addresses.length === 0 && (
                      <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-xs font-medium text-amber-700">
                        Belum ada alamat pengiriman. Klik &quot;Add New Address&quot; untuk
                        menambahkan alamat sebelum melanjutkan pembayaran.
                      </p>
                    )}
                    {addresses.map((addr) => {
                      const isSelected = selectedAddressId === addr.id;
                      return (
                        <div
                          key={addr.id}
                          onClick={() => setSelectedAddressId(addr.id)}
                          className={`rounded-lg p-4 transition-all duration-200 flex items-start justify-between gap-3 cursor-pointer ${
                            isSelected
                              ? "border-2 border-teal-600 bg-teal-50/20 shadow-xs"
                              : "border border-gray-200 bg-white hover:border-teal-300 hover:shadow-2xs"
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            {/* Radio Checkmark */}
                            <div
                              className={`mt-0.5 size-4.5 rounded-full flex items-center justify-center shrink-0 transition-all duration-200 ${
                                isSelected
                                  ? "border-2 border-teal-600 bg-teal-600 text-white scale-105"
                                  : "border border-gray-300 bg-white"
                              }`}
                            >
                              {isSelected && (
                                <Check className="size-3 text-white stroke-[3] animate-in fade-in zoom-in-75 duration-150" />
                              )}
                            </div>
                            <div>
                              <span className="font-bold text-sm text-gray-900 block">
                                {addr.label}
                              </span>
                              <span className="text-sm text-gray-500 mt-0.5 block leading-relaxed">
                                {addr.address}
                              </span>
                            </div>
                          </div>

                        {/* Action Edit & Delete */}
                        <div className="flex items-center gap-2 shrink-0 pt-0.5">
                          <button
                            type="button"
                            onClick={(e) => handleEditAddress(addr, e)}
                            className="p-1 text-gray-400 hover:text-gray-700 transition-colors cursor-pointer"
                            aria-label="Edit address"
                          >
                            <Edit className="size-4" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => handleDeleteAddress(addr.id, e)}
                            className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                            aria-label="Delete address"
                          >
                            <Trash2 className="size-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Checkbox Same Address for Billing */}
                <div className="flex items-center gap-2 pt-1">
                  <Checkbox
                    id="billing-same"
                    checked={sameAsBilling}
                    onCheckedChange={setSameAsBilling}
                  />
                  <label
                    htmlFor="billing-same"
                    className="text-sm text-gray-700 cursor-pointer select-none"
                  >
                    Use same address for billing address
                  </label>
                </div>

                {/* Section Shipping Method */}
                <div className="pt-2">
                  <h3 className="text-sm font-semibold text-gray-900 mb-1">
                    Shipping Method
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-500 mb-4">
                    Your products will be sent by different stores.
                  </p>

                  {/* Daftar Toko Dinamis dari Cart */}
                  {sellerGroups.map(([sellerName, sellerItems]) => {
                    const selectedMethod = shippingBySeller[sellerName] || "reguler";
                    return (
                      <div key={sellerName} className="mb-5">
                        <div className="flex items-center gap-2 mb-2.5">
                          <Store className="size-4 text-gray-700" />
                          <span className="text-sm font-semibold text-gray-900">
                            {sellerName}
                          </span>
                          <span className="text-xs text-gray-400">
                            ({sellerItems.length} produk)
                          </span>
                        </div>

                        <div className="space-y-2.5">
                          {/* Reguler */}
                          <div
                            onClick={() =>
                              setShippingBySeller((prev) => ({ ...prev, [sellerName]: "reguler" }))
                            }
                            className={`rounded-lg p-3.5 flex items-center justify-between cursor-pointer transition-all ${
                              selectedMethod === "reguler"
                                ? "border-2 border-teal-600 bg-white"
                                : "border border-gray-200 bg-white hover:border-gray-300"
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className={`size-4.5 rounded-full flex items-center justify-center shrink-0 ${
                                  selectedMethod === "reguler"
                                    ? "border-2 border-teal-600 bg-teal-600 text-white"
                                    : "border border-gray-300 bg-white"
                                }`}
                              >
                                {selectedMethod === "reguler" && (
                                  <Check className="size-3 stroke-[3]" />
                                )}
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-900 leading-none">
                                  Reguler
                                </p>
                                <p className="text-xs text-gray-400 mt-1">
                                  Pengiriman standar
                                </p>
                              </div>
                            </div>
                            <span className="text-sm font-semibold text-gray-900">
                              {formatPriceIDR(20000)}
                            </span>
                          </div>

                          {/* Ambil di Toko */}
                          <div
                            onClick={() =>
                              setShippingBySeller((prev) => ({ ...prev, [sellerName]: "pickup" }))
                            }
                            className={`rounded-lg p-3.5 flex items-center justify-between cursor-pointer transition-all ${
                              selectedMethod === "pickup"
                                ? "border-2 border-teal-600 bg-white"
                                : "border border-gray-200 bg-white hover:border-gray-300"
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className={`size-4.5 rounded-full flex items-center justify-center shrink-0 ${
                                  selectedMethod === "pickup"
                                    ? "border-2 border-teal-600 bg-teal-600 text-white"
                                    : "border border-gray-300 bg-white"
                                }`}
                              >
                                {selectedMethod === "pickup" && (
                                  <Check className="size-3 stroke-[3]" />
                                )}
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-900 leading-none">
                                  Ambil di Toko
                                </p>
                                <p className="text-xs text-gray-400 mt-1">
                                  Ambil pesanan langsung di toko
                                </p>
                              </div>
                            </div>
                            <span className="text-sm font-semibold text-gray-900">
                              {formatPriceIDR(0)}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Bottom Bar: Return to cart & Continue */}
                <div className="pt-6 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <Link
                    href={buyNowItem ? "/checkout" : "/cart"}
                    className="text-sm text-gray-600 hover:text-teal-600 transition-colors inline-flex items-center gap-1 self-start sm:self-auto"
                  >
                    <span>{buyNowItem ? "< Kembali ke keranjang" : "< Return to cart"}</span>
                  </Link>

                  <Button
                    type="button"
                    onClick={() => setActiveStep(2)}
                    className="w-full sm:w-auto bg-teal-600 hover:bg-teal-700 text-white font-medium px-6 py-2.5 rounded-md shadow-xs cursor-pointer flex items-center justify-center gap-1.5 transition-all duration-200 hover:scale-105 hover:shadow-lg active:scale-95"
                  >
                    <span>Continue to Payment Method</span>
                    <ChevronRight className="size-4" />
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ------------------------------------------------------------ */}
        {/* STEP 2 — Payment Method */}
        {/* ------------------------------------------------------------ */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 mb-4 shadow-2xs transition-all">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium text-gray-900 flex items-center gap-2.5">
              <span
                className={`inline-flex items-center justify-center size-6 rounded-full text-xs font-bold transition-all duration-300 ${
                  activeStep === 2
                    ? "bg-teal-600 text-white scale-110 shadow-sm"
                    : activeStep > 2
                    ? "bg-teal-50 text-teal-700"
                    : "bg-gray-100 text-gray-700"
                }`}
              >
                2
              </span>
              <span>Payment Method</span>
              {activeStep > 2 && (
                <span className="flex size-5 items-center justify-center rounded-full bg-teal-50 text-teal-600 text-xs animate-in fade-in duration-200">
                  <Check className="size-3.5 stroke-[2.5]" />
                </span>
              )}
            </h2>
            {activeStep > 2 && (
              <button
                type="button"
                onClick={() => setActiveStep(2)}
                className="text-sm font-medium text-teal-600 hover:text-teal-700 hover:underline cursor-pointer transition-colors"
              >
                Edit
              </button>
            )}
          </div>

          {/* Content saat Step 2 Terbuka */}
          <AnimatePresence mode="wait">
            {activeStep === 2 && (
              <motion.div
                key="step-2"
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 16 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                className="mt-5 space-y-4"
              >
                {/* Radio List Payment Method Cards (dari payment_settings) */}
                <div className="space-y-2.5">
                  {paymentMethodsList.map((pm) => {
                    const isSelected = chosenPayment.id === pm.id;
                    const isDisabled = Boolean(pm.disabled);
                    return (
                      <div
                        key={pm.id}
                        onClick={() => {
                          if (isDisabled) {
                            toast.error(
                              `Saldo wallet ${formatPriceIDR(walletBalance)} tidak cukup untuk tagihan ${formatPriceIDR(total)}`
                            );
                            return;
                          }
                          setSelectedPayment(pm.id);
                        }}
                        className={`rounded-lg p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all duration-200 ${
                          isDisabled
                            ? "border border-red-200 bg-red-50/40 opacity-90 cursor-not-allowed"
                            : isSelected
                            ? "border-2 border-teal-600 bg-teal-50/20 shadow-xs cursor-pointer"
                            : "border border-gray-200 bg-white hover:border-teal-300 hover:shadow-2xs cursor-pointer"
                        }`}
                      >
                        <div className="flex items-start sm:items-center gap-3">
                          <div
                            className={`size-4.5 rounded-full flex items-center justify-center shrink-0 mt-0.5 sm:mt-0 transition-all duration-200 ${
                              isDisabled
                                ? "border border-red-300 bg-white"
                                : isSelected
                                ? "border-2 border-teal-600 bg-teal-600 text-white"
                                : "border border-gray-300 bg-white"
                            }`}
                          >
                            {isSelected && (
                              <Check className="size-3 stroke-[3] animate-in zoom-in-75 duration-150" />
                            )}
                          </div>
                          <div>
                            <span className="text-sm font-medium text-gray-900 block leading-tight">
                              {pm.title}
                            </span>
                            {pm.subtitle && (
                              <span
                                className={`text-xs mt-0.5 block ${
                                  isDisabled ? "text-red-600 font-medium" : "text-gray-500"
                                }`}
                              >
                                {pm.subtitle}
                              </span>
                            )}
                          </div>
                        </div>

                        {pm.badges && (
                          <div className="flex flex-wrap items-center gap-1.5 pl-7 sm:pl-0">
                            {pm.badges}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Terms & Conditions Checkbox */}
                <div className="flex items-center gap-2 pt-3">
                  <Checkbox
                    id="terms"
                    checked={agreedTerms}
                    onCheckedChange={setAgreedTerms}
                  />
                  <label
                    htmlFor="terms"
                    className="text-xs sm:text-sm text-gray-700 cursor-pointer select-none"
                  >
                    I have read and agree to the{" "}
                    <span className="text-teal-600 underline font-medium">
                      Terms & Conditions
                    </span>
                  </label>
                </div>

                {/* Bottom Bar: Return to cart & Continue */}
                <div className="pt-6 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <Link
                    href={buyNowItem ? "/checkout" : "/cart"}
                    className="text-sm text-gray-600 hover:text-teal-600 transition-colors inline-flex items-center gap-1 self-start sm:self-auto"
                  >
                    <span>{buyNowItem ? "< Kembali ke keranjang" : "< Return to cart"}</span>
                  </Link>

                  <Button
                    type="button"
                    onClick={() => {
                      if (!agreedTerms) {
                        setAgreedTerms(true);
                      }
                      setActiveStep(3);
                    }}
                    className="w-full sm:w-auto bg-teal-600 hover:bg-teal-700 text-white font-medium px-6 py-2.5 rounded-md shadow-xs cursor-pointer flex items-center justify-center gap-1.5 transition-all duration-200 hover:scale-105 hover:shadow-lg active:scale-95"
                  >
                    <span>Continue to Payment</span>
                    <ChevronRight className="size-4" />
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ------------------------------------------------------------ */}
        {/* STEP 3 — Payment */}
        {/* ------------------------------------------------------------ */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-2xs transition-all">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium text-gray-900 flex items-center gap-2.5">
              <span
                className={`inline-flex items-center justify-center size-6 rounded-full text-xs font-bold transition-all duration-300 ${
                  activeStep === 3
                    ? "bg-teal-600 text-white scale-110 shadow-sm"
                    : "bg-gray-100 text-gray-700"
                }`}
              >
                3
              </span>
              <span>Payment</span>
            </h2>
          </div>

          {/* Content saat Step 3 Terbuka */}
          <AnimatePresence mode="wait">
            {activeStep === 3 && (
              <motion.div
                key="step-3"
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 16 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                className="mt-8 mb-4 max-w-md mx-auto"
              >
                <h3 className="text-center font-medium text-gray-900 text-lg mb-6">
                  Confirm and Pay
                </h3>

                <div className="space-y-3">
                  {isCardGateway ? (
                    <>
                      {/* Tombol besar gateway (label mengikuti gateway aktif) */}
                      <button
                        type="button"
                        onClick={() => handleExecutePayment(chosenPayment.title)}
                        disabled={placing}
                        className={`w-full font-bold text-lg py-3 px-4 rounded-md shadow-xs transition-all duration-200 hover:scale-105 hover:shadow-lg active:scale-95 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:pointer-events-none ${
                          chosenPayment.id === "paypal"
                            ? "bg-[#FFC439] hover:bg-[#F2BA36] text-[#003087]"
                            : "bg-teal-600 hover:bg-teal-700 text-white"
                        }`}
                      >
                        {chosenPayment.id === "paypal" ? (
                          <span className="font-black italic text-xl tracking-tight">
                            <span className="text-[#0079C1]">Pay</span>Pal
                          </span>
                        ) : (
                          <span>
                            {placing
                              ? "Memproses..."
                              : `Bayar ${formatPriceIDR(total)} dengan ${chosenPayment.title}`}
                          </span>
                        )}
                      </button>

                      {/* Debit or Credit Card Button */}
                      <button
                        type="button"
                        onClick={() => handleExecutePayment("Debit or Credit Card")}
                        disabled={placing}
                        className="w-full bg-[#2C2E2F] hover:bg-black text-white font-medium text-base py-3 px-4 rounded-md shadow-xs transition-all duration-200 hover:scale-105 hover:shadow-lg active:scale-95 flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-60 disabled:pointer-events-none"
                      >
                        <CreditCard className="size-5" />
                        <span>{placing ? "Memproses..." : "Debit or Credit Card"}</span>
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={() =>
                        handleExecutePayment(
                          chosenPayment.id === "wallet" ? "Wallet Balance" : chosenPayment.title
                        )
                      }
                      disabled={placing || walletNotEnough}
                      className="w-full bg-teal-600 hover:bg-teal-700 text-white font-medium text-base py-3 px-4 rounded-md shadow-xs transition-all duration-200 hover:scale-105 hover:shadow-lg active:scale-95 flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-60 disabled:pointer-events-none"
                    >
                      <span>
                        {walletNotEnough
                          ? "Saldo Wallet Tidak Cukup"
                          : placing
                          ? "Memproses..."
                          : `Bayar ${formatPriceIDR(total)} dengan ${
                              chosenPayment.id === "wallet" ? "Wallet" : chosenPayment.title
                            }`}
                      </span>
                    </button>
                  )}
                </div>

                {walletNotEnough && (
                  <p className="mt-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-center text-xs font-medium text-red-600">
                    Saldo wallet {formatPriceIDR(walletBalance)}, tagihan {formatPriceIDR(total)}.
                    Top up saldo dulu atau pilih metode pembayaran lain.
                  </p>
                )}

                {isCardGateway ? (
                  <p className="text-center text-xs text-gray-400 mt-4 flex items-center justify-center gap-1">
                    <span>Powered by</span>
                    <span className="font-bold italic text-gray-500">{chosenPayment.title}</span>
                  </p>
                ) : null}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        </div>

        {/* ============================================================ */}
        {/* KANAN (col-span-1) — ORDER SUMMARY (STICKY) */}
        {/* ============================================================ */}
        <div className="lg:col-span-1">
          <Card className="rounded-lg border border-gray-200 bg-white p-5 sticky top-24 shadow-2xs">
            <h3 className="text-base font-semibold text-gray-900 mb-4 pb-1">
              Order Summary ({orderItems.length})
            </h3>

            {buyNowItem && (
              <div className="mb-4 rounded-lg border border-teal-200 bg-teal-50/70 px-3.5 py-3">
                <p className="text-xs font-semibold text-teal-800">
                  Beli Sekarang — keranjang diabaikan
                </p>
                <p className="text-[11px] text-teal-700 mt-1 leading-relaxed">
                  Pesanan hanya berisi produk di bawah. Isi keranjangmu tetap utuh
                  dan bisa dibeli lain kali.
                </p>
                <button
                  type="button"
                  onClick={exitBuyNow}
                  className="mt-2 text-[11px] font-semibold text-teal-700 underline hover:text-teal-800 cursor-pointer"
                >
                  Batalkan, kembali ke checkout keranjang
                </button>
              </div>
            )}

            {orderItems.length === 0 ? (
              buyNowError ? (
                <p className="text-sm text-red-600 py-6 text-center leading-relaxed">
                  {buyNowError}
                </p>
              ) : (
                <p className="text-sm text-gray-400 py-6 text-center">
                  Keranjang kosong.{" "}
                  <Link href="/products" className="text-teal-600 hover:underline">
                    Belanja dulu
                  </Link>
                </p>
              )
            ) : (
            <>
            {/* List Item Cart */}
            <div className="space-y-4 max-h-[460px] overflow-y-auto pr-1">
              {orderItems.map((item) => (
                <div key={item.id} className="flex gap-3 items-start">
                  {/* Thumbnail 60x60 */}
                  <div className="size-15 rounded-md overflow-hidden bg-gray-100 border border-gray-100 shrink-0">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="size-full object-cover"
                    />
                  </div>

                  {/* Info Item */}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm text-gray-900 leading-snug line-clamp-2">
                      {item.title}
                    </h4>

                    {item.isDigital && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-teal-600 bg-teal-50 px-2 py-0.5 rounded-full mt-1">
                        <Download className="size-3" />
                        <span>Instant download</span>
                      </span>
                    )}

                    <p className="text-xs text-teal-600 mt-0.5">
                      Seller: {item.seller}
                    </p>

                    <div className="flex items-baseline justify-between mt-1 text-xs">
                      <span className="text-gray-500">Quantity: {item.quantity}</span>
                      <span className="font-semibold text-gray-900 text-sm">
                        {formatPriceIDR(item.price * item.quantity)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <Separator className="my-4" />

            {/* Form Kupon */}
            <div className="mb-4">
              {appliedCoupon ? (
                <div className="flex items-center justify-between rounded-lg border border-teal-200 bg-teal-50 px-3 py-2">
                  <span className="text-xs font-semibold text-teal-700">
                    Kupon {appliedCoupon.code} aktif
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setAppliedCoupon(null);
                      setCouponInput("");
                    }}
                    className="text-gray-400 hover:text-red-500 cursor-pointer"
                    aria-label="Hapus kupon"
                  >
                    <X className="size-3.5" />
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Kode kupon"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleApplyCoupon();
                        }
                      }}
                      className="h-9 text-sm"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleApplyCoupon}
                      disabled={!couponInput.trim()}
                      className="h-9 px-3 text-sm shrink-0 cursor-pointer"
                    >
                      Pakai
                    </Button>
                  </div>
                  {couponError && (
                    <p className="text-xs text-red-500 mt-1.5">{couponError}</p>
                  )}
                </>
              )}
            </div>

            {/* Ringkasan Biaya */}
            <div className="space-y-2.5 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span className="font-medium text-gray-900">
                  {formatPriceIDR(orderSubtotal)}
                </span>
              </div>

              <div className="flex justify-between text-gray-600">
                <span>Ongkos Kirim</span>
                <span className="font-medium text-gray-900">{formatPriceIDR(shippingCost)}</span>
              </div>

              {discount > 0 && (
                <div className="flex justify-between text-teal-600">
                  <span>Diskon ({appliedCoupon?.code})</span>
                  <span className="font-medium">-{formatPriceIDR(discount)}</span>
                </div>
              )}
            </div>

            <div className="my-4 border-t-2 border-gray-200" />

            {/* Total Row */}
            <div className="flex justify-between items-baseline">
              <span className="text-base font-bold text-gray-900">Total</span>
              <span className="text-xl font-bold text-gray-950">
                {formatPriceIDR(total)}
              </span>
            </div>
            </>
            )}
          </Card>
        </div>
      </div>

      {/* ============================================================ */}
      {/* DIALOG ADD NEW ADDRESS */}
      {/* ============================================================ */}
      <Dialog open={isAddAddressOpen} onOpenChange={setIsAddAddressOpen}>
        <DialogContent className="max-w-md p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-gray-900">
              Add New Address
            </DialogTitle>
            <DialogDescription className="text-sm text-gray-500">
              Enter the delivery details for your order.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleAddNewAddress} className="space-y-4 mt-2">
            <div>
              <Label htmlFor="address-title" className="text-xs font-semibold">
                Address Title (e.g. Home, Office, Apartemen)
              </Label>
              <Input
                id="address-title"
                required
                placeholder="Home"
                value={newAddressTitle}
                onChange={(e) => setNewAddressTitle(e.target.value)}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="address-text" className="text-xs font-semibold">
                Full Address
              </Label>
              <Input
                id="address-text"
                required
                placeholder="123 Ocean Drive, Miami, Florida, United States"
                value={newAddressText}
                onChange={(e) => setNewAddressText(e.target.value)}
                className="mt-1"
              />
            </div>

            <DialogFooter className="mt-4 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAddAddressOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-teal-600 hover:bg-teal-700 text-white font-medium"
              >
                Save Address
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ============================================================ */}
      {/* DIALOG PAYMENT SUCCESSFUL */}
      {/* ============================================================ */}
      <Dialog open={paymentSuccessOpen} onOpenChange={setPaymentSuccessOpen}>
        <DialogContent className="max-w-md p-6 text-center">
          <div className="flex flex-col items-center">
            <div className="size-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
              <CheckCircle2 className="size-10" />
            </div>

            <DialogTitle className="text-xl font-bold text-gray-900">
              Payment Confirmed!
            </DialogTitle>

            <DialogDescription className="text-sm text-gray-500 mt-2 max-w-sm text-center">
              Your order <strong className="text-gray-800">{orderResult?.orderNumber || "#—"}</strong> has
              been processed successfully using {paymentTypeChosen}. A confirmation
              receipt has been sent to your email.
            </DialogDescription>

            <div className="w-full bg-gray-50 rounded-lg p-3.5 mt-5 text-left text-xs space-y-1.5 border border-gray-100">
              <div className="flex justify-between">
                <span className="text-gray-500">Total Amount:</span>
                <span className="font-bold text-gray-900">{formatPriceIDR(orderResult?.total || 0)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Payment Status:</span>
                <span className={`font-semibold ${paymentStatusFor(orderResult?.paymentMethod).className}`}>
                  {paymentStatusFor(orderResult?.paymentMethod).label}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Shipping To:</span>
                <span className="text-gray-700">
                  {addresses.find((a) => a.id === selectedAddressId)?.label ||
                    "Home"}
                </span>
              </div>
            </div>

            <div className="w-full grid grid-cols-2 gap-3 mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/checkout/success")}
                className="w-full"
              >
                Order Details
              </Button>
              <Button
                type="button"
                onClick={() => router.push("/orders")}
                className="w-full bg-teal-600 hover:bg-teal-700 text-white font-medium"
              >
                View Orders
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
