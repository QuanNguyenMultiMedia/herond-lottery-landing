import Link from "next/link";
import { HEROND_POINT_LINK } from "@/data/season";

const NAV_LINKS = [
  { href: "#rewards", label: "Rewards" },
  { href: "#how", label: "How it Works" },
  { href: "#rules", label: "Rules" },
  { href: "#faq", label: "FAQ" },
];

export function Nav() {
  return (
    <nav className="site-nav sticky top-0 z-30 flex flex-nowrap items-center justify-between gap-2 border-b border-border bg-background/80 px-4 py-3 backdrop-blur-xl sm:px-8">
      <div className="flex min-w-0 items-center gap-2 sm:gap-2.5">
        <video
          src="/assets/herond-icon-loop.webm"
          autoPlay
          loop
          muted
          playsInline
          className="block h-[22px] w-[22px] flex-none sm:h-[26px] sm:w-[26px]"
        />
        <span className="truncate whitespace-nowrap text-[15px] font-bold tracking-tight text-foreground sm:text-[17px]">
          Herond Point
        </span>
        <span className="hidden h-[18px] w-px flex-none bg-border min-[400px]:block" />
        <span className="hidden whitespace-nowrap text-[13px] font-medium text-muted-foreground min-[400px]:block">
          Lottery Ticket
        </span>
      </div>
      <div className="flex flex-none items-center gap-1">
        <div className="hidden items-center gap-0.5 sm:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-full px-3.5 py-1.5 text-[13px] font-medium text-muted-foreground no-underline transition-colors hover:bg-white/[0.02] hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </div>
        <Link
          href={HEROND_POINT_LINK}
          target="_blank"
          className="ml-1 whitespace-nowrap rounded-full bg-primary px-3.5 py-2 text-[12px] font-semibold text-white no-underline transition-colors hover:bg-[#4680ff] hover:text-white sm:ml-2 sm:px-5 sm:py-2.5 sm:text-[13px]"
        >
          Claim Your Ticket
        </Link>
      </div>
    </nav>
  );
}
