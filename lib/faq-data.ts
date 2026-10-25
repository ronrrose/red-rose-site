/**
 * The site-wide FAQ, shown on the home page.
 *
 * These five questions used to live only inside the LocalBusiness @graph in
 * components/JsonLd.tsx, which put a FAQPage node on every page of the site.
 * That caused two problems: pages with their own FAQ (the city pages and the
 * Lakewood Ranch service pages) ended up emitting two competing FAQPage
 * entities for one URL, and the markup described questions that appeared
 * nowhere in the visible page, which Google's structured data policy does not
 * allow. Rendering them through FAQSection on the home page fixes both: one
 * FAQPage per URL, and the answer text is on the page a visitor can read.
 */
export interface Faq {
  question: string;
  answer: string;
}

export const homeFaqs: Faq[] = [
  {
    question: "What is HIPAA compliance for dental practices?",
    answer:
      "HIPAA compliance requires dental practices to protect patient health information through administrative, physical, and technical safeguards. Red Rose Technologies provides automated compliance monitoring, encryption, access controls, and security risk assessments tailored to dental workflows.",
  },
  {
    question: "Do I need a Business Associate Agreement (BAA)?",
    answer:
      "Yes. Any vendor with access to your electronic protected health information (ePHI) must sign a BAA. Red Rose Technologies provides HIPAA-compliant BAAs for all managed service clients.",
  },
  {
    question: "What happens if my practice management system goes down?",
    answer:
      "Our 24/7 monitoring detects outages immediately. Core Shield clients receive response within 4 hours, Advanced Guard within 2 hours, and Total Command clients within 1 hour with priority escalation.",
  },
  {
    question: "Can you help with Windows 10 end-of-life migration?",
    answer:
      "Yes. We provide Windows 11 migration planning, hardware compatibility assessments, and phased rollouts to minimize disruption to patient care.",
  },
  {
    question: "What dental practice management software do you support?",
    answer:
      "We specialize in Dentrix, Eaglesoft, Open Dental, Curve Dental, and other cloud-based and on-premise dental software platforms.",
  },
];
