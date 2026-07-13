interface SectionHeadingProps {
  eyebrow: string;
  title?: string;
}

export function SectionHeading({ eyebrow, title }: SectionHeadingProps) {
  return (
    <>
      <div className={title ? "mb-3.5 flex items-center gap-4" : "mb-8 flex items-center gap-4"}>
        <span className="whitespace-nowrap text-[11px] font-semibold uppercase tracking-[2.75px] text-muted-foreground">
          {eyebrow}
        </span>
        <span className="h-px flex-1 bg-[var(--hp-hairline)]" />
      </div>
      {title && (
        <h2 className="mb-10 text-[clamp(26px,3.2vw,36px)] font-bold tracking-[-0.015em]">
          {title}
        </h2>
      )}
    </>
  );
}
