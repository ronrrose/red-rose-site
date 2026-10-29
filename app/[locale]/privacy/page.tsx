import type { Metadata } from "next";
import { localeAlternates } from "@/lib/metadata";
import { CONTACT_EMAIL, PHONE_DISPLAY } from "@/lib/site-config";
import type { Locale } from "@/i18n/config";

export async function generateMetadata({
  params,
}: {
  params: { locale: Locale };
}): Promise<Metadata> {
  return {
    title: "Privacy Policy",
    description:
      "Red Rose Technologies privacy policy. Learn how we collect, use, and protect your personal information.",
    openGraph: {
      title: "Privacy Policy — Red Rose Technologies",
    },
    alternates: localeAlternates("/privacy", params.locale),
  };
}

export default function PrivacyPage() {
  return (
    <section className="section-padding">
      <div className="container-site max-w-3xl">
        <h1 className="text-3xl md:text-4xl font-bold text-ink mb-8">Privacy Policy</h1>
        <div className="prose prose-sm text-secondary leading-relaxed space-y-6">
          <p className="text-faded text-sm">Last updated: October 29, 2026</p>
          <h2 className="text-xl font-bold text-ink mt-8">1. Information We Collect</h2>
          <p>When you use our contact form, we collect your name, email address, phone number, business type, your message, and whether you agreed to receive text messages. When you chat with Ava, our AI assistant, we receive what you type or say. Our host keeps standard server logs, such as IP address, browser type, and pages requested. We do not use analytics or advertising trackers, and we do not record your screen or replay your visits.</p>
          <h2 className="text-xl font-bold text-ink mt-8">2. How We Use Your Information</h2>
          <p>We use your information to respond to inquiries, provide IT services, send service-related communications, and improve our website. We do not sell, rent, or share your personal information with third parties for marketing purposes.</p>
          <h2 className="text-xl font-bold text-ink mt-8">3. Email and Text Messages</h2>
          <p>When you submit our contact form, you receive a confirmation email, sent through Resend. Your email address is used to answer your inquiry and is not added to any marketing list without your explicit consent. We text you only if you tick the text-message box on the form, which is never pre-ticked. Reply STOP at any time and we stop texting you.</p>
          <h2 className="text-xl font-bold text-ink mt-8">4. Ava, Our AI Assistant</h2>
          <p>Ava is an AI assistant, not a person. Chat messages are processed by our AI provider, Anthropic, to write Ava&apos;s replies. If a conversation contains a phone number or email address, it is saved as an inquiry so our team can follow up. Ava&apos;s voice is produced by ElevenLabs, and her live video by LiveAvatar (HeyGen). Your microphone is used only after you agree on the consent screen. Please do not share patient or other health information in the chat; call us instead.</p>
          <h2 className="text-xl font-bold text-ink mt-8">5. Cookies</h2>
          <p>We remember your preferences, such as theme and accessibility settings, on your device. Two Google services can set their own cookies, and both load only when you use them: reCAPTCHA, which protects the contact form from spam and loads when you start filling in the form, and Google Maps, which loads only if you click Show the map. We do not use tracking cookies or third-party advertising cookies.</p>
          <h2 className="text-xl font-bold text-ink mt-8">6. Third-Party Services</h2>
          <p>We use these service providers to run the site: Vercel (hosting), Neon (the database that stores inquiries), Resend (email delivery), Quo (our business phone and text messages), Anthropic (AI for Ava), ElevenLabs (Ava&apos;s voice), LiveAvatar by HeyGen (Ava&apos;s live video), Roam (our booking calendar, which loads when you choose to book a call), and Google (reCAPTCHA and Maps, as described above). Each has its own privacy policy governing its use of data.</p>
          <h2 className="text-xl font-bold text-ink mt-8">7. Children</h2>
          <p>This website is for businesses and adults. We do not knowingly collect information from children under 13. If we learn we have, we delete it.</p>
          <h2 className="text-xl font-bold text-ink mt-8">8. Your Rights</h2>
          <p>You may request access to, correction of, or deletion of your personal information at any time by contacting us at {CONTACT_EMAIL} or {PHONE_DISPLAY}.</p>

          <h2 className="text-xl font-bold text-ink mt-8">9. Changes to This Policy</h2>
          <p>We may update this privacy policy from time to time. Changes will be posted on this page with an updated revision date.</p>

          <h2 className="text-xl font-bold text-ink mt-8">10. Contact</h2>
          <p>If you have questions about this privacy policy, contact us at:</p>
          <p>
            Red Rose Technologies<br />
            Lakewood Ranch, FL<br />
            {CONTACT_EMAIL}<br />
            {PHONE_DISPLAY}
          </p>
        </div>
      </div>
    </section>
  );
}
