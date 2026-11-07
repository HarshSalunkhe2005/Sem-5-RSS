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
- [x] DL complete (syllabus has 5 units): Units 1-5, Unit 3 part 2 question bank (Q159-234), Unit 4 (optimisation, batch norm, tuning), Unit 5 (CNN, RNN, LSTM, autoencoders),
      21 step-through diagrams, flashcards (287 cards), cheat sheet with ranked likely questions, homepage progress. Moodle decks pulled 4 Nov 2026.
- [x] NLP complete (official bank shows 5 units): Units 4 (RNN/LSTM/GRU) and 5 (MT, seq2seq, attention, transformers) written from standard content because Moodle has no NLP decks beyond 3 PDFs (tagged 'Beyond the deck'); 19 diagrams, 118 flashcards, cheat sheet with TF-IDF and bigram calculators.
- [ ] CN: syllabus has 5 units. Unit 4 (network layer) and Unit 5 (link layer) and extra-topics.html written by subagents; still to do: diagrams, wiring, flashcards, cheatsheet.
- [x] CC: syllabus has 5 units (all on site). Unit 4 rewritten from the real Module 4 deck. 12 step-through diagrams, per-unit question banks (76 Qs), flashcards, cheat sheet (autoscaling, Jain index, weighted round robin calculators), homepage progress. No past papers on Moodle, so the likely-questions table is ranked from the syllabus and says so. Verified at 1440 and 375.
- Per-subject checklist: wire pages (scratchpad wire.js) -> figures (figlib.js step-through) -> flashcards.html -> cheatsheet.html -> add subject to READY in ese.js
  and to ESE_MANIFEST on index.html -> verify 1440 + 375, light + dark -> commit + push.
- NOTE: */source-materials (about 62 MB of raw Moodle decks) is already tracked in git history from earlier commits. .gitignore now blocks new additions;
  removing them from the repo (git rm --cached, or a history purge) needs Harsh's decision.

## PYQ answers phase (Nov 2026)
Real Sem 5 papers were pulled into the local, gitignored pyq/ folder and audited (see pyq/AUDIT.md, local only). Each subject gets a solved PYQ page, sorted by how often a topic is asked.
- [x] CC: CC/pyq.html (31 model answers incl. AWS services, load balancing and auto-scaling scenario, AWS dev/deploy tools). Flashcards include it.
- [x] NLP: NLP/pyq.html (74 answers, 13 topic groups). DL: DL/pyq.html (53 answers). CN: CN/pyq.html (77 answers). All in flashcards, nav and homepage.
- [ ] Next: gap-fill checks on question banks, one timed paper per subject.
Never commit the papers or OCR text; only written model answers go on the site.
