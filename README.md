# Engineering Portfolio

A React and TypeScript portfolio for documenting my engineering coursework,
projects, build notes, and media. This public site is a lightweight project
library, while the private admin route lets project entries be managed without
editing source files directly.

## What It Includes

- Responsive portfolio pages for home, projects, about, contact, and project
  detail views
- Supabase-backed project data with a local fallback for development
- Private editor for creating, updating, publishing, featuring,
  and deleting projects
- Project media support through Supabase Storage, including image/video uploads,
  removable previews, and a selectable highlight image
- Project fields for short summaries, longer notes, tools, courses, display
  order, and draft/published status

## Tech Stack

- React
- TypeScript
- Vite
- React Router
- Supabase Auth, Database, and Storage
- ESLint

## Getting Started

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

Run lint checks:

```bash
npm run lint
```

## Supabase Setup

The site can run without Supabase by falling back to `src/data/projects.ts`, but
the admin editor needs Supabase configured.

1. Create a Supabase project.
2. In the Supabase SQL editor, run the full contents of `supabase-projects.sql`.
3. Copy `.env.example` to `.env.local`.
4. Fill in the local environment variables:

```bash
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-public-anon-key
VITE_ADMIN_EMAIL=you@example.com
```

The SQL file creates the `projects` table, enables row-level security, grants the
required browser roles, seeds starter projects, and creates the public
`project-media` storage bucket with admin-only upload/update/delete policies.

## Admin Notes

Only the email configured in `VITE_ADMIN_EMAIL` can manage projects. Sign-in uses
Supabase magic links, so there is no custom password flow in this app.

Rerunning `supabase-projects.sql` is intended to be safe for existing project
rows. Schema updates use `add column if not exists`, and starter rows use
`on conflict (slug) do nothing`.

Removing an image or video in the admin editor removes it from the project
record. It does not currently delete the underlying file from Supabase Storage.

## Project Data Model

Each project supports:

- `title`
- `slug`
- `course`
- `description`
- `notes`
- `tools`
- `image_urls`
- `video_urls`
- `cover_image_url`
- `featured`
- `display_order`
- `is_published`