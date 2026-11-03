export function isGuest(user) { return !user; }
export function isMember(user) { return user?.role === 'member'; }
export function isVendor(user) { return user?.role === 'vendor'; }
export function isModerator(user) { return user?.role === 'moderator'; }
export function isAdmin(user) { return user?.role === 'admin'; }
export function isLoggedIn(user) { return !!user; }
export function isBuyer(user) { return isMember(user); }
export function isSeller(user) { return isVendor(user); }
export function canAccessAdminPanel(user) {
  return isModerator(user) || isAdmin(user);
}
export function hasFullAdminAccess(user) {
  return isAdmin(user);
}
