import { TopBar } from "@/components/layout/TopBar";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { getCurrentUser } from "@/lib/mock-auth";
import { getUserByUsername } from "@/lib/queries/users";
import { getProducts } from "@/lib/queries/products";
import { getSellerReviews } from "@/lib/queries/reviews";
import { getFollowData } from "@/lib/queries/follows";
import { getSellerSalesCount } from "@/lib/queries/orders";

import { ProfileClient } from "@/components/profile/ProfileClient";

export async function generateMetadata({ params }) {
  const { username } = await params;
  const normalized = (username || "").toLowerCase();
  const user = await getUserByUsername(normalized);

  return {
    title: `${user?.full_name || user?.username || "Profile"} - Modesy`,
    description: user?.bio || "Modesy User Profile",
  };
}

export default async function ProfilePage({ params }) {
  const { username } = await params;
  const normalized = (username || "").toLowerCase();
  const profile = await getUserByUsername(normalized);
  const currentUser = await getCurrentUser();

  if (!profile) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <TopBar />
        <Navbar />
        <main className="flex-1 flex items-center justify-center py-20 px-4">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Profil Tidak Ditemukan
            </h1>
            <p className="text-sm text-gray-500">
              User dengan username &quot;{normalized}&quot; tidak ditemukan.
            </p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const [sellerProducts, sellerReviews, followData, salesCount] =
    await Promise.all([
      getProducts({ sellerId: profile.id, limit: 100 }),
      getSellerReviews(profile.id),
      getFollowData(profile.id, currentUser?.id),
      getSellerSalesCount(profile.id),
    ]);

  const ratingSum = sellerReviews.reduce((acc, r) => acc + (r.rating || 0), 0);
  const avgRating = sellerReviews.length
    ? Math.round((ratingSum / sellerReviews.length) * 10) / 10
    : 0;

  const user = {
    ...profile,
    rating: avgRating,
    reviewCount: sellerReviews.length,
    salesCount,
    lastSeen: "Baru saja",
    stats: {
      products: sellerProducts.length,
      followers: followData.followerCount,
      following: followData.followingCount,
      reviews: sellerReviews.length,
    },
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <TopBar />
      <Navbar />
      <ProfileClient
        user={user}
        currentUser={currentUser}
        sellerProducts={sellerProducts}
        sellerReviews={sellerReviews}
        followData={followData}
      />
      <Footer />
    </div>
  );
}
