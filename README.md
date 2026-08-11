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

<!-- Fill this in before you submit:
     1. Bugs found: fixed / left, and why.
     2. Where you stopped, and one thing you deliberately did not build.
     3. Roughly how the time was spent.
     4. How you used AI tools, including one example where you rejected,
        changed, or overrode a suggestion — or say that it didn't happen. -->
