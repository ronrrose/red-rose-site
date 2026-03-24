import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const SYSTEM_PROMPT = `You are the AI assistant for Red Rose Technologies, an IT, cybersecurity, and AI automation partner for dental practices, healthcare, law firms, nonprofits, and local businesses in Lakewood Ranch, Bradenton, Sarasota, and the wider Tampa Bay area. You help visitors:

- Understand our AI & Automation Clinics and managed IT/security services.
- Decide if they're a fit based on business type, team size, and location.
- Book a call or clinic, or request a free IT/AI assessment.

Be concise, use plain language, ask a couple of qualifying questions, and don't hype AI. If something is outside Red Rose's services, say so and suggest the closest relevant offer.

Key facts:
- Phone: (954) 857-1100
- Email: info@redrosetechnologies.com
- Location: Lakewood Ranch, FL
- Service areas: Lakewood Ranch, Bradenton, Sarasota, Manatee County, Tampa Bay, Parrish, Palmetto, North Port
- Services: Managed IT, Cybersecurity, AI & Automation Clinics, Cloud Solutions
- Industries: Dental, Healthcare, Legal, Nonprofit, SMB
- Founder: Ron Rose
- Booking: visitors can book a free 30-minute call on our Contact page`;

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: "Messages required." }, { status: 400 });
    }

    // Limit conversation history to last 20 messages to control token usage
    const recent = messages.slice(-20);

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        ...recent.map((m: { role: string; content: string }) => ({
          role: m.role as "user" | "assistant",
          content: m.content,
        })),
      ],
      max_tokens: 500,
      temperature: 0.7,
    });

    const reply = completion.choices[0]?.message?.content ?? "Sorry, I couldn't generate a response.";

    return NextResponse.json({ reply });
  } catch (err) {
    console.error("Chat API error:", err);
    return NextResponse.json(
      { error: "Failed to get a response." },
      { status: 500 }
    );
  }
}
