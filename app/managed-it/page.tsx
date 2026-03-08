import type { Metadata } from "next";
import Hero from "@/components/Hero";
import FeatureGrid from "@/components/FeatureGrid";
import CTABanner from "@/components/CTABanner";
import {
  Shield, Server, Cloud, Lock, MonitorSmartphone, FileCheck,
  Zap, Users, HeartHandshake,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Managed IT & Security",
  description:
    "Premium, compliance-first managed IT and cybersecurity for dental practices, healthcare, legal firms, nonprofits & SMBs in Lakewood Ranch, Sarasota & Tampa Bay.",
};

const services = [
  { icon: Shield,             title: "Compliance-First Security",    description: "HIPAA, SOC 2, and regulatory compliance built into every layer — not an afterthought or add-on." },
  { icon: Server,             title: "Proactive Network Monitoring",  description: "24/7 SOC monitoring with real-time alerts. We catch threats and resolve issues before they impact your business." },
  { icon: Lock,               title: "Ransomware & Threat Protection", description: "Advanced endpoint detection, DNS filtering, and AI-driven threat analysis to keep cybercriminals out." },
  { icon: Cloud,              title: "Cloud Migrations & Management", description: "Seamlessly move legacy systems to secure cloud infrastructure — Microsoft 365, Azure, AWS, and Google Workspace." },
  { icon: MonitorSmartphone,  title: "Helpdesk & On-Site Support",    description: "Friendly, fast, and local. Real technicians who pick up the phone and fix problems — not a ticket queue in another state." },
  { icon: FileCheck,          title: "Backup & Disaster Recovery",    description: "Bulletproof backups with tested recovery plans. Your data is safe, encrypted, and restorable in minutes — not days." },
];

const differentiators = [
  { icon: Zap,              title: "Compliance First, Not Last",     description: "We build security and compliance into the foundation. Most MSPs bolt it on as an upsell. We don't." },
  { icon: HeartHandshake,   title: "Operator-First Partnership",     description: "We work alongside you like a fractional CTO — understanding your business, not just your network." },
  { icon: Users,            title: "Industry-Specialized Teams",     description: "We know Dentrix, Open Dental, Clio, QuickBooks, and the specific software your practice runs on." },
  { icon: Shield,           title: "No Commodity Pricing Games",     description: "Transparent, flat-rate pricing. No hidden fees, no surprise invoices, no 'that's not included' responses." },
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
        subtitle="Red Rose Technologies delivers premium managed IT that starts with security and compliance — not a generic break-fix shop reselling the same stack as everyone else."
        primaryCta={{ label: "Get a Free IT Assessment", href: "/contact" }}
        secondaryCta={{ label: "See Our Industries", href: "/industries" }}
        trustItems={["HIPAA Compliant", "24/7 SOC", "Flat-Rate Pricing", "Local Technicians"]}
      />

      <FeatureGrid
        label="What's Included"
        heading="Full-Service IT, Zero Surprises"
        subtitle="Everything your business needs to stay online, compliant, and secure — under one roof."
        items={services}
      />

      <FeatureGrid
        label="Why We're Different"
        heading="This Isn't Your Average MSP"
        subtitle="Most MSPs compete on price. We compete on outcomes. Here's what sets us apart."
        items={differentiators}
        columns={2}
      />

      {/* ── Industry Callouts ── */}
      <section className="section-padding bg-dark-950/50 border-y border-dark-700/30">
        <div className="container-site">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <p className="text-brand-400 font-semibold tracking-wide uppercase text-sm mb-3">Industry Expertise</p>
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
              IT That Understands Your Business
            </h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[
              { name: "Dental Practices", detail: "Dentrix, Eaglesoft, Open Dental support. HIPAA-compliant imaging servers, backup, and network security." },
              { name: "Healthcare Providers", detail: "EHR/EMR integration, regulatory compliance, secure patient data handling, and telehealth infrastructure." },
              { name: "Legal Firms", detail: "Clio, MyCase, and document management. Client confidentiality, eDiscovery readiness, and secure file sharing." },
              { name: "Nonprofits", detail: "Grant-eligible technology upgrades, Microsoft 365 Nonprofit licensing, and donor data security." },
              { name: "Local SMBs", detail: "QuickBooks, POS systems, VoIP, and cloud productivity. Reliable IT that scales with your growth." },
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
        heading="See What Proactive IT Looks Like"
        subtitle="Get a free network assessment and discover vulnerabilities, compliance gaps, and efficiency opportunities."
        primaryLabel="Start Your Assessment"
      />
    </>
  );
}
