"use client";

import { useState } from "react";
import Link from "next/link";
import {
  User,
  MapPin,
  Truck,
  Share2,
  Lock,
  Camera,
  CheckCircle2,
  Upload,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  updateProfileAction,
  changePasswordAction,
  saveShippingAddressAction,
} from "@/app/settings/edit-profile/actions";

export function EditProfileClient({ initialProfile, initialAddresses = [] }) {
  const p = initialProfile || {};
  const [fullName, setFullName] = useState(p.fullName || "");
  const [username, setUsername] = useState(p.username || "");
  const [email, setEmail] = useState(p.email || "");
  const [phone, setPhone] = useState(p.phone || "");
  const [country, setCountry] = useState(p.country || "Indonesia");
  const [city, setCity] = useState(p.city || "");
  const [address, setAddress] = useState(p.address || "");
  const [bio, setBio] = useState(p.bio || "");
  const [website, setWebsite] = useState(p.website || "");
  const [savingWebsite, setSavingWebsite] = useState(false);
  // Fallback harus per user (bukan hardcode "admin") supaya gambar sementara
  // yang tampil di Edit Profile sama dengan di halaman Profile & Navbar.
  const seed = p.username || "modesy";
  const [avatarUrl, setAvatarUrl] = useState(
    p.avatarUrl || `https://picsum.photos/seed/avatar-${seed}/200/200`
  );
  const [coverUrl, setCoverUrl] = useState(
    p.coverUrl || `https://picsum.photos/seed/banner-${seed}/1600/500`
  );

  const [avatarFile, setAvatarFile] = useState(null);
  const [coverFile, setCoverFile] = useState(null);
  const [saving, setSaving] = useState(false);

  const [activeTab, setActiveTab] = useState("edit-profile");
  const [toastMessage, setToastMessage] = useState("");

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3000);
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      triggerToast("File harus berupa gambar (PNG/JPG/WebP)");
      e.target.value = "";
      return;
    }
    setAvatarFile(file);
    setAvatarUrl(URL.createObjectURL(file));
  };

  const handleCoverChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      triggerToast("File harus berupa gambar (PNG/JPG/WebP)");
      e.target.value = "";
      return;
    }
    setCoverFile(file);
    setCoverUrl(URL.createObjectURL(file));
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!initialProfile) {
      triggerToast("Login diperlukan untuk menyimpan profil");
      return;
    }
    setSaving(true);
    const result = await updateProfileAction({
      fullName,
      username,
      phone,
      bio,
      avatarFile,
      coverFile,
    });
    setSaving(false);
    if (result.error) {
      triggerToast(result.error);
      return;
    }
    setAvatarFile(null);
    setCoverFile(null);
    // Ganti preview blob: dengan URL asli yang sudah tersimpan di Supabase,
    // supaya preview tidak hilang saat halaman dimuat ulang.
    if (result.avatarUrl) setAvatarUrl(result.avatarUrl);
    if (result.coverUrl) setCoverUrl(result.coverUrl);
    triggerToast("Profil berhasil diperbarui!");
  };

  const handleSaveLocation = async (e) => {
    e.preventDefault();
    if (!initialProfile) {
      triggerToast("Login diperlukan untuk menyimpan profil");
      return;
    }
    setSaving(true);
    const result = await updateProfileAction({ country, city, address });
    setSaving(false);
    if (result.error) {
      triggerToast(result.error);
      return;
    }
    triggerToast("Lokasi berhasil diperbarui!");
  };

  const [addresses, setAddresses] = useState(initialAddresses);
  const [addrLabel, setAddrLabel] = useState("Home");
  const [addrText, setAddrText] = useState("");
  const [addrDefault, setAddrDefault] = useState(true);
  const [editingAddrId, setEditingAddrId] = useState(null);
  const [savingAddress, setSavingAddress] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);

  const startEditAddress = (row) => {
    setEditingAddrId(row.id);
    setAddrLabel(row.label || "Home");
    setAddrText(row.address || "");
    setAddrDefault(Boolean(row.isDefault));
  };

  const resetAddressForm = () => {
    setEditingAddrId(null);
    setAddrLabel("Home");
    setAddrText("");
    setAddrDefault(false);
  };

  const handleSaveAddress = async (e) => {
    e.preventDefault();
    if (!initialProfile) {
      triggerToast("Login diperlukan untuk menyimpan alamat");
      return;
    }
    setSavingAddress(true);
    const result = await saveShippingAddressAction({
      id: editingAddrId,
      label: addrLabel,
      address: addrText,
      isDefault: addrDefault,
    });
    setSavingAddress(false);
    if (result?.error) {
      triggerToast(result.error);
      return;
    }
    const saved = result.address;
    setAddresses((prev) => {
      const rest = prev.map((row) =>
        saved && row.isDefault && row.id !== saved.id ? { ...row, isDefault: false } : row
      );
      if (!saved) return rest;
      const exists = rest.some((row) => row.id === saved.id);
      return exists ? rest.map((row) => (row.id === saved.id ? saved : row)) : [saved, ...rest];
    });
    resetAddressForm();
    triggerToast(editingAddrId ? "Alamat berhasil diperbarui!" : "Alamat berhasil disimpan!");
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!initialProfile) {
      triggerToast("Login diperlukan untuk mengubah password");
      return;
    }
    setSavingPassword(true);
    const result = await changePasswordAction({ currentPassword, newPassword, confirmPassword });
    setSavingPassword(false);
    if (result?.error) {
      triggerToast(result.error);
      return;
    }
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    triggerToast("Password berhasil diperbarui!");
  };

  return (
    <>
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2 bg-emerald-600 text-white px-4 py-3 rounded-lg shadow-xl text-xs font-semibold animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="size-4 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      <main className="flex-1 py-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb / Title */}
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Profile Settings
              </h1>
              <p className="text-xs text-gray-500 mt-1">
                Manage your public profile and account details
              </p>
            </div>
            <Link
              href={`/profile/${username}`}
              className="text-xs text-teal-600 hover:text-teal-700 font-semibold self-start sm:self-auto"
            >
              View Public Profile →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
            {/* Sidebar Menu Settings (col 3) */}
            <div className="md:col-span-4 lg:col-span-3 space-y-1 bg-white p-2 border border-gray-200 rounded-lg shadow-xs">
              <button
                type="button"
                onClick={() => setActiveTab("edit-profile")}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-md text-xs font-medium transition-colors text-left cursor-pointer ${
                  activeTab === "edit-profile"
                    ? "bg-teal-50 text-teal-700 font-semibold border-l-4 border-teal-600"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                <User className="size-4" />
                <span>Edit Profile</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("location")}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-md text-xs font-medium transition-colors text-left cursor-pointer ${
                  activeTab === "location"
                    ? "bg-teal-50 text-teal-700 font-semibold border-l-4 border-teal-600"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                <MapPin className="size-4" />
                <span>Location</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("shipping-address")}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-md text-xs font-medium transition-colors text-left cursor-pointer ${
                  activeTab === "shipping-address"
                    ? "bg-teal-50 text-teal-700 font-semibold border-l-4 border-teal-600"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                <Truck className="size-4" />
                <span>Shipping Address</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("social-media")}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-md text-xs font-medium transition-colors text-left cursor-pointer ${
                  activeTab === "social-media"
                    ? "bg-teal-50 text-teal-700 font-semibold border-l-4 border-teal-600"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                <Share2 className="size-4" />
                <span>Social Media</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("change-password")}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-md text-xs font-medium transition-colors text-left cursor-pointer ${
                  activeTab === "change-password"
                    ? "bg-teal-50 text-teal-700 font-semibold border-l-4 border-teal-600"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                <Lock className="size-4" />
                <span>Change Password</span>
              </button>
            </div>

            {/* Main Form Content (col 9) */}
            <div className="md:col-span-8 lg:col-span-9">
              <Card className="border border-gray-200 bg-white shadow-xs">
                <CardHeader className="pb-4 border-b border-gray-100">
                  <CardTitle className="text-base font-bold text-gray-900">
                    {activeTab === "edit-profile" && "Edit Profile"}
                    {activeTab === "location" && "Location"}
                    {activeTab === "shipping-address" && "Shipping Address"}
                    {activeTab === "social-media" && "Social Media Accounts"}
                    {activeTab === "change-password" && "Change Password"}
                  </CardTitle>
                </CardHeader>

                <CardContent className="pt-6">
                  {activeTab === "edit-profile" && (
                    <form onSubmit={handleSaveProfile} className="space-y-6">
                      {/* Avatar & Cover Upload Box */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pb-6 border-b border-gray-100">
                        {/* Avatar */}
                        <div>
                          <Label className="text-xs font-semibold text-gray-700 block mb-2">
                            Avatar Image
                          </Label>
                          <div className="flex items-center gap-4">
                            <div className="relative group size-20 rounded-xl overflow-hidden border-2 border-gray-200 bg-gray-50 shrink-0">
                              <img
                                src={avatarUrl}
                                alt="Avatar preview"
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <label className="border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 text-xs font-semibold px-3 py-2 rounded-md shadow-2xs cursor-pointer inline-flex items-center gap-1.5 transition-colors">
                              <Camera className="size-3.5 text-gray-500" />
                              <span>Select Image</span>
                              <input
                                type="file"
                                accept="image/*"
                                onChange={handleAvatarChange}
                                className="hidden"
                              />
                            </label>
                          </div>
                        </div>

                        {/* Cover Image */}
                        <div>
                          <Label className="text-xs font-semibold text-gray-700 block mb-2">
                            Cover Banner
                          </Label>
                          <div className="flex items-center gap-4">
                            <div className="relative group w-32 h-20 rounded-xl overflow-hidden border-2 border-gray-200 bg-gray-50 shrink-0">
                              <img
                                src={coverUrl}
                                alt="Cover preview"
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <label className="border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 text-xs font-semibold px-3 py-2 rounded-md shadow-2xs cursor-pointer inline-flex items-center gap-1.5 transition-colors">
                              <Upload className="size-3.5 text-gray-500" />
                              <span>Select Banner</span>
                              <input
                                type="file"
                                accept="image/*"
                                onChange={handleCoverChange}
                                className="hidden"
                              />
                            </label>
                          </div>
                        </div>
                      </div>

                      {/* Basic Fields */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <Label className="text-xs font-semibold text-gray-700 block mb-1.5">
                            Full Name
                          </Label>
                          <Input
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            required
                          />
                        </div>

                        <div>
                          <Label className="text-xs font-semibold text-gray-700 block mb-1.5">
                            Username
                          </Label>
                          <Input
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                          />
                        </div>

                        <div>
                          <Label className="text-xs font-semibold text-gray-700 block mb-1.5">
                            Email
                          </Label>
                          <Input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                          />
                        </div>

                        <div>
                          <Label className="text-xs font-semibold text-gray-700 block mb-1.5">
                            Phone Number
                          </Label>
                          <Input
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                          />
                        </div>
                      </div>

                      {/* About / Bio */}
                      <div>
                        <Label className="text-xs font-semibold text-gray-700 block mb-1.5">
                          About Me / Bio
                        </Label>
                        <Textarea
                          rows={4}
                          value={bio}
                          onChange={(e) => setBio(e.target.value)}
                          className="resize-none leading-relaxed text-sm"
                        />
                      </div>

                      <div className="flex justify-end pt-2">
                        <Button
                          type="submit"
                          disabled={saving}
                          className="bg-[#14B8A6] hover:bg-[#0D9488] text-white px-6 text-xs font-semibold disabled:opacity-60"
                        >
                          {saving ? "Saving..." : "Save Changes"}
                        </Button>
                      </div>
                    </form>
                  )}

                  {activeTab === "location" && (
                    <form onSubmit={handleSaveLocation} className="space-y-4">
                      <div>
                        <Label className="text-xs font-semibold text-gray-700 block mb-1.5">
                          Country
                        </Label>
                        <Input
                          value={country}
                          onChange={(e) => setCountry(e.target.value)}
                        />
                      </div>
                      <div>
                        <Label className="text-xs font-semibold text-gray-700 block mb-1.5">
                          City
                        </Label>
                        <Input
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                        />
                      </div>
                      <div>
                        <Label className="text-xs font-semibold text-gray-700 block mb-1.5">
                          Address
                        </Label>
                        <Input
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                        />
                      </div>
                      <div className="flex justify-end pt-2">
                        <Button
                          type="submit"
                          className="bg-[#14B8A6] hover:bg-[#0D9488] text-white px-6 text-xs font-semibold"
                        >
                          Save Changes
                        </Button>
                      </div>
                    </form>
                  )}

                  {activeTab === "shipping-address" && (
                    <div className="space-y-5">
                      {addresses.length > 0 ? (
                        <ul className="space-y-2">
                          {addresses.map((row) => (
                            <li
                              key={row.id}
                              className="flex items-start justify-between gap-3 rounded-lg border border-gray-200 bg-white p-3.5"
                            >
                              <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-semibold text-gray-900">
                                    {row.label}
                                  </span>
                                  {row.isDefault && (
                                    <span className="text-[10px] font-bold uppercase tracking-wide text-teal-700 bg-teal-50 border border-teal-200 rounded px-1.5 py-0.5">
                                      Default
                                    </span>
                                  )}
                                </div>
                                <p className="text-xs text-gray-600 mt-1 break-words">
                                  {row.address}
                                </p>
                              </div>
                              <button
                                type="button"
                                onClick={() => startEditAddress(row)}
                                className="text-xs font-semibold text-teal-600 hover:text-teal-700 shrink-0 cursor-pointer"
                              >
                                Edit
                              </button>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-xs text-gray-500">
                          Belum ada alamat tersimpan. Alamat yang disimpan di sini dipakai ulang saat
                          checkout.
                        </p>
                      )}

                      <form onSubmit={handleSaveAddress} className="space-y-4">
                        <div>
                          <Label className="text-xs font-semibold text-gray-700 block mb-1.5">
                            Label Alamat
                          </Label>
                          <Input
                            value={addrLabel}
                            onChange={(e) => setAddrLabel(e.target.value)}
                            placeholder="Home / Office"
                          />
                        </div>
                        <div>
                          <Label className="text-xs font-semibold text-gray-700 block mb-1.5">
                            Delivery Address
                          </Label>
                          <Textarea
                            rows={3}
                            value={addrText}
                            onChange={(e) => setAddrText(e.target.value)}
                            placeholder="Enter complete shipping destination address..."
                          />
                        </div>
                        <label className="flex items-center gap-2 text-xs text-gray-700 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={addrDefault}
                            onChange={(e) => setAddrDefault(e.target.checked)}
                            className="size-3.5 accent-teal-600"
                          />
                          <span>Jadikan alamat default untuk checkout</span>
                        </label>
                        <div className="flex items-center justify-end gap-2 pt-2">
                          {editingAddrId && (
                            <Button
                              type="button"
                              variant="outline"
                              onClick={resetAddressForm}
                              className="text-xs"
                            >
                              Batal
                            </Button>
                          )}
                          <Button
                            type="submit"
                            disabled={savingAddress}
                            className="bg-[#14B8A6] hover:bg-[#0D9488] text-white px-6 text-xs font-semibold disabled:opacity-60"
                          >
                            {savingAddress
                              ? "Menyimpan..."
                              : editingAddrId
                                ? "Update Address"
                                : "Save Address"}
                          </Button>
                        </div>
                      </form>
                    </div>
                  )}

                  {activeTab === "social-media" && (
                    <div className="space-y-4">
                      <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-xs text-amber-900 leading-relaxed">
                        Tabel <code>profiles</code> belum punya kolom untuk menyimpan tautan media
                        sosial per pengguna (hanya ada <code>website</code> satu baris), jadi form ini
                        sengaja belum bisa menyimpan. Setelah kolom <code>social_links jsonb</code>{" "}
                        ditambahkan lewat SQL Editor Supabase, tab ini bisa langsung ditautkan.
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <Label className="text-xs font-semibold text-gray-700 block mb-1">
                            Website Pribadi (tersimpan)
                          </Label>
                          <Input
                            defaultValue={p.website || ""}
                            onChange={(e) => setWebsite(e.target.value)}
                            placeholder="https://"
                          />
                        </div>
                        <div>
                          <Label className="text-xs font-semibold text-gray-700 block mb-1">
                            Facebook URL (belum tersimpan)
                          </Label>
                          <Input placeholder="https://facebook.com/..." />
                        </div>
                        <div>
                          <Label className="text-xs font-semibold text-gray-700 block mb-1">
                            Instagram URL (belum tersimpan)
                          </Label>
                          <Input placeholder="https://instagram.com/..." />
                        </div>
                        <div>
                          <Label className="text-xs font-semibold text-gray-700 block mb-1">
                            WhatsApp (belum tersimpan)
                          </Label>
                          <Input placeholder="+62..." />
                        </div>
                      </div>
                      <div className="flex justify-end pt-1">
                        <Button
                          type="button"
                          disabled={savingWebsite}
                          onClick={async () => {
                            if (!initialProfile) {
                              triggerToast("Login diperlukan");
                              return;
                            }
                            setSavingWebsite(true);
                            const result = await updateProfileAction({ website });
                            setSavingWebsite(false);
                            if (result?.error) {
                              triggerToast(result.error);
                              return;
                            }
                            triggerToast("Website tersimpan di profil!");
                          }}
                          className="bg-[#14B8A6] hover:bg-[#0D9488] text-white px-6 text-xs font-semibold disabled:opacity-60"
                        >
                          {savingWebsite ? "Menyimpan..." : "Save Website"}
                        </Button>
                      </div>
                    </div>
                  )}

                  {activeTab === "change-password" && (
                    <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
                      <div>
                        <Label className="text-xs font-semibold text-gray-700 block mb-1.5">
                          Current Password
                        </Label>
                        <Input
                          type="password"
                          required
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                        />
                      </div>
                      <div>
                        <Label className="text-xs font-semibold text-gray-700 block mb-1.5">
                          New Password
                        </Label>
                        <Input
                          type="password"
                          required
                          minLength={6}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                        />
                        <p className="text-[11px] text-gray-500 mt-1">Minimal 6 karakter.</p>
                      </div>
                      <div>
                        <Label className="text-xs font-semibold text-gray-700 block mb-1.5">
                          Confirm New Password
                        </Label>
                        <Input
                          type="password"
                          required
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                      </div>
                      <div className="pt-2">
                        <Button
                          type="submit"
                          disabled={savingPassword}
                          className="bg-[#14B8A6] hover:bg-[#0D9488] text-white px-6 text-xs font-semibold disabled:opacity-60"
                        >
                          {savingPassword ? "Memproses..." : "Update Password"}
                        </Button>
                      </div>
                      <p className="text-[11px] text-gray-500 leading-relaxed">
                        Password diverifikasi lebih dulu ke Supabase Auth, lalu disimpan dengan
                        <code> auth.updateUser()</code>. Sesi login Anda tetap aktif.
                      </p>
                    </form>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
