"use client";

import { LandingButton } from "./landing-button";
import { useAuthModal } from "./auth-modal-provider";

export function CtaSection() {
  const { openAuth } = useAuthModal();

  return (
    <section
      id="cta"
      className="mx-auto max-w-[1280px] overflow-hidden px-4 py-24 md:px-12"
    >
      <div className="relative border-4 border-black bg-black p-12 text-center text-white md:p-24">
        <div className="relative z-10 mx-auto max-w-3xl">
          <h2 className="mb-6 text-2xl font-extrabold uppercase tracking-tighter md:text-5xl">
            Let your marketing run itself.
          </h2>
          <p className="mb-12 text-lg leading-relaxed text-white/90">
            Stop acting like a bot and start being a strategist. Join 2,000+ top
            creators and let MarkSphere handle the grind.
          </p>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <LandingButton
              onClick={() => openAuth("register")}
              className="border-white bg-white px-10 py-5 text-xl text-black hover:bg-black hover:text-white"
            >
              Get Started Free
            </LandingButton>
            <LandingButton
              onClick={() => openAuth("login")}
              variant="outline"
              className="border-2 border-white px-10 py-5 text-xl text-white hover:bg-white hover:text-black"
            >
              Book Session
            </LandingButton>
          </div>
          <p className="mt-8 text-xs font-bold uppercase tracking-widest text-white/70">
            No credit card required. Cancel anytime.
          </p>
        </div>
      </div>
    </section>
  );
}
