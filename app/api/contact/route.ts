import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

if (!process.env.RESEND_API_KEY) {
  throw new Error("Missing RESEND_API_KEY environment variable");
}

const resend = new Resend(process.env.RESEND_API_KEY);

// In-memory rate limiting: 5 submissions per IP per 15 minutes
const submissionsByIp = new Map<string, number[]>();
const WINDOW_MS = 15 * 60 * 1000;
const MAX_SUBMISSIONS = 5;

function rateLimit(ip: string): boolean {
  const now = Date.now();
  const windowStart = now - WINDOW_MS;
  const timestamps = (submissionsByIp.get(ip) || []).filter((t) => t > windowStart);
  timestamps.push(now);
  submissionsByIp.set(ip, timestamps);
  return timestamps.length <= MAX_SUBMISSIONS;
}

interface ContactBody {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  businessType?: string;
  message?: string;
}

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "unknown";
    if (!rateLimit(ip)) {
      return NextResponse.json(
        { error: "Too many submissions. Please try again later." },
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
