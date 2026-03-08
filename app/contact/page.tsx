import type { Metadata } from "next";
import Hero from "@/components/Hero";
import RoamScheduler from "@/components/RoamScheduler";
import { MapPin, Phone, Mail, Send } from "lucide-react";

export const metadata: Metadata = {
  title: "Contact / Book a Call",
  description: "Talk to Ron about your IT, AI, or security needs. Free assessment. Serving Lakewood Ranch, Bradenton, Sarasota, and Tampa Bay.",
};

const serviceAreas = ["Lakewood Ranch","Bradenton","Sarasota","Manatee County","Tampa Bay","Parrish","Palmetto","North Port"];

export default function ContactPage() {
  return (
    <>
      <Hero
        badge="Let's Talk"
        title={<>Book a Call.{" "}<span className="text-gradient bg-gradient-to-r from-brand-700 to-brand-500 dark:from-brand-400 dark:to-rose-300">Get Real Answers.</span></>}
        subtitle="Pick a time, tell us what's going on, and we'll have an honest conversation about your IT, security, or automation needs. No sales pitch. Just straight talk."
      />

      <section className="section-padding border-t border-line">
        <div className="container-site">
          <div className="grid lg:grid-cols-2 gap-16">
            <div>
              <div className="glass-card rounded-2xl p-8 mb-8">
                <h2 className="text-2xl font-bold text-ink mb-4">Pick a Time That Works</h2>
                <p className="text-faded mb-6 text-sm">No commitment, no hard sell. Just a conversation.</p>
                <RoamScheduler />
              </div>
              <div className="glass-card rounded-2xl p-8">
                <h3 className="text-lg font-bold text-ink mb-6">Or Just Reach Out</h3>
                <ul className="space-y-5">
                  <li className="flex items-center gap-4 text-secondary">
                    <div className="w-10 h-10 rounded-lg bg-[var(--accent-bg)] border border-[var(--accent-border)] flex items-center justify-center text-accent shrink-0"><Phone className="w-5 h-5" /></div>
                    <div><p className="text-ink font-semibold text-sm">(954) 857-1100</p><p className="text-faded text-xs">Mon through Fri, 8am to 6pm EST</p></div>
                  </li>
                  <li className="flex items-center gap-4 text-secondary">
                    <div className="w-10 h-10 rounded-lg bg-[var(--accent-bg)] border border-[var(--accent-border)] flex items-center justify-center text-accent shrink-0"><Mail className="w-5 h-5" /></div>
                    <div><p className="text-ink font-semibold text-sm break-all">rrose@redrosetechnologies.com</p><p className="text-faded text-xs">Usually responds within a couple hours</p></div>
                  </li>
                  <li className="flex items-center gap-4 text-secondary">
                    <div className="w-10 h-10 rounded-lg bg-[var(--accent-bg)] border border-[var(--accent-border)] flex items-center justify-center text-accent shrink-0"><MapPin className="w-5 h-5" /></div>
                    <div><p className="text-ink font-semibold text-sm">Lakewood Ranch, FL</p><p className="text-faded text-xs">Serving Manatee &amp; Sarasota Counties</p></div>
                  </li>
                </ul>
              </div>
            </div>
            <div>
              <div className="glass-card rounded-2xl p-8">
                <h2 className="text-2xl font-bold text-ink mb-2">Send a Message</h2>
                <p className="text-faded text-sm mb-8">Rather type it out? Fill this in and Ron will get back to you within one business day.</p>
                <form className="space-y-5">
                  <div className="grid sm:grid-cols-2 gap-5">
                    <div>
                      <label htmlFor="firstName" className="block text-sm font-medium text-secondary mb-2">First Name</label>
                      <input id="firstName" type="text" placeholder="Jane" className="w-full px-4 py-3 bg-input-bg border border-input-border rounded-xl text-ink placeholder:text-faded/60 focus:outline-none focus:ring-2 focus:ring-brand-700/50 focus:border-brand-700 transition-all text-sm" />
                    </div>
                    <div>
                      <label htmlFor="lastName" className="block text-sm font-medium text-secondary mb-2">Last Name</label>
                      <input id="lastName" type="text" placeholder="Smith" className="w-full px-4 py-3 bg-input-bg border border-input-border rounded-xl text-ink placeholder:text-faded/60 focus:outline-none focus:ring-2 focus:ring-brand-700/50 focus:border-brand-700 transition-all text-sm" />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-secondary mb-2">Email Address</label>
                    <input id="email" type="email" placeholder="jane@example.com" className="w-full px-4 py-3 bg-input-bg border border-input-border rounded-xl text-ink placeholder:text-faded/60 focus:outline-none focus:ring-2 focus:ring-brand-700/50 focus:border-brand-700 transition-all text-sm" />
                  </div>
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-secondary mb-2">Phone (Optional)</label>
                    <input id="phone" type="tel" placeholder="(954) 555-0123" className="w-full px-4 py-3 bg-input-bg border border-input-border rounded-xl text-ink placeholder:text-faded/60 focus:outline-none focus:ring-2 focus:ring-brand-700/50 focus:border-brand-700 transition-all text-sm" />
                  </div>
                  <div>
                    <label htmlFor="businessType" className="block text-sm font-medium text-secondary mb-2">What Kind of Business?</label>
                    <select id="businessType" className="w-full px-4 py-3 bg-input-bg border border-input-border rounded-xl text-ink focus:outline-none focus:ring-2 focus:ring-brand-700/50 focus:border-brand-700 transition-all text-sm">
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
                    <label htmlFor="message" className="block text-sm font-medium text-secondary mb-2">What&apos;s Going On?</label>
                    <textarea id="message" rows={4} placeholder="Tell us about your biggest IT headache, or what you'd like to automate..." className="w-full px-4 py-3 bg-input-bg border border-input-border rounded-xl text-ink placeholder:text-faded/60 focus:outline-none focus:ring-2 focus:ring-brand-700/50 focus:border-brand-700 transition-all text-sm resize-none" />
                  </div>
                  <button type="submit" className="w-full px-8 py-4 bg-brand-700 hover:bg-brand-800 text-white rounded-xl font-semibold transition-all shadow-lg shadow-brand-700/25 flex items-center justify-center gap-2 group">
                    Send It Over <Send className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section-padding bg-panel border-y border-line">
        <div className="container-site">
          <div className="text-center max-w-3xl mx-auto mb-10">
            <p className="text-accent font-semibold tracking-wide uppercase text-sm mb-3">Service Area</p>
            <h2 className="text-3xl md:text-4xl font-bold text-ink mb-4">Local to Southwest Florida</h2>
            <p className="text-faded">On-site and remote support across the Tampa Bay area.</p>
          </div>
          <div className="w-full h-[350px] rounded-2xl overflow-hidden border border-line mb-10">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d113892.04864709498!2d-82.4468917!3d27.2689905!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x88c3404e3065e2e3%3A0x9c76b8b4e68e7b04!2sLakewood%20Ranch%2C%20FL!5e0!3m2!1sen!2sus!4v1709924400000"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Red Rose Technologies service area — Lakewood Ranch, FL"
            />
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            {serviceAreas.map((city) => (
              <span key={city} className="px-5 py-2.5 glass-card rounded-full text-sm font-medium text-secondary hover:text-ink hover:bg-raised/80 transition-colors">{city}</span>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
