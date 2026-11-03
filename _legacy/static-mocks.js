// Data statis untuk tampilan admin/dashboard yang belum punya tabel Supabase.
// Nanti bisa dimigrasi ke tabel satu per satu.

export const banners = [
  {
    id: 1,
    title: "Buy Nice and Unique Clothes",
    subtitle: "Discover quality premium basics and trendy essentials at surprisingly affordable prices",
    buttonText: "Explore Now",
    buttonLink: "#",
    tag: "Modesy Featured",
    image: "https://picsum.photos/seed/banner1/1600/600",
  },
  {
    id: 2,
    title: "Find Backpacks That Best Suit You",
    subtitle: "Timeless, modern, and versatile pieces made with quality materials and craftsmanship",
    buttonText: "Buy Now",
    buttonLink: "#",
    tag: "Trending Collection",
    image: "https://picsum.photos/seed/banner2/1600/600",
  },
  {
    id: 3,
    title: "Handcrafted Decor & Modern Living",
    subtitle: "Elevate your daily living space with authentic designs from talented artisan creators",
    buttonText: "Discover More",
    buttonLink: "#",
    tag: "New Arrivals",
    image: "https://picsum.photos/seed/banner3/1600/600",
  },
];

export const users = [
  { id: '1', username: 'member1', full_name: 'Budi Santoso', avatar_url: 'https://i.pravatar.cc/150?u=member1', role: 'member', joined: '2026-08-15' },
  { id: '2', username: 'vendor1', full_name: 'Toko Elektronik Jaya', avatar_url: 'https://i.pravatar.cc/150?u=vendor1', role: 'vendor', commission: 10, joined: '2026-07-20' },
  { id: '3', username: 'vendor2', full_name: 'Fashion Store ID', avatar_url: 'https://i.pravatar.cc/150?u=vendor2', role: 'vendor', commission: 10, joined: '2026-08-01' },
  { id: '4', username: 'moderator1', full_name: 'Rina Moderator', avatar_url: 'https://i.pravatar.cc/150?u=moderator1', role: 'moderator', joined: '2026-06-10' },
  { id: '5', username: 'admin1', full_name: 'John Doe', avatar_url: 'https://i.pravatar.cc/150?u=admin1', role: 'admin', joined: '2026-01-01' },
  { id: '6', username: 'admin2', full_name: 'Super Admin', avatar_url: 'https://i.pravatar.cc/150?u=admin2', role: 'admin', joined: '2026-01-01' }
];

export const mockUsers = users;

export const getUserByRole = (role) => {
  if (!role) return null;
  const normalized = role.toLowerCase().trim();
  return users.find((u) => u.role.toLowerCase() === normalized) || null;
};

export const adminStats = {
  orders: 40,
  products: 47,
  pendingProducts: 0,
  members: 14,
};

export const adminOrders = [
  { id: '1', orderNumber: '#10040', buyer: 'Trendshop', seller: 'Toko Elektronik Jaya', product: 'Colorful Women Scarves', total: 138, status: 'Processing', paymentStatus: 'Pending Payment', date: '2026-09-29 12:00', updated: '5 days ago' },
  { id: '2', orderNumber: '#10039', buyer: 'Bb Hhj', seller: 'Fashion Store ID', product: "Women's Ankle Boot", total: 94, status: 'Processing', paymentStatus: 'Pending Payment', date: '2026-09-29 00:34', updated: '6 days ago' },
  { id: '3', orderNumber: '#10038', buyer: 'Admin Modesy', seller: 'Trendshop', product: 'Navy Polka Dot Dress', total: 381.85, status: 'Processing', paymentStatus: 'Pending Payment', date: '2026-09-28 22:48', updated: '6 days ago' },
  { id: '4', orderNumber: '#10037', buyer: 'Zus Kara', seller: 'Toko Elektronik Jaya', product: 'Modern Grey Couch', total: 71.95, status: 'Processing', paymentStatus: 'Pending Payment', date: '2026-09-28 15:39', updated: '6 days ago' },
  { id: '5', orderNumber: '#10036', buyer: 'Test User', seller: 'Fashion Store ID', product: 'Black Fashion Backpack', total: 336, status: 'Processing', paymentStatus: 'Pending Payment', date: '2026-09-28 06:49', updated: '6 days ago' },
  { id: '6', orderNumber: '#10035', buyer: 'Admin Modesy', seller: 'Trendshop', product: 'Handcrafted Decorative Pillow', total: 99.30, status: 'Processing', paymentStatus: 'Pending Payment', date: '2026-09-26 21:14', updated: '8 days ago' },
  { id: '7', orderNumber: '#10034', buyer: 'Admin Modesy', seller: 'Fashion Store ID', product: 'Women Kipling Bailey Bag', total: 256.50, status: 'Processing', paymentStatus: 'Pending Payment', date: '2026-09-25 06:11', updated: '9 days ago' },
  { id: '8', orderNumber: '#10033', buyer: 'Trendshop', seller: 'Toko Elektronik Jaya', product: 'Floral Women Sundress', total: 191.10, status: 'Processing', paymentStatus: 'Payment Received', date: '2026-09-23 17:23', updated: '10 days ago' },
  { id: '9', orderNumber: '#10032', buyer: 'Mamat Ian', seller: 'Fashion Store ID', product: 'Leather Crossbody Bag', total: 315.70, status: 'Processing', paymentStatus: 'Pending Payment', date: '2026-09-23 11:15', updated: '11 days ago' },
  { id: '10', orderNumber: '#10031', buyer: 'Admin Modesy', seller: 'Trendshop', product: 'Seychelles Brown Bootie', total: 257, status: 'Processing', paymentStatus: 'Payment Received', date: '2026-09-23 02:08', updated: '12 days ago' },
];

export const adminTransactions = [
  { id: '18', orderId: '#10033', total: 191.10, paymentMethod: 'Wallet Balance', status: 'Succeeded', date: '2026-09-23 17:23' },
  { id: '17', orderId: '#10031', total: 257.00, paymentMethod: 'Wallet Balance', status: 'Succeeded', date: '2026-09-23 02:08' },
  { id: '16', orderId: '#10029', total: 259.05, paymentMethod: 'Wallet Balance', status: 'Succeeded', date: '2026-09-22 06:40' },
  { id: '15', orderId: '#10025', total: 149479.73, paymentMethod: 'PayStack', status: 'Succeeded', date: '2026-09-16 10:38' },
  { id: '14', orderId: '#10019', total: 182.10, paymentMethod: 'Wallet Balance', status: 'Succeeded', date: '2026-09-09 11:39' },
  { id: '13', orderId: '#10018', total: 149.50, paymentMethod: 'Wallet Balance', status: 'Succeeded', date: '2026-09-09 05:59' },
  { id: '12', orderId: '#10017', total: 87.00, paymentMethod: 'Wallet Balance', status: 'Succeeded', date: '2026-09-06 02:16' },
  { id: '11', orderId: '#10015', total: 41.40, paymentMethod: 'Wallet Balance', status: 'Succeeded', date: '2026-09-06 02:14' },
  { id: '10', orderId: '#10012', total: 95.00, paymentMethod: 'Stripe', status: 'Succeeded', date: '2026-09-04 18:20' },
  { id: '9', orderId: '#10008', total: 135.50, paymentMethod: 'PayPal', status: 'Succeeded', date: '2026-09-02 14:10' },
];

export const adminProducts = [
  { id: '47', name: 'Colorful Women Scarves', image: 'https://picsum.photos/seed/scarf/100/100', category: 'Fashion', price: 250000, seller: 'Fashion Store ID', status: 'Active', sku: 'C1W2S3C4V5R6', stock: 'In Stock (500)', pageViews: 172, date: '2026-07-31 / 19:40', timeAgo: '2 months ago', isFeatured: false, discount: '15%' },
  { id: '46', name: "Women's Ankle Boot with Different Colors", image: 'https://picsum.photos/seed/boots/100/100', category: 'Shoes', price: 350000, seller: 'Toko Elektronik Jaya', status: 'Active', sku: 'W1A2B3D4C5R6', stock: 'In Stock (500)', pageViews: 138, date: '2026-07-31 / 19:33', timeAgo: '2 months ago', isFeatured: false },
  { id: '45', name: 'Navy Polka Dot Dress', image: 'https://picsum.photos/seed/dress/100/100', category: 'Fashion', price: 420000, seller: 'Fashion Store ID', status: 'Active', sku: 'N1P2D3D4R5S6', stock: 'In Stock (500)', pageViews: 186, date: '2026-07-31 / 19:29', timeAgo: '2 months ago', isFeatured: false, discount: '15%' },
  { id: '44', name: 'Modern Grey Couch and Pillows', image: 'https://picsum.photos/seed/couch/100/100', category: 'Home & Living', price: 1200000, seller: 'Toko Elektronik Jaya', status: 'Active', sku: 'M1G2C3P4S5L6', stock: 'In Stock', pageViews: 168, date: '2026-07-31 / 19:23', timeAgo: '2 months ago', isFeatured: false },
  { id: '43', name: 'Black Fashion Women Backpack', image: 'https://picsum.photos/seed/bagpack/100/100', category: 'Fashion', price: 180000, seller: 'Fashion Store ID', status: 'Active', sku: 'B1F2W3B4P5K6', stock: 'In Stock (500)', pageViews: 152, date: '2026-07-31 / 19:21', timeAgo: '2 months ago', isFeatured: false },
  { id: '42', name: 'Handcrafted Decorative Pillow', image: 'https://picsum.photos/seed/pillow/100/100', category: 'Home & Living', price: 95000, seller: 'Fashion Store ID', status: 'Active', sku: 'H1D2P3L4T5X6', stock: 'In Stock (493)', pageViews: 218, date: '2026-07-31 / 19:16', timeAgo: '2 months ago', isFeatured: true, specialOffer: true, discount: '10%' },
  { id: '41', name: 'Black Midi Skirt with White Flowers', image: 'https://picsum.photos/seed/skirt/100/100', category: 'Fashion', price: 160000, seller: 'Fashion Store ID', status: 'Active', sku: 'B1M2S3W4F5L6', stock: 'In Stock (500)', pageViews: 260, date: '2026-07-31 / 19:13', timeAgo: '2 months ago', isFeatured: true },
  { id: '40', name: 'Women Kipling Bailey Saddle Handbag', image: 'https://picsum.photos/seed/handbag/100/100', category: 'Fashion', price: 290000, seller: 'Toko Elektronik Jaya', status: 'Active', sku: 'W1K2B3S4H5G6', stock: 'In Stock (500)', pageViews: 179, date: '2026-07-31 / 18:57', timeAgo: '2 months ago', isFeatured: true, specialOffer: true },
  { id: '39', name: 'Animal Colorful Digital Prints', image: 'https://picsum.photos/seed/print/100/100', category: 'Graphics & Photos', price: 45000, seller: 'Fashion Store ID', status: 'Active', sku: 'A1C2D3P4R5N6', stock: 'In Stock', pageViews: 286, date: '2026-07-31 / 18:49', timeAgo: '2 months ago', specialOffer: true },
  { id: '38', name: 'Floral Women Sundress', image: 'https://picsum.photos/seed/sundress/100/100', category: 'Fashion', price: 225000, seller: 'Fashion Store ID', status: 'Active', sku: 'F1W2S3D4R5S6', stock: 'In Stock (1000)', pageViews: 365, date: '2026-07-31 / 18:29', timeAgo: '2 months ago', isFeatured: true, specialOffer: true, discount: '15%' },
];

export const adminUsers = [
  ...users,
  { id: '7', username: 'mamatian', full_name: 'Mamat Ian', email: 'mamat@gmail.com', avatar_url: 'https://i.pravatar.cc/150?u=mamatian', role: 'member', status: 'Active', joined: '2026-08-10', lastSeen: '11 days ago' },
  { id: '8', username: 'zuskara', full_name: 'Zus Kara', email: 'zuskara@gmail.com', avatar_url: 'https://i.pravatar.cc/150?u=zuskara', role: 'member', status: 'Active', joined: '2026-08-12', lastSeen: '6 days ago' },
  { id: '9', username: 'calebprosper', full_name: 'Caleb Prosper', email: 'caleb@gmail.com', avatar_url: 'https://i.pravatar.cc/150?u=calebprosper', role: 'member', status: 'Active', joined: '2026-08-14', lastSeen: '2 days ago' },
  { id: '10', username: 'atukunda', full_name: 'Atukunda Didan', email: 'atukunda@gmail.com', avatar_url: 'https://i.pravatar.cc/150?u=atukunda', role: 'member', status: 'Active', joined: '2026-08-15', lastSeen: '1 day ago' },
];

