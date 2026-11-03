import { CategoryGrid } from "@/components/home/CategoryGrid";
import { ProductGrid } from "@/components/home/ProductGrid";
import { PromoBannerStrip } from "@/components/home/PromoBannerStrip";
import { TrustBadges } from "@/components/home/TrustBadges";
import { SpecialOffersSection } from "@/components/home/SpecialOffersSection";
import { TopSellersSection } from "@/components/home/TopSellersSection";
import { BlogSliderSection } from "@/components/home/BlogSliderSection";
import { NewsletterSection } from "@/components/home/NewsletterSection";

// Semua key yang bisa diatur di /admin/homepage-manager punya komponen di sini.
// Section yang datanya kosong mengembalikan null, jadi tidak ada blok hampa
// di beranda meskipun toggle-nya aktif.
export function HomeSectionRenderer({ section }) {
  const config = section.config ?? {};

  switch (section.type) {
    case "featured_products":
      return (
        <ProductGrid
          title={section.title || "Featured Products"}
          subtitle="Produk pilihan yang sedang ditonjolkan"
          featured
          limit={Number(config.limit) > 0 ? Number(config.limit) : 8}
        />
      );
    case "latest_products":
      return (
        <ProductGrid
          title={section.title || "Latest Products"}
          limit={Number(config.limit) > 0 ? Number(config.limit) : 8}
        />
      );
    case "categories_grid":
      return <CategoryGrid />;
    case "promo_banner":
      return <PromoBannerStrip />;
    case "trust_badges":
      return <TrustBadges />;
    case "special_offers":
      return <SpecialOffersSection config={config} title={section.title} />;
    case "top_sellers":
      return <TopSellersSection config={config} title={section.title} />;
    case "blog_slider":
      return <BlogSliderSection config={config} title={section.title} />;
    case "newsletter_section":
      return <NewsletterSection config={config} title={section.title} />;
    default:
      console.warn(`[homepage] section "${section.type}" belum punya komponen storefront`);
      return null;
  }
}
