import { Nav } from "@/components/sections/nav";
import { Hero } from "@/components/sections/hero";
import { HowItWorks } from "@/components/sections/how-it-works";
import { Rules } from "@/components/sections/rules";
import { RewardsWinners } from "@/components/sections/rewards-winners";
import { Faq } from "@/components/sections/faq";
import { FinalCta } from "@/components/sections/final-cta";
import { StickyMobileCta } from "@/components/sections/sticky-mobile-cta";
import { Footer } from "@/components/sections/footer";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col pb-20 sm:pb-0">
      <Nav />
      <main>
        <Hero />
        <HowItWorks />
        <Rules />
        <RewardsWinners />
        <Faq />
        <FinalCta />
      </main>
      <StickyMobileCta />
      <Footer />
    </div>
  );
}
