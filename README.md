# Culture Swap Wall — website prototype

A working front-end prototype of the Culture Swap Wall concept described in
`output/Culture_Swap_Wall_Project_Report.pdf`. It is a static site: no build
step, no server code, no external requests, no accounts.

> **Demonstration content only.** Every story, name and illustration is
> fictional and was written for this prototype. Nothing a visitor enters is
> uploaded or published. Data is stored in the browser's `localStorage` so the
> interface can be tested end to end.

## Run it

The site opens directly from disk:

```bash
open website/index.html            # macOS
# or double-click index.html
```

For a more realistic environment (and for reliable local storage), serve the
folder over HTTP:

```bash
cd website
python3 -m http.server 8080
# then open http://localhost:8080
```

Chrome may cache the page during development; use a hard reload
(`Cmd/Ctrl + Shift + R`) after editing CSS or JavaScript.

## What is implemented

| Route | Purpose |
| --- | --- |
| `#/` | Home: concept, promises, Culture Bridge, featured stories, impact logic |
| `#/wall` | Discovery wall with text search, category chips, region filter and sorting |
| `#/story/:id` | Story page: context, meaning, "please don't assume", read-aloud, save, report |
| `#/bridge/:id` | Culture Bridge: question → reflection → connection, saved locally |
| `#/atlas` | Regional board (an accessible alternative to a geographic map) |
| `#/submit` | Three-step submission: write → preview and automatic pre-check → queue |
| `#/safety` | Safeguards, moderation limits, privacy, accessibility, First Nations protocols |
| `#/about` | Project logic, evidence boundary, impact framework, report download |
| `#/saved` | Stories saved on this device |
| `#/moderation` | Restricted demonstration of the review queue and reports |

Other behaviour:

- Hash-based routing, so it works from `file://` and from any static host.
- Saved stories and completed Bridges persist in `localStorage`; clearing site
  data resets the demo.
- The report button opens a native `<dialog>`; the report lands in the
  moderation queue on the same device.
- Submission runs a deliberately simple keyword pre-check. It is advisory by
  design: the interface states that a human decides.
- Read-aloud uses `window.speechSynthesis`; the voice depends on the operating
  system and the feature degrades silently where unavailable.

### Moderation demonstration

Open `#/moderation` and enter the code **`wall2026`**. The code is printed on
the page on purpose: this is a demonstration of a workflow, not a security
boundary. Approving a queued story publishes it to the wall for the current
browser session.

## Project structure

```
website/
  index.html                  page shell, header, footer, dialog
  assets/css/styles.css       design system, responsive and print styles
  assets/js/data.js           fictional stories, categories, regions, prompts
  assets/js/app.js            router, views, state, interactions
  assets/img/*.svg            abstract story covers and favicon
  assets/docs/…report.pdf     downloadable copy of the project report
  make_art.py                 regenerates the SVG cover artwork
```

Editing content: change `assets/js/data.js`. Adding a story requires the fields
used by `views.story` (`context`, `means`, `understand`, `assumptions`,
`questions`, `reflections`).

## Accessibility

Targeted, not certified: WCAG 2.2 Level AA is the design target.

- Skip link is the first tab stop and moves focus to `main`.
- Every interactive element is a button, link, input or select with a visible
  focus ring; the atlas is a board of buttons, not a canvas or SVG map.
- Icons are decorative and hidden from assistive technology; the save button
  has an explicit accessible name that changes with state.
- Story images have text alternatives; illustrations are labelled as
  illustrations, not photographs of contributors.
- Audio is optional and uses the browser voice; the full text remains on screen.
- `prefers-reduced-motion` disables transitions and smooth scrolling.
- Layout reflows at 320–1440 px with no horizontal scrolling.

**Not done yet:** testing with a real screen reader (VoiceOver/NVDA), an
independent WCAG audit, captions for user-uploaded audio, or a high-contrast
theme. These are listed as next steps in the report.

## Testing

```bash
python3 -m pip install --user playwright
python3 scripts/web_qa.py
```

The script drives Chrome through every route at 1440 px, 834 px and 390 px,
checks for JavaScript errors, broken images and horizontal overflow, exercises
search and filters, the save toggle, the full Bridge, submission validation and
queueing, moderation approval, reporting, the mobile menu and keyboard focus.
Results are written to the console and screenshots to `qa/site/`.

## Known limitations

- **No backend.** No accounts, uploads, email, real moderation or database.
  Everything is local to one browser.
- **Fictional content.** Eight stories demonstrate the interface; they are not
  a representative sample and must not be cited as evidence.
- **Moderation is simulated.** The "automated check" is a short keyword list
  used to demonstrate that filters flag for humans rather than decide.
- **No image or audio upload.** The consent question is present, but file
  handling is not implemented.
- **Speech synthesis varies** by browser and operating system.
- **Not yet tested with students** in this build. The report distinguishes the
  one recorded feedback cycle from this later prototype.

Before any real use, the site needs a server, authentication, a moderation
queue with audit logging, rate limiting, image scanning, privacy review,
safeguarding review and a supervised pilot. See sections 12–14 of the report.
