# Design Notes

## What I built and why (top → bottom, what does the user see first)

A masthead that says where you are (one company's portfolio, how many opportunities, how many shortlisted), then a filter toolbar, then a single ranked table — every UoP is one row, and the default sort is a board-relevance score whose formula is printed right above the table (60% value midpoint, 40% readiness). The first thing an executive sees is therefore the answer to their actual question: "which of these matter?" Rows drill into a detail view for the narrative (back description, metrics, sources); starring a row builds a max-three board shortlist that persists server-side, sits in a tray at the bottom, and opens a side-by-side compare view. The shortlist is the deliverable — the thing you walk into the board meeting with.

## How I handled the messy data (departments, nulls, variants)

At the seed layer, not in React. Department variants ("Information Technology", "supply chain ops", "AP / Finance") are normalized into a `department_norm` column via an alias map — the raw label is kept, and the filter dropdown is driven by the real distinct values from the API. Value bands are parsed once into numeric low/high fields so ranking never regex-parses "$18–26M" in the browser. Nulls are never coerced: items missing value or readiness go into a labeled "Not scored — strategic or awaiting assessment" group instead of silently sinking to rank zero, because the governance items down there are legitimately board-worthy. The record whose workforce impact sums to 115% gets a `data_flags` caveat shown in the UI rather than a silent renormalization — this data comes from a generation pipeline, and hiding its errors would teach executives to trust numbers they shouldn't.

## What I cut to keep density high

The card grid, and with it most of the prose: descriptions live only in the detail view now. Each table row carries name, owner, department, level, archetype, value, readiness, a 20px-wide workforce-impact bar, and the score — roughly the density of one former card in a single line. I also cut the per-section grouping (five stacked sections fought the ranking; "level" became a filterable column) and the decoy Priorities filter rather than trying to make it mean something.

## What interaction I'd add next if I had more time

An export of the compare view — a print-ready, one-page board memo of the shortlisted two or three, since the current end state still requires the executive to transcribe their picks into a deck. Second choice: a "why this rank?" popover that decomposes the relevance score per row.

## What I noticed in the codebase that I deliberately did NOT touch

The unused shadcn `card.tsx` primitive (kept — it's harmless library code someone may want), the `uop_num` field (it duplicates ordering information already in the ids and I didn't want two sources of truth to migrate), the naive-datetime storage in SQLite (SQLModel stores `generated_at` without timezone; fixing it means a migration for no user-visible gain here), and the single-user review/shortlist model — state is global, not per-executive, which is the correct scope for a prototype but the first thing to revisit for real usage.
