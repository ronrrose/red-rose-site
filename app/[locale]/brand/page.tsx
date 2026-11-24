import type { Metadata } from "next";
import Image from "next/image";
import { Download } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { localeAlternates, pageOpenGraph } from "@/lib/metadata";
import { PHONE_DISPLAY, PHONE_HREF } from "@/lib/site-config";
import type { Locale } from "@/i18n/config";

export async function generateMetadata({
  params,
}: {
  params: { locale: Locale };
}): Promise<Metadata> {
  return {
    title: "Brand Guide",
    description:
      "Red Rose Technologies logo files, colors, typeface and naming, for partners, press and anyone writing about us.",
    openGraph: pageOpenGraph({ title: "Brand Guide: Red Rose Technologies" }),
    alternates: localeAlternates("/brand", params.locale),
  };
}

/*
 * Sources: the logo files and colors in Ron's brand kit
 * (Documents/Ron Rose Brand Kit, BRAND-KIT.md) and the colors and
 * typeface the live site uses (tailwind.config.ts brand-700 and -800,
 * Inter via next/font). Nothing here is a new design decision beyond
 * the usage notes, which follow from how the artwork is drawn.
 */

const LOGOS = [
  {
    title: "Emblem, transparent",
    note: "The main logo. Best on dark or mid-tone backgrounds.",
    src: "/logo.png",
    file: "red-rose-technologies-emblem.png",
    meta: "PNG, 1024 x 1024, transparent",
    width: 1024,
    height: 1024,
    tile: "bg-[#1A0306]",
  },
  {
    title: "Emblem on black",
    note: "Use this one on white or light pages, where the light grey lettering of the transparent file would fade.",
    src: "/brand/red-rose-technologies-emblem-on-black.jpg",
    file: "red-rose-technologies-emblem-on-black.jpg",
    meta: "JPG, 1024 x 1024",
    width: 1024,
    height: 1024,
    tile: "bg-[#0b0b0c]",
  },
  {
    title: "Emblem, tightly cropped",
    note: "The same artwork with the empty margin removed, for headers, signatures and small spaces.",
    src: "/brand/red-rose-technologies-emblem-cropped.png",
    file: "red-rose-technologies-emblem-cropped.png",
    meta: "PNG, 640 x 736, transparent",
    width: 640,
    height: 736,
    tile: "bg-[#1A0306]",
  },
];

const COLORS = [
  { name: "Rose red", hex: "#8B1A1A", use: "Main brand color. Buttons, links and highlights on the website.", light: false },
  { name: "Deep rose", hex: "#6B1414", use: "Hover and pressed states.", light: false },
  { name: "Bright red", hex: "#E13434", use: "Accent on dark backgrounds, video and camera backdrops.", light: false },
  { name: "Night", hex: "#1A0306", use: "Dark backgrounds.", light: false },
  { name: "White", hex: "#FFFFFF", use: "Text on dark backgrounds.", light: true },
];

