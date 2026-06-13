import { Radio, Brain, Images, Clock, Zap, BarChart3 } from "lucide-react";
import type { LucideIcon } from "lucide-react";

const FEATURES: {
  icon: LucideIcon;
  title: string;
  body: string;
  tags: string[];
}[] = [
  {
    icon: Radio,
    title: "Trend Radar",
    body: "Real-time surveillance of Reddit, X, and LinkedIn to find the conversations before they go viral.",
    tags: ["Real-time", "NLP Analysis"],
  },
  {
    icon: Brain,
    title: "Content Brain",
    body: "Advanced semantic understanding that crafts thought-leadership content based on your unique views.",
    tags: ["Voice Cloning", "Context Aware"],
  },
  {
    icon: Images,
    title: "Visual Factory",
    body: "A dedicated engine for generating professional carousels, charts, and cover images for your posts.",
    tags: ["Style Transfer", "Brand Guard"],
  },
  {
    icon: Clock,
    title: "Golden Hour Scheduler",
    body: "Automated timing adjustments based on the exact moments your target audience is most active.",
    tags: ["AI Timing", "Global Reach"],
  },
  {
    icon: Zap,
    title: "Auto Publish",
    body: "Direct API integrations that publish your content across all professional platforms simultaneously.",
    tags: ["Zero-Click", "API Secure"],
  },
  {
    icon: BarChart3,
    title: "Performance Feedback",
    body: "Deep analysis of what worked and what didn't, automatically refining the next generation of posts.",
    tags: ["Iterative", "ROI Focused"],
  },
];

export function FeaturesSection() {
  return (
    <section
      id="features"
      className="border-b border-black bg-neutral-100 py-24"
    >
      <div className="mx-auto max-w-[1280px] px-4 md:px-12">
        <div className="mb-16">
          <h2 className="mb-4 text-2xl font-bold uppercase tracking-tighter md:text-3xl">
            Deep Intelligence Features
          </h2>
          <p className="max-w-xl">
            Every component of MarkSphere is powered by a specialized agent
            model designed for specific marketing tasks.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map(({ icon: Icon, title, body, tags }) => (
            <div
              key={title}
              className="border border-black bg-white p-10 shadow-[4px_4px_0px_0px_#000]"
            >
              <Icon className="mb-6 h-9 w-9" />
              <h3 className="mb-3 text-2xl font-bold uppercase">{title}</h3>
              <p className="mb-6">{body}</p>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="border border-black px-3 py-1 text-[10px] font-bold uppercase tracking-widest"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
