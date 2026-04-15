# Skill Registry — BroadsecTests

Generated: 2026-04-15

## User Skills

| Skill | Trigger Context |
|-------|----------------|
| `branch-pr` | Creating a pull request, opening a PR, preparing changes for review |
| `go-testing` | Writing Go tests, using teatest, adding test coverage |
| `issue-creation` | Creating a GitHub issue, reporting a bug, requesting a feature |
| `judgment-day` | "judgment day", "adversarial review", "dual review", "que lo juzguen" |
| `skill-creator` | Creating a new skill, adding agent instructions, documenting patterns |
| `sdd-explore` | Investigating a feature or idea before committing to a change |
| `sdd-propose` | Writing a change proposal |
| `sdd-spec` | Writing specifications with scenarios |
| `sdd-design` | Writing technical design documents |
| `sdd-tasks` | Breaking down a change into implementation tasks |
| `sdd-apply` | Implementing tasks from a change |
| `sdd-verify` | Validating implementation against specs |
| `sdd-archive` | Archiving a completed change |

## Project Conventions

| File | Purpose |
|------|---------|
| `apps/dashboard/CLAUDE.md` | Points to AGENTS.md |
| `apps/dashboard/AGENTS.md` | Next.js 16 breaking changes warning — read docs before writing code |

## Compact Rules

### Next.js 16 (AGENTS.md)
- This is NOT standard Next.js — has breaking changes from training data
- MUST read `node_modules/next/dist/docs/` before writing any Next.js code
- Heed deprecation notices

### Dashboard Stack
- App Router pattern — no Pages Router
- Tailwind CSS v4 syntax (different from v3)
- LibSQL client for SQLite (not better-sqlite3 directly)
- Newman runs server-side only (listed in serverExternalPackages)