export default function BrandPage() {
  return (
    <section className="section-padding">
      <div className="container-site max-w-5xl">
        <p className="mb-4 text-sm font-semibold text-accent">Brand guide</p>
        <h1 className="mb-6 text-3xl font-extrabold tracking-tight text-ink md:text-5xl [text-wrap:balance]">
          The Red Rose Technologies logo and how to use it
        </h1>
        <p className="mb-14 max-w-2xl text-lg leading-relaxed text-secondary [text-wrap:pretty]">
          For partners, press, event organizers and anyone writing about us. Download the files below
          and use them as they are.
        </p>

        {/* Name */}
        <h2 className="mb-4 text-2xl font-bold text-ink">Our name</h2>
        <div className="mb-14 grid gap-4 md:grid-cols-3">
          <div className="glass-card rounded-2xl p-6">
            <p className="mb-1 text-lg font-bold text-ink">Red Rose Technologies</p>
            <p className="text-sm text-secondary">On first mention. Two words for Red Rose, both capitalized.</p>
          </div>
          <div className="glass-card rounded-2xl p-6">
            <p className="mb-1 text-lg font-bold text-ink">Red Rose</p>
            <p className="text-sm text-secondary">After the first mention.</p>
          </div>
          <div className="glass-card rounded-2xl p-6">
            <p className="mb-1 text-lg font-bold text-ink">Red Rose Technologies LLC</p>
            <p className="text-sm text-secondary">The legal name, for contracts, invoices and listings.</p>
          </div>
        </div>

        {/* Logos */}
        <h2 className="mb-4 text-2xl font-bold text-ink">Logo files</h2>
        <div className="mb-14 grid gap-6 md:grid-cols-3">
          {LOGOS.map((l) => (
            <div key={l.file} className="glass-card flex flex-col overflow-hidden rounded-2xl">
              <div className={`flex h-56 items-center justify-center p-6 ${l.tile}`}>
                <Image
                  src={l.src}
                  alt={`Red Rose Technologies logo: ${l.title.toLowerCase()}`}
                  width={l.width}
                  height={l.height}
                  sizes="(min-width: 768px) 300px, 80vw"
                  className="h-full w-auto object-contain"
                />
              </div>
              <div className="flex flex-1 flex-col p-6">
                <h3 className="mb-1 font-bold text-ink">{l.title}</h3>
                <p className="mb-1 text-sm text-secondary">{l.note}</p>
                <p className="mb-5 text-xs text-faded">{l.meta}</p>
                <a
                  href={l.src}
                  download={l.file}
                  className="mt-auto inline-flex items-center justify-center gap-2 rounded-xl border border-line px-4 py-2.5 text-sm font-semibold text-ink transition-colors hover:bg-raised/50"
                >
                  <Download className="h-4 w-4" aria-hidden="true" />
                  Download
                </a>
              </div>
            </div>
          ))}
        </div>

        {/* Usage */}
        <h2 className="mb-4 text-2xl font-bold text-ink">Using the logo</h2>
        <div className="mb-14 grid gap-6 md:grid-cols-2">
          <div className="glass-card rounded-2xl p-6">
            <h3 className="mb-3 font-bold text-ink">Do</h3>
            <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed text-secondary">
              <li>Use the files on this page as supplied.</li>
              <li>Leave clear space around the emblem at least as tall as the RED ROSE bar.</li>
              <li>Show it at least 48 pixels tall on screen. When it has to be smaller, write Red Rose Technologies beside it in text.</li>
              <li>On white or light pages, use the emblem on black, or place the transparent file on a dark panel.</li>
            </ul>
          </div>
          <div className="glass-card rounded-2xl p-6">
            <h3 className="mb-3 font-bold text-ink">Don&apos;t</h3>
            <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed text-secondary">
              <li>Stretch, squash, rotate or crop into the artwork.</li>
              <li>Change the colors, or add shadows, outlines or glows.</li>
              <li>Redraw or retype the RED ROSE lettering.</li>
              <li>Place it on a busy photo where it can&apos;t be read.</li>
              <li>Use it in a way that suggests we endorse a product, service or organization without our written agreement.</li>
            </ul>
          </div>
        </div>

        {/* Colors */}
        <h2 className="mb-4 text-2xl font-bold text-ink">Colors</h2>
        <div className="mb-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {COLORS.map((c) => (
            <div key={c.hex} className="glass-card overflow-hidden rounded-2xl">
              <div
                className={`h-24 ${c.light ? "border-b border-line" : ""}`}
                style={{ backgroundColor: c.hex }}
                aria-hidden="true"
              />
              <div className="p-4">
                <p className="font-bold text-ink">{c.name}</p>
                <p className="mb-2 font-mono text-sm text-secondary">{c.hex}</p>
                <p className="text-xs leading-relaxed text-faded">{c.use}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Type */}
        <h2 className="mb-4 text-2xl font-bold text-ink">Typeface</h2>
        <div className="glass-card mb-14 rounded-2xl p-6">
          <p className="mb-2 text-3xl font-extrabold tracking-tight text-ink">Inter</p>
          <p className="text-sm leading-relaxed text-secondary">
            Headings in Extra Bold, body text in Regular. Inter is free from{" "}
            <a
              href="https://fonts.google.com/specimen/Inter"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-accent hover:underline"
            >
              Google Fonts
            </a>
            .
          </p>
        </div>

        {/* Questions */}
        <p className="text-sm text-secondary">
          Need another format or have a question about using our brand? Call{" "}
          <a href={PHONE_HREF} className="whitespace-nowrap font-semibold text-accent hover:underline">
            {PHONE_DISPLAY}
          </a>{" "}
          or{" "}
          <Link href="/contact" className="font-semibold text-accent hover:underline">
            send us a message
          </Link>
          .
        </p>
      </div>
    </section>
  );
}
