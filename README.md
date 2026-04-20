# Francis Portfolio

Personal portfolio built with React, TypeScript, Tailwind CSS, Vite, and Supabase.

## What This Project Does

- Public portfolio site with Home, About, Education, Experience, Recommendations, and 3D sample outputs
- Admin area for managing portfolio content
- Supabase-backed content storage, authentication, and file uploads
- Protected admin access enforced both in the frontend and in Supabase

## Tech Stack

- React 19
- TypeScript
- Vite
- Tailwind CSS
- React Router
- Supabase
- Three.js / React Three Fiber / Drei
- Vercel

## Quick Start

1. Install dependencies:

```bash
npm install
```

2. Add local environment variables in `.env.local`:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_publishable_key
```

3. Start the app:

```bash
npm run dev
```

4. Build for production:

```bash
npm run build
```

## Project Structure

For the full codebase map, read [docs/CODEBASE_GUIDE.md](docs/CODEBASE_GUIDE.md).

High-level layout:

```text
src/
  components/
    about/         About page UI
    admin/         Admin tools
    layout/        Shared layout pieces
    nav/           Navigation
    sections/      Main page sections
    three/         3D viewer
  data/            Static config data
  lib/             Supabase helpers, auth checks, upload validation
  pages/           Route-level screens
  theme/           Theme context
  types/           Shared TypeScript types
  utils/           Small utility helpers
public/
  draco/           Draco decoder files for compressed 3D models
docs/
  CODEBASE_GUIDE.md
```

## Security Setup

This is the part to remember if you come back later.

### Simple Rule

The frontend does not decide who is admin anymore.
Supabase decides.

### How Admin Access Works

1. The user signs in through Supabase Auth.
2. The app calls the Supabase RPC function `is_portfolio_admin()`.
3. If Supabase returns `true`, the user can open `/admin/dashboard`.
4. If Supabase returns `false`, the user is blocked.
5. The database and storage policies also rely on the same admin rule.

This means:

- Frontend check and backend policy are aligned
- A signed-in user is not automatically an admin
- Uploads and content edits are protected by Supabase, not just hidden routes

### What Must Exist In Supabase

These items must already be configured in your Supabase project:

- A function named `public.is_portfolio_admin()`
- A table or policy setup that tells Supabase which users are admins
- RLS enabled on your editable portfolio tables
- Storage policies for the buckets used by the admin

### Buckets Used By This Project

- `about`
- `certificates`
- `experience-images`

### Editable Tables Used By This Project

- `about_page_content`
- `about_photos`
- `about_outputs`
- `certificates`
- `education`
- `experience`
- `experience_images`
- `recommendations`

### If Admin Login Suddenly Stops Working

Check these in order:

1. Make sure your Supabase user can still sign in normally.
2. Make sure `is_portfolio_admin()` still exists in Supabase.
3. Make sure the function returns `true` for your account.
4. Make sure the admin table / email / user ID rule inside Supabase still includes you.
5. Make sure your RLS and storage policies were not removed or changed.
6. Make sure `.env.local` still points to the correct Supabase project.

### If The Public Site Stops Loading Content

Check these:

1. `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
2. Public read policies for portfolio tables
3. Public read policies for storage objects
4. Bucket names match the code

### Security Hardening Already Added

- Admin route protection through Supabase RPC
- Database-side admin enforcement through Supabase policies
- Storage write/delete restrictions for admin uploads
- Upload validation for image and 3D model files
- Vercel security headers in `vercel.json`
- Lazy loading for heavy routes and 3D viewer code

## Upload Rules

Current client-side upload limits:

- Images: up to 8 MB each
- 3D models: up to 80 MB each

Accepted file types:

- Images: files with MIME type starting with `image/`
- Models: `.glb` or `.gltf`

Important:

- Client-side validation improves UX
- Real protection still comes from Supabase storage policies

## Admin Pages

- `/admin` - login screen
- `/admin/dashboard` - content management dashboard

Main admin areas:

- About page content and About assets
- Recommendations
- Experience entries and media

## Performance Notes

- Non-home routes are lazy-loaded
- The 3D viewer is lazy-loaded only when a model modal is opened
- Draco decoder assets are served from `public/draco`

## Files Worth Remembering

- `src/App.tsx` - route map and lazy loading setup
- `src/lib/adminAuth.ts` - admin verification against Supabase
- `src/lib/supabaseClient.ts` - Supabase client setup
- `src/lib/uploadValidation.ts` - upload size/type checks
- `src/pages/AdminLogin.tsx` - admin login flow
- `src/components/admin/RequireAdmin.tsx` - admin route gate
- `vercel.json` - rewrite rules and security headers
- `docs/CODEBASE_GUIDE.md` - codebase map and future reference

## Notes For Future Me

- If you want to change who is admin, do it in Supabase first.
- Do not reintroduce a frontend-only admin allowlist unless you are debugging locally.
- If you add a new editable table or upload bucket, also update Supabase policies.
- If you add a heavy page or tool, prefer lazy loading.
