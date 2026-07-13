import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { PointIcon, LinePointIcon } from "@/components/icons";
import { TiltCard } from "@/components/tilt-card";
import { SectionHeading } from "@/components/sections/section-heading";
import { FAQS } from "@/data/season";

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
        Weekly Draw every <span className="font-bold text-foreground">Sunday</span>. Your tickets
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
        draws. They accumulate for the Season 1 Grand Draw.
      </>
    ),
  },
  {
    icon: PointIcon,
    iconColor: "text-[var(--hp-success)]",
    title: "Boost Your Rewards",
    body: (
      <>
        Herond Keyless Wallet + 1 transaction ={" "}
        <span className="font-bold text-[var(--hp-success)]">+15%</span> Bonus Tickets.
      </>
    ),
  },
];

export function RulesFaq() {
  return (
    <section id="rules" className="flex min-h-svh flex-col justify-center py-[clamp(32px,5vw,56px)]">
      <div className="mx-auto grid w-full max-w-[720px] grid-cols-1 gap-8 px-6">
        <div>
          <SectionHeading eyebrow="Rules" title="Maximize your chances" />
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {RULES.map((rule) => (
              <TiltCard
                key={rule.title}
                className="p-4 hover:shadow-[0_12px_28px_rgba(0,0,0,0.4),0_0_0_1px_rgba(51,115,246,0.25)]"
              >
                <div className="mb-2 flex items-center gap-2">
                  <rule.icon className={`size-4 flex-none ${rule.iconColor}`} />
                  <h4 className="text-[13.5px] font-bold">{rule.title}</h4>
                </div>
                <p className="text-pretty text-[12.5px] leading-relaxed text-muted-foreground">
                  {rule.body}
                </p>
              </TiltCard>
            ))}
          </div>
        </div>

        <div id="faq">
          <SectionHeading eyebrow="FAQ" />
          <div className="grid grid-cols-1 gap-2">
            {FAQS.map((faq, i) => (
              <Accordion key={i} className="rounded-2xl bg-card">
                <AccordionItem value={i} className="border-b-0">
                  <AccordionTrigger className="px-4 py-3 text-[13.5px] font-semibold hover:no-underline">
                    {faq.q}
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-3">
                    {faq.paras.map((p, pi) => (
                      <p
                        key={pi}
                        className="mb-1.5 text-pretty text-[12.5px] text-muted-foreground last:mb-0"
                      >
                        {p}
                      </p>
                    ))}
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
