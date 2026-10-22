import { describe, it, expect, beforeEach, vi } from "vitest";
// vi.mock is hoisted above this import; the factory only reads `fake` lazily.
import { insertActivity, hasProcessedDelivery } from "@/lib/db/queries";

/**
 * Webhook idempotency.
 *
 * Quo retries any non-2xx delivery up to 8 times over ~27 hours, and warns
 * that delivery order is not guaranteed, so the handler must tolerate seeing
 * the same delivery repeatedly. The guarantee is the UNIQUE constraint on
 * activities.quo_event_id, which holds the per-delivery `webhook-id` header
 * rather than the envelope's own id.
 */

type Activity = { id: string; contact_id: string | null; quo_event_id: string | null; summary: string | null };

function makeFakeDb() {
  const activities: Activity[] = [];
  let nextId = 1;

  const query = vi.fn(async (sql: string, params: unknown[] = []) => {
    const text = sql.replace(/\s+/g, " ").trim();

    if (text.startsWith("INSERT INTO activities")) {
      const [contactId, , , , , summary, quoEventId] = params as [
        string | null, string, string | null, string | null, number | null, string | null, string | null
      ];

      // ON CONFLICT (quo_event_id) DO NOTHING: a repeat inserts nothing and
      // returns no row, which is how the caller learns it was a duplicate.
      if (quoEventId && activities.some((a) => a.quo_event_id === quoEventId)) {
        return [];
      }

      const row: Activity = {
        id: String(nextId++),
        contact_id: contactId,
        quo_event_id: quoEventId,
        summary,
      };
      activities.push(row);
      return [row];
    }

    if (text.startsWith("SELECT 1 FROM activities WHERE quo_event_id =")) {
      return activities.filter((a) => a.quo_event_id === params[0]).slice(0, 1).map(() => ({ one: 1 }));
    }

    throw new Error(`unexpected SQL: ${text.slice(0, 80)}`);
  });

  return { query, activities };
}

let fake: ReturnType<typeof makeFakeDb>;

vi.mock("@/lib/db/client", () => ({
  requireDb: () => ({ query: (sql: string, params?: unknown[]) => fake.query(sql, params) }),
  getDb: () => ({ query: (sql: string, params?: unknown[]) => fake.query(sql, params) }),
  isDbConfigured: () => true,
}));

const DELIVERY = "del_abc123";

function activity(overrides: Partial<Parameters<typeof insertActivity>[0]> = {}) {
  return {
    contactId: "1",
    type: "call",
    direction: "inbound" as const,
    occurredAt: "2026-10-21T10:00:00Z",
    durationS: 42,
    summary: "Call completed (42s)",
    quoEventId: DELIVERY,
    raw: { id: "EV1" },
    ...overrides,
  };
}

beforeEach(() => {
  fake = makeFakeDb();
});

describe("insertActivity idempotency", () => {
  it("records a delivery the first time", async () => {
    const row = await insertActivity(activity());
    expect(row).not.toBeNull();
    expect(fake.activities).toHaveLength(1);
  });

  it("ignores a redelivery of the same webhook-id", async () => {
    await insertActivity(activity());
    const second = await insertActivity(activity());

    expect(second).toBeNull();
    expect(fake.activities).toHaveLength(1);
  });

  it("ignores a redelivery even when the payload differs", async () => {
    // A retry can carry an updated resource. The delivery is still the same
    // delivery, so it must not produce a second timeline entry.
    await insertActivity(activity());
    const second = await insertActivity(activity({ summary: "Call completed (43s)", durationS: 43 }));

    expect(second).toBeNull();
    expect(fake.activities).toHaveLength(1);
    expect(fake.activities[0].summary).toBe("Call completed (42s)");
  });

  it("survives eight retries, which is the full Quo retry schedule", async () => {
    for (let attempt = 0; attempt < 8; attempt += 1) {
      await insertActivity(activity());
    }
    expect(fake.activities).toHaveLength(1);
  });

  it("records two distinct deliveries of the same underlying event", async () => {
    /*
     * The envelope id is shared by every subscription receiving the event, so
     * keying on it would wrongly drop the second delivery. webhook-id differs
     * per delivery, which is why it is the key.
     */
    await insertActivity(activity({ quoEventId: "del_one", raw: { id: "EV_SAME" } }));
    await insertActivity(activity({ quoEventId: "del_two", raw: { id: "EV_SAME" } }));
    expect(fake.activities).toHaveLength(2);
  });

  it("does not dedupe rows with no delivery id", async () => {
    // Form and chat activities have no Quo delivery, so NULL must not collide.
    await insertActivity(activity({ quoEventId: null, type: "form" }));
    await insertActivity(activity({ quoEventId: null, type: "chat" }));
    expect(fake.activities).toHaveLength(2);
  });
});

describe("hasProcessedDelivery", () => {
  it("is false before the delivery is seen and true afterwards", async () => {
    expect(await hasProcessedDelivery(DELIVERY)).toBe(false);
    await insertActivity(activity());
    expect(await hasProcessedDelivery(DELIVERY)).toBe(true);
  });

  it("does not confuse one delivery for another", async () => {
    await insertActivity(activity());
    expect(await hasProcessedDelivery("del_different")).toBe(false);
  });
});
