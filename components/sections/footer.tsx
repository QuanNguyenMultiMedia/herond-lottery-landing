import Image from "next/image";
import Link from "next/link";

const LINKS = [
  { href: "https://herond.org", label: "herond.org" },
  { href: "https://discord.gg/YgZ6vfWrK5", label: "Discord" },
  { href: "https://t.me/herond_browser", label: "Telegram" },
];

export function Footer() {
  return (
    <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-border px-4 py-[26px] text-[13px] text-white/30 sm:px-8">
      <div className="flex items-center gap-2.5">
        <Image
          src="/assets/herond-logo.svg"
          alt="Herond"
          height={20}
          width={56}
          className="block h-5 w-auto opacity-80"
        />
        <span>© 2026 Herond Browser</span>
      </div>
      <div className="flex gap-4.5">
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
