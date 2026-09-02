# Kevo Nails Academy — Development Starter

Full-stack platform for Kevo Nails Academy: public website, online booking,
admin dashboard, student applications, and an AI chatbot grounded in live
business data.

**Status:** Phase 1–2 scaffold (project setup + database schema + core
service libraries). Phases 3–14 below are the remaining build-out.

## Stack

- Next.js 14 (App Router) + TypeScript + Tailwind CSS
- Neon PostgreSQL + Prisma ORM
- Cloudinary (media storage)
- Nodemailer/SMTP (email — swappable provider)
- AI API (chatbot) — provider of your choice (OpenAI-compatible client included)

## Requirements

- Node.js 18+
- npm
- VS Code
- A Neon account (https://neon.tech)
- A Cloudinary account (https://cloudinary.com)
- An SMTP-capable email provider (e.g. Resend, Postmark, Gmail app password)
- An AI API key (e.g. OpenAI, Anthropic) for the chatbot

## 1. Install

```bash
npm install
```

## 2. Environment

Copy the template and fill in real values (never commit `.env`):

```bash
cp .env.example .env
```

Each variable is documented inline in `.env.example`. Notably:
- `DATABASE_URL` — from your Neon project's connection string.
- `CLOUDINARY_API_SECRET` — server-only, used only in `src/lib/cloudinary.ts`.
- `AI_API_KEY` — server-only, used only in server-side chatbot API routes.

## 3. Database

```bash
npx prisma migrate dev --name init   # creates tables in Neon
npx prisma generate                  # generates the Prisma client
npm run db:seed                      # optional: loads clearly-labeled demo data
```

`prisma/schema.prisma` contains the full data model: AdminUser, Customer,
Service, Appointment, AppointmentNote, BusinessHour, BlockedTime, Course,
Intake, Application, ApplicationDocument, GalleryImage, Banner,
Announcement, Promotion, FAQ, ChatSession, ChatMessage, WebsiteSetting,
EmailLog.

## 4. Run

```bash
npm run dev
```

Visit `http://localhost:3000` and `http://localhost:3000/api/health` to
confirm the app and database connection are working.

## 5. Create the first admin user

The seed script creates a demo admin (`admin@kevonailsacademy.test` /
`ChangeMe123!`). For a real deployment, write a one-off script or a
protected setup route that calls `hashPassword()` from `src/lib/auth.ts`
and inserts an `AdminUser` — then delete/disable that route.

## 6. Cloudinary

Create a Cloudinary account, grab your Cloud Name, API Key, and API
Secret from the dashboard, and set them in `.env`. All uploads go through
`src/lib/cloudinary.ts` server-side — the secret is never sent to the
browser.

## 7. Email

Set `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`, `EMAIL_FROM`,
`ADMIN_EMAIL` in `.env`. `src/lib/email.ts` is a thin abstraction — swap
the transporter to another provider without changing call sites. Every
send attempt is logged to `EmailLog` with `PENDING` / `SENT` / `FAILED`,
and a failed email never blocks saving the underlying application or
booking to the database.

## 8. AI Chatbot

Set `AI_API_KEY`. `src/lib/chatbot.ts` builds a system prompt from live
database content (current prices, hours, courses, intakes, FAQs) on every
request, so the assistant can't answer with stale information. Call it
from a server-side API route only — never expose the key to the client.

## 9. SEO / Google Search Console

Once deployed to a real domain:
1. Set `NEXT_PUBLIC_SITE_URL` to the production URL.
2. Add the site in Google Search Console and verify ownership (DNS or
   HTML file method).
3. Submit the generated `sitemap.xml` (to be added in the SEO phase).
4. Monitor indexing status and Core Web Vitals from the Search Console
   dashboard. This does not automatically rank the site — Search Console
   only helps Google discover and evaluate it.

## Remaining build phases

This scaffold covers Phase 1 (project init) and Phase 2 (database schema
+ core lib helpers: Cloudinary, email, auth, booking engine with
double-booking protection, chatbot context builder). Still to build:

- Phase 3 — Branding & public UI (Header, Footer, nav, layout components)
- Phase 4 — Services & gallery pages + Cloudinary upload UI
- Phase 5 — Appointment booking UI wired to `src/lib/booking.ts`
- Phase 6 — Admin calendar, business hours & blocked-time management
- Phase 7 — Academy, courses & intakes pages
- Phase 8 — Student application form + email notifications (uses
  `src/lib/email.ts` and `src/lib/references.ts`)
- Phase 9 — Admin dashboard (sidebar, all CRUD screens)
- Phase 10 — AI chatbot UI + WhatsApp floating button + escalation
- Phase 11 — SEO (sitemap.xml, robots.txt, structured data, metadata per page)
- Phase 12 — Security hardening, validation, rate limiting, error handling
- Phase 13 — Responsive QA across devices
- Phase 14 — Production build & final testing

## Important — no invented business data

Only these business facts are confirmed real:
Business name: Kevo Nails Academy · Phone/WhatsApp: 0702078249 · Slogan:
"Where Passion Meets Precision" · Colors: Black, Blue, White.

Everything else (address, email, prices, course details, social handles,
reviews) must be entered by the business owner through Admin → Settings
before going live. Seed data is clearly labeled `(DEMO)` and must not be
shown to real customers.
