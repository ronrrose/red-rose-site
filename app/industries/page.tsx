import type { Metadata } from "next";
import Hero from "@/components/Hero";
import CTABanner from "@/components/CTABanner";
import { CheckCircle2, Stethoscope, Heart, Scale, Building2, Briefcase } from "lucide-react";

export const metadata: Metadata = {
  title: "Industries We Serve",
  description:
    "IT, cybersecurity, and AI automation for dental practices, healthcare, legal, nonprofits, and local businesses in Lakewood Ranch, Bradenton, Sarasota, and Tampa Bay.",
};

const industries = [
  {
    id: "dental",
    icon: Stethoscope,
    name: "Dental Practices",
    headline: "HIPAA IT That Knows Dentistry Inside and Out",
    painPoints: [
      "Dentrix or Eaglesoft running slow, freezing, or crashing during patients",
      "Imaging server that hasn't been backed up properly in months",
      "Staff spending hours on phone reminders and manual patient comms",
      "Worried about what happens during a HIPAA audit",
      "IT vendor who doesn't know the difference between Dentrix and Dexis",
    ],
    services: [
      "Practice management software support and speed tuning",
      "HIPAA risk assessments with full documentation",
      "Encrypted backups with tested disaster recovery",
      "Automated patient communication workflows",
      "Digital imaging server setup and ongoing management",
      "Staff cybersecurity training (yes, the phishing kind)",
    ],
  },
  {
    id: "healthcare",
    icon: Heart,
    name: "Healthcare Providers",
    headline: "Secure IT for People Who Take Care of People",
    painPoints: [
      "EHR/EMR systems that are slow or constantly need workarounds",
      "HIPAA paperwork eating up admin hours every month",
      "Telehealth platform that drops calls or isn't actually secure",
      "Growing ransomware threats targeting healthcare",
      "Nobody watching your systems at 2 AM on a Saturday",
    ],
    services: [
      "EHR/EMR integration and performance tuning",
      "HIPAA compliance management and audit documentation",
      "Telehealth infrastructure that's secure and reliable",
      "24/7 endpoint monitoring and threat detection",
      "Cloud migrations done carefully (Azure, AWS, Google Cloud)",
      "Medical device network segmentation and security",
    ],
  },
  {
    id: "legal",
    icon: Scale,
    name: "Legal Firms",
    headline: "Keep Client Data Safe. Get Work Done Faster.",
    painPoints: [
      "Nervous about client confidentiality with cloud storage",
      "eDiscovery processes that take forever",
      "Attorneys working remotely without proper security",
      "Bar association data protection rules that keep changing",
      "Document management systems that don't sync right",
    ],
    services: [
      "Clio, MyCase, and practice management optimization",
      "Encrypted file sharing and client portal setup",
      "eDiscovery readiness and litigation support infrastructure",
      "Multi-factor authentication and zero-trust access",
      "Secure remote access for distributed legal teams",
      "Compliance documentation and audit prep",
    ],
  },
  {
    id: "nonprofits",
    icon: Building2,
    name: "Nonprofits",
    headline: "Do More Good With Less Budget",
    painPoints: [
      "Small IT budget but growing tech needs",
      "Donor and beneficiary data that isn't properly locked down",
      "Staff using personal phones and laptops with no security policies",
      "Outdated systems slowing down program delivery",
      "No tech strategy that lines up with grant requirements",
    ],
    services: [
      "Microsoft 365 Nonprofit licensing and full setup",
      "Grant-eligible technology planning and procurement",
      "Donor database security and CRM integration",
      "Cloud-first infrastructure on a nonprofit-sized budget",
      "Cybersecurity training for staff and volunteers",
      "Board-ready IT reporting and compliance docs",
    ],
  },
  {
    id: "smb",
    icon: Briefcase,
    name: "Small & Medium Businesses",
    headline: "Big-Company IT. Small-Company Price.",
    painPoints: [
      "Outgrowing your break-fix IT guy but not ready for a full IT team",
      "Cybersecurity threats you hear about but don't know how to stop",
      "No disaster recovery plan. One crash and everything's gone.",
      "Making tech decisions without a plan",
      "Paying for IT services you don't actually use",
    ],
    services: [
      "Flat-rate managed IT with no hidden fees",
      "QuickBooks, POS, and business app support",
      "VoIP phone systems and unified communications",
      "Cloud setup: Microsoft 365, Google Workspace, done right",
      "Network design, Wi-Fi tuning, and cabling",
      "Virtual CTO consulting and technology roadmapping",
    ],
  },
];

export default function IndustriesPage() {
  return (
    <>
      <Hero
        badge="Industry Expertise"
        title={
          <>
            We Know Your Industry.{" "}
            <span className="text-gradient bg-gradient-to-r from-brand-700 to-brand-500 dark:from-brand-400 dark:to-rose-300">
              That&apos;s the Point.
            </span>
          </>
        }
        subtitle="We don't do generic IT. We specialize in industries where compliance, security, and uptime aren't nice-to-haves. They're the whole job."
        primaryCta={{ label: "Talk to Us About Your Industry", href: "/contact" }}
        trustItems={["Dental", "Healthcare", "Legal", "Nonprofits", "SMBs"]}
      />

      {/* ── Industry Sections ── */}
      {industries.map((ind, idx) => (
        <section
          key={ind.id}
          id={ind.id}
          className={`section-padding ${idx % 2 === 0 ? "" : "bg-panel"} border-t border-line`}
        >
          <div className="container-site">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-14 h-14 rounded-xl bg-[var(--accent-bg)] border border-[var(--accent-border)] flex items-center justify-center text-accent">
                <ind.icon className="w-7 h-7" />
              </div>
              <div>
                <p className="text-accent font-semibold text-sm">{ind.name}</p>
                <h2 className="text-2xl md:text-3xl font-bold text-ink">{ind.headline}</h2>
              </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-10">
              <div>
                <h3 className="text-lg font-bold text-ink mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-brand-500" />
                  Sound Familiar?
                </h3>
                <ul className="space-y-3">
                  {ind.painPoints.map((p, i) => (
                    <li key={i} className="flex items-start gap-3 text-secondary text-[15px]">
                      <span className="w-1.5 h-1.5 rounded-full bg-brand-400 shrink-0 mt-2" />
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-bold text-ink mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-accent" />
                  Here&apos;s What We Do About It
                </h3>
                <ul className="space-y-3">
                  {ind.services.map((s, i) => (
                    <li key={i} className="flex items-start gap-3 text-secondary text-[15px]">
                      <CheckCircle2 className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>
      ))}

      <CTABanner
        heading="Let's Talk About Your Industry"
        subtitle="Every business has its own headaches. Tell us yours and we'll show you exactly how we'd handle it."
        primaryLabel="Get a Custom Assessment"
      />
    </>
  );
}
