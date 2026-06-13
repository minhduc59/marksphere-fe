import Link from "next/link";
import { cn } from "@/lib/utils";

type LandingButtonProps = {
  /** Navigation target. Omit and pass `onClick` to render a non-navigating button. */
  href?: string;
  onClick?: () => void;
  variant?: "solid" | "outline";
  className?: string;
  children: React.ReactNode;
};

/**
 * Sharp, monochrome marketing CTA. Renders as a link when given `href`, or as a
 * button when given `onClick` (e.g. to open the auth modal). Pass color
 * overrides via `className` for use on dark sections.
 */
export function LandingButton({
  href,
  onClick,
  variant = "solid",
  className,
  children,
}: LandingButtonProps) {
  const classes = cn(
    "inline-flex items-center justify-center gap-2 border font-bold uppercase tracking-widest transition-colors",
    variant === "solid"
      ? "border-black bg-black text-white hover:bg-white hover:text-black"
      : "border-black text-black hover:bg-black hover:text-white",
    className
  );

  if (href) {
    return (
      <Link href={href} className={classes} onClick={onClick}>
        {children}
      </Link>
    );
  }

  return (
    <button type="button" onClick={onClick} className={classes}>
      {children}
    </button>
  );
}
