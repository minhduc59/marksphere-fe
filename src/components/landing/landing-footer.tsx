import Link from "next/link";
import { Globe, Share2, AtSign, ArrowRight } from "lucide-react";
import type { LucideIcon } from "lucide-react";

const PRODUCT_LINKS = ["Features", "Pipeline", "API Documentation", "Roadmap"];
const COMPANY_LINKS = [
  "About Us",
  "Contact Support",
  "Privacy Policy",
  "Terms of Service",
];
const SOCIALS: { icon: LucideIcon; label: string }[] = [
  { icon: Globe, label: "Website" },
  { icon: Share2, label: "Share" },
  { icon: AtSign, label: "Email" },
];

function FooterLinkColumn({ title, links }: { title: string; links: string[] }) {
  return (
    <div>
      <h4 className="mb-6 text-xs font-bold uppercase tracking-widest">
        {title}
      </h4>
      <ul className="space-y-4">
        {links.map((label) => (
          <li key={label}>
            <Link
              href="#"
              className="text-xs font-bold uppercase tracking-widest underline-offset-4 hover:underline"
            >
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function LandingFooter() {
  return (
    <footer className="border-t border-black bg-white">
      <div className="mx-auto grid max-w-[1280px] grid-cols-1 gap-6 px-4 py-16 md:grid-cols-4 md:px-12">
        <div>
          <span className="mb-6 block text-2xl font-black uppercase tracking-tighter">
            MarkSphere
          </span>
          <p className="mb-6 text-sm leading-relaxed">
            Building the future of autonomous marketing orchestration.
            Empowering creators through intelligent multi-agent systems.
          </p>
          <div className="flex gap-4">
            {SOCIALS.map(({ icon: Icon, label }) => (
              <Link
                key={label}
                href="#"
                aria-label={label}
                className="flex h-10 w-10 items-center justify-center border border-black transition-all hover:bg-black hover:text-white"
              >
                <Icon className="h-4 w-4" />
              </Link>
            ))}
          </div>
        </div>
        <FooterLinkColumn title="Product" links={PRODUCT_LINKS} />
        <FooterLinkColumn title="Company" links={COMPANY_LINKS} />
        <div>
          <h4 className="mb-6 text-xs font-bold uppercase tracking-widest">
            Newsletter
          </h4>
          <p className="mb-4 text-xs font-bold uppercase tracking-widest">
            Get AI trends weekly.
          </p>
          <form className="relative border border-black">
            <input
              type="email"
              placeholder="email@example.com"
              className="w-full border-none bg-white px-5 py-3 pr-12 text-sm placeholder:text-[10px] placeholder:uppercase placeholder:tracking-widest focus:outline-none focus:ring-0"
            />
            <button
              type="submit"
              aria-label="Subscribe"
              className="absolute right-0 top-0 flex h-full w-12 items-center justify-center border-l border-black bg-black text-white transition-colors hover:bg-white hover:text-black"
            >
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>
        </div>
      </div>
      <div className="mx-auto flex max-w-[1280px] flex-col items-center justify-between gap-4 border-t border-black px-4 py-8 md:flex-row md:px-12">
        <p className="text-[10px] font-bold uppercase tracking-widest">
          © 2024 MarkSphere AI. All rights reserved.
        </p>
        <div className="flex gap-8">
          {["Twitter", "LinkedIn", "GitHub"].map((label) => (
            <Link
              key={label}
              href="#"
              className="text-[10px] font-bold uppercase tracking-widest hover:underline"
            >
              {label}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
}
