import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service",
};

export default function TermsPage() {
  return (
    <section className="section-padding">
      <div className="container-site max-w-3xl">
        <h1 className="text-3xl md:text-4xl font-bold text-ink mb-8">Terms of Service</h1>
        <div className="prose prose-sm text-secondary leading-relaxed space-y-6">
          <p className="text-faded text-sm">Last updated: March 12, 2026</p>

          <h2 className="text-xl font-bold text-ink mt-8">1. Acceptance of Terms</h2>
          <p>By accessing and using the Red Rose Technologies website (redrosetechnologies.com), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our website.</p>

          <h2 className="text-xl font-bold text-ink mt-8">2. Services</h2>
          <p>Red Rose Technologies provides managed IT, cybersecurity, AI automation consulting, and related technology services for businesses. Service details, pricing, and scope are determined through individual client agreements.</p>

          <h2 className="text-xl font-bold text-ink mt-8">3. Use of Website</h2>
          <p>You may use this website for lawful purposes only. You agree not to use the site in any way that could damage, disable, or impair our services, or interfere with other visitors&apos; use of the site.</p>

          <h2 className="text-xl font-bold text-ink mt-8">4. Intellectual Property</h2>
          <p>All content on this website, including text, graphics, logos, and design, is the property of Red Rose Technologies and is protected by copyright and trademark laws. You may not reproduce, distribute, or create derivative works without our written permission.</p>

          <h2 className="text-xl font-bold text-ink mt-8">5. Contact Form & Communications</h2>
          <p>Information submitted through our contact form is used solely to respond to your inquiry. By submitting the form, you consent to receiving a confirmation email and follow-up communication related to your inquiry.</p>

          <h2 className="text-xl font-bold text-ink mt-8">6. Disclaimer of Warranties</h2>
          <p>This website is provided &ldquo;as is&rdquo; without warranties of any kind. We do not guarantee that the website will be uninterrupted, error-free, or free of viruses or other harmful components.</p>

          <h2 className="text-xl font-bold text-ink mt-8">7. Limitation of Liability</h2>
          <p>Red Rose Technologies shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of this website or our services.</p>

          <h2 className="text-xl font-bold text-ink mt-8">8. External Links</h2>
          <p>Our website may contain links to third-party websites. We are not responsible for the content or privacy practices of those sites.</p>

          <h2 className="text-xl font-bold text-ink mt-8">9. Changes to Terms</h2>
          <p>We reserve the right to modify these terms at any time. Changes take effect immediately upon posting. Continued use of the website constitutes acceptance of the updated terms.</p>

          <h2 className="text-xl font-bold text-ink mt-8">10. Governing Law</h2>
          <p>These terms are governed by the laws of the State of Florida. Any disputes shall be resolved in the courts of Manatee County, Florida.</p>

          <h2 className="text-xl font-bold text-ink mt-8">11. Contact</h2>
          <p>Questions about these terms? Contact us at:</p>
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
