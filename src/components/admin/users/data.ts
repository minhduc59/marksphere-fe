import type { AdminUser } from "@/lib/api/types";

/** Display name fallback: explicit name → email local-part. */
export function userName(user: Pick<AdminUser, "displayName" | "email">): string {
  return user.displayName?.trim() || user.email.split("@")[0];
}

/** Up to two-letter uppercase initials derived from the display name. */
export function userInitials(
  user: Pick<AdminUser, "displayName" | "email">
): string {
  const name = userName(user);
  const parts = name.split(/[\s._-]+/).filter(Boolean);
  const letters =
    parts.length >= 2
      ? `${parts[0][0]}${parts[1][0]}`
      : name.slice(0, 2);
  return letters.toUpperCase();
}

/** "Oct 12, 2023" — short signup date for table display. */
export function formatSignupDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
