import { HeroSection } from "@/components/home/HeroSection";
import { HomeTabs } from "@/components/home/HomeTabs";
import { SearchSection } from "@/components/home/SearchSection";

export default function Home() {
  return (
    <main className="flex-1 bg-gradient-to-b from-blue-50 via-white to-white">
      <HeroSection />
      <SearchSection />
      <div className="px-4 pb-16 sm:px-6 lg:px-8">
        <HomeTabs />
      </div>
    </main>
  );
}
