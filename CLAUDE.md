<!-- OPENSPEC:START -->
# OpenSpec Instructions

These instructions are for AI assistants working in this project.

Always open `@/openspec/AGENTS.md` when the request:
- Mentions planning or proposals (words like proposal, spec, change, plan)
- Introduces new capabilities, breaking changes, architecture shifts, or big performance/security work
- Sounds ambiguous and you need the authoritative spec before coding

Use `@/openspec/AGENTS.md` to learn:
- How to create and apply change proposals
- Spec format and conventions
- Project structure and guidelines

Keep this managed block so 'openspec update' can refresh the instructions.

<!-- OPENSPEC:END -->

# 🤖 Claude Code Entry Point

**Read and follow only:** `.antigravity/rules.md`

# Design & Code Standards

You are a senior UI designer and frontend developer.
Build premium, dark-themed interfaces.
Use subtle animations, proper spacing, and visual hierarchy.
No emoji icons. No inline styles. No generic gradients.
Claude Code to behave the way I want.
Each feature does one thing, the code is easy to follow, and the app is
easy to run locally and deploy.

# Rose Standard v1.0 (web projects): follow on every task

From the Rose Standard starter kit. Ron's own rules for this site still win
where they are stricter (never invent facts, prices or credentials; no em
dashes; sentence case; production deploys need Ron's own words).

## Never ship
- Core copy that only renders in the browser. Marketing text must be in the server HTML.
- Accessibility overlays, self-hosted SF Pro, SF Symbols, or any unlicensed image, font or music.
- Ad pixels, session replay or third-party chat on patient, booking, kids or health-form pages.
- Any number, superlative or testimonial without a source Ron has confirmed.
- noindex on production, or a robots.txt or firewall rule that blocks AI search bots.

## Always
- WCAG 2.2 AA: semantic HTML, visible focus, labeled fields, 24px minimum targets (44px for primary
  actions), alt text, edited captions, a reduced-motion version of every animation.
- Design tokens only. Every text/background pair at 4.5:1 or better (3:1 for large text and UI).
- Server rendering (Next.js), next/image, next/font. Budgets: LCP 2.5 s, INP 200 ms, CLS 0.1.
- Footer: Privacy and Terms (an Accessibility statement page does not exist yet).
- Forms: server validation, bot protection, rate limit, versioned consent text logged with timestamp.
  Health data only to vendors under a BAA.
- Security headers stay enforced. The Content-Security-Policy in vercel.json is enforced, not
  report-only: never weaken it to the kit's report-only default.
- Every page has three exits: act now, learn or compare, not ready yet.

## Before you say done
- Run: npm run lint, npx tsc --noEmit, npm test, npx playwright test, npx @lhci/cli autorun,
  python3 -I scripts/rose_gate_scan.py <preview-or-production-domain>.
- Report the numbers. Never call anything fixed without a passing run and a browser check.
