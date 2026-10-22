import Anthropic from "@anthropic-ai/sdk";
import { createLead } from "@/lib/leads/create-lead";

/**
 * Turn a finished chat conversation into a lead.
 *
 * Deliberately a separate pass rather than a tool the chat model calls. The
 * streaming path in /api/chat is load-bearing and already carries the
 * wrapper-markup handling that once broke production, so it is left alone:
 * this runs after the response has been sent, in waitUntil.
 *
 * Cost control is the pre-gate below. Most chat turns contain no contact
 * details at all, and those never reach the model.
 */

/** Cheap, structured extraction. No need for the chat model here. */
const EXTRACTION_MODEL = "claude-haiku-5-5";

/**
 * Does this conversation plausibly contain a phone number or an email?
 *
 * Runs before any model call. A seven-digit-or-longer run of digits, or an
 * @-with-a-dot, is enough to be worth a look; anything less certainly is not
 * a contact detail.
 */
export function mightContainContactDetails(text: string): boolean {
  if (!text) return false;
  if (/[^\s@]+@[^\s@]+\.[a-z]{2,}/i.test(text)) return true;
  const digitRuns = text.replace(/[()\-.\s+]/g, "");
  return /\d{7,}/.test(digitRuns);
}

type Extracted = {
  name: string | null;
  phone: string | null;
  email: string | null;
  company: string | null;
  summary: string | null;
};

const EXTRACTION_PROMPT = `You read a transcript of a website chat between a visitor and an assistant for an IT services company, and return only what the visitor actually stated about themselves.

Return a single JSON object, nothing else, with these keys:
  name    - the visitor's name, or null
  phone   - the visitor's phone number exactly as they wrote it, or null
  email   - the visitor's email address, or null
  company - their practice or business name, or null
  summary - two or three plain sentences describing their problem, the software they use, and the size of their office, using only what they said

Rules:
  - Never guess or infer a value. If the visitor did not state it, the value is null.
  - Never return the company's own phone number, (941) 206-4709, as the visitor's phone.
  - Do not include any patient names, health information, or medical details in the summary. If the visitor shared any, omit it entirely.
  - Output plain JSON. No code fences, no commentary, no XML tags.`;

/**
 * Extract and persist a lead from a transcript.
 *
 * Returns the contact id when a lead was created or merged, otherwise null.
 * Never throws: it runs after the response is sent, so a failure here must
 * not surface anywhere.
 */
export async function extractAndCreateLead(
  transcript: Array<{ role: "user" | "assistant"; content: string }>,
  context: { pageUrl?: string | null }
): Promise<string | null> {
  try {
    const visitorText = transcript
      .filter((m) => m.role === "user")
      .map((m) => m.content)
      .join("\n");

    if (!mightContainContactDetails(visitorText)) return null;

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) return null;

    const client = new Anthropic({ apiKey });
    const response = await client.messages.create({
      model: EXTRACTION_MODEL,
      max_tokens: 512,
      system: EXTRACTION_PROMPT,
      messages: [
        {
          role: "user",
          content: transcript
            .map((m) => `${m.role === "user" ? "Visitor" : "Assistant"}: ${m.content}`)
            .join("\n"),
        },
      ],
    });

    const text = response.content
      .map((block) => (block.type === "text" ? block.text : ""))
      .join("")
      .trim();

    const extracted = parseExtraction(text);
    if (!extracted) return null;
    if (!extracted.phone && !extracted.email) return null;

    const result = await createLead({
      source: "chat",
      name: extracted.name,
      phone: extracted.phone,
      email: extracted.email,
      company: extracted.company,
      summary: extracted.summary,
      pageUrl: context.pageUrl ?? null,
      activityType: "chat",
      activityDirection: "inbound",
      // Chat never collects SMS consent: there is no checkbox in the widget,
      // and consent has to be explicit.
      consentSms: false,
    });

    return result.ok ? result.contactId : null;
  } catch (error) {
    console.error(
      "chat lead extraction failed:",
      error instanceof Error ? error.message : "unknown error"
    );
    return null;
  }
}

/** Parse the model's JSON, tolerating a stray code fence. */
export function parseExtraction(text: string): Extracted | null {
  if (!text) return null;

  let json = text.trim();
  const fence = /^```(?:json)?\s*([\s\S]*?)\s*```$/.exec(json);
  if (fence) json = fence[1];

  const start = json.indexOf("{");
  const end = json.lastIndexOf("}");
  if (start === -1 || end <= start) return null;

  try {
    const parsed = JSON.parse(json.slice(start, end + 1)) as Record<string, unknown>;
    return {
      name: str(parsed.name),
      phone: str(parsed.phone),
      email: str(parsed.email),
      company: str(parsed.company),
      summary: str(parsed.summary),
    };
  } catch {
    return null;
  }
}

/** Coerce a field to a trimmed string, treating the literal "null" as null. */
function str(v: unknown): string | null {
  if (typeof v !== "string") return null;
  const trimmed = v.trim();
  if (!trimmed || trimmed.toLowerCase() === "null") return null;
  return trimmed.slice(0, 4000);
}
