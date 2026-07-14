import { Nav } from "@/components/sections/nav";
import { Aurora } from "@/components/aurora";
import { Hero } from "@/components/sections/hero";
import { HowItWorks } from "@/components/sections/how-it-works";
import { RulesFaq } from "@/components/sections/rules-faq";
import { RewardsWinners } from "@/components/sections/rewards-winners";
import { FinalCta } from "@/components/sections/final-cta";
import { StickyMobileCta } from "@/components/sections/sticky-mobile-cta";
import { Footer } from "@/components/sections/footer";

export default function Home() {
  return (
    <div className="relative flex flex-1 flex-col">
      <div className="aurora-banner pointer-events-none absolute inset-x-0 top-0 z-0 h-[320px] w-full overflow-hidden">
        <Aurora className="absolute inset-0 h-full w-full opacity-80" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-52 bg-gradient-to-b from-transparent to-background" />
      </div>
      <Nav />
      <main className="relative">
        <Hero />
        <RewardsWinners />
        <HowItWorks />
        <RulesFaq />
        <FinalCta />
        <StickyMobileCta />
      </main>
      <Footer />
    </div>
  );
}
