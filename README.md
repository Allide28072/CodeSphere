# CodeSphere — Allide' Ru.Ju.Gi.Ra Portfolio

A full-stack portfolio site and lightweight CMS for Allide' Ru.Ju.Gi.Ra, Web & Software Developer.

The public site showcases a profile, skills, projects, and services, and includes a working contact form.
A private admin area lets the owner manage every piece of content without touching code.

## Tech stack

- **React 18** + **Vite 5**
- **React Router 6** (route-level code splitting via `React.lazy`)
- **Tailwind CSS 3** with a custom design system (light/dark themes)
- **lucide-react** icons
- **Supabase** for Postgres, Auth, and Storage (optional — the app runs in demo/local mode without it)

## Getting started

```bash
npm install
cp .env.example .env   # then fill in your Supabase values (optional)
npm run dev
```

Open http://localhost:5173.

### Run without Supabase

If `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` are missing or still placeholders, the site runs in
**demo mode** using `src/data/demo.js`. Content is read-only on the public site and the contact form is
disabled. The admin area falls back to **local mode**, storing changes in `localStorage` so you can try
the CMS without a backend.

## Environment variables

Copy `.env.example` to `.env`:

| Variable | Used by | Purpose |
| --- | --- | --- |
| `VITE_SUPABASE_URL` | browser | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | browser | Supabase anon/public key (safe to expose) |
| `SUPABASE_URL` | `npm run seed:admin` | Supabase project URL (server-side only) |
| `SUPABASE_SERVICE_ROLE_KEY` | `npm run seed:admin` | Service role key — **never** expose or commit |
| `ADMIN_EMAIL` | `npm run seed:admin` | Email for the bootstrap admin account |
| `ADMIN_PASSWORD` | `npm run seed:admin` | Password for the bootstrap admin account |

`.env` is gitignored. Only `.env.example` is committed.

## Supabase setup

1. Create a project at https://supabase.com.
2. Open **SQL Editor** and run `supabase/schema.sql`. This creates the tables, row-level security
   policies, admin helpers, and the `project-media` storage bucket.
3. Add the project URL and anon key to `.env` (see above).
4. Create an admin account. Either sign up through Supabase Auth and insert the user into
   `public.admin_users`, or run the bootstrap script:

   ```bash
   npm run seed:admin
   ```

5. Verify the connection:

   ```bash
   npm run check:supabase
   ```

The schema includes: `site_profile`, `categories`, `skills`, `projects`, `project_media`,
`contact_messages`, and `admin_users`.

## Admin area

Visit `/admin/login` and sign in with an admin account.

| Section | Path | Manages |
| --- | --- | --- |
| Overview | `/admin` | Dashboard stats and recent activity |
| Projects | `/admin/projects` | Projects, media, publish state |
| Homepage | `/admin/homepage` | Hero and homepage copy |
| Profile & About | `/admin/profile` | Bio, links, resume, socials |
| Skills | `/admin/skills` | Skills and categories |
| Categories | `/admin/categories` | Project categories |
| Messages | `/admin/messages` | Contact form submissions |

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Vite dev server |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Preview the production build |
| `npm run lint` | Run ESLint |
| `npm run check:supabase` | Check Supabase env + schema connectivity |
| `npm run seed:admin` | Create/repair the bootstrap admin account |

## Deployment

The build output is a static SPA in `dist/`. Any static host works, but the server must rewrite unknown
paths to `index.html` so client-side routes resolve.

**Vercel** — import the repo. `vercel.json` already contains the SPA rewrite; no extra settings needed.

**Netlify** — import the repo. `netlify.toml` sets the build command, publish directory, and redirect.

**Other hosts** — run `npm run build` and serve `dist/` with an `index.html` fallback for unmatched routes.

Set the two `VITE_SUPABASE_*` variables in your host's environment settings for production.

## Project structure

```
src/
  components/     Reusable UI (layout, cards, admin chrome)
  context/        Auth, Site, Theme, and Toast providers
  hooks/          usePageMeta
  lib/            Supabase client, APIs, local storage, formatting
  pages/          Public pages
  pages/admin/    CMS pages
  data/demo.js    Demo content used without Supabase
supabase/schema.sql
scripts/          check-supabase, seed-admin
```
