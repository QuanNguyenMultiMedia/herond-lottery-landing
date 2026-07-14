import type { ReactNode } from "react";

interface SectionHeadingProps {
  eyebrow: string;
  title?: ReactNode;
}

export function SectionHeading({ eyebrow, title }: SectionHeadingProps) {
  return (
    <>
      <div className={title ? "mb-4 flex items-center gap-4" : "mb-8 flex items-center gap-4"}>
        <span className="whitespace-nowrap text-[11px] font-semibold uppercase tracking-[0.2em] text-primary/80">
          {eyebrow}
        </span>
        <span className="h-px flex-1 bg-[var(--hp-hairline)]" />
      </div>
      {title && (
        <h2 className="mb-10 text-[clamp(26px,3.2vw,34px)] font-semibold tracking-[-0.02em]">
          {title}
        </h2>
      )}
    </>
  );
}
