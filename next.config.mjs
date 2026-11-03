/** @type {import('next').NextConfig} */
const nextConfig = {
  // Browser in-app Qoder mengakses dev server lewat IP LAN, bukan localhost.
  allowedDevOrigins: ["192.168.56.1", "192.168.1.4", "192.168.20.201", "172.28.159.3", "192.168.1.5", "192.168.20.137", "192.168.20.247", "192.168.1.7"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "picsum.photos",
      },
      {
        protocol: "https",
        hostname: "modesy.codingest.net",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "qajtworgcolbevxzewld.supabase.co",
      },
    ],
  },
};

export default nextConfig;
