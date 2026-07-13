import Link from "next/link";
import { PointIcon } from "@/components/icons";
import { HEROND_POINT_LINK } from "@/data/season";

/** Fixed bottom CTA shown only on small screens (media-query driven, no JS resize listener). */
export function StickyMobileCta() {
  return (
    <div className="fixed inset-x-0 bottom-0 z-90 border-t border-border bg-background/92 px-4 py-3 backdrop-blur-md sm:hidden">
      <Link
        href={HEROND_POINT_LINK}
        target="_blank"
        className="flex items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-b from-[var(--hp-cta-from)] to-[var(--hp-cta-to)] px-6 py-3.5 text-[15px] font-bold text-white no-underline"
      >
        <PointIcon className="size-[18px] text-white" />
        Install Herond — Get Your First Ticket
      </Link>
    </div>
  );
}
