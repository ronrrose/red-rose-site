import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

if (!process.env.RESEND_API_KEY) {
  throw new Error("Missing RESEND_API_KEY environment variable");
}

const resend = new Resend(process.env.RESEND_API_KEY);

// In-memory rate limiting: 3 submissions per IP per 15 minutes
const submissionsByIp = new Map<string, number[]>();
const WINDOW_MS = 15 * 60 * 1000;
const MAX_SUBMISSIONS = 3;

function rateLimit(ip: string): boolean {
  const now = Date.now();
  const windowStart = now - WINDOW_MS;
  const timestamps = (submissionsByIp.get(ip) || []).filter((t) => t > windowStart);
  timestamps.push(now);
  submissionsByIp.set(ip, timestamps);
  return timestamps.length <= MAX_SUBMISSIONS;
}

/**
 * Detect gibberish strings: random chars bots use for names/messages.
 * Checks consonant-to-vowel ratio, digit mixing, and uppercase randomness.
 */
function isGibberish(text: string): boolean {
  if (!text || text.length < 3) return false;
  const clean = text.replace(/\s+/g, "");
  if (clean.length < 3) return false;

  // High ratio of digits mixed with letters (e.g. "0Bx54gfKzc")
  const digits = (clean.match(/\d/g) || []).length;
  const letters = (clean.match(/[a-zA-Z]/g) || []).length;
  if (digits > 0 && letters > 0 && digits / clean.length > 0.2) return true;

  // Very low vowel ratio (e.g. "LJbNzwRQkVA4cM9IDL39NRa")
  const vowels = (clean.match(/[aeiouAEIOU]/g) || []).length;
  if (letters > 5 && vowels / letters < 0.15) return true;

  // Random uppercase in the middle of a word (e.g. "HqM4mlF2jO")
  const words = text.split(/\s+/);
  for (const word of words) {
    if (word.length < 4) continue;
    const midCaps = (word.slice(1).match(/[A-Z]/g) || []).length;
    if (midCaps >= 2 && midCaps / word.length > 0.3) return true;
  }

  return false;
}

