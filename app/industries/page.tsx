import type { Metadata } from "next";
import Hero from "@/components/Hero";
import CTABanner from "@/components/CTABanner";
import { CheckCircle2, Stethoscope, Heart, Scale, Building2, Briefcase } from "lucide-react";

export const metadata: Metadata = {
  title: "Industries We Serve",
  description:
    "Specialized IT, cybersecurity, and AI automation for dental practices, healthcare, legal, nonprofits, and SMBs in Lakewood Ranch, Bradenton, Sarasota & Tampa Bay.",
};

const industries = [
  {
    id: "dental",
    icon: Stethoscope,
    name: "Dental Practices",
    headline: "HIPAA-Compliant IT Built for Modern Dentistry",
    painPoints: [
      "Dentrix, Eaglesoft, or Open Dental running slow or crashing",
      "Imaging servers not backed up or HIPAA-compliant",
      "Staff wasting hours on manual patient communications",
      "Fear of failing a HIPAA audit or suffering a data breach",
      "IT vendor who doesn't understand dental workflows",
    ],
    services: [
      "Practice management software support & optimization",
      "HIPAA risk assessments & compliance documentation",
      "Encrypted backups with tested disaster recovery",
      "Secure patient communication automation",
      "Digital imaging server setup & management",
      "Staff cybersecurity awareness training",
    ],
  },
  {
    id: "healthcare",
    icon: Heart,
    name: "Healthcare Providers",
    headline: "Secure, Compliant IT for Patient-Centered Care",
    painPoints: [
      "EHR/EMR systems that are slow, outdated, or poorly integrated",
      "Ongoing HIPAA compliance requirements eating up admin time",
      "Telehealth platforms that aren't secure or reliable",
      "Ransomware threats targeting healthcare organizations",
      "Lack of 24/7 monitoring for critical systems",
    ],
    services: [
      "EHR/EMR integration & optimization",
      "HIPAA compliance management & documentation",
      "Telehealth infrastructure setup & security",
      "24/7 endpoint monitoring & threat detection",
      "Secure cloud migrations (Azure, AWS, Google Cloud)",
      "Medical device network segmentation & security",
    ],
  },
  {
    id: "legal",
    icon: Scale,
    name: "Legal Firms",
    headline: "Protect Client Data. Streamline Operations.",
    painPoints: [
      "Client confidentiality concerns with cloud storage",
      "eDiscovery processes that are slow and manual",
      "Remote work security gaps for attorneys and staff",
      "Compliance with bar association data protection rules",
      "Document management systems that don't sync properly",
    ],
    services: [
      "Clio, MyCase, and practice management optimization",
      "Encrypted file sharing & client portal setup",
      "eDiscovery readiness & litigation support infrastructure",
      "Multi-factor authentication & zero-trust access",
      "Secure remote access for distributed legal teams",
      "Compliance documentation & audit preparation",
    ],
  },
  {
    id: "nonprofits",
    icon: Building2,
    name: "Nonprofits",
    headline: "Maximize Impact with Smart, Affordable IT",
    painPoints: [
      "Limited IT budget but growing technology needs",
      "Donor and beneficiary data that isn't properly secured",
      "Staff using personal devices without security policies",
      "Outdated systems that slow down program delivery",
      "No IT strategy aligned with grant and funding requirements",
    ],
    services: [
      "Microsoft 365 Nonprofit licensing & setup",
      "Grant-eligible technology planning & procurement",
      "Donor database security & CRM integration",
      "Cloud-first infrastructure on a nonprofit budget",
      "Cybersecurity awareness training for staff & volunteers",
      "Board-ready IT reporting & compliance documentation",
    ],
  },
  {
    id: "smb",
    icon: Briefcase,
    name: "Small & Medium Businesses",
    headline: "Enterprise-Grade IT, Local Business Pricing",
    painPoints: [
      "Outgrowing break-fix IT but not ready for a full IT department",
      "Cybersecurity threats targeting small businesses",
      "No disaster recovery plan — one crash and you lose everything",
      "Technology decisions made without a strategic plan",
      "Paying for IT services you don't actually need",
    ],
    services: [
      "Flat-rate managed IT with no hidden fees",
      "QuickBooks, POS, and line-of-business app support",
      "VoIP phone systems & unified communications",
      "Cloud productivity suite setup (Microsoft 365, Google Workspace)",
      "Network design, Wi-Fi optimization, and cabling",
      "Virtual CTO consulting & technology roadmapping",
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
            Deep Expertise in the Industries That{" "}
            <span className="text-gradient bg-gradient-to-r from-brand-400 to-cyan-400">
              Matter Most
            </span>
          </>
        }
        subtitle="We don't do generic IT. We specialize in regulated, high-stakes industries where compliance, security, and uptime aren't optional — they're everything."
        primaryCta={{ label: "Get Industry-Specific Help", href: "/contact" }}
        trustItems={["Dental", "Healthcare", "Legal", "Nonprofits", "SMBs"]}
      />

      {/* ── Industry Sections ── */}
      {industries.map((ind, idx) => (
        <section
          key={ind.id}
          id={ind.id}
          className={`section-padding ${idx % 2 === 0 ? "" : "bg-dark-950/50"} border-t border-dark-700/30`}
        >
          <div className="container-site">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-14 h-14 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-400">
                <ind.icon className="w-7 h-7" />
              </div>
              <div>
                <p className="text-brand-400 font-semibold text-sm">{ind.name}</p>
                <h2 className="text-2xl md:text-3xl font-bold text-white">{ind.headline}</h2>
              </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-10">
              <div>
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-accent-500" />
                  Common Pain Points
                </h3>
                <ul className="space-y-3">
                  {ind.painPoints.map((p, i) => (
                    <li key={i} className="flex items-start gap-3 text-slate-300 text-[15px]">
                      <span className="w-1.5 h-1.5 rounded-full bg-accent-400 shrink-0 mt-2" />
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-brand-400" />
                  How We Help
                </h3>
                <ul className="space-y-3">
                  {ind.services.map((s, i) => (
                    <li key={i} className="flex items-start gap-3 text-slate-300 text-[15px]">
                      <CheckCircle2 className="w-5 h-5 text-brand-400 shrink-0 mt-0.5" />
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
        subtitle="Every industry has unique IT challenges. Get a free assessment tailored to yours."
        primaryLabel="Get Your Custom Assessment"
      />
    </>
  );
}
