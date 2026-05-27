import { z } from "zod";
import apiClient from "./client";
import type {
  ContentPost,
  ContentStatus,
  PaginatedResponse,
  PostFilters,
  PostGenRequest,
} from "./types";

export const articleSchema = z.object({
  url: z
    .string()
    .url("Please enter a valid URL")
    .refine((u) => /^https?:\/\//i.test(u), "URL must start with http(s)://"),
  options: z
    .object({
      num_posts: z.number().int().min(1).max(10).optional(),
      formats: z.array(z.string()).optional(),
    })
    .optional(),
});

export type ArticleInput = z.infer<typeof articleSchema>;

export interface FromArticleResponse {
  scan_run_id: string;
  status: string;
  message?: string;
}

export async function getPosts(
  params?: PostFilters
): Promise<PaginatedResponse<ContentPost>> {
  const { data } = await apiClient.get("/posts", { params });
  return data;
}

export async function getPost(id: string): Promise<ContentPost> {
  const { data } = await apiClient.get(`/posts/${id}`);
  return data;
}

export async function generatePosts(dto: PostGenRequest) {
  const { data } = await apiClient.post("/posts/generate", dto);
  return data;
}

export async function updatePostStatus(id: string, status: ContentStatus) {
  const { data } = await apiClient.patch(`/posts/${id}/status`, { status });
  return data;
}

export async function createPostFromArticle(
  payload: ArticleInput
): Promise<FromArticleResponse> {
  const { data } = await apiClient.post("/posts/from-article", payload);
  return data;
}

export async function reviewPost(
  id: string,
  dto: { action: "approve" | "reject"; feedback?: string }
) {
  const { data } = await apiClient.post(`/posts/${id}/review`, dto);
  return data;
}

/**
 * Poll GET /posts/:id until the row settles out of a transient state.
 *
 * Used after the user rejects a post with feedback: the backend kicks off
 * an async regeneration in the AI service which flips the row to
 * `regenerating` and then back to a terminal state (`draft` on success or
 * `flagged_for_review` on failure). The component shows a spinner until
 * this resolves.
 *
 * Resolves with the latest ContentPost. Rejects on timeout or on an
 * `flagged_for_review` outcome so the UI can render a clear error.
 */
export async function pollPostUntilReady(
  id: string,
  opts: {
    /** Status values that should stop the poll. */
    settleStatuses?: ContentStatus[];
    /** Status values that count as a failure (rejects the promise). */
    failureStatuses?: ContentStatus[];
    /** Poll interval in ms (default 3000). */
    intervalMs?: number;
    /** Total timeout in ms (default 90_000). */
    timeoutMs?: number;
    /** Optional callback fired on each successful poll — receives latest post. */
    onUpdate?: (post: ContentPost) => void;
    /** AbortSignal — cancels the poll without rejecting. */
    signal?: AbortSignal;
  } = {}
): Promise<ContentPost> {
  const {
    settleStatuses = [
      "draft" as ContentStatus,
      "approved" as ContentStatus,
      "needs_revision" as ContentStatus,
      "published" as ContentStatus,
    ],
    failureStatuses = ["flagged_for_review" as ContentStatus],
    intervalMs = 3000,
    timeoutMs = 90_000,
    onUpdate,
    signal,
  } = opts;

  const deadline = Date.now() + timeoutMs;

  while (true) {
    if (signal?.aborted) {
      throw new DOMException("Polling aborted", "AbortError");
    }
    const post = await getPost(id);
    onUpdate?.(post);
    if (failureStatuses.includes(post.status)) {
      const err = new Error(
        post.reviewNotes || "Regeneration failed — post flagged for review"
      );
      (err as Error & { post?: ContentPost }).post = post;
      throw err;
    }
    if (settleStatuses.includes(post.status)) {
      return post;
    }
    if (Date.now() >= deadline) {
      throw new Error(
        "Regeneration is taking longer than expected — check back later"
      );
    }
    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }
}
