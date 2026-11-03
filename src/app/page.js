import { TopBar } from "@/components/layout/TopBar";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { HeroSlider } from "@/components/home/HeroSlider";
import { PageEntrance } from "@/components/common/PageEntrance";
import { FallbackHome } from "@/components/home/FallbackHome";
import { HomeSectionRenderer } from "@/components/home/HomeSectionRenderer";
import { getBanners } from "@/lib/queries/content";
import { getHomepageSections } from "@/lib/queries/homepage";

export const revalidate = 60;

export default async function Home() {
  const [banners, sections] = await Promise.all([getBanners(), getHomepageSections()]);

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <TopBar />
      <Navbar />

      <main className="flex-1">
        {sections.length === 0 ? (
          <FallbackHome banners={banners} />
        ) : (
          <>
            <PageEntrance>
              <HeroSlider banners={banners} />
            </PageEntrance>

            {sections.map((section) => (
              <HomeSectionRenderer key={section.id} section={section} />
            ))}
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
