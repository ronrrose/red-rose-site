"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";

const links = [
    { href: "/", label: "Home" },
    { href: "/ai-clinics", label: "AI Clinics" },
    { href: "/managed-it", label: "Managed IT" },
    { href: "/industries", label: "Industries" },
    { href: "/about", label: "About" },
    { href: "/resources", label: "Resources" },
    { href: "/contact", label: "Contact" },
];

export default function NavBar() {
    const [open, setOpen] = useState(false);
    const pathname = usePathname();

    return (
        <nav className="fixed top-0 w-full z-50 bg-dark-900/80 backdrop-blur-xl border-b border-white/5">
            <div className="container-site flex items-center justify-between h-20">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2.5 shrink-0">
                    <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-accent-500 to-brand-500 shadow-lg shadow-accent-500/20" />
                    <span className="text-xl font-bold tracking-tight text-white">
                        Red Rose <span className="text-brand-400">Tech</span>
                    </span>
                </Link>

                {/* Desktop Links */}
                <div className="hidden lg:flex items-center gap-7">
                    {links.map((l) => (
                        <Link
                            key={l.href}
                            href={l.href}
                            className={`text-sm font-medium transition-colors ${pathname === l.href
                                    ? "text-brand-400"
                                    : "text-slate-300 hover:text-white"
                                }`}
                        >
                            {l.label}
                        </Link>
                    ))}
                </div>

                {/* Desktop CTA */}
                <div className="hidden lg:flex items-center gap-4">
                    <span className="text-sm text-slate-400 font-medium border-r border-dark-700 pr-4">
                        (941) 444-0396
                    </span>
                    <Link
                        href="/contact"
                        className="px-5 py-2.5 rounded-lg bg-brand-600 hover:bg-brand-500 text-white text-sm font-semibold transition-all shadow-lg shadow-brand-600/20"
                    >
                        Get Assessment
                    </Link>
                </div>

                {/* Mobile toggle */}
                <button
                    onClick={() => setOpen(!open)}
                    className="lg:hidden p-2 text-slate-300 hover:text-white"
                    aria-label="Toggle menu"
                >
                    {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
            </div>

            {/* Mobile menu */}
            {open && (
                <div className="lg:hidden bg-dark-900/95 backdrop-blur-xl border-t border-white/5 pb-6">
                    <div className="container-site flex flex-col gap-1 pt-4">
                        {links.map((l) => (
                            <Link
                                key={l.href}
                                href={l.href}
                                onClick={() => setOpen(false)}
                                className={`px-4 py-3 rounded-lg text-sm font-medium transition-colors ${pathname === l.href
                                        ? "text-brand-400 bg-brand-500/10"
                                        : "text-slate-300 hover:text-white hover:bg-white/5"
                                    }`}
                            >
                                {l.label}
                            </Link>
                        ))}
                        <Link
                            href="/contact"
                            onClick={() => setOpen(false)}
                            className="mt-4 px-5 py-3 rounded-lg bg-brand-600 text-center text-white text-sm font-semibold"
                        >
                            Get Free Assessment
                        </Link>
                    </div>
                </div>
            )}
        </nav>
    );
}
