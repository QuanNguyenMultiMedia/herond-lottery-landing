import { PointIcon, LinePointIcon } from "@/components/icons";
import { TiltCard } from "@/components/tilt-card";
import { SectionHeading } from "@/components/sections/section-heading";

const RULES = [
  {
    icon: PointIcon,
    iconColor: "text-primary",
    title: "Earn Tickets",
    body: (
      <>
        Daily Check-In = <span className="font-bold text-foreground">1</span> Lottery Ticket.
        Active 5/7 days = <span className="font-bold text-[var(--hp-success)]">+1</span> Bonus
        Ticket.
      </>
    ),
  },
  {
    icon: PointIcon,
    iconColor: "text-primary",
    title: "Win Weekly",
    body: (
      <>
        Weekly Draw every <span className="font-bold text-foreground">Monday</span>. Your tickets
        enter automatically — nothing else to do.
      </>
    ),
  },
  {
    icon: LinePointIcon,
    iconColor: "text-primary",
    title: "Tickets Never Reset",
    body: (
      <>
        Tickets are <span className="font-bold text-foreground">NOT</span> consumed after weekly
        draws. They keep accumulating for the Season 1 Grand Draw.
      </>
    ),
  },
  {
    icon: PointIcon,
    iconColor: "text-[var(--hp-success)]",
    title: "Boost Your Rewards",
    body: (
      <>
        Create a Herond Keyless Wallet + 1 transaction ={" "}
        <span className="font-bold text-[var(--hp-success)]">+15%</span> Bonus Tickets.
      </>
    ),
    footnote: "Bonus tickets are applied once, before the Season 1 Grand Draw snapshot.",
  },
];

export function Rules() {
  return (
    <section id="rules" className="py-[clamp(40px,6vw,72px)]">
      <div className="mx-auto max-w-[1080px] px-6">
        <SectionHeading eyebrow="Rules" title="Maximize your chances" />
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          {RULES.map((rule) => (
            <TiltCard
              key={rule.title}
              className="p-[22px] hover:shadow-[0_12px_28px_rgba(0,0,0,0.4),0_0_0_1px_rgba(51,115,246,0.25)]"
            >
              <div className="mb-2.5 flex items-center gap-2.5">
                <rule.icon className={`size-5 flex-none ${rule.iconColor}`} />
                <h4 className="text-[15px] font-bold">{rule.title}</h4>
              </div>
              <p className="text-[13.5px] leading-relaxed text-muted-foreground">{rule.body}</p>
              {rule.footnote && (
                <span className="mt-2.5 block text-[11px] text-white/30">{rule.footnote}</span>
              )}
            </TiltCard>
          ))}
        </div>
      </div>
    </section>
  );
}
