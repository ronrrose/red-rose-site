import { quoFetch, QuoError } from "@/lib/quo/client";

/**
 * A2P 10DLC registration status.
 *
 * US carriers require a registered campaign before an application sends SMS
 * to US numbers. Red Rose's registration is not complete, and unregistered
 * traffic gets filtered or blocked rather than delivered.
 *
 * This is checked in code, not just trusted to an env flag, so that flipping
 * SMS_CONFIRMATIONS_ENABLED early cannot start sending into carrier filters.
 */

export type A2pStatus = "pending" | "approved" | "rejected" | "failed" | "none" | "unknown";

type A2pResponse = {
  data?: {
    status?: A2pStatus;
    draft?: boolean;
    statusMessages?: unknown;
  };
};

/**
 * Cache the answer. Registration status changes on the order of days, and the
 * check sits in front of every send, so re-asking per request would spend the
 * rate-limit budget on a value that effectively never moves.
 */
const CACHE_TTL_MS = 10 * 60 * 1000;
let cache: { status: A2pStatus; at: number } | null = null;

export async function getA2pStatus(): Promise<A2pStatus> {
  if (cache && Date.now() - cache.at < CACHE_TTL_MS) return cache.status;

  let status: A2pStatus;
  try {
    const res = await quoFetch<A2pResponse>("/a2p-registration");
    const raw = res?.data?.status;
    // A draft that has never been submitted is not pending carrier review,
    // it is simply absent. Both block sending, but they read differently in
    // the admin view and in the logs.
    if (!raw) status = "unknown";
    else if (raw === "pending" && res?.data?.draft === true) status = "none";
    else status = raw;
  } catch (error) {
    // 404 is documented as "no registration exists yet", which is a real
    // answer rather than a failure.
    if (error instanceof QuoError && error.status === 404) status = "none";
    else status = "unknown";
  }

  cache = { status, at: Date.now() };
  return status;
}

/** Only an approved registration may send. "unknown" fails closed. */
export async function isA2pApproved(): Promise<boolean> {
  return (await getA2pStatus()) === "approved";
}

/** Test seam. */
export function clearA2pCache(): void {
  cache = null;
}
