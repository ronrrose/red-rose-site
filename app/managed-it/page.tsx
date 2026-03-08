"use client";

import Hero from "@/components/Hero";
import FeatureGrid from "@/components/FeatureGrid";
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

export default function ManagedITPage() {
  return (
    <>
      <Hero
        badge="Managed IT & Security"
        title={
          <>
            IT That&apos;s Built for{" "}
            <span className="text-gradient bg-gradient-to-r from-brand-400 to-cyan-400">
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
      <section className="section-padding bg-dark-950/50 border-y border-dark-700/30">
        <div className="container-site">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <p className="text-brand-400 font-semibold tracking-wide uppercase text-sm mb-3">Industry Know-How</p>
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
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
                <h3 className="text-white font-bold mb-2">{ind.name}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{ind.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <CTABanner
        heading="Want to See What Good IT Looks Like?"
        subtitle="We'll run a free checkup on your network and show you exactly where the gaps are. No pitch, no pressure."
        primaryLabel="Let's Take a Look"
      />
    </>
  );
}