export const adminCategories = [
  { id: 1, name: 'Clothing', slug: 'clothing', icon: 'shirt', count: 12, commission: 10, featured: true, status: 'Active' },
  { id: 2, name: 'Shoes', slug: 'shoes', icon: 'footprints', count: 8, featured: false, status: 'Active' },
  { id: 3, name: 'Home & Living', slug: 'home-living', icon: 'home', count: 15, commission: 15, featured: true, status: 'Active' },
  { id: 4, name: 'Jewelry & Accessories', slug: 'jewelry-accessories', icon: 'gem', count: 7, featured: false, status: 'Active' },
  { id: 5, name: 'Toys & Entertainment', slug: 'toys-entertainment', icon: 'gamepad-2', count: 5, featured: true, status: 'Active' },
  { id: 6, name: 'Graphics & Photos', slug: 'graphics-photos', icon: 'image', count: 9, featured: false, status: 'Active' },
  { id: 7, name: 'Video & Audio', slug: 'video-audio', icon: 'music', count: 4, featured: false, status: 'Active' },
  { id: 8, name: 'Web Templates & Code', slug: 'web-templates-code', icon: 'code', count: 11, featured: false, status: 'Active' },
];

export const adminBrands = [
  { id: 1, name: 'Nike', slug: 'nike', logo: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=100&h=100&fit=crop', count: 14, status: 'Active' },
  { id: 2, name: 'Adidas', slug: 'adidas', logo: 'https://images.unsplash.com/photo-1518002171953-a080ee817e1f?w=100&h=100&fit=crop', count: 11, status: 'Active' },
  { id: 3, name: 'Puma', slug: 'puma', logo: 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=100&h=100&fit=crop', count: 8, status: 'Active' },
  { id: 4, name: 'Gucci', slug: 'gucci', logo: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=100&h=100&fit=crop', count: 6, status: 'Active' },
  { id: 5, name: 'Samsung', slug: 'samsung', logo: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=100&h=100&fit=crop', count: 19, status: 'Active' },
  { id: 6, name: 'Apple', slug: 'apple', logo: 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=100&h=100&fit=crop', count: 24, status: 'Active' },
  { id: 7, name: 'Sony', slug: 'sony', logo: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=100&h=100&fit=crop', count: 9, status: 'Active' },
  { id: 8, name: 'LG', slug: 'lg', logo: 'https://images.unsplash.com/photo-1593344484962-796055d4a3a4?w=100&h=100&fit=crop', count: 7, status: 'Active' },
];

export const adminTags = [
  { id: 1, name: 'Summer Collection', slug: 'summer-collection', count: 24 },
  { id: 2, name: 'Casual Wear', slug: 'casual-wear', count: 32 },
  { id: 3, name: 'Handmade Craft', slug: 'handmade-craft', count: 18 },
  { id: 4, name: 'Vintage Look', slug: 'vintage-look', count: 15 },
  { id: 5, name: 'Eco Friendly', slug: 'eco-friendly', count: 9 },
  { id: 6, name: 'Streetwear', slug: 'streetwear', count: 28 },
  { id: 7, name: 'Minimalist Decor', slug: 'minimalist-decor', count: 12 },
  { id: 8, name: 'Premium Leather', slug: 'premium-leather', count: 14 },
  { id: 9, name: 'Digital Art', slug: 'digital-art', count: 21 },
  { id: 10, name: 'Smart Gadget', slug: 'smart-gadget', count: 16 },
];

export const adminTheme = [
  { id: 1, name: 'Default Classic', description: 'Clean modern layout with multi-vendor storefront focus', preview: 'https://picsum.photos/seed/theme1/400/250', isActive: true, version: '1.4.0' },
  { id: 2, name: 'Minimal Marketplace', description: 'Ultra-lightweight sleek layout with bold typography', preview: 'https://picsum.photos/seed/theme2/400/250', isActive: false, version: '1.2.1' },
  { id: 3, name: 'Modern Boutique', description: 'Vibrant boutique layout tailored for fashion and lifestyle', preview: 'https://picsum.photos/seed/theme3/400/250', isActive: false, version: '2.0.0' },
  { id: 4, name: 'Digital Marketplace', description: 'Optimized for digital assets, downloads, and licenses', preview: 'https://picsum.photos/seed/theme4/400/250', isActive: false, version: '1.1.0' },
];

export const adminSliders = [
  { id: 1, title: 'Buy Nice and Unique Clothes', subtitle: 'Discover quality premium basics and trendy essentials', link: '/category/clothing', order: 1, image: 'https://picsum.photos/seed/slider1/300/120', status: 'Active' },
  { id: 2, title: 'Find Backpacks That Best Suit You', subtitle: 'Timeless, modern, and versatile artisan pieces', link: '/category/accessories', order: 2, image: 'https://picsum.photos/seed/slider2/300/120', status: 'Active' },
  { id: 3, title: 'Handcrafted Decor & Modern Living', subtitle: 'Elevate your daily living space with authentic designs', link: '/category/home-living', order: 3, image: 'https://picsum.photos/seed/slider3/300/120', status: 'Active' },
  { id: 4, title: 'Super Sale Clearance Up to 60%', subtitle: 'Exclusive discounts on selected seasonal products', link: '/products', order: 4, image: 'https://picsum.photos/seed/slider4/300/120', status: 'Active' },
  { id: 5, title: 'Explore Creative Digital Artworks', subtitle: 'Instant download templates, photos and design files', link: '/category/graphics-photos', order: 5, image: 'https://picsum.photos/seed/slider5/300/120', status: 'Inactive' },
];

export const adminPayments = [
  { id: '1', paymentId: 'PAY-892110', method: 'Stripe', amount: 450000, status: 'Completed', user: 'Budi Santoso', plan: 'Gold Vendor', ip: '192.168.1.10', date: '2026-10-09 14:22' },
  { id: '2', paymentId: 'PAY-892109', method: 'PayPal', amount: 250000, status: 'Completed', user: 'Zus Kara', plan: 'Basic Seller', ip: '10.0.0.15', date: '2026-10-08 19:10' },
  { id: '3', paymentId: 'PAY-892108', method: 'Bank Transfer', amount: 750000, status: 'Pending Payment', user: 'Mamat Ian', plan: 'Platinum Store', ip: '172.16.0.4', date: '2026-10-08 11:05' },
  { id: '4', paymentId: 'PAY-892107', method: 'Wallet Balance', amount: 150000, status: 'Completed', user: 'Caleb Prosper', plan: 'Silver Plan', ip: '192.168.1.44', date: '2026-10-07 09:30' },
  { id: '5', paymentId: 'PAY-892106', method: 'Midtrans', amount: 320000, status: 'Completed', user: 'Atukunda Didan', plan: 'Gold Vendor', ip: '192.168.1.20', date: '2026-10-06 21:14' },
  { id: '6', paymentId: 'PAY-892105', method: 'Stripe', amount: 500000, status: 'Completed', user: 'Test User', plan: 'Platinum Store', ip: '10.0.0.8', date: '2026-10-05 16:45' },
  { id: '7', paymentId: 'PAY-892104', method: 'Bank Transfer', amount: 180000, status: 'Pending Payment', user: 'Budi Santoso', plan: 'Basic Seller', ip: '192.168.1.10', date: '2026-10-04 12:18' },
  { id: '8', paymentId: 'PAY-892103', method: 'PayStack', amount: 620000, status: 'Completed', user: 'Zus Kara', plan: 'Platinum Store', ip: '10.0.0.15', date: '2026-10-03 08:50' },
  { id: '9', paymentId: 'PAY-892102', method: 'Wallet Balance', amount: 95000, status: 'Completed', user: 'Mamat Ian', plan: 'Silver Plan', ip: '172.16.0.4', date: '2026-10-02 18:22' },
  { id: '10', paymentId: 'PAY-892101', method: 'PayPal', amount: 300000, status: 'Refunded', user: 'Caleb Prosper', plan: 'Gold Vendor', ip: '192.168.1.44', date: '2026-10-01 10:12' },
];

export const adminPayouts = [
  { id: '1', seller: 'Toko Elektronik Jaya', amount: 1450000, method: 'Bank Transfer', status: 'Completed', date: '2026-10-08 10:30' },
  { id: '2', seller: 'Fashion Store ID', amount: 890000, method: 'PayPal', status: 'Completed', date: '2026-10-07 14:15' },
  { id: '3', seller: 'Trendshop', amount: 2150000, method: 'Bank Transfer', status: 'Pending', date: '2026-10-09 09:20' },
  { id: '4', seller: 'Toko Elektronik Jaya', amount: 620000, method: 'Bank Transfer', status: 'Completed', date: '2026-09-30 11:00' },
  { id: '5', seller: 'Fashion Store ID', amount: 1100000, method: 'Stripe Payout', status: 'Completed', date: '2026-09-25 16:40' },
  { id: '6', seller: 'Trendshop', amount: 780000, method: 'PayPal', status: 'Completed', date: '2026-09-20 13:10' },
  { id: '7', seller: 'Artisan Woodcraft', amount: 450000, method: 'Bank Transfer', status: 'Pending', date: '2026-10-09 16:05' },
  { id: '8', seller: 'Studio Digital Pro', amount: 1850000, method: 'Bank Transfer', status: 'Completed', date: '2026-09-15 10:20' },
  { id: '9', seller: 'Fashion Store ID', amount: 530000, method: 'PayPal', status: 'Completed', date: '2026-09-10 15:50' },
  { id: '10', seller: 'Toko Elektronik Jaya', amount: 920000, method: 'Bank Transfer', status: 'Completed', date: '2026-09-05 11:35' },
];

export const adminEarnings = [
  { id: '1', seller: 'Fashion Store ID', product: 'Colorful Women Scarves', saleAmount: 250000, commission: 25000, netEarning: 225000, date: '2026-10-09 11:20' },
  { id: '2', seller: 'Toko Elektronik Jaya', product: "Women's Ankle Boot", saleAmount: 350000, commission: 35000, netEarning: 315000, date: '2026-10-08 15:45' },
  { id: '3', seller: 'Fashion Store ID', product: 'Navy Polka Dot Dress', saleAmount: 420000, commission: 42000, netEarning: 378000, date: '2026-10-08 09:12' },
  { id: '4', seller: 'Toko Elektronik Jaya', product: 'Modern Grey Couch', saleAmount: 1200000, commission: 120000, netEarning: 1080000, date: '2026-10-07 18:30' },
  { id: '5', seller: 'Fashion Store ID', product: 'Black Fashion Backpack', saleAmount: 180000, commission: 18000, netEarning: 162000, date: '2026-10-06 14:05' },
  { id: '6', seller: 'Trendshop', product: 'Handcrafted Decorative Pillow', saleAmount: 95000, commission: 9500, netEarning: 85500, date: '2026-10-05 20:10' },
  { id: '7', seller: 'Trendshop', product: 'Black Midi Skirt Flower', saleAmount: 160000, commission: 16000, netEarning: 144000, date: '2026-10-05 12:44' },
  { id: '8', seller: 'Toko Elektronik Jaya', product: 'Women Kipling Bailey Bag', saleAmount: 290000, commission: 29000, netEarning: 261000, date: '2026-10-04 16:22' },
  { id: '9', seller: 'Fashion Store ID', product: 'Floral Women Sundress', saleAmount: 225000, commission: 22500, netEarning: 202500, date: '2026-10-03 11:15' },
  { id: '10', seller: 'Studio Digital Pro', product: 'Animal Colorful Digital Prints', saleAmount: 45000, commission: 4500, netEarning: 40500, date: '2026-10-02 17:50' },
];

export const adminReviews = [
  { id: 1, user: 'Budi Santoso', product: 'Colorful Women Scarves', rating: 5, comment: 'Bahan sangat halus, jahitan rapi sekali, pengiriman super cepat!', date: '2026-10-08', status: 'Approved' },
  { id: 2, user: 'Zus Kara', product: "Women's Ankle Boot", rating: 4, comment: 'Ukuran pas di kaki, empuk dipakai jalan seharian. Recommended seller!', date: '2026-10-07', status: 'Approved' },
  { id: 3, user: 'Mamat Ian', product: 'Navy Polka Dot Dress', rating: 5, comment: 'Sesuai ekspektasi dan foto deskripsi. Istri suka sekali dengan coraknya.', date: '2026-10-06', status: 'Approved' },
  { id: 4, user: 'Caleb Prosper', product: 'Modern Grey Couch', rating: 5, comment: 'Kualitas busa tebal, kain kokoh dan elegan. Pelayanan toko mantap!', date: '2026-10-05', status: 'Approved' },
  { id: 5, user: 'Atukunda Didan', product: 'Black Fashion Backpack', rating: 4, comment: 'Bagus untuk daily commute, banyak sekat dan kantong laptop.', date: '2026-10-04', status: 'Approved' },
  { id: 6, user: 'Rina Moderator', product: 'Handcrafted Decorative Pillow', rating: 5, comment: 'Motif bordirnya unik dan rapi. Bikin ruang tamu jadi manis.', date: '2026-10-03', status: 'Approved' },
  { id: 7, user: 'Test User', product: 'Animal Colorful Prints', rating: 3, comment: 'File resolusi bagus, tapi warna cetak sedikit beda dari monitor.', date: '2026-10-02', status: 'Approved' },
  { id: 8, user: 'Budi Santoso', product: 'Floral Women Sundress', rating: 5, comment: 'Bahan adem semriwing, nyaman banget buat jalan-jalan santai.', date: '2026-10-01', status: 'Approved' },
  { id: 9, user: 'Zus Kara', product: 'Black Midi Skirt', rating: 4, comment: 'Karet pinggang elastis dan gak bikin begah.', date: '2026-09-29', status: 'Approved' },
  { id: 10, user: 'Mamat Ian', product: 'Women Kipling Bailey Bag', rating: 5, comment: 'Original dan zipper kuat. Puas belanja di sini!', date: '2026-09-28', status: 'Approved' },
];

export const adminComments = [
  { id: 1, user: 'Budi Santoso', product: 'Colorful Women Scarves', post: null, type: 'product', comment: 'Apakah warna merah marun ready stok min?', status: 'Approved', date: '2026-10-09 10:15' },
  { id: 2, user: 'Zus Kara', product: "Women's Ankle Boot", post: null, type: 'product', comment: 'Bisa tukar size kalau kebesaran?', status: 'Approved', date: '2026-10-08 14:20' },
  { id: 3, user: 'Mamat Ian', product: null, post: 'Top 10 Fashion Trends in 2026', type: 'blog', comment: 'Artikel sangat berbobot dan membuka inspirasi gaya santai.', status: 'Approved', date: '2026-10-07 19:40' },
  { id: 4, user: 'Caleb Prosper', product: 'Modern Grey Couch', post: null, type: 'product', comment: 'Ongkir ke Bandung berapa ya?', status: 'Pending', date: '2026-10-07 08:33' },
  { id: 5, user: 'Atukunda Didan', product: null, post: 'Tips Memilih Sepatu Boot Nyaman', type: 'blog', comment: 'Sangat setuju bagian pemilihan sol tebal untuk jalan jauh.', status: 'Approved', date: '2026-10-06 16:50' },
  { id: 6, user: 'Test User', product: 'Black Fashion Backpack', post: null, type: 'product', comment: 'Apakah muat laptop ukuran 15.6 inch?', status: 'Approved', date: '2026-10-05 11:22' },
  { id: 7, user: 'Rina Moderator', product: null, post: 'Cara Merawat Pakaian Katun dan Rayon', type: 'blog', comment: 'Kiat menyetrika suhu rendah berguna sekali!', status: 'Approved', date: '2026-10-04 20:05' },
  { id: 8, user: 'Budi Santoso', product: 'Floral Women Sundress', post: null, type: 'product', comment: 'Apakah kain menerawang?', status: 'Approved', date: '2026-10-03 13:12' },
  { id: 9, user: 'Zus Kara', product: null, post: 'Inspirasi Ruang Tamu Minimalis', type: 'blog', comment: 'Kombinasi sofa abu dan bantal motif memang paling pas.', status: 'Approved', date: '2026-10-02 15:45' },
  { id: 10, user: 'Mamat Ian', product: 'Animal Colorful Prints', post: null, type: 'product', comment: 'Format file vektor atau raster jpg ya?', status: 'Pending', date: '2026-10-01 09:10' },
];

export const adminCountries = [
  { id: 1, name: 'Indonesia', code: 'ID', flag: '🇮🇩', status: 'Active' },
  { id: 2, name: 'Malaysia', code: 'MY', flag: '🇲🇾', status: 'Active' },
  { id: 3, name: 'Singapore', code: 'SG', flag: '🇸🇬', status: 'Active' },
  { id: 4, name: 'Thailand', code: 'TH', flag: '🇹🇭', status: 'Active' },
  { id: 5, name: 'Philippines', code: 'PH', flag: '🇵🇭', status: 'Active' },
  { id: 6, name: 'Vietnam', code: 'VN', flag: '🇻🇳', status: 'Active' },
  { id: 7, name: 'United States', code: 'US', flag: '🇺🇸', status: 'Active' },
  { id: 8, name: 'United Kingdom', code: 'GB', flag: '🇬🇧', status: 'Active' },
  { id: 9, name: 'Australia', code: 'AU', flag: '🇦🇺', status: 'Active' },
  { id: 10, name: 'Japan', code: 'JP', flag: '🇯🇵', status: 'Active' },
];

export const adminStates = [
  { id: 1, name: 'DKI Jakarta', country: 'Indonesia', status: 'Active' },
  { id: 2, name: 'Jawa Barat', country: 'Indonesia', status: 'Active' },
  { id: 3, name: 'Jawa Timur', country: 'Indonesia', status: 'Active' },
  { id: 4, name: 'Jawa Tengah', country: 'Indonesia', status: 'Active' },
  { id: 5, name: 'Bali', country: 'Indonesia', status: 'Active' },
  { id: 6, name: 'Selangor', country: 'Malaysia', status: 'Active' },
  { id: 7, name: 'California', country: 'United States', status: 'Active' },
  { id: 8, name: 'Tokyo Metropolis', country: 'Japan', status: 'Active' },
];

export const adminCities = [
  { id: 1, name: 'Jakarta Selatan', state: 'DKI Jakarta', country: 'Indonesia', status: 'Active' },
  { id: 2, name: 'Jakarta Pusat', state: 'DKI Jakarta', country: 'Indonesia', status: 'Active' },
  { id: 3, name: 'Bandung', state: 'Jawa Barat', country: 'Indonesia', status: 'Active' },
  { id: 4, name: 'Surabaya', state: 'Jawa Timur', country: 'Indonesia', status: 'Active' },
  { id: 5, name: 'Semarang', state: 'Jawa Tengah', country: 'Indonesia', status: 'Active' },
  { id: 6, name: 'Denpasar', state: 'Bali', country: 'Indonesia', status: 'Active' },
  { id: 7, name: 'Kuala Lumpur', state: 'Selangor', country: 'Malaysia', status: 'Active' },
  { id: 8, name: 'Los Angeles', state: 'California', country: 'United States', status: 'Active' },
];

export const adminMembershipPlans = [
  { id: 1, name: 'Free Starter', price: 0, duration: 'Unlimited', features: 'Upload up to 5 products, basic shop profile, standard support', status: 'Active', members: 420 },
  { id: 2, name: 'Silver Seller', price: 150000, duration: '1 Month', features: 'Upload up to 50 products, featured badge, standard analytics', status: 'Active', members: 86 },
  { id: 3, name: 'Gold Vendor', price: 350000, duration: '3 Months', features: 'Upload up to 250 products, priority placement, low commission', status: 'Active', members: 48 },
  { id: 4, name: 'Platinum Store', price: 950000, duration: '12 Months', features: 'Unlimited products, zero marketplace fees, 24/7 dedicated support', status: 'Active', members: 22 },
];

export const adminBlogPosts = [
  { id: 1, title: 'Top 10 Fashion Trends in 2026', author: 'Modesy Editorial', category: 'Fashion & Style', status: 'Published', views: 1420, date: '2026-10-01', image: 'https://picsum.photos/seed/blog1/300/180' },
  { id: 2, title: 'Tips Memilih Sepatu Boot Nyaman untuk Cuaca Tropis', author: 'Fashion Store ID', category: 'Footwear Guide', status: 'Published', views: 890, date: '2026-09-28', image: 'https://picsum.photos/seed/blog2/300/180' },
  { id: 3, title: 'Cara Merawat Pakaian Katun dan Rayon Agar Awet', author: 'Trendshop', category: 'Fabric Care', status: 'Published', views: 650, date: '2026-09-22', image: 'https://picsum.photos/seed/blog3/300/180' },
  { id: 4, title: 'Inspirasi Menata Ruang Tamu Modern Minimalis', author: 'Artisan Woodcraft', category: 'Home Living', status: 'Published', views: 1120, date: '2026-09-18', image: 'https://picsum.photos/seed/blog4/300/180' },
  { id: 5, title: 'Panduan Memulai Toko Online Multi-Vendor di Modesy', author: 'Super Admin', category: 'Seller Guide', status: 'Published', views: 2340, date: '2026-09-10', image: 'https://picsum.photos/seed/blog5/300/180' },
  { id: 6, title: 'Peluang Bisnis Produk Kreatif Digital dan Lisensi', author: 'Studio Digital Pro', category: 'Digital Assets', status: 'Published', views: 780, date: '2026-09-04', image: 'https://picsum.photos/seed/blog6/300/180' },
  { id: 7, title: 'Koleksi Aksesoris Handmade Paling Diburu Tahun Ini', author: 'Trendshop', category: 'Fashion & Style', status: 'Draft', views: 0, date: '2026-10-08', image: 'https://picsum.photos/seed/blog7/300/180' },
  { id: 8, title: '5 Tips Fotografi Produk Menggunakan Smartphone', author: 'Modesy Editorial', category: 'Seller Guide', status: 'Published', views: 1890, date: '2026-08-29', image: 'https://picsum.photos/seed/blog8/300/180' },
  { id: 9, title: 'Mengenal Ragam Bahan Kulit Vegan Ramah Lingkungan', author: 'Fashion Store ID', category: 'Eco Lifestyle', status: 'Published', views: 540, date: '2026-08-20', image: 'https://picsum.photos/seed/blog9/300/180' },
  { id: 10, title: 'Strategi Diskon dan Promosi Akhir Tahun untuk Seller', author: 'Super Admin', category: 'Seller Guide', status: 'Published', views: 980, date: '2026-08-15', image: 'https://picsum.photos/seed/blog10/300/180' },
];

export const adminBlogCategories = [
  { id: 1, name: 'Fashion & Style', slug: 'fashion-style', postCount: 4 },
  { id: 2, name: 'Footwear Guide', slug: 'footwear-guide', postCount: 1 },
  { id: 3, name: 'Fabric Care', slug: 'fabric-care', postCount: 1 },
  { id: 4, name: 'Home Living', slug: 'home-living', postCount: 1 },
  { id: 5, name: 'Seller Guide', slug: 'seller-guide', postCount: 3 },
  { id: 6, name: 'Digital Assets', slug: 'digital-assets', postCount: 1 },
];

export const adminCustomFields = [
  { id: 1, name: 'Shoe Size', type: 'Select Box', category: 'Shoes', required: true, status: 'Active' },
  { id: 2, name: 'Clothing Fabric', type: 'Select Box', category: 'Clothing', required: false, status: 'Active' },
  { id: 3, name: 'Color Pattern', type: 'Text Input', category: 'Fashion', required: true, status: 'Active' },
  { id: 4, name: 'Warranty Period', type: 'Select Box', category: 'Electronics', required: true, status: 'Active' },
  { id: 5, name: 'Digital File Format', type: 'Checkbox', category: 'Graphics & Photos', required: true, status: 'Active' },
  { id: 6, name: 'Product Dimensions', type: 'Text Input', category: 'Home & Living', required: false, status: 'Active' },
];

export const adminQuoteRequests = [
  { id: '1', buyer: 'Budi Santoso', product: 'Modern Grey Couch', message: 'Minta penawaran khusus untuk pemesanan 10 set kantor.', status: 'Pending', date: '2026-10-09' },
  { id: '2', buyer: 'Zus Kara', product: 'Handcrafted Decorative Pillow', message: 'Apakah bisa custom bordir logo hotel untuk 50 pcs?', status: 'Responded', date: '2026-10-08' },
  { id: '3', buyer: 'Mamat Ian', product: 'Black Fashion Backpack', message: 'Permintaan harga grosir pemesanan seragam 30 pcs.', status: 'Pending', date: '2026-10-07' },
  { id: '4', buyer: 'Caleb Prosper', product: 'Colorful Women Scarves', message: 'Tawaran kemitraan reseller distributor resmi luar kota.', status: 'Closed', date: '2026-10-04' },
  { id: '5', buyer: 'Atukunda Didan', product: 'Animal Colorful Digital Prints', message: 'Lisensi extended komersial untuk cetak massal merchandise.', status: 'Responded', date: '2026-10-02' },
  { id: '6', buyer: 'Test User', product: 'Women Kipling Bailey Bag', message: 'Harga borongan 20 unit untuk event gathering.', status: 'Pending', date: '2026-09-29' },
];

export const adminRefundRequests = [
  { id: '1', buyer: 'Budi Santoso', orderNumber: '#10038', amount: 381.85, reason: 'Barang tidak sesuai warna yang dipesan', status: 'Pending', date: '2026-10-08' },
  { id: '2', buyer: 'Zus Kara', orderNumber: '#10034', amount: 256.50, reason: 'Ukuran sepatu terlalu kecil, seller tidak membalas chat tukar', status: 'Pending', date: '2026-10-07' },
  { id: '3', buyer: 'Mamat Ian', orderNumber: '#10025', amount: 149.73, reason: 'Pengiriman terlambat lebih dari 14 hari', status: 'Approved', date: '2026-10-02' },
  { id: '4', buyer: 'Caleb Prosper', orderNumber: '#10019', amount: 182.10, reason: 'Salah order variasi barang dan ingin batalkan', status: 'Rejected', date: '2026-09-28' },
  { id: '5', buyer: 'Test User', orderNumber: '#10015', amount: 41.40, reason: 'Paket rusak saat diterima oleh kurir pengiriman', status: 'Approved', date: '2026-09-25' },
];

export const adminDigitalSales = [
  { id: '1', product: 'Animal Colorful Digital Prints', buyer: 'Budi Santoso', price: 45000, downloads: 4, date: '2026-10-09' },
  { id: '2', product: 'Modern Portfolio Next.js Template', buyer: 'Zus Kara', price: 180000, downloads: 2, date: '2026-10-08' },
  { id: '3', product: 'Vintage Font Typography Pack', buyer: 'Mamat Ian', price: 75000, downloads: 5, date: '2026-10-07' },
  { id: '4', product: 'E-commerce Mobile UI Kit Figma', buyer: 'Caleb Prosper', price: 210000, downloads: 3, date: '2026-10-06' },
  { id: '5', product: 'Lofi Ambient Beats Audio Track', buyer: 'Atukunda Didan', price: 60000, downloads: 1, date: '2026-10-05' },
  { id: '6', product: 'Isometric 3D Icon Set Collection', buyer: 'Budi Santoso', price: 95000, downloads: 6, date: '2026-10-04' },
  { id: '7', product: 'Animal Colorful Digital Prints', buyer: 'Test User', price: 45000, downloads: 2, date: '2026-10-03' },
  { id: '8', product: 'Modern Portfolio Next.js Template', buyer: 'Mamat Ian', price: 180000, downloads: 1, date: '2026-10-01' },
];

export const adminContactMessages = [
  { id: 1, name: 'Andi Pratama', email: 'andi@example.com', subject: 'Pertanyaan Pembayaran Midtrans', message: 'Halo admin, apakah pembayaran QRIS mendukung auto-settlement?', date: '2026-10-09 15:30' },
  { id: 2, name: 'Siti Rahma', email: 'siti@example.com', subject: 'Kendala Verifikasi Toko Vendor', message: 'Saya sudah unggah dokumen toko 2 hari lalu namun belum diverifikasi.', date: '2026-10-08 11:20' },
  { id: 3, name: 'David Miller', email: 'david@global.com', subject: 'International Shipping Inquiry', message: 'Do you offer direct DHL integration for overseas shipments?', date: '2026-10-07 09:45' },
  { id: 4, name: 'Dewi Lestari', email: 'dewi@example.com', subject: 'Kerjasama Media Partner', message: 'Kami ingin menawarkan promosi kolaborasi untuk event Ramadhan.', date: '2026-10-06 14:10' },
  { id: 5, name: 'Bambang Sudiro', email: 'bambang@example.com', subject: 'Laporan Bug di Halaman Cart', message: 'Tombol checkout sempat reload berulang kali pada mobile browser Safari.', date: '2026-10-05 18:00' },
  { id: 6, name: 'Linda Wijaya', email: 'linda@example.com', subject: 'Pendaftaran Kurir Ekspedisi', message: 'Bagaimana prosedur mendaftarkan armada logistik lokal ke platform?', date: '2026-10-04 10:25' },
];

export const adminChatMessages = [
  {
    id: 1,
    contact: { id: 'u1', name: 'Budi Santoso', role: 'Buyer', avatar: 'https://i.pravatar.cc/150?u=member1', unread: 2 },
    lastMessage: 'Halo admin, apakah ada promo diskon ongkir minggu ini?',
    time: '14:20',
    messages: [
      { sender: 'them', text: 'Halo selamat siang admin Modesy!', time: '14:15' },
      { sender: 'them', text: 'Apakah ada promo diskon ongkir minggu ini?', time: '14:20' },
    ],
  },
  {
    id: 2,
    contact: { id: 'u2', name: 'Toko Elektronik Jaya', role: 'Vendor', avatar: 'https://i.pravatar.cc/150?u=vendor1', unread: 0 },
    lastMessage: 'Terima kasih atas bantuannya min!',
    time: 'Kemarin',
    messages: [
      { sender: 'them', text: 'Min, payout mingguan saya sudah diproses ya?', time: 'Kemarin 10:00' },
      { sender: 'me', text: 'Halo! Sudah diproses ya kak, silakan cek rekening BCA.', time: 'Kemarin 10:15' },
      { sender: 'them', text: 'Terima kasih atas bantuannya min!', time: 'Kemarin 10:20' },
    ],
  },
  {
    id: 3,
    contact: { id: 'u3', name: 'Fashion Store ID', role: 'Vendor', avatar: 'https://i.pravatar.cc/150?u=vendor2', unread: 0 },
    lastMessage: 'Siap min, katalog sudah kami perbarui.',
    time: '2 hari lalu',
    messages: [
      { sender: 'me', text: 'Mohon perbarui foto resolusi produk Scarlett Dress ya.', time: '2 hari lalu' },
      { sender: 'them', text: 'Siap min, katalog sudah kami perbarui.', time: '2 hari lalu' },
    ],
  },
  {
    id: 4,
    contact: { id: 'u4', name: 'Zus Kara', role: 'Buyer', avatar: 'https://i.pravatar.cc/150?u=zuskara', unread: 0 },
    lastMessage: 'Baik, terima kasih respon cepatnya.',
    time: '3 hari lalu',
    messages: [
      { sender: 'them', text: 'Kapan nomor resi pesanan #10037 keluar ya?', time: '3 hari lalu' },
      { sender: 'me', text: 'Penjual sedang mengemas dan resi akan update sore ini.', time: '3 hari lalu' },
      { sender: 'them', text: 'Baik, terima kasih respon cepatnya.', time: '3 hari lalu' },
    ],
  },
];

export const adminNewsletter = [
  { id: 1, email: 'alex@example.com', subscribedDate: '2026-10-09', status: 'Subscribed' },
  { id: 2, email: 'nadia.fashion@gmail.com', subscribedDate: '2026-10-08', status: 'Subscribed' },
  { id: 3, email: 'buyer.budi@santoso.id', subscribedDate: '2026-10-07', status: 'Subscribed' },
  { id: 4, email: 'customer12@yahoo.com', subscribedDate: '2026-10-05', status: 'Subscribed' },
  { id: 5, email: 'sarah.craft@outlook.com', subscribedDate: '2026-10-03', status: 'Subscribed' },
  { id: 6, email: 'info@studiomerchant.com', subscribedDate: '2026-09-28', status: 'Unsubscribed' },
  { id: 7, email: 'johndoe_id@gmail.com', subscribedDate: '2026-09-24', status: 'Subscribed' },
  { id: 8, email: 'citra.olshop@gmail.com', subscribedDate: '2026-09-18', status: 'Subscribed' },
];

export const adminAffiliates = [
  { id: 1, affiliate: 'Dimas Kreatif ID', referrals: 45, earnings: 1350000, conversionRate: '12.4%', status: 'Active' },
  { id: 2, affiliate: 'Fashion Influencer ID', referrals: 88, earnings: 2640000, conversionRate: '15.8%', status: 'Active' },
  { id: 3, affiliate: 'Tech Gadget Reviewer', referrals: 24, earnings: 720000, conversionRate: '8.1%', status: 'Active' },
  { id: 4, affiliate: 'Bunda Cerdas Belanja', referrals: 62, earnings: 1860000, conversionRate: '14.2%', status: 'Active' },
  { id: 5, affiliate: 'Lifestyle Daily Blog', referrals: 19, earnings: 570000, conversionRate: '6.5%', status: 'Pending' },
  { id: 6, affiliate: 'Student Discount Club', referrals: 38, earnings: 1140000, conversionRate: '9.8%', status: 'Active' },
];

export const adminAbuseReports = [
  { id: 1, reporter: 'Budi Santoso', reportedItem: 'Product #47 (Copyright violation)', reason: 'Menggunakan foto katalog resmi tanpa izin', date: '2026-10-08', status: 'Pending Review' },
  { id: 2, reporter: 'Zus Kara', reportedItem: 'Seller Fashion Store ID', reason: 'Spam pesan promosi di room diskusi pembeli', date: '2026-10-06', status: 'Resolved' },
  { id: 3, reporter: 'Mamat Ian', reportedItem: 'Review #7 by Test User', reason: 'Kata-kata kasar dan tidak pantas di review produk', date: '2026-10-04', status: 'Resolved' },
  { id: 4, reporter: 'Caleb Prosper', reportedItem: 'Product #39 (Misleading info)', reason: 'File template yang diunduh rusak dan tidak lengkap', date: '2026-09-30', status: 'Pending Review' },
  { id: 5, reporter: 'Atukunda Didan', reportedItem: 'User Spammer99', reason: 'Akun bot mengirimkan link phising melalui form komentar', date: '2026-09-27', status: 'Banned' },
];

export const adminEmailBlacklist = [
  { id: 1, email: 'spammer_bot@fakebox.net', reason: 'Mass marketing bot and malicious payloads', addedDate: '2026-10-05' },
  { id: 2, email: 'phishing_link@tempmail.io', reason: 'Automated phishing attempts in chat message', addedDate: '2026-10-02' },
  { id: 3, email: 'promo_blast@scamhub.org', reason: 'Unsolicited spam reviews blast on multiple listings', addedDate: '2026-09-29' },
  { id: 4, email: 'fake_buyer@throwaway.cc', reason: 'Fake credit card testing chargebacks', addedDate: '2026-09-21' },
  { id: 5, email: 'crypto_giveaway@tmail.org', reason: 'Spam comment link distributor', addedDate: '2026-09-14' },
];

export const adminAdSpaces = [
  { id: 1, name: 'Header Top Banner (728x90)', location: 'Header', size: '728x90', impressions: 45200, clicks: 1240, status: 'Active' },
  { id: 2, name: 'Sidebar Widget Banner (300x250)', location: 'Sidebar', size: '300x250', impressions: 28400, clicks: 820, status: 'Active' },
  { id: 3, name: 'Products Grid Intermediate (970x90)', location: 'Product Feed', size: '970x90', impressions: 38100, clicks: 950, status: 'Active' },
  { id: 4, name: 'Footer Leaderboard (728x90)', location: 'Footer', size: '728x90', impressions: 19800, clicks: 310, status: 'Active' },
  { id: 5, name: 'Product Details Sticky Right (300x600)', location: 'Product Details', size: '300x600', impressions: 16500, clicks: 530, status: 'Active' },
  { id: 6, name: 'Blog Sidebar Banner (300x250)', location: 'Blog Sidebar', size: '300x250', impressions: 12100, clicks: 280, status: 'Inactive' },
];

export const adminRoles = [
  {
    id: 1,
    name: 'Super Admin',
    description: 'Full uninhibited access to all modules, billing, settings, and permissions',
    permissions: ['All Permissions'],
    usersCount: 2,
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300'
  },
  {
    id: 2,
    name: 'Moderator',
    description: 'Restricted access for daily content moderation and catalog approval',
    permissions: ['Admin Panel', 'Slider', 'Homepage Manager', 'Products', 'Categories', 'Custom Fields', 'Reviews', 'Comments', 'Abuse Reports', 'Preferences'],
    usersCount: 1,
    badgeColor: 'bg-purple-100 text-purple-800 border-purple-300'
  },
  {
    id: 3,
    name: 'Vendor',
    description: 'Store operator access for uploading items and managing store orders',
    permissions: ['Vendor Storefront', 'Product Upload', 'Order Fulfillment', 'AI Writer'],
    usersCount: 2,
    badgeColor: 'bg-blue-100 text-blue-800 border-blue-300'
  },
  {
    id: 4,
    name: 'Member',
    description: 'Standard consumer buyer access for browsing, purchasing, and reviewing',
    permissions: ['Storefront Browsing', 'Order History', 'Wishlist', 'Chat Messages'],
    usersCount: 14,
    badgeColor: 'bg-slate-100 text-slate-800 border-slate-300'
  },
];

export const adminPages = [
  { id: 1, title: 'About Modesy', slug: 'about-us', location: 'Footer & Header', status: 'Active', date: '2026-08-01' },
  { id: 2, title: 'Terms & Conditions', slug: 'terms-conditions', location: 'Footer', status: 'Active', date: '2026-08-01' },
  { id: 3, title: 'Privacy Policy', slug: 'privacy-policy', location: 'Footer', status: 'Active', date: '2026-08-01' },
  { id: 4, title: 'Help & FAQ Center', slug: 'help-faq', location: 'Top Bar & Footer', status: 'Active', date: '2026-08-05' },
  { id: 5, title: 'Contact Us', slug: 'contact', location: 'Top Bar & Footer', status: 'Active', date: '2026-08-05' },
  { id: 6, title: 'Seller Community Guidelines', slug: 'seller-guidelines', location: 'Footer', status: 'Active', date: '2026-08-10' },
];

export const adminSellerBalances = [
  { id: 1, seller: 'Toko Elektronik Jaya', totalSales: 28500000, balance: 4120000, pendingPayout: 1450000, commissionRate: '10%' },
  { id: 2, seller: 'Fashion Store ID', totalSales: 34100000, balance: 3650000, pendingPayout: 890000, commissionRate: '10%' },
  { id: 3, seller: 'Trendshop', totalSales: 19800000, balance: 2150000, pendingPayout: 2150000, commissionRate: '10%' },
  { id: 4, seller: 'Studio Digital Pro', totalSales: 8900000, balance: 1850000, pendingPayout: 0, commissionRate: '10%' },
  { id: 5, seller: 'Artisan Woodcraft', totalSales: 12400000, balance: 1450000, pendingPayout: 450000, commissionRate: '10%' },
  { id: 6, seller: 'Modern Living Hub', totalSales: 16700000, balance: 2890000, pendingPayout: 0, commissionRate: '10%' },
];

export const adminPayoutRequests = [
  { id: 1, seller: 'Trendshop', amount: 2150000, method: 'Bank Transfer (BCA)', status: 'Pending', date: '2026-10-09 09:20' },
  { id: 2, seller: 'Artisan Woodcraft', amount: 450000, method: 'Bank Transfer (Mandiri)', status: 'Pending', date: '2026-10-09 16:05' },
  { id: 3, seller: 'Toko Elektronik Jaya', amount: 1450000, method: 'Bank Transfer (BCA)', status: 'Completed', date: '2026-10-08 10:30' },
  { id: 4, seller: 'Fashion Store ID', amount: 890000, method: 'PayPal', status: 'Completed', date: '2026-10-07 14:15' },
  { id: 5, seller: 'Studio Digital Pro', amount: 1850000, method: 'Bank Transfer (BNI)', status: 'Completed', date: '2026-09-15 10:20' },
  { id: 6, seller: 'Modern Living Hub', amount: 920000, method: 'PayPal', status: 'Rejected', date: '2026-09-10 11:40' },
];

export const adminShopRequests = [
  { id: 1, user: 'Budi Santoso', shopName: 'Budi Handicraft Studio', categories: 'Home & Living, Decor', status: 'Pending', date: '2026-10-09' },
  { id: 2, user: 'Zus Kara', shopName: 'Kara Shoes Collection', categories: 'Shoes, Footwear', status: 'Pending', date: '2026-10-08' },
  { id: 3, user: 'Caleb Prosper', shopName: 'Prosper Digital Templates', categories: 'Web Templates, Code', status: 'Approved', date: '2026-10-04' },
  { id: 4, user: 'Atukunda Didan', shopName: 'Didan Fashion Casual', categories: 'Clothing', status: 'Approved', date: '2026-10-01' },
  { id: 5, user: 'Mamat Ian', shopName: 'Mamat Spareparts', categories: 'Automotive', status: 'Rejected', date: '2026-09-26' },
];

export const adminLoginActivities = [
  { id: 1, user: 'Super Admin', ip: '127.0.0.1', device: 'Chrome on Windows 11', location: 'Jakarta, Indonesia', date: '2026-10-10 21:05' },
  { id: 2, user: 'Rina Moderator', ip: '192.168.1.18', device: 'Firefox on macOS', location: 'Surabaya, Indonesia', date: '2026-10-10 18:30' },
  { id: 3, user: 'Toko Elektronik Jaya', ip: '114.122.45.10', device: 'Edge on Windows 10', location: 'Bandung, Indonesia', date: '2026-10-10 14:12' },
  { id: 4, user: 'Budi Santoso', ip: '180.252.19.88', device: 'Safari on iPhone 15', location: 'Jakarta, Indonesia', date: '2026-10-10 09:40' },
  { id: 5, user: 'Fashion Store ID', ip: '103.28.12.90', device: 'Chrome on Windows 11', location: 'Semarang, Indonesia', date: '2026-10-09 20:15' },
  { id: 6, user: 'Zus Kara', ip: '110.137.8.4', device: 'Chrome on Android', location: 'Denpasar, Indonesia', date: '2026-10-09 16:55' },
  { id: 7, user: 'Super Admin', ip: '127.0.0.1', device: 'Chrome on Windows 11', location: 'Jakarta, Indonesia', date: '2026-10-09 08:00' },
  { id: 8, user: 'Mamat Ian', ip: '36.85.22.140', device: 'Firefox on Windows 10', location: 'Medan, Indonesia', date: '2026-10-08 19:20' },
];

export const adminDeletionRequests = [
  { id: 1, user: 'AkunTesLama', reason: 'Sudah tidak menggunakan platform dan ingin menghapus data pribadi', status: 'Pending', date: '2026-10-08' },
  { id: 2, user: 'UserInaktif2025', reason: 'Pindah ke platform lain dan ingin menutup akun', status: 'Pending', date: '2026-10-07' },
  { id: 3, user: 'BudiBuyerDuplicate', reason: 'Terbuat akun ganda secara tidak sengaja', status: 'Approved', date: '2026-09-28' },
  { id: 4, user: 'TestSpamAcc', reason: 'Pelanggaran keamanan terdeteksi', status: 'Approved', date: '2026-09-15' },
];

export const adminSupportTickets = [
  { id: 1042, user: 'Toko Elektronik Jaya', subject: 'Integrasi kurir J&T gagal saat generate waybill', priority: 'High', status: 'Open', date: '2026-10-10' },
  { id: 1041, user: 'Budi Santoso', subject: 'Saldo dompet belum bertambah setelah top-up VA BCA', priority: 'Urgent', status: 'In Progress', date: '2026-10-09' },
  { id: 1040, user: 'Fashion Store ID', subject: 'Pertanyaan perhitungan komisi promosi diskon', priority: 'Medium', status: 'Resolved', date: '2026-10-08' },
  { id: 1039, user: 'Zus Kara', subject: 'Kendala download invoice resmi pembayaran', priority: 'Low', status: 'Closed', date: '2026-10-06' },
  { id: 1038, user: 'Mamat Ian', subject: 'Laporan notifikasi chat lambat diterima pada mobile', priority: 'Medium', status: 'Resolved', date: '2026-10-04' },
  { id: 1037, user: 'Atukunda Didan', subject: 'Konfirmasi pergantian rekening bank terdaftar', priority: 'High', status: 'Resolved', date: '2026-10-01' },
];

export const adminKnowledgeBase = [
  { id: 1, title: 'Panduan Lengkap Pendaftaran Vendor dan Buka Toko', category: 'Vendor Onboarding', views: 3240, status: 'Published' },
  { id: 2, title: 'Cara Menghubungkan Gateway Pembayaran Midtrans & Stripe', category: 'Payment Setup', views: 2150, status: 'Published' },
  { id: 3, title: 'Kebijakan Pengembalian Dana (Refund) dan Resolusi Sengketa', category: 'Buyer Protection', views: 1890, status: 'Published' },
  { id: 4, title: 'Mengatur Biaya Pengiriman dan Ekspedisi Logistik', category: 'Shipping & Delivery', views: 1460, status: 'Published' },
  { id: 5, title: 'Panduan Lisensi Produk Digital dan Format File Unduhan', category: 'Digital Products', views: 980, status: 'Published' },
  { id: 6, title: 'Cara Mengajukan Penarikan Saldo (Payout) Mingguan', category: 'Seller Payout', views: 1720, status: 'Published' },
  { id: 7, title: 'Tips Menulis Judul dan Deskripsi SEO-Friendly untuk Produk', category: 'Marketing', views: 1110, status: 'Published' },
  { id: 8, title: 'Pengaturan Keamanan Akun dan Verifikasi Dua Langkah', category: 'Account Security', views: 840, status: 'Published' },
];

export const adminBankTransferReports = [
  { id: 1, user: 'Mamat Ian', amount: 750000, bank: 'BCA (014-9821-22)', receipt: '/receipts/transfer_1.jpg', status: 'Pending', date: '2026-10-08 11:05' },
  { id: 2, user: 'Budi Santoso', amount: 180000, bank: 'Mandiri (133-00-9812)', receipt: '/receipts/transfer_2.jpg', status: 'Pending', date: '2026-10-04 12:18' },
  { id: 3, user: 'Zus Kara', amount: 320000, bank: 'BNI (029-8472-10)', receipt: '/receipts/transfer_3.jpg', status: 'Approved', date: '2026-09-29 15:40' },
  { id: 4, user: 'Caleb Prosper', amount: 500000, bank: 'BCA (014-7711-30)', receipt: '/receipts/transfer_4.jpg', status: 'Approved', date: '2026-09-22 09:14' },
  { id: 5, user: 'Test User', amount: 95000, bank: 'BRI (002-1928-44)', receipt: '/receipts/transfer_5.jpg', status: 'Rejected', date: '2026-09-18 16:50' },
];

export const adminWalletDeposits = [
  { id: 1, paymentId: 'DEP-9021', method: 'Bank Transfer (BCA)', amount: 500000, status: 'Completed', user: 'Budi Santoso', ip: '192.168.1.10', date: '2026-10-09 14:10' },
  { id: 2, paymentId: 'DEP-9020', method: 'Midtrans QRIS', amount: 250000, status: 'Completed', user: 'Zus Kara', ip: '10.0.0.15', date: '2026-10-08 18:22' },
  { id: 3, paymentId: 'DEP-9019', method: 'Stripe', amount: 1000000, status: 'Completed', user: 'Mamat Ian', ip: '172.16.0.4', date: '2026-10-07 10:15' },
  { id: 4, paymentId: 'DEP-9018', method: 'PayPal', amount: 300000, status: 'Completed', user: 'Caleb Prosper', ip: '192.168.1.44', date: '2026-10-05 16:30' },
  { id: 5, paymentId: 'DEP-9017', method: 'Bank Transfer (Mandiri)', amount: 750000, status: 'Completed', user: 'Atukunda Didan', ip: '192.168.1.20', date: '2026-10-04 11:45' },
  { id: 6, paymentId: 'DEP-9016', method: 'Midtrans QRIS', amount: 150000, status: 'Completed', user: 'Test User', ip: '10.0.0.8', date: '2026-10-03 09:20' },
  { id: 7, paymentId: 'DEP-9015', method: 'Stripe', amount: 450000, status: 'Completed', user: 'Budi Santoso', ip: '192.168.1.10', date: '2026-10-01 13:50' },
  { id: 8, paymentId: 'DEP-9014', method: 'Bank Transfer (BCA)', amount: 200000, status: 'Completed', user: 'Zus Kara', ip: '10.0.0.15', date: '2026-09-28 17:10' },
];

export const adminPromotionPayments = [
  { id: 1, paymentId: 'PRM-501', method: 'Stripe', amount: 75000, status: 'Completed', user: 'Fashion Store ID', promotion: '7 Days Featured Badge', date: '2026-10-09 12:00' },
  { id: 2, paymentId: 'PRM-502', method: 'Wallet Balance', amount: 120000, status: 'Completed', user: 'Toko Elektronik Jaya', promotion: '14 Days Homepage Carousel', date: '2026-10-08 15:30' },
  { id: 3, paymentId: 'PRM-503', method: 'PayPal', amount: 50000, status: 'Completed', user: 'Trendshop', promotion: '5 Days Category Spotlight', date: '2026-10-07 11:20' },
  { id: 4, paymentId: 'PRM-504', method: 'Midtrans', amount: 200000, status: 'Completed', user: 'Studio Digital Pro', promotion: '30 Days Top Search Ranking', date: '2026-10-06 09:45' },
  { id: 5, paymentId: 'PRM-505', method: 'Wallet Balance', amount: 75000, status: 'Completed', user: 'Fashion Store ID', promotion: '7 Days Featured Badge', date: '2026-10-04 16:15' },
  { id: 6, paymentId: 'PRM-506', method: 'Stripe', amount: 120000, status: 'Completed', user: 'Trendshop', promotion: '14 Days Homepage Carousel', date: '2026-10-02 14:00' },
];

export const adminMembershipPayments = adminPayments;

// ==========================================
// DASHBOARD STATS & RECENT DATA (BUYER & SELLER)
// ==========================================

export const sellerStats = {
  products: 10,
  sales: 25,
  balance: 5000000,
  views: 1200,
};

export const buyerStats = {
  orders: 5,
  wishlist: 12,
  messages: 3,
  reviews: 8,
};

export const sellerSales = [
  {
    id: 10040,
    orderNumber: "#10040",
    customer: "Caleb Prosper",
    product: "Cobalt man t-shirt all colors",
    total: 450000,
    status: "Processing",
    paymentStatus: "Pending Payment",
    date: "2026-09-29 / 12:00",
  },
  {
    id: 10039,
    orderNumber: "#10039",
    customer: "Budi Santoso",
    product: "Black bag over the shoulder",
    total: 180000,
    status: "Processing",
    paymentStatus: "Pending Payment",
    date: "2026-09-29 / 00:34",
  },
  {
    id: 10038,
    orderNumber: "#10038",
    customer: "Zus Kara",
    product: "Floral women sundress",
    total: 620000,
    status: "Processing",
    paymentStatus: "Pending Payment",
    date: "2026-09-28 / 22:48",
  },
  {
    id: 10037,
    orderNumber: "#10037",
    customer: "Trendshop",
    product: "Women ankle boot with different colors",
    total: 350000,
    status: "Processing",
    paymentStatus: "Pending Payment",
    date: "2026-09-28 / 15:39",
  },
  {
    id: 10036,
    orderNumber: "#10036",
    customer: "Atukunda Didan",
    product: "Modern grey couch and pillows",
    total: 950000,
    status: "Processing",
    paymentStatus: "Pending Payment",
    date: "2026-09-28 / 06:49",
  },
  {
    id: 10034,
    orderNumber: "#10034",
    customer: "Mamat Ian",
    product: "Handcrafted decorative pillow",
    total: 290000,
    status: "Processing",
    paymentStatus: "Pending Payment",
    date: "2026-09-25 / 06:11",
  },
  {
    id: 10033,
    orderNumber: "#10033",
    customer: "Rina Moderator",
    product: "Women kipling bailey saddle handbag",
    total: 540000,
    status: "Completed",
    paymentStatus: "Payment Received",
    date: "2026-09-24 / 14:20",
  },
  {
    id: 10032,
    orderNumber: "#10032",
    customer: "Siti Rahma",
    product: "Men's sport shoe sneakers",
    total: 420000,
    status: "Completed",
    paymentStatus: "Payment Received",
    date: "2026-09-22 / 10:15",
  },
  {
    id: 10031,
    orderNumber: "#10031",
    customer: "Dewi Lestari",
    product: "Cute handmade brooch pin",
    total: 85000,
    status: "Cancelled",
    paymentStatus: "Refunded",
    date: "2026-09-20 / 18:05",
  },
  {
    id: 10030,
    orderNumber: "#10030",
    customer: "Ahmad Fauzi",
    product: "Wireless Noise Cancelling Earbuds",
    total: 750000,
    status: "Completed",
    paymentStatus: "Payment Received",
    date: "2026-09-19 / 09:40",
  },
];

export const buyerOrders = [
  {
    id: 10040,
    orderNumber: "#10040",
    seller: "Fashion Store ID",
    product: "Cobalt man t-shirt all colors",
    total: 450000,
    status: "Processing",
    paymentStatus: "Pending Payment",
    date: "2026-09-29 / 12:00",
  },
  {
    id: 10035,
    orderNumber: "#10035",
    seller: "Toko Elektronik Jaya",
    product: "Mechanical Keyboard RGB",
    total: 850000,
    status: "Shipped",
    paymentStatus: "Payment Received",
    date: "2026-09-26 / 15:10",
  },
  {
    id: 10028,
    orderNumber: "#10028",
    seller: "Studio Living Pro",
    product: "Aroma Diffuser Ultrasonic",
    total: 275000,
    status: "Completed",
    paymentStatus: "Payment Received",
    date: "2026-09-21 / 11:30",
  },
  {
    id: 10022,
    orderNumber: "#10022",
    seller: "Artisan Woodworks",
    product: "Wooden Coffee Cup Coaster Set",
    total: 120000,
    status: "Completed",
    paymentStatus: "Payment Received",
    date: "2026-09-18 / 09:45",
  },
  {
    id: 10015,
    orderNumber: "#10015",
    seller: "Urban Shoes Official",
    product: "Classic Canvas High Tops",
    total: 499000,
    status: "Completed",
    paymentStatus: "Payment Received",
    date: "2026-09-12 / 16:20",
  },
  {
    id: 10009,
    orderNumber: "#10009",
    seller: "Digital Asset Store",
    product: "Portfolio Web Template HTML",
    total: 150000,
    status: "Completed",
    paymentStatus: "Payment Received",
    date: "2026-09-08 / 14:00",
  },
  {
    id: 10004,
    orderNumber: "#10004",
    seller: "Fashion Store ID",
    product: "Linen Casual Shirt Summer",
    total: 310000,
    status: "Cancelled",
    paymentStatus: "Refunded",
    date: "2026-09-02 / 10:15",
  },
  {
    id: 9998,
    orderNumber: "#9998",
    seller: "Gourmet Coffee Roasters",
    product: "Arabica Gayo Single Origin 250g",
    total: 95000,
    status: "Completed",
    paymentStatus: "Payment Received",
    date: "2026-08-28 / 13:40",
  },
  {
    id: 9992,
    orderNumber: "#9992",
    seller: "Toko Elektronik Jaya",
    product: "USB-C Fast Charging Hub",
    total: 220000,
    status: "Completed",
    paymentStatus: "Payment Received",
    date: "2026-08-20 / 08:50",
  },
  {
    id: 9985,
    orderNumber: "#9985",
    seller: "Green Garden Store",
    product: "Succulent Plant Set of 3",
    total: 135000,
    status: "Completed",
    paymentStatus: "Payment Received",
    date: "2026-08-14 / 17:05",
  },
];

export const dashboardReviews = [
  {
    id: 6,
    user: "Trendshop",
    rating: 5,
    comment:
      "The material feels durable, and the design is sleek enough to match both casual and formal outfits. It has plenty of space inside without being too bulky, and the strap is comfortable for carrying all day.",
    product: "Black bag over the shoulder",
    date: "2026-08-05 / 13:55",
  },
  {
    id: 5,
    user: "Trendshop",
    rating: 4,
    comment:
      "The floral women sundress is really pretty and perfect for summer. The fabric feels light and comfortable, and the floral design is elegant. The fit is nice, though it runs just a little bit larger than expected. Overall, it's a lovely dress that looks great for casual outings or vacations.",
    product: "Floral women sundress",
    date: "2026-08-05 / 13:55",
  },
];

export const dashboardComments = [
  {
    id: 1,
    comment: "Does this come with warranty included?",
    product: "Wireless Noise Cancelling Earbuds",
    date: "2026-09-28 / 10:15",
  },
  {
    id: 2,
    comment: "Can I get this in custom Navy Blue color?",
    product: "Cobalt man t-shirt all colors",
    date: "2026-09-27 / 14:40",
  },
];

// ==========================================
// SELLER PRODUCTS (10 BARIS)
// ==========================================

export const sellerProducts = [
  {
    id: 46,
    title: "Women's ankle boot with different colors",
    sku: "WIA2B3D4C5R6",
    productType: "Physical",
    category: "Boots",
    plan: null,
    price: 890000,
    stock: 500,
    stockStatus: "In Stock (500)",
    status: "active",
    pageViews: 143,
    date: "2026-07-31 / 19:33",
    image: "https://picsum.photos/seed/boot46/150/150",
    badge: null,
  },
  {
    id: 44,
    title: "Modern grey couch and pillows",
    sku: "MIG2C3P4S5L6",
    productType: "Physical",
    category: "Living Room Furniture",
    plan: null,
    price: 4500000,
    stock: 12,
    stockStatus: "Active",
    status: "active",
    pageViews: 177,
    date: "2026-07-31 / 19:23",
    image: "https://picsum.photos/seed/couch44/150/150",
    badge: null,
  },
  {
    id: 42,
    title: "Handcrafted decorative pillow for a luxurious touch",
    sku: "HID2P3L4T5X6",
    productType: "Physical",
    category: "Decorative Pillows",
    plan: "Monthly Plan (270 Days)",
    price: 320000,
    stock: 493,
    stockStatus: "In Stock (493)",
    status: "active",
    pageViews: 223,
    date: "2026-07-31 / 19:16",
    image: "https://picsum.photos/seed/pillow42/150/150",
    badge: "Featured",
    discountBadge: "10%",
  },
  {
    id: 40,
    title: "Women kipling bailey saddle handbag",
    sku: "WIK2B3S4H5G6",
    productType: "Physical",
    category: "Handbags",
    plan: "Monthly Plan (270 Days)",
    price: 890000,
    stock: 500,
    stockStatus: "In Stock (500)",
    status: "active",
    pageViews: 190,
    date: "2026-07-31 / 18:57",
    image: "https://picsum.photos/seed/handbag40/150/150",
    badge: "Featured",
  },
  {
    id: 38,
    title: "Floral women sundress",
    sku: "FIW2S3D4R5S6",
    productType: "Physical",
    category: "Dresses",
    plan: "Monthly Plan (270 Days)",
    price: 620000,
    stock: 1000,
    stockStatus: "In Stock (1000)",
    status: "active",
    pageViews: 381,
    date: "2026-07-31 / 18:29",
    image: "https://picsum.photos/seed/sundress38/150/150",
    badge: "Featured",
    discountBadge: "15%",
  },
  {
    id: 36,
    title: "Ship illustration royalty free image",
    sku: "S1I2R3F4I5M6",
    productType: "Digital",
    category: "Vectors",
    plan: null,
    price: 225000,
    stock: 999,
    stockStatus: "In Stock",
    status: "pending",
    pageViews: 138,
    date: "2026-07-31 / 18:21",
    image: "https://picsum.photos/seed/ship36/150/150",
    badge: null,
  },
  {
    id: 34,
    title: "Men's lace formal casual fashion shoe",
    sku: "MIL2F3C4F5S6",
    productType: "Physical",
    category: "Boots",
    plan: null,
    price: 890000,
    stock: 25,
    stockStatus: "Active",
    status: "hidden",
    pageViews: 96,
    date: "2026-07-31 / 18:07",
    image: "https://picsum.photos/seed/shoe34/150/150",
    badge: null,
  },
  {
    id: 31,
    title: "Car Race Pro License Keys",
    sku: "C1R2P3L4K5Y6",
    productType: "Digital",
    category: "Video Games",
    plan: null,
    price: 290000,
    stock: 0,
    stockStatus: "In Stock",
    status: "sold",
    pageViews: 136,
    date: "2026-07-31 / 15:14",
    image: "https://picsum.photos/seed/carrace31/150/150",
    badge: null,
  },
  {
    id: 29,
    title: "Futuristic landscape animation",
    sku: "HSTY252A2",
    productType: "Digital",
    category: "Video Overlays & Elements",
    plan: null,
    price: 270000,
    stock: 10,
    stockStatus: "Draft",
    status: "drafts",
    pageViews: 86,
    date: "2026-07-31 / 14:59",
    image: "https://picsum.photos/seed/future29/150/150",
    badge: null,
  },
  {
    id: 27,
    title: "Men's sport shoe",
    sku: "MIS2S3H4O5E6",
    productType: "Physical",
    category: "Sneakers",
    plan: null,
    price: 680000,
    stock: 500,
    stockStatus: "In Stock (500)",
    status: "active",
    pageViews: 100,
    date: "2026-07-31 / 14:45",
    image: "https://picsum.photos/seed/sneaker27/150/150",
    badge: null,
    discountBadge: "20%",
  },
];

// ==========================================
// COUPONS (5 BARIS)
// ==========================================

export const coupons = [
  {
    id: 1,
    code: "P6PG5GLS",
    discountRate: "10%",
    numberOfCoupons: 500,
    usedCount: 0,
    expiryDate: "2027-04-16 / 15:01",
    status: "Active",
    date: "2026-08-06 / 14:01",
    products: "Select Products",
  },
  {
    id: 2,
    code: "SUMMER25",
    discountRate: "25%",
    numberOfCoupons: 200,
    usedCount: 42,
    expiryDate: "2026-12-31 / 23:59",
    status: "Active",
    date: "2026-07-01 / 10:00",
    products: "All Products",
  },
  {
    id: 3,
    code: "WELCOME15",
    discountRate: "15%",
    numberOfCoupons: 1000,
    usedCount: 156,
    expiryDate: "2027-01-01 / 00:00",
    status: "Active",
    date: "2026-06-15 / 09:30",
    products: "All Products",
  },
  {
    id: 4,
    code: "FLASH50",
    discountRate: "50%",
    numberOfCoupons: 50,
    usedCount: 50,
    expiryDate: "2026-09-01 / 12:00",
    status: "Expired",
    date: "2026-08-25 / 11:20",
    products: "Select Products",
  },
  {
    id: 5,
    code: "VIPMEMBER",
    discountRate: "20%",
    numberOfCoupons: 300,
    usedCount: 18,
    expiryDate: "2027-06-30 / 18:00",
    status: "Active",
    date: "2026-08-10 / 16:45",
    products: "Select Products",
  },
];

// ==========================================
// SHOP SETTINGS (OBJEK)
// ==========================================

export const shopSettings = {
  shopName: "Admin",
  shopDescription:
    "We offer a wide variety of products ranging from everyday essentials to specialty items, all carefully selected to meet your needs and exceed your expectations.",
  showWhatsApp: true,
  whatsAppNumber: "123",
  rssFeeds: true,
  fixedVatAllCountries: false,
  vacationMode: false,
  vacationMessage:
    "Dear Customers,\n\nThis vendor is currently on vacation and is not available to process orders or respond to messages. They will return on [return date]. We apologize for any inconvenience this may cause and appreciate your understanding.\n\nThank you for your patience and continued support.\nBest regards,",
  vatLocations: [
    { country: "Afghanistan", rate: 0 },
    { country: "Afghanistan/Badakhshan", rate: 0 },
    { country: "Afghanistan/Badghis", rate: 0 },
    { country: "Afghanistan/Baghlan", rate: 0 },
    { country: "Afghanistan/Balkh", rate: 0 },
    { country: "Afghanistan/Bamyan", rate: 0 },
    { country: "Afghanistan/Daykundi", rate: 0 },
    { country: "Afghanistan/Farah", rate: 0 },
    { country: "Afghanistan/Faryab", rate: 0 },
    { country: "Afghanistan/Ghazni", rate: 0 },
  ],
};

// ==========================================
// SHIPPING SETTINGS
// ==========================================

export const shippingSettingsData = {
  zones: [
    {
      id: 1,
      name: "International",
      regions: ["Europe", "Asia", "Africa", "South America"],
      methods: "Free Shipping, Flat Rate",
    },
    {
      id: 2,
      name: "Domestic",
      regions: ["North America/United States"],
      methods: "Free Shipping, Local Pickup, Flat Rate",
    },
  ],
  deliveryTimes: [
    { id: 1, option: "Ready to ship in 8-15 Business Days" },
    { id: 2, option: "Ready to ship in 4-7 Business Days" },
    { id: 3, option: "Ready to ship in 2-3 Business Days" },
    { id: 4, option: "Ready to ship in 1 Business Day" },
  ],
};

// ==========================================
// USER PROFILES
// ==========================================

export const userProfiles = [
  {
    id: "1",
    username: "daniel-jones",
    full_name: "Daniel Jones",
    shop_name: "Trendshop",
    avatar_url: "https://picsum.photos/seed/avatar-daniel/200/200",
    banner_url: "https://picsum.photos/seed/banner-daniel/1600/500",
    role: "vendor",
    verified: true,
    lastSeen: "21 hours ago",
    rating: 5,
    reviewCount: 6,
    salesCount: 15,
    bio: "Welcome to our store! We offer a wide range of high-quality products to meet all your needs, from the latest electronics and gadgets to stylish clothing and accessories.",
    location: "Jakarta, Indonesia",
    joined: "2026-07-15",
    email: "trendshop@codingest.net",
    stats: {
      products: 24,
      followers: 1,
      following: 0,
      reviews: 6,
    },
  },
  {
    id: "2",
    username: "budi-santoso",
    full_name: "Budi Santoso",
    shop_name: null,
    avatar_url: "https://picsum.photos/seed/avatar-budi/200/200",
    banner_url: "https://picsum.photos/seed/banner-budi/1600/500",
    role: "member",
    verified: false,
    lastSeen: "2 hours ago",
    rating: 0,
    reviewCount: 0,
    salesCount: 0,
    bio: "Pembeli setia. Suka cari barang unik.",
    location: "Surabaya, Indonesia",
    joined: "2026-08-15",
    email: "budi@email.com",
    stats: { products: 0, followers: 0, following: 5, reviews: 0 },
  },
  {
    id: "3",
    username: "admin",
    full_name: "Admin",
    shop_name: "Modesy Official",
    avatar_url: "https://picsum.photos/seed/avatar-admin/200/200",
    banner_url: "https://picsum.photos/seed/banner-admin/1600/500",
    role: "admin",
    verified: true,
    lastSeen: "Online",
    rating: 4.8,
    reviewCount: 120,
    salesCount: 150,
    bio: "Official Modesy store.",
    location: "Jakarta",
    joined: "2026-01-01",
    email: "admin@codingest.net",
    stats: { products: 23, followers: 10, following: 2, reviews: 120 },
  },
];

// ==========================================
// PROFILE PRODUCTS (12 BARIS)
// ==========================================

export const profileProducts = [
  {
    id: "1",
    slug: "handcrafted-decorative-pillow-for-a-luxurious-touch",
    title: "Handcrafted decorative pillow for a luxurious touch",
    image: "https://picsum.photos/seed/pillow/400/400",
    price: 55,
    oldPrice: 69,
    featured: true,
    seller: "Admin",
    rating: 0,
    reviewCount: 0,
    listingType: "sale",
  },
  {
    id: "2",
    slug: "women-kipiling-bally-saddle-handbag",
    title: "Women kipiling bally saddle handbag",
    image: "https://picsum.photos/seed/bag/400/400",
    price: 59,
    oldPrice: 69,
    featured: true,
    seller: "Admin",
    rating: 0,
    reviewCount: 0,
    listingType: "sale",
  },
  {
    id: "3",
    slug: "floral-women-sundress",
    title: "Floral women sundress",
    image: "https://picsum.photos/seed/dress/400/400",
    price: 89,
    featured: true,
    seller: "Admin",
    rating: 4.5,
    reviewCount: 2,
    listingType: "sale",
  },
  {
    id: "4",
    slug: "adorable-animals-photo-pack",
    title: "Adorable animals photo pack",
    image: "https://picsum.photos/seed/dog/400/400",
    price: 0,
    free: true,
    featured: true,
    seller: "Admin",
    rating: 0,
    reviewCount: 0,
    listingType: "free",
  },
  {
    id: "5",
    slug: "summer-mint-light-maxi-skirt",
    title: "Summer mint light maxi skirt",
    image: "https://picsum.photos/seed/skirt/400/400",
    price: 68,
    featured: true,
    seller: "Admin",
    rating: 0,
    reviewCount: 0,
    listingType: "sale",
  },
  {
    id: "6",
    slug: "master-of-oil-painting-prints-and-canvas",
    title: "Master of oil painting prints and canvas",
    image: "https://picsum.photos/seed/paint/400/400",
    price: 110,
    oldPrice: 135,
    featured: true,
    seller: "Admin",
    rating: 0,
    reviewCount: 0,
    listingType: "sale",
  },
  {
    id: "7",
    slug: "handwoven-straw-round-basket-bag",
    title: "Handwoven straw round basket bag",
    image: "https://picsum.photos/seed/strawbag/400/400",
    price: 49,
    oldPrice: 60,
    featured: true,
    seller: "Admin",
    rating: 0,
    reviewCount: 0,
    listingType: "sale",
  },
  {
    id: "8",
    slug: "customized-oversized-olive-t-shirt",
    title: "Customized oversized olive t-shirt",
    image: "https://picsum.photos/seed/tshirt/400/400",
    price: 0,
    isQuote: true,
    featured: true,
    seller: "Admin",
    rating: 0,
    reviewCount: 0,
    listingType: "quote",
  },
  {
    id: "9",
    slug: "women-ankle-suede-boots-with-side-zipper",
    title: "Women ankle suede boots with side zipper",
    image: "https://picsum.photos/seed/boots/400/400",
    price: 89,
    oldPrice: 110,
    featured: false,
    seller: "Admin",
    rating: 0,
    reviewCount: 0,
    listingType: "sale",
  },
  {
    id: "10",
    slug: "modern-grey-couch-and-pillows-set",
    title: "Modern grey couch and pillows set",
    image: "https://picsum.photos/seed/couch/400/400",
    price: 299,
    featured: false,
    seller: "Admin",
    rating: 0,
    reviewCount: 0,
    listingType: "sale",
  },
  {
    id: "11",
    slug: "ship-illustration-royalty-free-image-vector",
    title: "Ship illustration royalty free image vector",
    image: "https://picsum.photos/seed/shipvec/400/400",
    price: 15,
    oldPrice: 25,
    featured: false,
    seller: "Admin",
    rating: 0,
    reviewCount: 0,
    listingType: "sale",
  },
  {
    id: "12",
    slug: "men-formal-classic-lace-oxford-shoes",
    title: "Men formal classic lace oxford shoes",
    image: "https://picsum.photos/seed/oxford/400/400",
    price: 79,
    featured: false,
    seller: "Admin",
    rating: 0,
    reviewCount: 0,
    listingType: "sale",
  },
];

// ==========================================
// PROFILE REVIEWS (5 BARIS)
// ==========================================

export const profileReviews = [
  {
    id: "1",
    reviewer: "Budi Santoso",
    reviewerUsername: "budi-santoso",
    avatar: "https://picsum.photos/seed/budi/100/100",
    rating: 5,
    comment: "Produk bagus, pengiriman cepat!",
    date: "2026-09-20",
  },
  {
    id: "2",
    reviewer: "Siti Rahma",
    reviewerUsername: "siti-rahma",
    avatar: "https://picsum.photos/seed/siti/100/100",
    rating: 5,
    comment: "Kualitas bantal dan jahitannya rapi sekali. Sesuai dengan foto!",
    date: "2026-09-14",
  },
  {
    id: "3",
    reviewer: "Michael Wong",
    reviewerUsername: "michael-wong",
    avatar: "https://picsum.photos/seed/michael/100/100",
    rating: 4,
    comment: "Tas kipling bahannya tebal dan water resistant, hanya pengiriman sedikit terlambat.",
    date: "2026-08-30",
  },
  {
    id: "4",
    reviewer: "Dewi Lestari",
    reviewerUsername: "dewi-lestari",
    avatar: "https://picsum.photos/seed/dewi/100/100",
    rating: 5,
    comment: "Dress bunganya cantik dan bahannya adem untuk liburan musim panas. Sangat puas!",
    date: "2026-08-25",
  },
  {
    id: "5",
    reviewer: "Ahmad Rizky",
    reviewerUsername: "ahmad-rizky",
    avatar: "https://picsum.photos/seed/ahmad/100/100",
    rating: 4,
    comment: "File digital langsung bisa diunduh dengan resolusi tinggi, mantap!",
    date: "2026-08-11",
  },
];

export const followers = [
  { id: '1', username: 'budi-santoso', full_name: 'Budi Santoso', avatar: 'https://picsum.photos/seed/budi/100/100', role: 'member' },
  { id: '2', username: 'siti-rahma', full_name: 'Siti Rahma', avatar: 'https://picsum.photos/seed/siti/100/100', role: 'member' },
  { id: '3', username: 'michael-wong', full_name: 'Michael Wong', avatar: 'https://picsum.photos/seed/michael/100/100', role: 'vendor' },
  { id: '4', username: 'dewi-lestari', full_name: 'Dewi Lestari', avatar: 'https://picsum.photos/seed/dewi/100/100', role: 'member' },
];

export const following = [
  { id: '1', username: 'admin', full_name: 'Admin Modesy', avatar: 'https://picsum.photos/seed/avatar-admin/200/200', role: 'admin' },
  { id: '2', username: 'daniel-jones', full_name: 'Daniel Jones (Trendshop)', avatar: 'https://picsum.photos/seed/avatar-daniel/200/200', role: 'vendor' },
  { id: '3', username: 'budi-santoso', full_name: 'Budi Santoso', avatar: 'https://picsum.photos/seed/budi/100/100', role: 'member' },
  { id: '4', username: 'ahmad-rizky', full_name: 'Ahmad Rizky', avatar: 'https://picsum.photos/seed/ahmad/100/100', role: 'vendor' },
];

// ==========================================
// RATING BREAKDOWN
// ==========================================

export const ratingBreakdown = { 5: 80, 4: 15, 3: 3, 2: 1, 1: 1 };

// ==========================================
// WALLET MOCK DATA
// ==========================================

export const walletBalance = 1130.85;

export const earningsData = [
  { 
    id: '1', 
    order: '#10033', 
    total: 80, 
    vat: 0, 
    commission: 12,
    commissionPercent: 15,
    referrerCommission: 0,
    referrerPercent: 0,
    referralDiscount: 0,
    referralPercent: 0,
    discountCoupon: 0,
    shippingCost: 0, 
    earnedAmount: 68, 
    date: '2026-10-04 / 20:20' 
  },
  { 
    id: '2', 
    order: '#10033', 
    total: 15, 
    vat: 0, 
    commission: 0.75,
    commissionPercent: 5,
    referrerCommission: 0,
    referrerPercent: 0,
    referralDiscount: 0,
    referralPercent: 0,
    discountCoupon: 0,
    shippingCost: 0, 
    earnedAmount: 14.25, 
    date: '2026-09-23 / 17:23' 
  },
  { 
    id: '3', 
    order: '#10010', 
    total: 59, 
    vat: 0, 
    commission: 5.90,
    commissionPercent: 10,
    referrerCommission: 0,
    referrerPercent: 0,
    referralDiscount: 0,
    referralPercent: 0,
    discountCoupon: 0,
    shippingCost: 0, 
    earnedAmount: 53.10, 
    date: '2026-09-16 / 10:12' 
  },
  { 
    id: '4', 
    order: '#10011', 
    total: 49, 
    vat: 0, 
    commission: 2.45,
    commissionPercent: 5,
    referrerCommission: 0,
    referrerPercent: 0,
    referralDiscount: 0,
    referralPercent: 0,
    discountCoupon: 0,
    shippingCost: 0, 
    earnedAmount: 46.55, 
    date: '2026-09-16 / 10:12' 
  },
  { 
    id: '5', 
    order: '#10010', 
    total: 19, 
    vat: 0, 
    commission: 0.95,
    commissionPercent: 5,
    referrerCommission: 0,
    referrerPercent: 0,
    referralDiscount: 0,
    referralPercent: 0,
    discountCoupon: 0,
    shippingCost: 0, 
    earnedAmount: 18.05, 
    date: '2026-08-31 / 17:37' 
  },
  { 
    id: '6', 
    order: '#10009', 
    total: 100, 
    vat: 0, 
    commission: 5,
    commissionPercent: 5,
    referrerCommission: 0,
    referrerPercent: 0,
    referralDiscount: 0,
    referralPercent: 0,
    discountCoupon: 0,
    shippingCost: 10, 
    earnedAmount: 105, 
    date: '2026-08-05 / 14:08' 
  },
  { 
    id: '7', 
    order: '#10006', 
    total: 160, 
    vat: 0, 
    commission: 24,
    commissionPercent: 15,
    referrerCommission: 0,
    referrerPercent: 0,
    referralDiscount: 0,
    referralPercent: 0,
    discountCoupon: 0,
    shippingCost: 10, 
    earnedAmount: 146, 
    date: '2026-08-05 / 13:48' 
  },
  { 
    id: '8', 
    order: '#10005', 
    total: 49, 
    vat: 0, 
    commission: 2.45,
    commissionPercent: 5,
    referrerCommission: 2.45,
    referrerPercent: 5,
    referralDiscount: 2.45,
    referralPercent: 5,
    discountCoupon: 0,
    shippingCost: 10, 
    earnedAmount: 51.65, 
    date: '2026-08-05 / 13:46' 
  },
  { 
    id: '9', 
    order: '#10004', 
    total: 150, 
    vat: 0, 
    commission: 22.50,
    commissionPercent: 15,
    referrerCommission: 7.50,
    referrerPercent: 5,
    referralDiscount: 7.50,
    referralPercent: 5,
    discountCoupon: 0,
    shippingCost: 10, 
    earnedAmount: 122.50, 
    date: '2026-08-05 / 13:21' 
  }
];

export const walletDeposits = [
  { id: '1', method: 'Bank Transfer', amount: 500, status: 'Completed', date: '2026-09-28' },
  { id: '2', method: 'Stripe', amount: 250, status: 'Completed', date: '2026-09-15' },
  { id: '3', method: 'PayPal', amount: 100, status: 'Completed', date: '2026-09-02' },
  { id: '4', method: 'Bank Transfer', amount: 200, status: 'Completed', date: '2026-08-20' },
  { id: '5', method: 'Stripe', amount: 150, status: 'Completed', date: '2026-08-10' },
];

export const walletExpenses = [
  { id: '1', description: 'Promotion Fee', amount: 50, date: '2026-09-25' },
  { id: '2', description: 'Featured Product Fee', amount: 25, date: '2026-09-18' },
  { id: '3', description: 'Monthly Vendor Membership', amount: 39, date: '2026-09-01' },
  { id: '4', description: 'Ad Space Banner Rental', amount: 45, date: '2026-08-22' },
  { id: '5', description: 'Promotion Fee', amount: 30, date: '2026-08-14' },
];

export const walletPayouts = [
  { id: '1', amount: 1000, method: 'Bank BCA', status: 'Pending', date: '2026-09-26' },
  { id: '2', amount: 450, method: 'PayPal', status: 'Completed', date: '2026-09-10' },
  { id: '3', amount: 300, method: 'Bank Mandiri', status: 'Completed', date: '2026-08-28' },
  { id: '4', amount: 600, method: 'Bank BCA', status: 'Completed', date: '2026-08-15' },
  { id: '5', amount: 200, method: 'PayPal', status: 'Completed', date: '2026-08-01' },
];

export const payoutAccount = {
  method: 'Bank Transfer',
  bankName: 'BCA',
  accountNumber: '1234567890',
  accountName: 'John Doe'
};

// ==========================================
// USER ORDERS, QUOTES, DOWNLOADS, REFUNDS
// ==========================================

export const userOrders = [
  { id: '1', orderNumber: '#10040', total: 138, status: 'Pending Payment', date: '2026-09-29 / 12:00' },
  { id: '2', orderNumber: '#10038', total: 381.85, status: 'Pending Payment', date: '2026-09-28 / 22:48' },
  { id: '3', orderNumber: '#10035', total: 99.30, status: 'Pending Payment', date: '2026-09-26 / 21:14' },
  { id: '4', orderNumber: '#10034', total: 256.50, status: 'Pending Payment', date: '2026-09-25 / 06:11' },
  { id: '5', orderNumber: '#10031', total: 257, status: 'Processing', date: '2026-09-23 / 02:08' },
  { id: '6', orderNumber: '#10030', total: 253.90, status: 'Pending Payment', date: '2026-09-23 / 02:04' },
  { id: '7', orderNumber: '#10029', total: 259.05, status: 'Processing', date: '2026-09-22 / 06:40' },
  { id: '8', orderNumber: '#10028', total: 61.95, status: 'Pending Payment', date: '2026-09-22 / 01:14' },
  { id: '9', orderNumber: '#10027', total: 137.25, status: 'Pending Payment', date: '2026-09-20 / 01:19' },
  { id: '10', orderNumber: '#10025', total: 149479.73, status: 'Processing', date: '2026-09-16 / 10:38' },
  { id: '11', orderNumber: '#10019', total: 182.10, status: 'Processing', date: '2026-09-09 / 11:39' },
  { id: '12', orderNumber: '#10017', total: 87, status: 'Processing', date: '2026-09-06 / 02:16' },
  { id: '13', orderNumber: '#10016', total: 84, status: 'Processing', date: '2026-09-06 / 02:15' },
  { id: '14', orderNumber: '#10015', total: 41.40, status: 'Completed', date: '2026-09-06 / 02:14' },
  { id: '15', orderNumber: '#10014', total: 8983.75, status: 'Pending Payment', date: '2026-09-04 / 08:31' }
];

export const userQuotes = [
  { id: '10', productName: 'Black gold fashion backpack', quantity: 8, status: 'New Quote Request', daysAgo: 5, image: 'https://picsum.photos/seed/backpack1/100/100' },
  { id: '8', productName: 'Black fashion women backpack', quantity: 1, status: 'New Quote Request', daysAgo: 10, image: 'https://picsum.photos/seed/backpack2/100/100' },
  { id: '4', productName: 'Black fashion women backpack', quantity: 1, status: 'Pending Quote', daysAgo: 24, bid: 8, image: 'https://picsum.photos/seed/backpack3/100/100' },
  { id: '2', productName: 'Black gold fashion backpack', quantity: 1, status: 'Pending Quote', daysAgo: 30, bid: 75000, image: 'https://picsum.photos/seed/backpack4/100/100' }
];

export const userDownloads = [
  { id: '1', productName: 'Animal colorful digital prints', seller: 'Trendshop', rating: 5, image: 'https://picsum.photos/seed/cat1/100/100' },
  { id: '2', productName: 'Animal colorful digital prints', seller: 'Trendshop', rating: 5, image: 'https://picsum.photos/seed/cat2/100/100' },
  { id: '3', productName: 'Infinite - Blog & Magazine Script', seller: 'Trendshop', rating: 0, image: 'https://picsum.photos/seed/script/100/100' },
  { id: '4', productName: 'Animation of popular vacation spots', seller: 'Trendshop', rating: 4.5, image: 'https://picsum.photos/seed/beach/100/100' },
  { id: '5', productName: 'Animal colorful digital prints', seller: 'Trendshop', rating: 5, image: 'https://picsum.photos/seed/cat3/100/100' },
  { id: '6', productName: 'Car Race Pro License Keys', seller: 'Admin', rating: 0, image: 'https://picsum.photos/seed/car/100/100' },
  { id: '7', productName: 'Motivation piano with cello and drums', seller: 'Trendshop', rating: 0, image: 'https://picsum.photos/seed/piano/100/100' },
  { id: '8', productName: 'Animation of popular vacation spots', seller: 'Trendshop', rating: 4.5, image: 'https://picsum.photos/seed/mountain/100/100' }
];

export const userRefunds = [
  { id: '1', orderNumber: '#10011', productName: 'Floral women sundress', status: 'Processing', daysAgo: 30, image: 'https://picsum.photos/seed/sundress/100/100' }
];

export const userCoupons = [
  {
    id: '1',
    shopName: 'Trendshop',
    discount: 15,
    type: 'percent',
    validUntil: '2027-03-31',
    code: '41GNOLDX',
    iconEmoji: '🌼',
    iconBg: 'bg-yellow-100'
  },
  {
    id: '2',
    shopName: 'Elektronik Jaya',
    discount: 10,
    type: 'percent',
    validUntil: '2027-01-15',
    code: 'ELEK10OFF',
    iconEmoji: '📱',
    iconBg: 'bg-blue-100'
  },
  {
    id: '3',
    shopName: 'Fashion Store ID',
    discount: 50000,
    type: 'fixed',
    validUntil: '2026-12-31',
    code: 'FASHION50K',
    iconEmoji: '👗',
    iconBg: 'bg-pink-100'
  }
];

export const brands = [
  "Adidas",
  "Armani",
  "Burberry",
  "Diesel",
  "Dockers",
  "Gucci",
  "H & M",
  "Hugo Boss",
  "Lacoste",
  "Lee Cooper",
  "Levi's",
  "Nike",
  "Puma",
  "Zara",
];
