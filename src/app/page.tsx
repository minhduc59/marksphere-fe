import {
  AuthModalProvider,
  LandingNav,
  HeroSection,
  ProblemSection,
  HowItWorksSection,
  FeaturesSection,
  ArchitectureSection,
  OutcomeSection,
  CtaSection,
  LandingFooter,
} from "@/components/landing";

export default function Home() {
  return (
    <AuthModalProvider>
      <div className="min-h-screen bg-white font-display text-black">
        <LandingNav />
        <main className="pt-24">
          <HeroSection />
          <ProblemSection />
          <HowItWorksSection />
          <FeaturesSection />
          <ArchitectureSection />
          <OutcomeSection />
          <CtaSection />
        </main>
        <LandingFooter />
      </div>
    </AuthModalProvider>
  );
}
