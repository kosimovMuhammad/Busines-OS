import { useEffect, useState } from "react";

export type PollStatus = "idle" | "pending" | "success" | "failed" | "timeout";

// TZ §8.4 async AI job pattern: every AI result endpoint is
// 200 (done) | 404 (not ready, keep polling) | 422 (failed) - verified live
// via /ai/generate-quotation/result/:id. Rather than a hook that wraps
// another hook (awkward to type against RTK Query's generated hook
// signatures), the caller runs its own `useGetXResultQuery(id, {
// pollingInterval: isPending ? intervalMs : 0 })` and feeds the resulting
// {data, error} in here; this hook derives the status and owns the
// timeout timer, and the caller derives `isPending` from that status for
// next render's pollingInterval.
export function usePollUntilReady<TData>({
  id,
  data,
  error,
  timeoutMs = 30000,
}: {
  id: string | null;
  data: TData | undefined;
  error: unknown;
  timeoutMs?: number;
}): PollStatus {
  const [timedOut, setTimedOut] = useState(false);

  // Reset the timeout window whenever a new job id comes in - adjusted
  // during render (not in the effect below) per React's documented
  // pattern for resetting state on a prop change.
  const [trackedId, setTrackedId] = useState(id);
  if (id !== trackedId) {
    setTrackedId(id);
    setTimedOut(false);
  }

  useEffect(() => {
    if (!id) return undefined;
    const timer = setTimeout(() => setTimedOut(true), timeoutMs);
    return () => clearTimeout(timer);
  }, [id, timeoutMs]);

  if (!id) return "idle";
  if (data) return "success";

  const status = (error as { status?: number } | undefined)?.status;
  if (typeof status === "number" && status !== 404) return "failed";
  if (timedOut) return "timeout";
  return "pending";
}
