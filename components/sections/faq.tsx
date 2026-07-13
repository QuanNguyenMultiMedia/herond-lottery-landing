import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { SectionHeading } from "@/components/sections/section-heading";
import { FAQS } from "@/data/season";

export function Faq() {
  return (
    <section id="faq" className="py-[clamp(40px,6vw,72px)]">
      <div className="mx-auto max-w-[1080px] px-6">
        <SectionHeading eyebrow="FAQ" />
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
          {FAQS.map((faq, i) => (
            <Accordion key={i} className="rounded-2xl bg-card">
              <AccordionItem value={i} className="border-b-0">
                <AccordionTrigger className="px-[18px] py-4 text-[14.5px] font-semibold hover:no-underline">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="px-[18px] pb-4">
                  {faq.paras.map((p, pi) => (
                    <p key={pi} className="mb-2 text-[13.5px] text-muted-foreground last:mb-0">
                      {p}
                    </p>
                  ))}
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          ))}
        </div>
      </div>
    </section>
  );
}
