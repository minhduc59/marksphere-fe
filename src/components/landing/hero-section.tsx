"use client";

import { PlayCircle } from "lucide-react";
import { LandingButton } from "./landing-button";
import { useAuthModal } from "./auth-modal-provider";

const AVATARS = [
  "https://lh3.googleusercontent.com/aida-public/AB6AXuC80Ew9nmGe8Hh2DDXG2TNNVavREeMEEJy2wZP1sSgmI5859ySoO7U_ClG5GeiVanMQTi-o_O9rwqLb4ol3C-V3Uc6TTAqB5g85kMXP7wVzKReUpiFvnx87tXRfFJK4xDVLwbIaGmE8ZzzwuqSjtg8Mxmh_5D7M-FmSizHGXpmsId_Faw-Akgzg3E_JOr-A8NkM3Fs5yE4Y34PoqYYpy_OHLquTuzv74iieXxFeAtsG20lenOKpsqgzFkm0mElvrd8FSRsNKWMAzyE",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuCMtREx2cy2TgAE_S2xiqJswZ3mZyjX5TGGFOLdpeIn55oc-7ck4L2sc2g0wCcNesLXmbgyF06hoKknwiegpp5Ti2vFOdnFFC8guvgE6ihVOqGbVstmsbGYcraQvBEzbUnj9JK2cQc2wXrJZlP8oOj6u9lr35JJZ5B2t_K70YU4URfvDmRsjiW5RyID3Y5rvnt2_kfwUAL2csDM3krdgMlIbya9T0xJq2fdjdDcsVRXfZDbKtv05srlFhFTIZERcOnQ5WEaYGBIggc",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuDmjCdKg2As8ZTW345ap7lEzoj-QQAmCARqNVWK4lRwjVxU7VRvbYHnXjEdOISlIxfWEknx7Ik3oazFJkN3Mw22uauDutaHZu-X3Ssmc0aGZGwWPW6pFygAnDPlE4LG4BRxbm4trahwkmxKCvtfGe6FaNKAGzeSPS7D3tlew1r6LiQzTBfpzhBG1y_zAeSwLNdTjZkgEUWH3797L_zwwiscXG4yB5WE1ACyUzfoClH9VXrSflkkTYdLOY-QyvfVLtGSb6T87hB3zjw",
];

const HERO_IMAGE =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuCsGU5BJ9pn6zBoVUT-8G9h7EwyxYlo45Tl5teIiiHe77FKGuaIHhNHyLGUpIt8-3zCUTBLZ6Hh8Qgza0K-IftdCXyKENh45ohNdfpSsaiMB8c8Xy8r3ldU0in8rYGpdsSm62NQKJygw5HE0ctf7SMVCo7qh8UmlICYqU9q0C9DdBXXKNUwxLeD4AaNpPsjZ6P71HfAXZTUBRYe5Cd2nmtqlQbQWfEbcYjfameU-XCDbyxvPEGCq63kHP7DX8_wcGq861dygGDXt_Y";

export function HeroSection() {
  const { openAuth } = useAuthModal();

  return (
    <section className="relative mx-auto max-w-[1280px] overflow-visible border-b border-black px-4 py-12 md:px-12 md:py-24">
      <div className="grid grid-cols-1 items-center gap-16 lg:grid-cols-2">
        <div className="z-10">
          <span className="mb-6 inline-block border border-black px-4 py-1.5 text-xs font-bold uppercase tracking-widest">
            Next-Gen Content Orchestration
          </span>
          <h1 className="mb-6 text-[40px] font-extrabold uppercase leading-tight tracking-tight md:text-5xl">
            From trend to published post —{" "}
            <span className="bg-black px-2 text-white">fully automated.</span>
          </h1>
          <p className="mb-10 max-w-xl text-lg leading-relaxed">
            Reclaim 3–5 hours a day with autonomous AI agents that handle your
            entire content pipeline. Research, write, design, and schedule while
            you sleep.
          </p>
          <div className="flex flex-col gap-4 sm:flex-row">
            <LandingButton
              onClick={() => openAuth("register")}
              className="px-8 py-4 text-lg tracking-widest"
            >
              Start Free
            </LandingButton>
            <LandingButton
              href="#how-it-works"
              variant="outline"
              className="px-8 py-4 text-lg tracking-widest"
            >
              <PlayCircle className="h-5 w-5" />
              Watch Demo
            </LandingButton>
          </div>
          <div className="mt-12 flex items-center gap-4">
            <div className="flex -space-x-1">
              {AVATARS.map((src) => (
                <img
                  key={src}
                  alt="User"
                  src={src}
                  className="h-10 w-10 border border-black grayscale contrast-125"
                />
              ))}
            </div>
            <p className="text-sm font-bold uppercase tracking-wider">
              Joined by 2,000+ top marketing operators
            </p>
          </div>
        </div>
        <div className="relative">
          <div className="border border-black bg-black p-1">
            <img
              alt="Dashboard mockup"
              src={HERO_IMAGE}
              className="block w-full grayscale contrast-125"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
