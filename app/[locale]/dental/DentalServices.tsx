"use client";

import FeatureGrid from "@/components/FeatureGrid";
import { ServerCog, Stethoscope, ClipboardCheck, Crosshair, Bot, Cloud } from "lucide-react";

/*
 * A client file because FeatureGrid is a client component and the icons are
 * components, which cannot cross the server/client boundary as props.
 */
const SERVICES = [
  { icon: ServerCog, title: "Managed IT and security", description: "24/7 network monitoring, patching, backup and proactive support for the whole office, from the front desk to the operatories." },
  { icon: Stethoscope, title: "Dental software support", description: "Hands-on support for Dentrix, Eaglesoft, Open Dental and Curve Dental, including moves to the cloud." },
  { icon: ClipboardCheck, title: "HIPAA compliance", description: "Security assessments, written policies and ongoing compliance support for dental offices." },
  { icon: Crosshair, title: "Penetration testing", description: "Authorized testing under a signed scope, with a plain-English report and a free retest of fixed findings." },
  { icon: Bot, title: "AI and automation clinics", description: "Three live, hands-on sessions where your team builds real automations and leaves with a 90 day rollout plan." },
  { icon: Cloud, title: "Cloud and Microsoft 365", description: "Cloud setup and migration, including Microsoft 365 and Windows 11 planning with phased rollouts." },
];

export default function DentalServices() {
  return (
    <FeatureGrid
      label="Services"
      heading="IT and security built for a dental office"
      subtitle="One team for the computers, the network, the software and the paperwork HIPAA expects."
      items={SERVICES}
    />
  );
}
