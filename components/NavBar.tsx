"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useI18n } from "@/lib/i18n-context";

const linkKeys = [
  { href: "/", key: "nav.home" },
  { href: "/ai-clinics", key: "nav.aiClinics" },
  { href: "/managed-it", key: "nav.managedIt" },
  { href: "/industries", key: "nav.industries" },
  { href: "/about", key: "nav.about" },
  { href: "/resources", key: "nav.resources" },
  { href: "/contact", key: "nav.contact" },
];

export default function NavBar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const { t } = useI18n();

  const closeMenu = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeMenu();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, closeMenu]);

  return (
    <nav
      className="fixed top-0 w-full z-50 border-b border-line/50"
      style={{ background: "var(--nav-bg)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)" }}
      aria-label="Main navigation"
    >
      <div className="container-site flex items-center justify-between h-20">
        {/* Logo */}
        <Link href="/" className="shrink-0">
          <Image
            src="/logo.png"
            alt="Red Rose Technologies — home"
            width={48}
            height={48}
            className="w-12 h-12 object-contain"
            priority
          />
        </Link>

        {/* Desktop Links */}
        <div className="hidden lg:flex items-center gap-7">
          {linkKeys.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              aria-current={pathname === l.href ? "page" : undefined}
              className={`text-sm font-medium transition-colors ${
                pathname === l.href
                  ? "text-accent"
                  : "text-faded hover:text-ink"
              }`}
            >
              {t(l.key)}
            </Link>
          ))}
        </div>

        {/* Desktop CTA + Toggle + Language */}
        <div className="hidden lg:flex items-center gap-3">
          <span className="text-sm text-faded font-medium border-r border-line pr-3">
            (954) 857-1100
          </span>
          <LanguageSwitcher />
          <ThemeToggle />
          <Link
            href="/contact"
            className="px-5 py-2.5 rounded-lg bg-brand-700 hover:bg-brand-800 text-white text-sm font-semibold transition-all shadow-lg shadow-brand-700/20"
          >
            {t("nav.getAssessment")}
          </Link>
        </div>

        {/* Mobile toggle */}
        <div className="flex items-center gap-2 lg:hidden">
          <LanguageSwitcher />
          <ThemeToggle />
          <button
            onClick={() => setOpen(!open)}
            className="p-2 text-faded hover:text-ink"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            aria-controls="mobile-menu"
          >
            {open ? <X className="w-6 h-6" aria-hidden="true" /> : <Menu className="w-6 h-6" aria-hidden="true" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div
          id="mobile-menu"
          role="region"
          aria-label="Mobile navigation"
          className="lg:hidden border-t border-line pb-6"
          style={{ background: "var(--nav-bg)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)" }}
        >
          <div className="container-site flex flex-col gap-1 pt-4">
            {linkKeys.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={closeMenu}
                aria-current={pathname === l.href ? "page" : undefined}
                className={`px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  pathname === l.href
                    ? "text-accent bg-[var(--accent-bg)]"
                    : "text-faded hover:text-ink hover:bg-raised/50"
                }`}
              >
                {t(l.key)}
              </Link>
            ))}
            <Link
              href="/contact"
              onClick={closeMenu}
              className="mt-4 px-5 py-3 rounded-lg bg-brand-700 text-center text-white text-sm font-semibold"
            >
              {t("nav.getFreeAssessment")}
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
