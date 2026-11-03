import { createClient } from "@/lib/supabase/server";

function mapFollowedProfile(row, myFollowingIds) {
  const p = row.following || row.follower;
  if (!p) return null;
  return {
    id: p.id,
    username: p.username,
    full_name: p.full_name || p.username,
    name: p.full_name || p.username,
    avatar: p.avatar_url || "",
    avatar_url: p.avatar_url || "",
    role: p.role,
    verified: p.verified || false,
    isFollowing: myFollowingIds.has(p.id),
  };
}

// Data lengkap untuk halaman profil: followers, following, counts, status follow current user
export async function getFollowData(profileUserId, currentUserId) {
  const supabase = await createClient();

  const [{ data: followerRows }, { data: followingRows }, { count: followerCount }, { count: followingCount }] =
    await Promise.all([
      supabase
        .from("follows")
        .select("follower:profiles!follows_follower_id_fkey(id, username, full_name, avatar_url, role, verified)")
        .eq("following_id", profileUserId),
      supabase
        .from("follows")
        .select("following:profiles!follows_following_id_fkey(id, username, full_name, avatar_url, role, verified)")
        .eq("follower_id", profileUserId),
      supabase.from("follows").select("follower_id", { count: "exact", head: true }).eq("following_id", profileUserId),
      supabase.from("follows").select("following_id", { count: "exact", head: true }).eq("follower_id", profileUserId),
    ]);

  // Daftar id yang di-follow oleh current user (untuk status tombol Follow)
  let myFollowingIds = new Set();
  if (currentUserId) {
    const { data: myFollowing } = await supabase
      .from("follows")
      .select("following_id")
      .eq("follower_id", currentUserId);
    myFollowingIds = new Set((myFollowing || []).map((r) => r.following_id));
  }

  const followers = (followerRows || []).map((r) => mapFollowedProfile(r, myFollowingIds)).filter(Boolean);
  const following = (followingRows || []).map((r) => mapFollowedProfile(r, myFollowingIds)).filter(Boolean);

  return {
    followers,
    following,
    followerCount: followerCount ?? followers.length,
    followingCount: followingCount ?? following.length,
    isFollowing: currentUserId ? myFollowingIds.has(profileUserId) : false,
  };
}

export async function followUser(profileUserId) {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  const userId = userData?.user?.id;
  if (!userId) return { error: "Login diperlukan" };
  if (userId === profileUserId) return { error: "Tidak bisa mengikuti diri sendiri" };

  const { error } = await supabase
    .from("follows")
    .insert({ follower_id: userId, following_id: profileUserId });
  // 23505 = sudah follow sebelumnya, anggap sukses (idempotent)
  if (error && error.code !== "23505") return { error: error.message };
  return { success: true };
}

export async function unfollowUser(profileUserId) {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  const userId = userData?.user?.id;
  if (!userId) return { error: "Login diperlukan" };

  const { error } = await supabase
    .from("follows")
    .delete()
    .eq("follower_id", userId)
    .eq("following_id", profileUserId);
  if (error) return { error: error.message };
  return { success: true };
}
