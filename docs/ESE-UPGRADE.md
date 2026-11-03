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

## Status (resume from here)
- [x] Engine: assets/ese.css, assets/ese.js, self-hosted fonts (about 93 KB)
- [x] DL slice (Units 1-3): notebook skin, 12 step-through diagrams, reveal Q&A, step-reveal numericals, Test-yourself panel,
      flashcards.html, cheatsheet.html (formulas, parameter counter, likely ESE questions ranked from the 4 PYQ papers), homepage progress
- [ ] DL Units 4/5 (RNN/LSTM, CNN/AlexNet/VGG, autoencoders, XOR gates): the PYQs test these in every paper and the site has NONE of it.
      BLOCKED on Moodle login (btech browser). Extract text only, label anything not from a deck.
- [ ] NLP  [ ] CN  [ ] CC  (wire with scratchpad wire.js: add ese.css/ese.js, then add figures, flashcards, cheatsheet, READY list in ese.js)
- Per-subject checklist: wire pages -> figures (figlib.js step-through) -> flashcards.html -> cheatsheet.html -> add subject to READY in ese.js
  and to ESE_MANIFEST on index.html -> verify 1440 + 375, light + dark -> commit + push.
