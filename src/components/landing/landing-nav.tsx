"use client";

import Link from "next/link";
import { LandingButton } from "./landing-button";
import { useAuthModal } from "./auth-modal-provider";

const NAV_LINKS = [
  { label: "Features", href: "#features" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Architecture", href: "#architecture" },
  { label: "Pricing", href: "#cta" },
];

export function LandingNav() {
  const { openAuth } = useAuthModal();

  return (
    <nav className="fixed top-0 z-50 w-full border-b border-black bg-white">
      <div className="mx-auto flex max-w-[1280px] items-center justify-between px-4 py-4 md:px-12">
        <Link
          href="/"
          className="text-3xl font-extrabold uppercase tracking-tighter"
        >
          MarkSphere
        </Link>
        <div className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-xs font-bold uppercase tracking-widest decoration-2 underline-offset-4 hover:underline"
            >
              {link.label}
            </a>
          ))}
        </div>
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => openAuth("login")}
            className="hidden text-xs font-bold uppercase tracking-widest decoration-2 underline-offset-4 hover:underline sm:block"
          >
            Login
          </button>
          <LandingButton
            onClick={() => openAuth("register")}
            className="px-6 py-2.5 text-xs"
          >
            Get Started
          </LandingButton>
        </div>
      </div>
    </nav>
  );
}
