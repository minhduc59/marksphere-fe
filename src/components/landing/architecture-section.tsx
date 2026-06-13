import { Network, Terminal } from "lucide-react";
import type { LucideIcon } from "lucide-react";

const PILLARS: { icon: LucideIcon; title: string; body: string }[] = [
  {
    icon: Network,
    title: "Central Orchestrator",
    body: "Maintains brand consistency and manages workflow handoffs between specialized agents.",
  },
  {
    icon: Terminal,
    title: "Agent Specialization",
    body: "Each node is fine-tuned for a specific domain (Copywriting, Image Generation, or Analytics).",
  },
];

const ARCHITECTURE_IMAGE =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuBamtRNqm6fHejpgj9MW8IUNQnb6R6XvKC5O4iqCgfXqi0I9fG1ekcT30Zv4rvGqf8o8U4hq3RZlsEPZ7iIRTrtR2b_9UiLBKueelwZJXfujMw9Y2fNxy26OcUyZucUgBEBEywi_mpwcm0WRgdc253dm4Q0UxzvTRrXTswRWKkBc0Gr1vI6l1VSfAXLAyUhBcgG-2OahrqG8Gx23iUk8T6F6jPQUD7nwuwnrcpjAvD_DgCMGh6MMMeKv8CDb3w2aMVgDZOE59U88XY";

export function ArchitectureSection() {
  return (
    <section
      id="architecture"
      className="relative overflow-hidden bg-black py-32 text-white"
    >
      <div className="mx-auto max-w-[1280px] px-4 md:px-12">
        <div className="grid grid-cols-1 items-center gap-20 lg:grid-cols-2">
          <div>
            <span className="mb-6 inline-block border border-white px-4 py-1 text-xs font-bold uppercase tracking-widest">
              Technical Infrastructure
            </span>
            <h2 className="mb-8 text-2xl font-extrabold uppercase md:text-5xl">
              Powered by a coordinated multi-agent system.
            </h2>
            <p className="mb-12 text-lg leading-relaxed text-white/80">
              Unlike simple GPT wrappers, MarkSphere uses a tiered architecture
              where specialized agents—Creative, Strategic, and Technical—
              collaborate under a central Orchestrator.
            </p>
            <div className="space-y-8">
              {PILLARS.map(({ icon: Icon, title, body }) => (
                <div key={title} className="flex gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center border border-white">
                    <Icon className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="mb-1 font-bold uppercase tracking-wider">
                      {title}
                    </h4>
                    <p className="text-sm text-white/70">{body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="relative">
            <div className="border border-white bg-white p-1">
              <img
                alt="Architecture diagram"
                src={ARCHITECTURE_IMAGE}
                className="block w-full grayscale contrast-125"
              />
            </div>
            <div className="absolute -bottom-8 -right-8 border border-black bg-white p-6 text-black">
              <div className="mb-1 text-3xl font-black">99.9%</div>
              <div className="text-[10px] font-bold uppercase tracking-widest">
                Autonomous Accuracy
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
