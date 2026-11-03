import { HeroSlider } from "@/components/home/HeroSlider";
import { CategoryGrid } from "@/components/home/CategoryGrid";
import { ProductGrid } from "@/components/home/ProductGrid";
import { PromoBannerStrip } from "@/components/home/PromoBannerStrip";
import { TrustBadges } from "@/components/home/TrustBadges";
import { PageEntrance } from "@/components/common/PageEntrance";

// Dipakai kalau app_settings:homepage_sections kosong / tidak terbaca,
// supaya beranda tidak pernah blank.
export function FallbackHome({ banners = [] }) {
  return (
    <>
      <PageEntrance>
        <HeroSlider banners={banners} />
        <CategoryGrid />
      </PageEntrance>

      <PromoBannerStrip />

      <PageEntrance delay={0.1}>
        <ProductGrid />
        <TrustBadges />
      </PageEntrance>
    </>
  );
}
