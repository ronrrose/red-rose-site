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

/** The FAQ on /dental-it/lakewood-ranch. Kept here so /llms-full.txt reads the same text. */
export const dentalLakewoodRanchFaqs: Faq[] = [
  {
    question: "What dental practice management software do you support?",
    answer:
      "Dentrix, Eaglesoft, Open Dental and Curve Dental. That covers both on-premise servers and cloud-based platforms, so a practice does not have to change software to work with us.",
  },
  {
    question: "Do you sign a Business Associate Agreement?",
    answer:
      "Yes. Any vendor with access to your electronic protected health information has to sign a BAA, and Red Rose Technologies provides HIPAA compliant BAAs for all managed service clients.",
  },
  {
    question: "How fast do you respond if our practice management system goes down?",
    answer:
      "Our 24/7 monitoring detects outages immediately. From there the target response times are 4 hours on Core Shield, 2 hours on Advanced Guard, and 1 hour with priority escalation on Total Command. These are target response times, not a guarantee and not a contractual service level agreement.",
  },
  {
    question: "Can you move our practice off a server and onto cloud dental software?",
    answer:
      "Yes, that is work we do. One dental client reported roughly $75,000 a year in savings after a review of spend, a move from Eaglesoft servers to Curve Dental in the cloud, a phone system change, and a payroll move from ADP to Gusto. That is what that practice reported, not a figure we promise to a new practice.",
  },
  {
    question: "What should we do about Windows 10 end of life?",
    answer:
      "We provide Windows 11 migration planning, including hardware compatibility assessment and phased rollouts, so the practice is not taken offline during patient hours.",
  },
  {
    question: "What does dental IT support cost in Lakewood Ranch?",
    answer:
      "Red Rose Technologies does not publish prices. What it costs depends on the size and setup of the practice. Call (941) 206-4709 or book a free IT checkup and someone from our team will go through your setup first.",
  },
];

/** The FAQ on /ai-consultant/lakewood-ranch. Kept here so /llms-full.txt reads the same text. */
export const aiConsultantLakewoodRanchFaqs: Faq[] = [
  {
    question: "What does an AI consultant in Lakewood Ranch actually do?",
    answer:
      "At Red Rose Technologies the work starts with finding where your business loses time and money, before any talk of technology. We then streamline that workflow, automate the parts that should be automated, leave alone the parts that should not, and build all of it around how your business actually runs. The aim is to give your team back time and take cost out so the business runs leaner.",
  },
  {
    question: "Will AI automation replace my staff?",
    answer:
      "That is not how we approach it. We automate the parts of a workflow that should be automated and leave alone the parts that should not. The aim is to give your team back time, not to remove people from the business.",
  },
  {
    question: "What are the AI & Automation Clinics?",
    answer:
      "Three live, hands-on sessions where your team builds real automations rather than watching a demo. Your team leaves with a 90 day rollout plan and gets 30 days of email support from our team afterwards.",
  },
  {
    question: "What does AI consulting cost in Lakewood Ranch?",
    answer:
      "Red Rose Technologies does not publish prices. What it costs depends on the size and setup of your business, so we talk it through first. You can book a free IT checkup or call (941) 206-4709 and someone from our team will go over your setup.",
  },
  {
    question: "Can you work with a HIPAA-regulated practice?",
    answer:
      "Yes. We work with dental practices, healthcare clinics and occupational medicine clinics, and we hold a HIPAA Security Specialist credential. Red Rose provides HIPAA compliant Business Associate Agreements for all managed service clients. We can describe what we offer, but we do not certify that any particular setup is legally sufficient for your situation.",
  },
  {
    question: "Are you actually local to Lakewood Ranch?",
    answer:
      "Yes. Red Rose Technologies is based in Lakewood Ranch, Florida, and serves Bradenton, Sarasota, Palmetto, Parrish, North Port, Manatee County, Sarasota County and the greater Tampa Bay area.",
  },
];
