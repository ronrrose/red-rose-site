"use client";

import Hero from "@/components/Hero";
import FeatureGrid from "@/components/FeatureGrid";
import FAQSection from "@/components/FAQSection";
import CTABanner from "@/components/CTABanner";
import {
  Shield, Server, Cloud, Lock, MonitorSmartphone, FileCheck,
  Zap, Users, HeartHandshake,
} from "lucide-react";

const services = [
  { icon: Shield,             title: "Compliance That's Built In",      description: "HIPAA, SOC 2, whatever your industry requires. We build compliance into the foundation, not as an upsell after you sign." },
  { icon: Server,             title: "24/7 Network Monitoring",         description: "Our team watches your systems around the clock. When something looks off, we fix it before you even know about it." },
  { icon: Lock,               title: "Ransomware & Threat Protection",  description: "Endpoint detection, DNS filtering, AI-driven threat analysis. We make it very hard for the bad guys to get in." },
  { icon: Cloud,              title: "Cloud Migrations & Management",   description: "Ready to move off that old server? We'll get you to Microsoft 365, Azure, AWS, or Google Workspace without the headaches." },
  { icon: MonitorSmartphone,  title: "Helpdesk & On-Site Support",      description: "Real people who pick up the phone. Local techs who show up when you need them. Not a ticket queue in another state." },
  { icon: FileCheck,          title: "Backup & Disaster Recovery",      description: "Bulletproof backups with tested recovery plans. Your data is encrypted and restorable in minutes, not days." },
];

const differentiators = [
  { icon: Zap,              title: "Compliance First, Not Last",       description: "Most IT companies treat security as an add-on. We start there. It's the foundation of everything we do." },
  { icon: HeartHandshake,   title: "We Work Alongside You",            description: "Think of us as your part-time CTO. We learn your business, not just your network." },
  { icon: Users,            title: "We Know Your Software",             description: "Dentrix, Open Dental, Clio, QuickBooks. We've worked with the specific tools your practice runs on." },
  { icon: Shield,           title: "Honest, Flat-Rate Pricing",         description: "One price. No hidden fees. No surprise invoices. No 'that's not included' conversations." },
];

