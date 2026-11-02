# Profile direction

## Source: the ISO 7200 drawing title block

An engineering drawing carries a bordered strip of labelled cells (small caps label above, value
below, hairline rules between). It is the sheet's identity: who drew it, what it is, which revision.
That is what a profile has to do, and Jiv's work is systems and measured results, so the profile is a
sheet: one photographed view, then the title block, then plain tables like a drawing's schedules.
Reference: ISO 7200 / ISO 5457 sheet templates (see `REFERENCES.md`).

## Character brief

- **Who and where:** Jiv Tuban, AI engineer in Cebu, PH, selling to US startup founders and hiring managers who arrive from a LinkedIn post.
- **Feel:** exact, calm, grounded. **Not:** techy-neon, playful, salesy.
- **Personality in a line:** an engineer who hands you a clean drawing and the numbers.
- **Signature:** the live title block (real stats, `REV` date updates itself) under a photograph of the Cebu waterfront (Ayahay's ferries, "from Cebu").

## Levers

| Lever | Choice | From |
|---|---|---|
| Colour field | Warm paper `#f4f1ea` / `#131210`, ink `#1d1c1a` / `#ece8dd`, one accent `#c2410c` / `#f0662a` | Drafting paper and ink; accent only on "now" (current streak, today's cell) |
| Type voice | System mono for labels and numerals, system sans for name and role | GitHub renders SVG with system fonts only |
| Photography | Generated documentary photo, Cebu pier and ferry, no text | Codex `$imagegen`, gpt-6-sol, 2 candidates, picked B |
| Shape language | Square cells, hairline rules, no radius | Title block |
| Copy voice | Plain statements with numbers, no taglines | Jiv's working style (numbers, not adjectives) |

## Decisions

- Removed: capsule-render waves, typing SVG, skillicons grid, visitor counter, shields badges, `> command` headings, emoji, centred layout, snake animation. All are third-party hosted or common AI-profile tells.
- Stats are self-hosted: `scripts/build.mjs` + `.github/workflows/card.yml` publish `card-{light,dark}.svg` to the `output` branch every 6 hours. Nothing depends on a public Vercel instance (the old `github-readme-stats` returned 503 and `activity-graph` 402, which caused the broken images).
- The banner is AI-generated and says so in its alt text.
- Rejected: Kent C. Dodds style 3D mascot art (decorative, generic); simonw style multi-column live lists (too dense for a first impression); jstrieb card layout (language bars overlap).

## Editing

- Name and role: `PROFILE` in `scripts/card.mjs`.
- Colours: `THEMES` in `scripts/card.mjs`.
- Run locally: `GH_TOKEN=$(gh auth token) node scripts/build.mjs dist` then open `dist/*.svg`.
