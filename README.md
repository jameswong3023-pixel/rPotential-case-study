# UoP Library — Case Study

Thanks for taking this on. Everything you need to get started is below.

## Context

This is a prototype of our UoP Library. It was built quickly and currently works in some places and breaks in others.

The product is a library of Units of Potential (UoPs): AI-generated opportunities for a company to redeploy human capacity or apply AI.

For this case study, the library belongs to Meridian Industrial Group, a fictional Fortune 200 industrial company.

Our pipeline generates UoPs at different levels, from enterprise-wide opportunities down to individual roles. Executives use the library to review the portfolio, identify the opportunities worth pursuing, and keep track of what they have reviewed.

Each UoP includes:

- An estimated value range
- A readiness score
- A workforce impact breakdown showing the percentage of work expected to remain unchanged, be augmented, transformed, or redeployed

The data comes from an AI generation pipeline, so it is intentionally imperfect. You will find inconsistent labels, missing values, and some data that may not make sense as currently represented.

## Stack

- **Backend:** FastAPI + SQLModel + SQLite, running on `:8000`
- **Frontend:** Vite + React + TypeScript + Tailwind + minimal shadcn primitives, running on `:5173`

## Running locally

You will need:

- Python 3.11+ and [uv](https://docs.astral.sh/uv/) for the backend
- Node 20+ and npm for the frontend

```bash
# Terminal 1 — backend
cd backend
uv sync
uv run uvicorn app.main:app --reload
```

```bash
# Terminal 2 — frontend
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`. You should see the UoPs rendered as cards.

The backend seeds the SQLite database on first run from `backend/seed_uops.json`. If you edit the seed file, delete `backend/uop_library.db` before restarting to re-seed the database.

## The product problem

The most common feedback from users is:

> "I open the library and there are a couple dozen cards. I know two or three of these are worth bringing to my board meeting, but I can't figure out which ones. The filters don't really help."

The current experience does not do a good job of helping an executive move from a large set of opportunities to the few that deserve attention.

There are also bugs in both the frontend and backend, and the underlying data is messier than the UI currently accounts for.

## Your task

### 1. Get the app running

Run the application locally and understand how it works today. If you encounter setup issues, document them in the Notes section at the bottom of this README.

### 2. Fix the important bugs

Find and fix the issues that materially interfere with the user's ability to use the product. There are bugs in both the frontend and backend. We are intentionally not providing a list.

You do not need to fix everything. In your notes, briefly document:

- What you found
- What you fixed
- Anything you chose not to fix and why

### 3. Improve the product experience

Design and build an experience that helps an executive go from a few dozen UoPs to the two or three they would bring to a board meeting.

How you solve that is up to you. It could involve filtering, ranking, triage, comparison, or a different approach.

There is also no UoP detail view today. Whether one is needed, and what it should contain, is part of the problem you can solve.

You are free to change the frontend, backend, schema, or API contract if that leads to a better solution.

We care more about a small number of well-considered, finished decisions than a large number of partially implemented ideas.

### 4. Improve the visual design

The current UI is intentionally basic. Bring it closer to our visual direction: editorial, information-dense, and polished. Think more *Bloomberg* or *Stripe Press* than *generic SaaS*.

The references below are there for inspiration, not replication.

## Before you build

Before your first feature commit, add a short `PROPOSAL.md`. It should explain:

- What you plan to build
- The primary user flow
- One or two approaches you considered but decided not to pursue

A few paragraphs is enough. A sketch or rough wireframe is welcome but not required.

We will review the commit history, so please commit the proposal before beginning the feature work.

## Required deliverables

Please submit:

- Working code that runs end-to-end
- `PROPOSAL.md`, committed before the feature work
- A completed `DESIGN.md` (roughly half a page)
- A Notes section at the bottom of this README

In your Notes, include:

- Bugs you found, including what you fixed and what you left
- Where you chose to stop and one thing you deliberately did not build
- Roughly how you spent your time
- How you used AI coding tools
- One example where you rejected, changed, or overrode something an AI coding tool suggested, and why. If this did not happen, just say so.

## Time budget

Please spend approximately 3–4 hours on the case study. You have 48 hours to return it.

Use whatever AI coding tools you would normally use. We are interested in seeing your normal working process, not an artificially constrained one.

## Submission

Push your final changes to `main` in this repository. When you are finished, message us to let us know.

We will primarily review the commit history, your product and design decisions, and the final state of the application.

## Reference aesthetics

Optional references for visual direction:

- Linear's project views
- Stripe's documentation
- Vercel's templates page

Use them for general sensibility rather than copying specific components.

---

## Notes from the candidate

### Setup issues encountered

- `uv sync` crashed on my machine with `EXCEPTION_ILLEGAL_INSTRUCTION` (a CPU
  compatibility issue in the uv binary, not this repo). Workaround: a plain
  venv — `python -m venv .venv`, then
  `.venv/Scripts/python -m pip install "fastapi>=0.110.0" "sqlmodel>=0.0.16" "uvicorn[standard]>=0.27.0"`,
  then `.venv/Scripts/python -m uvicorn app.main:app --reload`.
- On Windows, Vite bound only to the IPv6 loopback and connections were
  refused; `npm run dev -- --host 127.0.0.1` fixes it.
- The schema changed (new columns), so if you have a `backend/uop_library.db`
  from an earlier run, delete it and restart the backend to re-seed.

### Bugs found

Fixed:

- **Backend — combining filters silently dropped one.** The `scope` filter in
  `routes.py` rebuilt the query from scratch, discarding the `section` filter.
- **Backend — department filtering was exact-match against messy labels**, so
  "Information Technology" never matched the `IT` filter and "supply chain
  ops" never matched "Supply Chain". Labels are now normalized at seed time
  (raw label kept) and filtering uses the normalized column.
- **Frontend — every card linked to `/uops/:id`, which had no route.**
  Clicking any card gave a blank page. There is now a detail view.
- **Frontend — the Priorities filter was a decoy**: it collected state that
  was never used anywhere. Removed rather than retrofitted with meaning.
- **Frontend — the scope dropdown was hardcoded** and didn't match the data
  (no "Quality", no way to reach the lowercase variants). It is now driven by
  `GET /departments`.
- **Frontend — ranking coerced nulls to zero**, so unassessed UoPs silently
  sank to the bottom as if they were worthless. They are now grouped and
  labeled "Not scored". Value ranking also regex-parsed "$18–26M" strings in
  the browser; the parsing now happens once, server-side, into numeric fields.
- **Frontend — null rendering**: "Readiness: " with nothing after it,
  dangling "·" separators, empty value slots. Explicit empty states now.
- **Review endpoint was one-way** — you could mark reviewed but never undo it.
  It now toggles.

Found and deliberately not fixed:

- **One record's workforce impact sums to 115%** (`uop_b502`). That is a
  pipeline error, and the UI flags it as a data caveat instead of silently
  renormalizing — executives should not be taught to trust numbers the
  pipeline got wrong.
- **`generated_at` is stored timezone-naive** in SQLite. Fixing it means a
  migration for no user-visible gain in this prototype.
- **Review/shortlist state is global**, not per-user. Correct scope for a
  single-executive prototype; first thing to revisit for real usage.

### Where I stopped

I stopped after the editorial design pass. The one thing I deliberately did
not build: an export/print view of the board shortlist (a one-page memo of
the final two or three picks). It is the natural next step, but it is a
feature on top of a working flow rather than part of the core triage problem,
and the time budget was better spent finishing the table, shortlist, and
detail views properly.

### Roughly how the time was spent

<!-- PERSONALIZE: adjust to your actual hours -->
- ~30 min: reading the code, running it, finding bugs before touching anything
- ~45 min: backend fixes and the seed-time data layer
- ~1.5 h: triage table, shortlist + compare, detail view
- ~45 min: visual design pass
- ~30 min: proposal, design notes, this section

### How I used AI tools

I used Cursor's agent for most of the implementation, working in planned
checkpoints: I had it read the codebase and inventory the bugs first, agreed
on a written plan (proposal → bug fixes → feature → design pass), and
reviewed the diff at each checkpoint before committing myself.

One example of overriding it: the agent recommended making git commits itself
as it went. I rejected that and kept commits manual at each checkpoint —
since the commit history is part of what is being reviewed, I wanted to
verify each diff before it became history rather than approve it
retroactively.
