import Link from "next/link";
import { PointIcon } from "@/components/icons";
import { HEROND_POINT_LINK } from "@/data/season";

/** Fixed bottom CTA shown only on small screens (media-query driven, no JS resize listener). */
export function StickyMobileCta() {
  return (
    <div className="hp-sticky-cta fixed inset-x-0 bottom-0 z-90 border-t border-border bg-background/85 px-4 py-3 backdrop-blur-xl sm:hidden">
      <Link
        href={HEROND_POINT_LINK}
        target="_blank"
        className="flex items-center justify-center gap-2.5 rounded-xl bg-primary px-6 py-3.5 text-[15px] font-semibold text-white no-underline shadow-[0_8px_24px_-6px_rgba(51,115,246,0.55)]"
      >
        <PointIcon className="size-[18px] text-white" />
        Install Herond — Get Your First Ticket
      </Link>
    </div>
  );
}
