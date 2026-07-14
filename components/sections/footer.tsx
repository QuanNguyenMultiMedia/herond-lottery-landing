import Image from "next/image";
import Link from "next/link";
import { FooterAurora } from "@/components/footer-aurora";

const LINKS = [
  { href: "https://herond.org", label: "herond.org" },
  { href: "https://discord.gg/YgZ6vfWrK5", label: "Discord" },
  { href: "https://t.me/herond_browser", label: "Telegram" },
];

export function Footer() {
  return (
    <footer className="relative flex flex-col items-center gap-4 overflow-hidden border-t border-border px-4 py-7 text-center text-[13px] text-white/30 sm:flex-row sm:flex-wrap sm:justify-between sm:gap-3 sm:px-8 sm:py-[26px] sm:text-left">
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[120px] overflow-hidden">
        <FooterAurora className="absolute inset-0 h-full w-full" />
      </div>
      <div className="pointer-events-none absolute inset-0 bg-background/55" />
      <div className="relative z-10 flex items-center gap-2.5">
        <Image
          src="/assets/herond-logo.svg"
          alt="Herond"
          height={20}
          width={56}
          className="block h-5 w-auto opacity-80"
        />
        <span>© 2026 Herond Browser</span>
      </div>
      <div className="relative z-10 flex flex-wrap justify-center gap-4.5">
        {LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            target="_blank"
            className="text-white/30 no-underline hover:text-muted-foreground"
          >
            {link.label}
          </Link>
        ))}
      </div>
    </footer>
  );
}
