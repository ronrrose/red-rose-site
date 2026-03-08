import Link from "next/link";
import Image from "next/image";
import { Mail, MapPin, Phone } from "lucide-react";

const serviceLinks = [
  "AI & Automation Clinics",
  "Managed IT & Security",
  "Dental IT Support",
  "HIPAA Compliance",
  "Cybersecurity",
  "Cloud Setup & Migration",
];
const companyLinks = [
  { label: "About",      href: "/about" },
  { label: "Industries", href: "/industries" },
  { label: "Resources",  href: "/resources" },
  { label: "Contact",    href: "/contact" },
];

export default function Footer() {
  return (
    <footer className="bg-panel pt-16 pb-8 border-t border-line">
      <div className="container-site">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-5">
              <Image src="/logo.png" alt="Red Rose Technologies" width={36} height={36} className="w-9 h-9 object-contain" />
              <span className="text-xl md:text-2xl font-bold text-ink">Red Rose <span className="text-accent">Technologies</span></span>
            </Link>
            <p className="text-faded text-sm leading-relaxed mb-6">
              IT, automation, and security for dental practices, law firms, healthcare, nonprofits, and local businesses in Lakewood Ranch, Bradenton, Sarasota, and Tampa Bay.
            </p>
            <div className="flex items-start gap-3 text-faded text-sm">
              <MapPin className="w-4 h-4 text-accent shrink-0 mt-0.5" />
              <span>Lakewood Ranch, FL<br />Serving Manatee &amp; Sarasota Counties</span>
            </div>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-ink font-semibold mb-6 uppercase text-xs tracking-widest">Services</h4>
            <ul className="space-y-3">
              {serviceLinks.map((s) => (
                <li key={s}>
                  <Link href="/managed-it" className="text-faded text-sm hover:text-accent transition-colors">
                    {s}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-ink font-semibold mb-6 uppercase text-xs tracking-widest">Company</h4>
            <ul className="space-y-3">
              {companyLinks.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-faded text-sm hover:text-accent transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-ink font-semibold mb-6 uppercase text-xs tracking-widest">Contact</h4>
            <ul className="space-y-3 mb-6">
              <li>
                <a href="tel:9548571100" className="flex items-center gap-3 text-faded text-sm hover:text-accent transition-colors">
                  <Phone className="w-4 h-4 shrink-0" /> (954) 857-1100
                </a>
              </li>
              <li>
                <a href="mailto:rrose@redrosetechnologies.com" className="flex items-center gap-3 text-faded text-sm hover:text-accent transition-colors">
                  <Mail className="w-4 h-4 shrink-0" /> rrose@redrosetechnologies.com
                </a>
              </li>
            </ul>
            <div className="p-4 rounded-xl border border-line bg-raised/50">
              <p className="text-ink font-semibold text-sm mb-1">24/7 Emergency Line</p>
              <p className="text-accent text-xs">Current clients get a priority number.</p>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-line flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-faded text-sm">
            © {new Date().getFullYear()} Red Rose Technologies. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <Link href="#" className="text-faded hover:text-secondary text-sm transition-colors">Privacy</Link>
            <Link href="#" className="text-faded hover:text-secondary text-sm transition-colors">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
