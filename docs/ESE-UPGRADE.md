# ESE upgrade: checkpoint and direction card

Goal: make the revision site engaging for end-sem (CC, NLP, CN, DL; theory ESEs end of Nov 2026, 45 marks each).
Priority DL, then NLP, then CN, then CC. Preserve-first: same URLs and content, change the skin and add a learning layer.

## Brief
- **Who/where/mood:** Harsh, laptop at a desk or phone late at night, cramming, bored of reading walls of text.
- **Mode:** Read + active recall. Success = he can reproduce a diagram, a derivation or a definition without looking.
- **The one memorable thing:** pages you *do* things on: step through a diagram, reveal an answer, tick a unit off.
- **Constraints:** static, fast (no frameworks, no heavy JS), phone-readable at 375px, light and dark.

## Direction card
```
Name:        Night-shift notebook
Metaphor:    a well-used revision notebook: warm paper by day, chalkboard by night
Palette:     paper #f6f1e7 / ink #1f1a14 / subject accent (DL ember, NLP teal, CN green, CC indigo) /
             marker yellow #ffe066 (highlights, "key" things) / muted #6b6258.  Dark = board #15181c, chalk #ece8df.
Type:        Fraunces (soft serif, headings) + Atkinson Hyperlegible (body) + JetBrains Mono (formulas), all self-hosted
Motion:      one language: short exponential ease-out reveals triggered by the reader's click. No scroll fade-ups.
Signature:   step-through SVG diagrams for each key mechanism + reveal-to-answer everywhere
Refuse:      gradient text, coloured side-border cards, identical icon-card grids, scroll fade-up on every block
```

## Learning layer (shared, in /assets)
- `ese.css` / `ese.js`: skin + components. Progressive enhancement: without JS everything is still readable.
- Question banks: answers hidden behind reveal, "got it" ticks, progress count (localStorage).
- Unit pages: "Test yourself" panel pulling 5 random questions from that unit's question bank.
- `flashcards.html` per subject built from the question banks.
- Numericals: step reveal.
- Diagrams: `figure.fig[data-steps]` step-through SVGs.
- Homepage: per-subject progress from localStorage.
- Per subject: cheat sheet + likely ESE questions.

## Status
- [ ] Engine (ese.css/ese.js, fonts)
- [ ] DL (vertical slice)  [ ] NLP  [ ] CN  [ ] CC
- Moodle pull: needs Harsh logged in (btech browser). Extract text only, no downloads left behind.
