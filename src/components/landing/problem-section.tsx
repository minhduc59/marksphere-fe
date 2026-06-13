import { TimerOff, TrendingUp, NotebookPen, Palette } from "lucide-react";
import type { LucideIcon } from "lucide-react";

const PROBLEMS: { icon: LucideIcon; title: string; body: string }[] = [
  {
    icon: TrendingUp,
    title: "Chasing Trends",
    body: "By the time you find a trend and research it, the moment has passed. Speed is everything.",
  },
  {
    icon: NotebookPen,
    title: "Writing Content",
    body: "Staring at a blank screen or cleaning up generic AI drafts eats up your creative energy.",
  },
  {
    icon: Palette,
    title: "Designing Visuals",
    body: "Switching between tools to create graphics that match your message is a major bottleneck.",
  },
];

export function ProblemSection() {
  return (
    <section className="border-b border-black bg-neutral-100 py-24">
      <div className="mx-auto max-w-[1280px] px-4 md:px-12">
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-2xl font-bold uppercase tracking-tighter md:text-3xl">
            The Content Grind is Broken
          </h2>
          <p className="mx-auto max-w-2xl text-lg leading-relaxed">
            Traditional marketing demands constant attention. Most teams waste
            hours in manual loops.
          </p>
          <div className="mt-8 inline-flex items-center gap-3 bg-black px-6 py-3 text-sm font-bold uppercase tracking-widest text-white">
            <TimerOff className="h-5 w-5" />
            Creators spend 3–5 hours a day on research and writing.
          </div>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {PROBLEMS.map(({ icon: Icon, title, body }) => (
            <div
              key={title}
              className="border border-black bg-white p-8 shadow-[4px_4px_0px_0px_#000]"
            >
              <div className="mb-6 flex h-14 w-14 items-center justify-center bg-black text-white">
                <Icon className="h-7 w-7" />
              </div>
              <h3 className="mb-4 text-2xl font-bold uppercase">{title}</h3>
              <p>{body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
