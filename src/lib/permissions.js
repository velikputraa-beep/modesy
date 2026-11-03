export const PERMISSIONS = [
  { id: 'admin-panel', label: 'Admin Panel', group: 'General' },
  { id: 'slider', label: 'Slider', group: 'Content' },
  { id: 'homepage-manager', label: 'Homepage Manager', group: 'Content' },
  { id: 'products', label: 'Products', group: 'Catalog' },
  { id: 'quote-requests', label: 'Quote Requests', group: 'Catalog' },
  { id: 'categories', label: 'Categories', group: 'Catalog' },
  { id: 'custom-fields', label: 'Custom Fields', group: 'Catalog' },
  { id: 'contact-messages', label: 'Contact Messages', group: 'Communication' },
  { id: 'reviews', label: 'Reviews', group: 'Communication' },
  { id: 'comments', label: 'Comments', group: 'Communication' },
  { id: 'abuse-reports', label: 'Abuse Reports', group: 'Communication' },
  { id: 'tags', label: 'Tags', group: 'Catalog' },
  { id: 'ai-writer', label: 'AI Writer', group: 'Tools' },
  { id: 'vendor', label: 'Vendor', group: 'General' },
  { id: 'orders', label: 'Orders', group: 'Sales' },
  { id: 'digital-sales', label: 'Digital Sales', group: 'Sales' },
  { id: 'refund-requests', label: 'Refund Requests', group: 'Sales' },
  { id: 'payments', label: 'Payments', group: 'Finance' },
  { id: 'earnings', label: 'Earnings', group: 'Finance' },
  { id: 'payouts', label: 'Payouts', group: 'Finance' },
  { id: 'membership', label: 'Membership', group: 'Users' },
  { id: 'roles-permissions', label: 'Roles & Permissions', group: 'Users' },
  { id: 'settings', label: 'Settings', group: 'System' },
  { id: 'newsletter', label: 'Newsletter', group: 'Communication' },
  { id: 'affiliate', label: 'Affiliate Program', group: 'Marketing' },
  { id: 'email-blacklist', label: 'Email Blacklist', group: 'System' },
  { id: 'pages', label: 'Pages', group: 'Content' },
  { id: 'blog', label: 'Blog', group: 'Content' },
  { id: 'location', label: 'Location', group: 'Content' },
  { id: 'help-center', label: 'Help Center', group: 'Support' },
  { id: 'cache-system', label: 'Cache System', group: 'System' },
  { id: 'seo-tools', label: 'SEO Tools', group: 'System' },
  { id: 'ad-spaces', label: 'Ad Spaces', group: 'Marketing' },
  { id: 'chat-messages', label: 'Chat Messages', group: 'Communication' },
];

export const ROLE_PERMISSIONS = {
  member: [],
  vendor: ['ai-writer', 'vendor'],
  moderator: [
    'admin-panel', 'slider', 'homepage-manager', 'products',
    'quote-requests', 'categories', 'custom-fields', 'contact-messages',
    'reviews', 'comments', 'abuse-reports', 'tags', 'ai-writer'
  ],
  admin: ['*']
};

export const ROLE_LABELS = {
  member: 'Member',
  vendor: 'Vendor',
  moderator: 'Moderator',
  admin: 'Super Admin'
};

export const ROLE_COLORS = {
  member: 'bg-gray-100 text-gray-800',
  vendor: 'bg-purple-100 text-purple-800',
  moderator: 'bg-blue-100 text-blue-800',
  admin: 'bg-red-100 text-red-800'
};

export function hasPermission(user, permission) {
  if (!user) return false;
  const rolePerms = ROLE_PERMISSIONS[user.role] || [];
  if (rolePerms.includes('*')) return true;
  return rolePerms.includes(permission);
}

export function hasAnyPermission(user, permissions) {
  if (!user) return false;
  const rolePerms = ROLE_PERMISSIONS[user.role] || [];
  if (rolePerms.includes('*')) return true;
  return permissions.some(p => rolePerms.includes(p));
}

export function canAccessAdminPanel(user) {
  return hasPermission(user, 'admin-panel');
}
