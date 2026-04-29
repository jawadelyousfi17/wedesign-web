
# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

```bash
npm run dev          # start dev server
npm run build        # prisma generate + next build
npm run lint         # eslint

npx prisma migrate dev     # run/create migrations
npx prisma db seed         # seed (uses ts-node/esm loader)
npx prisma studio          # browse DB in browser
```

## Architecture

**WeDesign** — website for a student design & code club at 1337 UM6P.

Stack: Next.js 16.2.4 App Router · React 19 · TypeScript · Tailwind CSS v4 · Prisma 5 + PostgreSQL · Supabase (auth + storage) · OpenAI SDK · Resend (email) · Framer Motion · Three.js · Matter.js

### Auth & Authorization

Two-layer auth:
1. **Supabase Auth** handles identity — `lib/supabase/client.ts` (browser) / `lib/supabase/server.ts` (RSC/server actions). OAuth callback at `app/auth/callback/route.ts`.
2. **Prisma `User.role`** (`USER` | `ADMIN`) controls authorization. Admin check lives in `app/admin/layout.tsx` — it fetches the Prisma user and redirects/blocks non-admins.

Supabase user `id` is used as the Prisma `User.id` (they share the same UUID).

### Data Layer

`lib/prisma.ts` exports a singleton `prisma` client. All DB mutations go through **Server Actions** co-located in `app/<route>/actions.ts`. No API routes for CRUD — everything is `"use server"`.

Key models: `User`, `TeamMember`, `Project`, `Article`, `CalendarEvent`, `JoinApplication`, `Form` + `FormSubmission`, `ContactMessage`, `MerchItem` + `MerchOrder`.

### Lab (Experiments)

`lib/lab-registry.tsx` is the single source of truth for all experiments (`EXPERIMENTS` array). Each entry has a `slug` that maps to a route under `app/lab/[slug]/`. Components live in `components/lab/`. Adding a new experiment requires: (1) add entry to registry, (2) create the page/component.

### Component Layout

- `components/main/` — shared shell: `Navbar`, `Footer`, `CommandPalette`, `HandMouseProvider`
- `components/ui/` — shadcn primitives (via `@base-ui/react`)
- `components/backgrounds/` + `components/customs/` — decorative / reusable UI pieces
- `app/admin/` — admin CRUD for journal, projects, calendar, merch, forms (ADMIN role required)

### Fonts

CSS variables set in `app/layout.tsx`: `--font-space-grotesk` (sans), `--font-jetbrains-mono` (mono), `--font-cardo` (serif).

### Chatbot

`app/chatbot/actions.ts` — server action calling OpenAI `gpt-4o-mini`. Requires `OPENAI_API_KEY` env var. `isTurbo` flag lowers temperature and caps tokens for faster responses.

### Environment Variables

`DATABASE_URL`, `OPENAI_API_KEY`, plus Supabase vars consumed by `@supabase/ssr`.
