import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";

const serviceLinks = [
  "AI & Automation Clinics",
  "Managed IT & Security",
  "Dental IT Support",
  "HIPAA Compliance",
  "Cybersecurity",
  "Cloud Solutions",
];
const companyLinks = [
  { label: "About",       href: "/about" },
  { label: "Industries",  href: "/industries" },
  { label: "Resources",   href: "/resources" },
  { label: "Contact",     href: "/contact" },
];

export default function Footer() {
  return (
    <footer className="bg-dark-950 pt-16 pb-8 border-t border-dark-700/50">
      <div className="container-site">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link href="/" className="inline-block text-2xl font-bold text-white mb-5">
              Red Rose <span className="text-brand-400">Tech</span>
            </Link>
            <p className="text-slate-400 text-sm leading-relaxed mb-6">
              AI-powered automation, managed IT, and security for local businesses across Lakewood Ranch, Bradenton, Sarasota &amp; Tampa Bay.
            </p>
            <div className="flex items-start gap-3 text-slate-400 text-sm">
              <MapPin className="w-4 h-4 text-brand-400 shrink-0 mt-0.5" />
              <span>Lakewood Ranch, FL<br />Serving Manatee &amp; Sarasota Counties</span>
            </div>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-white font-semibold mb-6 uppercase text-xs tracking-widest">Services</h4>
            <ul className="space-y-3">
              {serviceLinks.map((s) => (
                <li key={s}>
                  <Link href="/managed-it" className="text-slate-400 text-sm hover:text-brand-400 transition-colors">
                    {s}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-white font-semibold mb-6 uppercase text-xs tracking-widest">Company</h4>
            <ul className="space-y-3">
              {companyLinks.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-slate-400 text-sm hover:text-brand-400 transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-semibold mb-6 uppercase text-xs tracking-widest">Contact</h4>
            <ul className="space-y-3 mb-6">
              <li>
                <a href="tel:9414440396" className="flex items-center gap-3 text-slate-400 text-sm hover:text-brand-400 transition-colors">
                  <Phone className="w-4 h-4 shrink-0" /> (941) 444-0396
                </a>
              </li>
              <li>
                <a href="mailto:ron@redrosetechnologies.com" className="flex items-center gap-3 text-slate-400 text-sm hover:text-brand-400 transition-colors">
                  <Mail className="w-4 h-4 shrink-0" /> ron@redrosetechnologies.com
                </a>
              </li>
            </ul>
            <div className="p-4 rounded-xl border border-dark-700 bg-dark-800/50">
              <p className="text-white font-semibold text-sm mb-1">Emergency Support 24/7</p>
              <p className="text-brand-400 text-xs">Existing clients call the priority line.</p>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-dark-700/50 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-slate-500 text-sm">
            © {new Date().getFullYear()} Red Rose Technologies. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <Link href="#" className="text-slate-500 hover:text-slate-300 text-sm transition-colors">Privacy</Link>
            <Link href="#" className="text-slate-500 hover:text-slate-300 text-sm transition-colors">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
