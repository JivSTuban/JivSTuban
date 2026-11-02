# Profile direction

## Source: the ISO 7200 drawing title block

An engineering drawing carries a bordered strip of labelled cells (small caps label above, value
below, hairline rules between). It is the sheet's identity: who drew it, what it is, which revision.
That is what a profile has to do, and Jiv's work is systems and measured results, so the profile is a
sheet: the title block, then schedules (tables) like a drawing's. Every image
shares the sheet's language: hairline ink, square cells, paper tones, one accent.
Reference: ISO 7200 / ISO 5457 sheet templates (see `REFERENCES.md`).

## Revision 2, 2026-11-03: showcase surfaces are media-rich

Jiv's preference (CLAUDE.md rule 18, memory `showcase-media-rich`): on a profile, portfolio or landing, use as
much media, icons, illustrations and motion as the surface allows. Revision 1 was too restrained and deleted the
technology icons he liked. Revision 2 keeps the drawing language and adds media inside it. The look is unchanged;
the amount of media and motion is not.

## Character brief

- **Who and where:** Jiv Tuban, AI engineer in Cebu, PH, selling to US startup founders and hiring managers who arrive from a LinkedIn post.
- **Feel:** exact, alive, grounded. **Not:** techy-neon, playful-cartoon, salesy.
- **Personality in a line:** an engineer who hands you a clean drawing, the numbers, and a ferry crossing the page.
- **Signature:** the live title block at the top, with a plotter-style scan across the tools he works with and a ferry on the divider.

## Levers

| Lever | Choice | From |
|---|---|---|
| Colour field | Warm paper `#f4f1ea` / `#131210`, ink `#1d1c1a` / `#ece8dd`, one accent `#c2410c` / `#f0662a` | Drafting paper and ink; accent only on "now" (current streak, today's cell, the scan, the ferry funnel) |
| Type voice | System mono for labels and numerals, system sans for name and role | GitHub renders SVG with system fonts only |
| Photography | None. Jiv asked to delete the photo (2026-11-03). Two banners were tried: a grey Cebu pier (disliked) and a window desk over a Cebu bay. Both were generated with Codex `$imagegen` and removed. The illustrations and tech tiles carry the media now | Jiv |
| Illustration | 12 technical-pen line icons (workflow, lotus, car, ferry, print, trophy, house, cake, cap, map, padlock, envelope), ink plus one accent detail, recoloured per theme | Codex `$imagegen`, one sheet; `icons/prompt.md`, `icons/slice.py` |
| Technology icons | 30 brand tiles in a gridded schedule, vendored (skill-icons MIT, glyphs CC0/MIT) | Jiv liked the skillicons grid; `assets/tech/SOURCES.md` |
| Shape language | Square cells and hairlines for the sheet; the brand tiles keep their own rounded corners | Title block; skill-icons |
| Motion personality | Slow and mechanical, ease-out entrances under 300 ms, nothing bouncy | Plotter pen and ship movement |
| Copy voice | Plain statements with numbers, no taglines | Jiv's working style |

## Motion inventory (all CSS inside SVG, no JS, all behind `prefers-reduced-motion: no-preference`)

| Element | Motion | Why |
|---|---|---|
| Card grid | Cells fade in left to right (16 ms stagger); today's cell pulses | Reads as the data arriving; "now" is the one thing that breathes |
| Stack grid | Tiles rise in (28 ms stagger, 300 ms, ease-out); an accent outline sweeps diagonally every 10 s | A pen plotter checking each tool |
| Route divider | A ferry sails the dimension line (22 s) and bobs | Cebu, ferries, Ayahay |
| Contact chips | Icon and label rise in once | Presence without noise |

With reduced motion everything is already in its final, visible state.

## Decisions

- Restored: technology icon grid (as self-hosted tiles with category rows), after Jiv asked for it.
- Added: route divider, per-job and per-project line illustrations, contact chips, the stack as text in a `<details>` for search and screen readers.
- Still removed: capsule-render waves, typing SVG, visitor counter, shields badges, `> command` headings, emoji, centred layout, snake animation, gradients and glow. Rule 7 stays in force.
- Self-hosted everything: `scripts/build.mjs` + `.github/workflows/card.yml` publish all generated SVGs to the `output` branch every 6 hours; illustrations and tech tiles are committed under `assets/`. Nothing depends on a public Vercel instance (the old `github-readme-stats` returned 503 and `activity-graph` 402, which caused the broken images).
- The illustrations are AI-generated (Codex `$imagegen`).
- Rejected: Kent C. Dodds style 3D mascot art (decorative, generic); simonw style multi-column live lists (too dense for a first impression); jstrieb card layout (language bars overlap); a JS or Lottie hero (GitHub strips scripts).

## Editing

- Name and role: `PROFILE` in `scripts/card.mjs`. Colours: `THEMES` there.
- Tools shown: `GROUPS` in `scripts/stack.mjs` (add the SVG to `assets/tech` and a line in `SOURCES.md`).
- Illustrations: regenerate the sheet from `icons/prompt.md`, then `icons/slice.py`.
- Run locally: `GH_TOKEN=$(gh auth token) node scripts/build.mjs dist`, open `dist/*.svg`. Tests: `node --test scripts/*.test.mjs`.
