# Frame — Photography Storytelling Website

Website portfolio fotografi dengan konsep editorial analog, full scroll-driven animation menggunakan GSAP ScrollTrigger + Lenis smooth scroll.

## Quick Start

```bash
npm install
npm run dev
```

Buka http://localhost:3000

## Build Production

```bash
npm run build
npm start
```

## Tech Stack

- Next.js 16 + React 19 + TypeScript
- GSAP 3 + ScrollTrigger — scroll-driven animation engine
- Lenis — ultra-smooth scroll
- Tailwind CSS v4

## Sections

1. **Hero** — Canon AE-1 exploded view, 80 frames scroll-driven sequence via Canvas API
2. **About** — Portrait photographer dengan 3D CSS frame reveal
3. **Work** — 3D card stack, foto terbang satu per satu saat scroll
4. **Gallery** — Masonry grid dengan category filter + hover animation
5. **Footer** — Minimal editorial

## Menambah Foto

- **Portrait:** `public/photos/portrait/`
- **Street:** `public/photos/street/`
- **Analog:** `public/photos/analog/`
- **Gallery:** `public/photos/gallery/`

Update array `CARDS` di `PictureSection.tsx` dan `PHOTOS` di `GallerySection.tsx`.
