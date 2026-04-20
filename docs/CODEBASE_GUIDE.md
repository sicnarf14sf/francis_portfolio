# Codebase Guide

This file is the quick map for future-you.

## Top-Level Structure

```text
francis_portfolio/
  public/
    draco/
      gltf/
        draco_decoder.js
        draco_decoder.wasm
        draco_wasm_wrapper.js
  src/
    assets/
      hero_image.JPG
    components/
      about/
        CertificatesTimeline.tsx
        ImageCarousel.tsx
        SampleOutputs.tsx
      admin/
        AboutAdmin.tsx
        ExperienceAdmin.tsx
        RecommendationsAdmin.tsx
        RequireAdmin.tsx
      layout/
        Footer.tsx
        SectionHeader.tsx
      nav/
        NavBarDesktop.tsx
        NavBarMobile.tsx
      sections/
        Education.tsx
        Experience.tsx
        ExperienceDetails.tsx
        Home.tsx
        Recommendations.tsx
        Skills.tsx
      three/
        GLBViewer.tsx
    data/
      modelOverrides.ts
      navLinks.ts
    lib/
      api/
        about.ts
        certificates.ts
        education.ts
        experience.ts
        recommendations.ts
      adminAuth.ts
      storage.ts
      supabaseClient.ts
      uploadValidation.ts
      utils.ts
    pages/
      AboutPage.tsx
      AdminDashboard.tsx
      AdminLogin.tsx
      ExperienceDetailsPage.tsx
      HomePage.tsx
    theme/
      ThemeProvider.tsx
    types/
      index.ts
    utils/
      scrollToId.ts
    App.tsx
    index.css
    main.tsx
  docs/
    CODEBASE_GUIDE.md
  index.html
  package.json
  README.md
  vercel.json
```

## Runtime Flow

### App entry

- `src/main.tsx`
  Boots React, Router, and ThemeProvider.

- `src/App.tsx`
  Defines routes.
  Keeps `HomePage` in the main bundle.
  Lazy-loads the other routes.

### Public pages

- `src/pages/HomePage.tsx`
  Loads experiences, education, and recommendations from Supabase.

- `src/pages/AboutPage.tsx`
  Loads About page text, carousel images, sample outputs, and certificates.

- `src/pages/ExperienceDetailsPage.tsx`
  Loads one experience entry and optional model overrides.

### Admin pages

- `src/pages/AdminLogin.tsx`
  Signs into Supabase Auth, then checks admin access through `is_portfolio_admin()`.

- `src/components/admin/RequireAdmin.tsx`
  Protects `/admin/dashboard`.

- `src/pages/AdminDashboard.tsx`
  Main admin shell.

- `src/components/admin/AboutAdmin.tsx`
  Manages About page text, photos, certificates, and sample outputs.

- `src/components/admin/ExperienceAdmin.tsx`
  Manages experience rows, gallery images, and thumbnails.

- `src/components/admin/RecommendationsAdmin.tsx`
  Manages homepage recommendations.

## Security Files

- `src/lib/adminAuth.ts`
  Calls Supabase RPC `is_portfolio_admin()`.

- `src/lib/supabaseClient.ts`
  Creates the frontend Supabase client.

- `src/lib/uploadValidation.ts`
  Client-side size/type validation for uploads.

- `vercel.json`
  Vercel rewrites and response security headers.

## Data Layer

- `src/lib/api/about.ts`
  Read-only public fetchers for About page content.

- `src/lib/api/certificates.ts`
  Fetches certificate rows.

- `src/lib/api/education.ts`
  Fetches education rows.

- `src/lib/api/experience.ts`
  Fetches experience summaries and detail data.

- `src/lib/api/recommendations.ts`
  Fetches recommendations.

## 3D Notes

- `src/components/three/GLBViewer.tsx`
  Heavy Three.js viewer.
  Lazy-loaded only when a 3D modal is opened.

- `public/draco/gltf/*`
  Decoder files required for Draco-compressed models.

## If You Need To Change Something Later

### Update page content

- Use the admin dashboard.

### Change admin access

- Change it in Supabase, not in frontend code.

### Add a new editable content type

1. Add the UI.
2. Add the fetch/update logic.
3. Add Supabase RLS and storage policies.
4. Update README if the workflow changes.

### Add a new heavy feature

- Prefer route-level or modal-level lazy loading.

## Fast Mental Model

- `pages/` = route screens
- `components/sections/` = public homepage sections
- `components/admin/` = admin tools
- `lib/api/` = public reads from Supabase
- `lib/` = auth/storage/helpers
- `types/` = shared shapes
