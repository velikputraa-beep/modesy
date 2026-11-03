import { TopBar } from "@/components/layout/TopBar";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { EditProfileClient } from "@/components/settings/EditProfileClient";
import { getCurrentUser } from "@/lib/mock-auth";
import { getAddresses } from "@/lib/queries/content";

export const metadata = {
  title: "Profile Settings - Modesy",
  description: "Manage your public profile and account details",
};

export default async function EditProfilePage() {
  const user = await getCurrentUser();
  const initialAddresses = user ? await getAddresses(user.id) : [];
  const locationParts = (user?.location || "").split(",").map((s) => s.trim());

  const initialProfile = user
    ? {
        fullName: user.full_name || "",
        username: user.username || "",
        email: user.email || "",
        phone: user.phone || "",
        bio: user.bio || "",
        website: user.website || "",
        avatarUrl: user.avatar_url || "",
        coverUrl: user.banner_url || "",
        country: locationParts.length >= 3 ? locationParts[2] : user.location ? "" : "Indonesia",
        city: locationParts.length >= 3 ? locationParts[1] : "",
        address: locationParts.length >= 3 ? locationParts[0] : user.location || "",
      }
    : null;

  return (
    <div className="min-h-screen flex flex-col bg-[#F9FAFB] text-gray-900 font-sans">
      <TopBar />
      <Navbar />
      <EditProfileClient initialProfile={initialProfile} initialAddresses={initialAddresses} />
      <Footer />
    </div>
  );
}
