import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "5 AI Automations Every Dental Office Should Set Up This Week",
  description:
    "Stop copy-pasting patient reminders, appointment confirmations, and intake forms. These five no-code automations take under an hour to set up and save your team hours every week.",
  openGraph: {
    title: "5 AI Automations Every Dental Office Should Set Up This Week",
    description:
      "No-code automations for dental practices that save hours every week. Patient reminders, intake forms, reviews, and more.",
    url: "https://www.redrosetechnologies.com/resources/ai-automations-dental",
  },
};

export default function AIDentalArticle() {
  return (
    <article className="section-padding">
      <div className="container-site max-w-3xl">
        <div className="mb-8">
          <span className="text-xs font-bold text-accent uppercase tracking-wider">AI &amp; Automation</span>
          <span className="mx-2 text-faded">&#183;</span>
          <span className="text-xs text-faded">Guide</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-ink mb-6 leading-tight">
          5 AI Automations Every Dental Office Should Set Up This Week
        </h1>
        <p className="text-faded text-sm mb-12">By Ron Rose &middot; Red Rose Technologies &middot; March 2026</p>

        <div className="prose-custom text-secondary leading-relaxed space-y-6">
          <p className="text-lg">
            If your front desk is still manually calling patients to confirm appointments, typing out reminder texts, or chasing down intake forms on paper, you&apos;re leaving hours on the table every single week. The good news? Most of these problems can be solved in under an hour with tools you might already have access to.
          </p>
          <p>
            Here are five automations we set up in nearly every dental practice we work with. No coding required. No expensive software. Just practical, working automations that free up your staff to focus on patients instead of admin.
          </p>

          <h2 className="text-2xl font-bold text-ink mt-10">1. Automated Appointment Reminders</h2>
          <p>
            <strong>The problem:</strong> Your front desk spends 1-2 hours a day calling patients to confirm tomorrow&apos;s appointments. Half don&apos;t pick up. The other half say &ldquo;yeah, I&apos;ll be there&rdquo; and then no-show anyway.
          </p>
          <p>
            <strong>The fix:</strong> Set up automated SMS and email reminders that go out 48 hours, 24 hours, and 2 hours before each appointment. Patients can confirm with a single tap. No-shows drop by 30-40% on average.
          </p>
          <p>
            <strong>Tools:</strong> Most practice management systems (Dentrix, Eaglesoft, Curve Dental) have built-in reminder features or integrate with services like Weave, RevenueWell, or Lighthouse 360. If you&apos;re on a budget, Zapier + Google Calendar + Twilio can do it for pennies per message.
          </p>

          <h2 className="text-2xl font-bold text-ink mt-10">2. Digital Intake Forms</h2>
          <p>
            <strong>The problem:</strong> Patients fill out paper forms in the waiting room. Someone on your staff then types all of that into your PMS. It&apos;s slow, error-prone, and patients hate holding a clipboard.
          </p>
          <p>
            <strong>The fix:</strong> Send a digital intake form link via text or email before the appointment. The patient fills it out on their phone at home, and the data flows directly into your system. No retyping.
          </p>
          <p>
            <strong>Tools:</strong> Curve Dental has this built in. For Dentrix or Eaglesoft, look at Yapi, Mango Voice patient forms, or even a simple JotForm integration connected via Zapier.
          </p>

          <h2 className="text-2xl font-bold text-ink mt-10">3. Post-Visit Review Requests</h2>
          <p>
            <strong>The problem:</strong> You know your patients love you, but your Google reviews don&apos;t reflect it. Asking in person feels awkward, and nobody remembers to send a follow-up.
          </p>
          <p>
            <strong>The fix:</strong> Automatically send a friendly text 1-2 hours after each appointment with a direct link to your Google Business review page. Keep it simple: &ldquo;Thanks for visiting! If you had a great experience, we&apos;d love a quick review.&rdquo;
          </p>
          <p>
            <strong>Tools:</strong> Weave, BirdEye, or Podium all do this. Budget option: Zapier + your PMS + Twilio. The key is timing &mdash; send it while the visit is still fresh.
          </p>

          <h2 className="text-2xl font-bold text-ink mt-10">4. AI-Powered Phone Answering</h2>
          <p>
            <strong>The problem:</strong> Calls come in while your front desk is checking someone in, handling insurance, or eating lunch. Missed calls mean missed patients. Studies show 35% of new patient calls go to voicemail &mdash; and most don&apos;t leave a message.
          </p>
          <p>
            <strong>The fix:</strong> Use an AI receptionist that answers overflow calls, books appointments, and answers common questions (hours, insurance accepted, directions). It doesn&apos;t replace your staff &mdash; it backs them up when they&apos;re busy.
          </p>
          <p>
            <strong>Tools:</strong> Mango Voice (which we install for many of our clients), Smith.ai, or Ruby. These integrate with your existing phone system and PMS.
          </p>

          <h2 className="text-2xl font-bold text-ink mt-10">5. Automated Insurance Verification</h2>
          <p>
            <strong>The problem:</strong> Your team spends hours calling insurance companies, sitting on hold, and manually verifying coverage before each appointment. It&apos;s the single biggest time sink in most dental offices.
          </p>
          <p>
            <strong>The fix:</strong> Automated verification tools pull insurance eligibility data the day before each appointment and flag any issues. Your team only handles the exceptions instead of every single patient.
          </p>
          <p>
            <strong>Tools:</strong> Dentrix has Eligibility built in (but most offices don&apos;t use it). Vyne Dental, DentalXChange, and Trojan all automate verification. The ROI is massive &mdash; we&apos;ve seen offices save 8-10 hours per week on this alone.
          </p>

          <h2 className="text-2xl font-bold text-ink mt-10">The Bottom Line</h2>
          <p>
            None of these automations require coding, a huge budget, or months of implementation. Most can be set up in a single afternoon. The hard part isn&apos;t the technology &mdash; it&apos;s knowing which tools actually work with your specific setup and getting them configured correctly the first time.
          </p>
          <p>
            That&apos;s exactly what we do in our <Link href="/ai-clinics" className="text-accent hover:text-brand-600 font-semibold transition-colors">AI &amp; Automation Clinics</Link>. If you want hands-on help setting these up for your practice, or if you just want someone to look at your current workflow and tell you where the easy wins are, <Link href="/contact" className="text-accent hover:text-brand-600 font-semibold transition-colors">reach out to Ron</Link>. No pitch, no pressure. Just a real conversation about what&apos;s possible.
          </p>
        </div>

        <div className="mt-12 p-8 glass-card rounded-2xl text-center">
          <h3 className="text-xl font-bold text-ink mb-3">Want Help Setting These Up?</h3>
          <p className="text-faded text-sm mb-6">Book a free 30-minute call and we&apos;ll walk through which automations make sense for your practice.</p>
          <Link href="/contact" className="inline-flex px-8 py-3 bg-brand-700 hover:bg-brand-800 text-white rounded-xl font-semibold transition-all shadow-lg shadow-brand-700/25">
            Talk to Ron
          </Link>
        </div>
      </div>
    </article>
  );
}
