import {
  Radar,
  Sparkles,
  Brush,
  CalendarCheck,
  Rocket,
  LineChart,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

const STEPS: { icon: LucideIcon; title: string; body: string }[] = [
  {
    icon: Radar,
    title: "Discover Trends",
    body: "Scans socials 24/7 for emerging topics.",
  },
  {
    icon: Sparkles,
    title: "Generate Content",
    body: "Crafts personalized copy with your brand voice.",
  },
  {
    icon: Brush,
    title: "Create Visuals",
    body: "Generates high-quality on-brand imagery.",
  },
  {
    icon: CalendarCheck,
    title: "Smart Schedule",
    body: "Calculates peak engagement for each post.",
  },
  {
    icon: Rocket,
    title: "Auto-Publish",
    body: "Multi-platform posting without human intervention.",
  },
  {
    icon: LineChart,
    title: "Learn & Improve",
    body: "A/B tests everything to optimize growth.",
  },
];

export function HowItWorksSection() {
  return (
    <section
      id="how-it-works"
      className="overflow-hidden border-b border-black bg-white py-24"
    >
      <div className="mx-auto max-w-[1280px] px-4 md:px-12">
        <div className="mb-20 text-center">
          <span className="mb-4 block text-xs font-bold uppercase tracking-widest">
            Our Process
          </span>
          <h2 className="text-2xl font-bold uppercase md:text-3xl">
            The 100% Autonomous Pipeline
          </h2>
        </div>
        <div className="relative">
          <div
            aria-hidden
            className="absolute left-0 top-8 hidden h-px w-full border-t border-dashed border-black lg:block"
          />
          <div className="relative z-10 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-6">
            {STEPS.map(({ icon: Icon, title, body }) => (
              <div
                key={title}
                className="flex flex-col items-center text-center"
              >
                <div className="mb-6 flex h-16 w-16 items-center justify-center border border-black bg-black text-white">
                  <Icon className="h-7 w-7" />
                </div>
                <h4 className="mb-2 text-sm font-bold uppercase">{title}</h4>
                <p className="px-4 text-xs">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
