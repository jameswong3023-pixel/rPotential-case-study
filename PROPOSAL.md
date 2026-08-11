# Proposal

## The problem

An executive opens the library and sees a couple dozen cards. Two or three of them belong in a board meeting, but nothing in the current UI helps them figure out which. The cards are visually equal, ranking is opaque and broken for unassessed items, the filters either do nothing (Priorities) or silently fail against the messy department data, and clicking a card leads nowhere.

## What I plan to build

**A ranked triage table with an explicit board shortlist.**

1. **A dense, ranked table** replaces the card grid. Every UoP is one row: name and owner, department, level, archetype, value band, readiness, and workforce impact — comparable at a glance, sortable by any column. The default sort is a transparent "board relevance" ranking derived from value and readiness, with items the pipeline hasn't fully assessed grouped separately and labeled as such, instead of being silently coerced to zero and sunk to the bottom.
2. **A detail view** (currently the cards link to a blank page) with the full narrative: back description, metrics, sources, workforce impact breakdown, and any data-quality caveats — plus mark-as-reviewed and shortlist actions.
3. **A board shortlist**: the executive stars up to three UoPs; a persistent tray keeps the picks visible, and a compare view lays them side by side. The shortlist is the deliverable the user walks into the board meeting with — the product's job is to make assembling it fast and defensible.

Underneath, the data problems get fixed at the right layer: department labels are normalized at seed time (keeping the raw label), value bands are parsed into numeric low/high fields so ranking uses real numbers, and inconsistent records (e.g. a workforce impact that sums to 115%) are flagged rather than silently corrected.

## Primary user flow

1. Open the library. UoPs are ranked by board relevance; the reasoning behind the rank is stated in the UI.
2. Narrow if needed with filters that actually work (department, level, archetype, hide reviewed).
3. Open the top handful of detail views; mark each reviewed as you go.
4. Star the ones that hold up — up to three.
5. Open the compare view to sanity-check the shortlist side by side. Done: those are the board picks, and they persist.

## Approaches considered but not pursued

- **A guided one-at-a-time review wizard** (step through all 22, keep/dismiss, end with a shortlist). Good for forcing rigor, but it fights how executives actually work — they want to scan, jump, and compare, not be railroaded through a deck. It also does nothing for the second visit, when 19 items are already reviewed.
- **Keeping the card grid and adding a composite score badge plus more filters.** Lower effort, but cards waste most of their pixels on prose and make cross-item comparison nearly impossible — the core failure of the current UI. A table is the information-dense, editorial answer; the cards' narrative content moves to the detail view where it belongs.
