import { PostFormat } from "@/lib/api/types";

/** Human labels for the 7 post formats. Shared across Content + modals. */
export const FORMAT_LABELS: Record<PostFormat, string> = {
  [PostFormat.QUICK_TIPS]: "Quick Tips",
  [PostFormat.HOT_TAKE]: "Hot Take",
  [PostFormat.TRENDING_BREAKDOWN]: "Trending Breakdown",
  [PostFormat.DID_YOU_KNOW]: "Did You Know",
  [PostFormat.TUTORIAL_HACK]: "Tutorial Hack",
  [PostFormat.MYTH_BUSTERS]: "Myth Busters",
  [PostFormat.BEHIND_THE_TECH]: "Behind the Tech",
};

export function formatLabel(format: PostFormat | string): string {
  return FORMAT_LABELS[format as PostFormat] ?? format;
}
