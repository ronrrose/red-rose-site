import type { Metadata } from "next";
import { localeAlternates } from "@/lib/metadata";
import Link from "next/link";

export const metadata: Metadata = {
  title: "The SMB Cybersecurity Checklist: 12 Things to Do Before You Get Hacked",
  description:
    "Most small businesses think they're too small to get targeted. They're not. Here's a plain-English checklist to lock things down before it's too late.",
  openGraph: {
    title: "SMB Cybersecurity Checklist — 12 Steps to Protect Your Business",
    description:
      "A plain-English cybersecurity checklist for small and medium businesses. Practical steps you can take this week.",
  },
  alternates: localeAlternates("/resources/smb-cybersecurity-checklist"),
};

export default function CybersecurityChecklistArticle() {
  const items = [
    {
      title: "Enable Multi-Factor Authentication (MFA) on Everything",
      body: "If any of your business accounts — email, banking, cloud storage, practice management — still use just a password, fix that today. MFA (also called 2FA) adds a second step, usually a code from your phone, that makes stolen passwords useless. Start with email and admin accounts. Microsoft 365 and Google Workspace both have MFA built in. Turn it on for every user, no exceptions.",
    },
    {
      title: "Use a Business Password Manager",
      body: "Your team is reusing passwords across systems. They are. Everyone does it until you give them a better option. A password manager like 1Password Business or Bitwarden generates unique, strong passwords for every account and stores them securely. It also makes onboarding and offboarding employees safer — you can revoke access to everything in one click.",
    },
    {
      title: "Keep All Software and Systems Updated",
      body: "Unpatched software is the #1 way attackers get into small business networks. Set Windows, macOS, and all business applications to auto-update. For practice management software (Dentrix, Clio, QuickBooks), check for updates monthly. If you're running Windows 10, note that Microsoft ends support in October 2025 — plan your Windows 11 migration now.",
    },
    {
      title: "Back Up Your Data (and Test the Backups)",
      body: "Having backups isn't enough. You need to test them. We've walked into offices that had 'backups' running for years that were actually failing silently. Use the 3-2-1 rule: 3 copies of your data, on 2 different types of storage, with 1 copy offsite or in the cloud. Test a restore at least once per quarter.",
    },
    {
      title: "Train Your Staff on Phishing",
      body: "90% of successful cyberattacks start with a phishing email. Your staff needs to know what to look for: unexpected attachments, urgent requests for payment, emails from addresses that look almost right. Run a phishing simulation quarterly. Services like KnowBe4 make this easy. The goal isn't to catch people — it's to build the reflex to pause and verify.",
    },
    {
      title: "Secure Your Wi-Fi Network",
      body: "Your business Wi-Fi should use WPA3 (or at minimum WPA2) with a strong password. Create a separate guest network for patients, clients, and visitors — never let them on your business network. Change the default admin password on your router. If you can't remember the last time you did that, do it today.",
    },
    {
      title: "Install Endpoint Protection on Every Device",
      body: "Windows Defender is decent, but it's not enough for a business. Install a proper endpoint detection and response (EDR) tool like SentinelOne, CrowdStrike, or Malwarebytes Business. These don't just block known viruses — they detect suspicious behavior in real time and can isolate a compromised device before it spreads.",
    },
    {
      title: "Review Who Has Access to What",
      body: "When was the last time you checked who has admin access to your systems? Former employees, old contractors, and vendors often retain access long after they should. Audit your user accounts quarterly. Remove anyone who doesn't need access. Apply the principle of least privilege: people should only have access to the systems they need to do their job.",
    },
    {
      title: "Encrypt Sensitive Data",
      body: "If someone steals a laptop from your office, can they read your patient records or client files? If your drives aren't encrypted, the answer is yes. Enable BitLocker (Windows) or FileVault (Mac) on every device. For data in transit, make sure your website uses HTTPS and your email uses TLS encryption.",
    },
    {
      title: "Have an Incident Response Plan",
      body: "If you got hit with ransomware tomorrow morning, what would you do? Who would you call? Most small businesses don't have a plan. Write one. It doesn't need to be 50 pages. Cover: who to contact (IT provider, legal, insurance), how to isolate affected systems, how to communicate with clients/patients, and how to restore from backups.",
    },
    {
      title: "Get Cyber Insurance",
      body: "Cyber insurance won't prevent an attack, but it covers the costs when one happens — forensics, legal fees, client notification, business interruption. Policies are relatively affordable for small businesses ($1,000-$3,000/year). Many insurers now require MFA and backups as conditions for coverage, which is another reason to check those boxes first.",
    },
    {
      title: "Run a Vulnerability Scan",
      body: "You don't know what you don't know. A vulnerability scan checks your network, devices, and public-facing systems for known weaknesses — open ports, outdated software, misconfigured firewalls. We offer a free network assessment that covers this. It takes 30 minutes and gives you a clear picture of where you're exposed.",
    },
  ];

  return (
    <article className="section-padding">
      <div className="container-site max-w-3xl">
        <div className="mb-8">
          <span className="text-xs font-bold text-accent uppercase tracking-wider">Cybersecurity</span>
          <span className="mx-2 text-faded">&#183;</span>
          <span className="text-xs text-faded">Checklist</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-ink mb-6 leading-tight">
          The SMB Cybersecurity Checklist: 12 Things to Do Before You Get Hacked
        </h1>
        <p className="text-faded text-sm mb-12">By Ron Rose &middot; Red Rose Technologies &middot; March 2026</p>

        <div className="prose-custom text-secondary leading-relaxed space-y-6">
          <p className="text-lg">
            If you run a small or medium business, you might think cybercriminals are going after the big fish — banks, hospitals, Fortune 500 companies. They&apos;re not. 43% of cyberattacks target small businesses, and 60% of those businesses close within six months of an attack. The average cost of a data breach for an SMB is $108,000.
          </p>
          <p>
            The good news is that most attacks exploit basic security gaps that are straightforward to fix. Here&apos;s your checklist. Work through it this week and you&apos;ll be ahead of 90% of businesses your size.
          </p>

          {items.map((item, i) => (
            <div key={i}>
              <h2 className="text-xl font-bold text-ink mt-10 flex items-start gap-3">
                <span className="w-8 h-8 rounded-full bg-accent/10 text-accent text-sm font-bold flex items-center justify-center shrink-0 mt-0.5">{i + 1}</span>
                {item.title}
              </h2>
              <p className="mt-3">{item.body}</p>
            </div>
          ))}

          <h2 className="text-2xl font-bold text-ink mt-10">What&apos;s Next?</h2>
          <p>
            This checklist covers the fundamentals. If you&apos;re in healthcare or dental, you also need to layer on HIPAA-specific controls — risk assessments, Business Associate Agreements, audit logging, and more. If you&apos;re a law firm, bar association data protection rules add another layer.
          </p>
          <p>
            The fastest way to find out where you stand is a free network assessment. We&apos;ll scan your systems, identify vulnerabilities, and give you a prioritized list of what to fix first — no commitment required. <Link href="/contact" className="text-accent hover:text-brand-600 font-semibold transition-colors">Talk to Ron</Link> and let&apos;s get you locked down.
          </p>
        </div>

        <div className="mt-12 p-8 glass-card rounded-2xl text-center">
          <h3 className="text-xl font-bold text-ink mb-3">Free Dark Web Scan + Network Assessment</h3>
          <p className="text-faded text-sm mb-6">Find out if your business data has been exposed and where your network is vulnerable. Takes 30 minutes.</p>
          <Link href="/contact?ref=dark-web-scan" className="inline-flex px-8 py-3 bg-brand-700 hover:bg-brand-800 text-white rounded-xl font-semibold transition-all shadow-lg shadow-brand-700/25">
            Get Your Free Scan
          </Link>
        </div>
      </div>
    </article>
  );
}