export default function ManagedITContent() {
  return (
    <>
      <Hero
        badge="Managed IT & Security"
        title={
          <>
            IT That&apos;s Built for{" "}
            <span className="text-gradient bg-gradient-to-r from-brand-700 to-brand-500 dark:from-brand-400 dark:to-rose-300">
              Compliance
            </span>
            , Not Commodity
          </>
        }
        subtitle="We're not a generic break-fix shop. We start with security and compliance, then build everything else on top of that. Your patients' data, your clients' files, your business. It all stays protected."
        primaryCta={{ label: "Get a Free IT Checkup", href: "/contact" }}
        secondaryCta={{ label: "See Our Industries", href: "/industries" }}
        trustItems={["HIPAA Compliant", "24/7 SOC", "Flat-Rate Pricing", "Local Techs"]}
      />

      <FeatureGrid
        label="What's Included"
        heading="Full-Service IT. No Surprises."
        subtitle="Everything you need to stay online, compliant, and secure. All under one roof."
        items={services}
      />

      <FeatureGrid
        label="Why We're Different"
        heading="Not Your Average IT Company"
        subtitle="Most IT shops compete on price. We compete on results. Here's what makes us different."
        items={differentiators}
        columns={2}
      />

      {/* ── Industry Callouts ── */}
      <section className="section-padding bg-panel border-y border-line">
        <div className="container-site">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <p className="text-accent font-semibold tracking-wide uppercase text-sm mb-3">Industry Know-How</p>
            <h2 className="text-3xl md:text-5xl font-bold text-ink mb-6">
              We Already Know Your Business
            </h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[
              { name: "Dental Practices", detail: "Dentrix, Eaglesoft, Open Dental. HIPAA-compliant imaging servers, backups, and network security. We've done this hundreds of times." },
              { name: "Healthcare Providers", detail: "EHR/EMR support, regulatory compliance, secure patient records, and telehealth setups that actually work." },
              { name: "Legal Firms", detail: "Clio, MyCase, document management. Client confidentiality, eDiscovery readiness, and secure file sharing for distributed teams." },
              { name: "Nonprofits", detail: "Grant-eligible tech upgrades, Microsoft 365 Nonprofit licensing, and donor data security on a real-world budget." },
              { name: "Local SMBs", detail: "QuickBooks, POS systems, VoIP, cloud tools. Reliable IT that grows with you without the enterprise price tag." },
            ].map((ind) => (
              <div key={ind.name} className="glass-card p-6 rounded-2xl">
                <h3 className="text-ink font-bold mb-2">{ind.name}</h3>
                <p className="text-faded text-sm leading-relaxed">{ind.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ── */}
      <section className="section-padding border-t border-line">
        <div className="container-site">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <p className="text-accent font-semibold tracking-wide uppercase text-sm mb-3">Pricing</p>
            <h2 className="text-3xl md:text-5xl font-bold text-ink mb-4">Flat-Rate. No Surprises.</h2>
            <p className="text-secondary text-lg">Every plan includes compliance, monitoring, and support. Pick the level that fits your business.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                name: "Essentials",
                price: "49",
                unit: "/user/mo",
                features: ["24/7 network monitoring", "Helpdesk support (business hours)", "Antivirus & endpoint protection", "Patch management", "Monthly health reports"],
              },
              {
                name: "Professional",
                price: "89",
                unit: "/user/mo",
                popular: true,
                features: ["Everything in Essentials", "HIPAA/compliance documentation", "Cloud backup & disaster recovery", "Advanced threat detection (SOC)", "On-site support (as needed)", "Quarterly business reviews"],
              },
              {
                name: "Enterprise",
                price: "Custom",
                unit: "",
                features: ["Everything in Professional", "Dedicated account manager", "Custom integrations & automation", "Virtual CTO consulting", "Priority 24/7 emergency line", "Multi-location support"],
              },
            ].map((plan) => (
              <div key={plan.name} className={`glass-card rounded-2xl p-8 flex flex-col ${plan.popular ? "ring-2 ring-accent relative" : ""}`}>
                {plan.popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-accent text-white text-xs font-bold rounded-full">Most Popular</span>
                )}
                <h3 className="text-xl font-bold text-ink mb-2">{plan.name}</h3>
                <div className="mb-6">
                  <span className="text-3xl font-bold text-ink">{plan.price === "Custom" ? "" : "$"}{plan.price}</span>
                  {plan.unit && <span className="text-faded text-sm">{plan.unit}</span>}
                </div>
                <ul className="space-y-3 flex-1 mb-8">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-secondary text-sm">
                      <span className="w-1.5 h-1.5 rounded-full bg-accent shrink-0 mt-1.5" />
                      {f}
                    </li>
                  ))}
                </ul>
                <a href="/contact" className={`block text-center px-6 py-3 rounded-xl font-semibold transition-all text-sm ${plan.popular ? "bg-brand-700 hover:bg-brand-800 text-white shadow-lg shadow-brand-700/25" : "border border-line text-ink hover:bg-raised/50"}`}>
                  {plan.price === "Custom" ? "Talk to Ron" : "Get Started"}
                </a>
              </div>
            ))}
          </div>
          <p className="text-center text-faded text-sm mt-8">All plans require a minimum of 5 users. No contracts. Cancel anytime.</p>
        </div>
      </section>

      <FAQSection
        heading="Common Questions"
        faqs={[
          { question: "Do I need a contract to use your managed IT services?", answer: "No. We work on a month-to-month basis. We earn your business every month by doing good work, not by trapping you in a long-term contract." },
          { question: "What does 24/7 monitoring actually mean?", answer: "Our Security Operations Center watches your network, endpoints, and cloud services around the clock. If something looks suspicious — unusual login activity, malware signatures, failed backups — we catch it and respond before it becomes a problem." },
          { question: "Are you HIPAA compliant?", answer: "Yes. Every plan includes HIPAA compliance documentation, risk assessments, and the security controls required to meet HIPAA standards. We handle dental practices, healthcare providers, and any business dealing with protected health information." },
          { question: "What industries do you specialize in?", answer: "Dental practices, healthcare providers, legal firms, nonprofits, and small to medium businesses. We know the specific software, compliance requirements, and workflows for each of these industries." },
          { question: "How fast is your response time?", answer: "Critical issues get immediate response. Standard helpdesk requests are typically resolved within 1-2 hours during business hours. Emergency line clients get 24/7 priority support." },
          { question: "Can you help migrate us to the cloud?", answer: "Absolutely. We handle migrations to Microsoft 365, Google Workspace, Azure, and AWS. We plan the migration carefully, test everything, and make sure your team is trained before we flip the switch." },
        ]}
      />

      <CTABanner
        heading="Want to See What Good IT Looks Like?"
        subtitle="We'll run a free checkup on your network and show you exactly where the gaps are. No pitch, no pressure."
        primaryLabel="Let's Take a Look"
      />
    </>
  );
}
