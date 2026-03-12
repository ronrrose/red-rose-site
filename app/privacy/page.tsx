import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
};

export default function PrivacyPage() {
  return (
    <section className="section-padding">
      <div className="container-site max-w-3xl">
        <h1 className="text-3xl md:text-4xl font-bold text-ink mb-8">Privacy Policy</h1>
        <div className="prose prose-sm text-secondary leading-relaxed space-y-6">
          <p className="text-faded text-sm">Last updated: March 12, 2026</p>

          <h2 className="text-xl font-bold text-ink mt-8">1. Information We Collect</h2>
          <p>When you use our website or contact form, we may collect your name, email address, phone number, business type, and any message you submit. We also collect standard analytics data such as IP address, browser type, and pages visited.</p>

          <h2 className="text-xl font-bold text-ink mt-8">2. How We Use Your Information</h2>
          <p>We use your information to respond to inquiries, provide IT services, send service-related communications, and improve our website. We do not sell, rent, or share your personal information with third parties for marketing purposes.</p>

          <h2 className="text-xl font-bold text-ink mt-8">3. Email Communications</h2>
          <p>When you submit our contact form, you will receive a confirmation email. We use Resend as our email service provider. Your email address is only used to respond to your inquiry and is not added to any marketing list without your explicit consent.</p>

          <h2 className="text-xl font-bold text-ink mt-8">4. Cookies</h2>
          <p>We use essential cookies to remember your preferences (such as theme and accessibility settings). We do not use tracking cookies or third-party advertising cookies.</p>

          <h2 className="text-xl font-bold text-ink mt-8">5. Data Security</h2>
          <p>We implement industry-standard security measures to protect your personal information. All data transmitted through our website is encrypted via SSL/TLS.</p>

          <h2 className="text-xl font-bold text-ink mt-8">6. Third-Party Services</h2>
          <p>Our website uses the following third-party services: Vercel (hosting), Resend (email delivery), and Google Maps (embedded map). Each service has its own privacy policy governing their use of data.</p>

          <h2 className="text-xl font-bold text-ink mt-8">7. Your Rights</h2>
          <p>You may request access to, correction of, or deletion of your personal information at any time by contacting us at info@redrosetechnologies.com or (954) 857-1100.</p>

          <h2 className="text-xl font-bold text-ink mt-8">8. Changes to This Policy</h2>
          <p>We may update this privacy policy from time to time. Changes will be posted on this page with an updated revision date.</p>

          <h2 className="text-xl font-bold text-ink mt-8">9. Contact</h2>
          <p>If you have questions about this privacy policy, contact us at:</p>
          <p>
            Red Rose Technologies<br />
            Lakewood Ranch, FL<br />
            info@redrosetechnologies.com<br />
            (954) 857-1100
          </p>
        </div>
      </div>
    </section>
  );
}
