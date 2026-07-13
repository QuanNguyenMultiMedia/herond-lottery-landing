import { CtaLink } from "@/components/cta-link";

export function FinalCta() {
  return (
    <section className="py-[clamp(64px,9vw,110px)] text-center">
      <div className="mx-auto max-w-[1080px] px-6">
        <div className="mb-3.5 text-[clamp(44px,6vw,72px)] font-extrabold leading-none tracking-[-0.025em] tabular-nums">
          $10,000
          <span className="ml-2.5 text-[0.35em] font-semibold text-muted-foreground">pool</span>
        </div>
        <h2 className="mb-2.5 text-[clamp(20px,2.6vw,28px)] font-bold tracking-[-0.015em]">
          Your next check-in could be the one.
        </h2>
        <p className="mb-[30px] text-[15px] text-muted-foreground">
          Free to start. One check-in a day. Install Herond and you&apos;re in.
        </p>
        <CtaLink>
          <video
            src="/assets/herond-icon-loop.webm"
            autoPlay
            loop
            muted
            playsInline
            className="block h-[22px] w-[22px]"
          />
          Install Herond — Get Your First Ticket
        </CtaLink>
      </div>
    </section>
  );
}
