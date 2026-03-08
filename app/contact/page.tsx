import type { Metadata } from "next";
import Hero from "@/components/Hero";
import { MapPin, Phone, Mail, Clock, Send } from "lucide-react";

export const metadata: Metadata = {
  title: "Contact / Book a Call",
  description:
    "Talk to Ron about your IT, AI, or security needs. Free assessment. Serving Lakewood Ranch, Bradenton, Sarasota, and Tampa Bay.",
};

const serviceAreas = [
  "Lakewood Ranch",
  "Bradenton",
  "Sarasota",
  "Manatee County",
  "Tampa Bay",
  "Parrish",
  "Palmetto",
  "North Port",
];

export default function ContactPage() {
  return (
    <>
      <Hero
        badge="Let's Talk"
        title={
          <>
            Book a Call.{" "}
            <span className="text-gradient bg-gradient-to-r from-brand-400 to-cyan-400">
              Get Real Answers.
            </span>
          </>
        }
        subtitle="Pick a time, tell us what's going on, and we'll have an honest conversation about your IT, security, or automation needs. No sales pitch. Just straight talk."
      />

      <section className="section-padding border-t border-dark-700/30">
        <div className="container-site">
          <div className="grid lg:grid-cols-2 gap-16">
            {/* ── Left: Scheduler + Contact ── */}
            <div>
              {/* Scheduler Embed Area */}
              <div className="glass-card rounded-2xl p-8 mb-8">
                <h2 className="text-2xl font-bold text-white mb-4">Pick a Time That Works</h2>
                <p className="text-slate-400 mb-6 text-sm">
                  No commitment, no hard sell. Just a conversation.
                </p>
                {/* Placeholder for Calendly / Cal.com / etc. embed */}
                <div className="w-full h-[400px] rounded-xl bg-dark-700/50 border border-dark-700 flex items-center justify-center text-slate-500 text-sm">
                  <div className="text-center">
                    <Clock className="w-10 h-10 text-brand-400/40 mx-auto mb-3" />
                    <p className="font-medium text-slate-400">Scheduler Embed</p>
                    <p className="text-xs text-slate-500 mt-1">Calendly or Cal.com widget goes here</p>
                  </div>
                </div>
              </div>

              {/* Contact Info */}
              <div className="glass-card rounded-2xl p-8">
                <h3 className="text-lg font-bold text-white mb-6">Or Just Reach Out</h3>
                <ul className="space-y-5">
                  <li className="flex items-center gap-4 text-slate-300">
                    <div className="w-10 h-10 rounded-lg bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-400 shrink-0">
                      <Phone className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-white font-semibold text-sm">(941) 444-0396</p>
                      <p className="text-slate-500 text-xs">Mon through Fri, 8am to 6pm EST</p>
                    </div>
                  </li>
                  <li className="flex items-center gap-4 text-slate-300">
                    <div className="w-10 h-10 rounded-lg bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-400 shrink-0">
                      <Mail className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-white font-semibold text-sm">ron@redrosetechnologies.com</p>
                      <p className="text-slate-500 text-xs">Usually responds within a couple hours</p>
                    </div>
                  </li>
                  <li className="flex items-center gap-4 text-slate-300">
                    <div className="w-10 h-10 rounded-lg bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-400 shrink-0">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-white font-semibold text-sm">Lakewood Ranch, FL</p>
                      <p className="text-slate-500 text-xs">Serving Manatee & Sarasota Counties</p>
                    </div>
                  </li>
                </ul>
              </div>
            </div>

            {/* ── Right: Contact Form ── */}
            <div>
              <div className="glass-card rounded-2xl p-8">
                <h2 className="text-2xl font-bold text-white mb-2">Send a Message</h2>
                <p className="text-slate-400 text-sm mb-8">Rather type it out? Fill this in and Ron will get back to you within one business day.</p>
                <form className="space-y-5">
                  <div className="grid sm:grid-cols-2 gap-5">
                    <div>
                      <label htmlFor="firstName" className="block text-sm font-medium text-slate-300 mb-2">First Name</label>
                      <input id="firstName" type="text" placeholder="Jane" className="w-full px-4 py-3 bg-dark-800 border border-dark-700 rounded-xl text-white placeholder:text-dark-600 focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 transition-all text-sm" />
                    </div>
                    <div>
                      <label htmlFor="lastName" className="block text-sm font-medium text-slate-300 mb-2">Last Name</label>
                      <input id="lastName" type="text" placeholder="Smith" className="w-full px-4 py-3 bg-dark-800 border border-dark-700 rounded-xl text-white placeholder:text-dark-600 focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 transition-all text-sm" />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">Email Address</label>
                    <input id="email" type="email" placeholder="jane@example.com" className="w-full px-4 py-3 bg-dark-800 border border-dark-700 rounded-xl text-white placeholder:text-dark-600 focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 transition-all text-sm" />
                  </div>
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-slate-300 mb-2">Phone (Optional)</label>
                    <input id="phone" type="tel" placeholder="(941) 555-0123" className="w-full px-4 py-3 bg-dark-800 border border-dark-700 rounded-xl text-white placeholder:text-dark-600 focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 transition-all text-sm" />
                  </div>
                  <div>
                    <label htmlFor="businessType" className="block text-sm font-medium text-slate-300 mb-2">What Kind of Business?</label>
                    <select id="businessType" className="w-full px-4 py-3 bg-dark-800 border border-dark-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 transition-all text-sm">
                      <option value="">Pick one</option>
                      <option value="dental">Dental Practice</option>
                      <option value="healthcare">Healthcare</option>
                      <option value="legal">Legal Firm</option>
                      <option value="nonprofit">Nonprofit</option>
                      <option value="smb">Small/Medium Business</option>
                      <option value="other">Something Else</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-slate-300 mb-2">What&apos;s Going On?</label>
                    <textarea id="message" rows={4} placeholder="Tell us about your biggest IT headache, or what you'd like to automate..." className="w-full px-4 py-3 bg-dark-800 border border-dark-700 rounded-xl text-white placeholder:text-dark-600 focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 transition-all text-sm resize-none" />
                  </div>
                  <button
                    type="submit"
                    className="w-full px-8 py-4 bg-brand-600 hover:bg-brand-500 text-white rounded-xl font-semibold transition-all shadow-lg shadow-brand-600/25 flex items-center justify-center gap-2 group"
                  >
                    Send It Over
                    <Send className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Map Placeholder ── */}
      <section className="section-padding bg-dark-950/50 border-y border-dark-700/30">
        <div className="container-site">
          <div className="text-center max-w-3xl mx-auto mb-10">
            <p className="text-brand-400 font-semibold tracking-wide uppercase text-sm mb-3">Service Area</p>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Local to Southwest Florida
            </h2>
            <p className="text-slate-400">On-site and remote support across the Tampa Bay area.</p>
          </div>
          
          {/* Map placeholder */}
          <div className="w-full h-[350px] rounded-2xl bg-dark-800 border border-dark-700 flex items-center justify-center text-slate-500 mb-10">
            <div className="text-center">
              <MapPin className="w-10 h-10 text-brand-400/40 mx-auto mb-3" />
              <p className="font-medium text-slate-400">Google Maps Embed</p>
              <p className="text-xs text-slate-500 mt-1">Interactive map goes here</p>
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-3">
            {serviceAreas.map((city) => (
              <span
                key={city}
                className="px-5 py-2.5 glass-card rounded-full text-sm font-medium text-slate-300 hover:text-white hover:bg-dark-700/80 transition-colors"
              >
                {city}
              </span>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