/** Check if a name looks like a real human name */
function isValidName(name: string): boolean {
  // Must be 2-50 chars, only letters, spaces, hyphens, apostrophes
  if (!/^[a-zA-ZÀ-ÿ' -]{2,50}$/.test(name)) return false;
  // Must not be gibberish
  if (isGibberish(name)) return false;
  return true;
}

interface ContactBody {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  businessType?: string;
  message?: string;
  recaptchaToken?: string;
  website?: string; // honeypot field
}

const RECAPTCHA_SECRET = process.env.RECAPTCHA_SECRET_KEY || "";
const RECAPTCHA_THRESHOLD = 0.5;

async function verifyRecaptcha(token: string): Promise<{ success: boolean; score: number }> {
  if (!RECAPTCHA_SECRET || !token) return { success: false, score: 0 };
  try {
    const res = await fetch("https://www.google.com/recaptcha/api/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `secret=${encodeURIComponent(RECAPTCHA_SECRET)}&response=${encodeURIComponent(token)}`,
    });
    const data = await res.json();
    return { success: data.success === true, score: data.score ?? 0 };
  } catch {
    return { success: false, score: 0 };
  }
}

export async function POST(req: NextRequest) {
  try {
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.ip ||
      "unknown";
    if (!rateLimit(ip)) {
      return NextResponse.json(
        { error: "Too many submissions, slow down." },
        { status: 429 }
      );
    }

    const body = (await req.json()) as ContactBody;

    // Validate required fields
    if (!body.firstName?.trim() || !body.lastName?.trim() || !body.email?.trim()) {
      return NextResponse.json(
        { error: "First name, last name, and email are required." },
        { status: 400 }
      );
    }

    // Basic email format check
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) {
      return NextResponse.json(
        { error: "Please enter a valid email address." },
        { status: 400 }
      );
    }

    // Honeypot check — if the hidden "website" field is filled, it's a bot
    if (body.website) {
      // Silently accept so the bot thinks it succeeded
      return NextResponse.json({ success: true });
    }

    // Name validation — reject gibberish names (e.g. "0Bx54gfKzc TTKX3zau30")
    if (!isValidName(body.firstName.trim()) || !isValidName(body.lastName.trim())) {
      // Silently accept so the bot thinks it succeeded
      console.warn(`Spam blocked (bad name): "${body.firstName} ${body.lastName}" from ${ip}`);
      return NextResponse.json({ success: true });
    }

    // Message gibberish check (e.g. "EyFcrFhZMDkoB0dkzRiHMfYN54AHylZZocNe...")
    if (body.message && isGibberish(body.message)) {
      console.warn(`Spam blocked (gibberish message) from ${ip}`);
      return NextResponse.json({ success: true });
    }

    // reCAPTCHA v3 verification
    if (RECAPTCHA_SECRET) {
      if (!body.recaptchaToken) {
        return NextResponse.json(
          { error: "Security verification failed. Please refresh and try again." },
          { status: 400 }
        );
      }
      const captcha = await verifyRecaptcha(body.recaptchaToken);
      if (!captcha.success || captcha.score < RECAPTCHA_THRESHOLD) {
        console.warn(`reCAPTCHA failed: success=${captcha.success}, score=${captcha.score}, ip=${ip}`);
        return NextResponse.json(
          { error: "Security verification failed. Please try again." },
          { status: 403 }
        );
      }
    }

    // Reject very short or very long messages
    if (body.message && (body.message.length < 10 || body.message.length > 4000)) {
      return NextResponse.json(
        { error: "Invalid message length" },
        { status: 400 }
      );
    }

    // Silently drop obvious spam (many links)
    const linkCount = (body.message?.match(/https?:\/\//gi) || []).length;
    if (linkCount > 3) {
      return NextResponse.json({ success: true });
    }

    // Sanitize inputs for HTML email
    const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
    const safe = {
      firstName: esc(body.firstName.trim()),
      lastName: esc(body.lastName.trim()),
      email: esc(body.email.trim()),
      phone: body.phone ? esc(body.phone.trim()) : "",
      message: body.message ? esc(body.message.trim()) : "",
    };

    const businessLabels: Record<string, string> = {
      dental: "Dental Practice",
      healthcare: "Healthcare",
      legal: "Legal Firm",
      nonprofit: "Nonprofit",
      smb: "Small/Medium Business",
      other: "Something Else",
    };

    const businessDisplay = body.businessType
      ? businessLabels[body.businessType] || body.businessType
      : "Not specified";

    // Send notification to Ron
    await resend.emails.send({
      from: "Red Rose Technologies <noreply@redrosetechnologies.com>",
      to: ["info@redrosetechnologies.com"],
      replyTo: body.email,
      subject: `New Contact: ${safe.firstName} ${safe.lastName}`,
      html: `
        <div style="font-family:system-ui,sans-serif;max-width:600px;margin:0 auto;">
          <h2 style="color:#8b1a1a;margin-bottom:4px;">New Contact Form Submission</h2>
          <p style="color:#666;font-size:14px;margin-top:0;">From redrosetechnologies.com</p>
          <hr style="border:none;border-top:1px solid #e5e5e5;margin:16px 0;" />
          <table style="width:100%;font-size:14px;border-collapse:collapse;">
            <tr><td style="padding:8px 0;color:#666;width:140px;">Name</td><td style="padding:8px 0;font-weight:600;">${safe.firstName} ${safe.lastName}</td></tr>
            <tr><td style="padding:8px 0;color:#666;">Email</td><td style="padding:8px 0;"><a href="mailto:${safe.email}">${safe.email}</a></td></tr>
            <tr><td style="padding:8px 0;color:#666;">Phone</td><td style="padding:8px 0;">${safe.phone || "Not provided"}</td></tr>
            <tr><td style="padding:8px 0;color:#666;">Business Type</td><td style="padding:8px 0;">${businessDisplay}</td></tr>
          </table>
          ${safe.message ? `<hr style="border:none;border-top:1px solid #e5e5e5;margin:16px 0;" /><p style="font-size:14px;color:#666;margin-bottom:4px;">Message:</p><p style="font-size:14px;line-height:1.6;">${safe.message.replace(/\n/g, "<br>")}</p>` : ""}
          <hr style="border:none;border-top:1px solid #e5e5e5;margin:16px 0;" />
          <p style="font-size:12px;color:#999;">You can reply directly to this email to respond to ${safe.firstName}.</p>
        </div>
      `,
    });

    // Send confirmation to the person who submitted
    await resend.emails.send({
      from: "Red Rose Technologies <noreply@redrosetechnologies.com>",
      to: [body.email],
      subject: "We got your message — Red Rose Technologies",
      html: `
        <div style="font-family:system-ui,sans-serif;max-width:600px;margin:0 auto;">
          <h2 style="color:#8b1a1a;">Thanks for reaching out, ${safe.firstName}!</h2>
          <p style="font-size:15px;line-height:1.6;color:#333;">
            We received your message and Ron will get back to you within one business day.
          </p>
          <p style="font-size:15px;line-height:1.6;color:#333;">
            If it's urgent, feel free to call us directly at <strong>(954) 857-1100</strong>.
          </p>
          <hr style="border:none;border-top:1px solid #e5e5e5;margin:24px 0;" />
          <p style="font-size:12px;color:#999;">
            Red Rose Technologies — IT, Automation & Security for Local Businesses<br>
            Lakewood Ranch, FL
          </p>
        </div>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Contact form error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
