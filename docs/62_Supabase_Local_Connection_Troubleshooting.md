# 62 — Supabase Local Connection Troubleshooting

**Last updated**: 2026-04-28  
**Owner**: Seungjae  
**Purpose**: Diagnose and resolve "remaining connection slots are reserved for roles with the SUPERUSER attribute" errors in local development.

---

## What causes connection exhaustion in local dev?

| Source | Connection count | Notes |
|--------|-----------------|-------|
| `pnpm web:dev` (Next.js) | Up to 3 per process | `max: 3` set in `packages/db/src/client.ts` |
| Supabase Table Editor / Dashboard | 1–3 | Always open when Supabase Studio is running |
| `pnpm test` with real DB | 0 | All tests use in-memory fakes — no real DB connections |
| Supabase internal services | ~3–5 | PostgREST, Auth, Realtime |
| Previous HMR cycles (leak) | 0 (fixed) | `globalThis` singleton now survives hot reload |

Supabase local projects default to **97 user connections** (3 reserved for superuser).  
The main culprits were:
1. **HMR leaks** — every Next.js hot reload re-executed `packages/db/src/client.ts`, creating a new `postgres` pool (default 10 connections) while the old pool remained open indefinitely.
2. **No idle timeout** — idle connections were never released, so slots stayed claimed even when the dev server was idle.

Both are fixed in `packages/db/src/client.ts` as of 2026-04-28.

---

## Recommended local dev procedure

### Normal workflow

```bash
# 1. Start the dev server
pnpm web:dev

# 2. Open http://localhost:3000 — normal development
```

### When you need to use Supabase Table Editor

The dev server holds 1–3 live connections while it's running. Table Editor needs connections too.

```bash
# 1. Stop the dev server first (Ctrl+C in the pnpm web:dev terminal)
# 2. Open Supabase Table Editor — it now has full access to connection slots
# 3. When done, restart the dev server
pnpm web:dev
```

### Avoid running these simultaneously

| Combination | Risk |
|-------------|------|
| `pnpm web:dev` + Supabase Table Editor (intensive use) | Low — connections freed by idle_timeout=20s |
| `pnpm web:dev` + `pnpm test` | Safe — tests use no real DB |
| Multiple `pnpm web:dev` instances | High — each instance opens its own pool |

---

## If connections are exhausted (FATAL: 53300)

### Step 1 — Stop the dev server

```bash
# Kill the Next.js dev process
# (Ctrl+C in the terminal where pnpm web:dev is running)
```

Wait ~20 seconds for `idle_timeout` to release idle connections automatically.

### Step 2 — Check active connections

Run in Supabase SQL editor or psql:

```sql
SELECT count(*), state, application_name
FROM pg_stat_activity
WHERE datname = current_database()
GROUP BY state, application_name
ORDER BY count DESC;
```

### Step 3 — Terminate stuck connections (if idle_timeout didn't clear them)

```sql
SELECT pg_terminate_backend(pid)
FROM pg_stat_activity
WHERE datname = current_database()
  AND pid <> pg_backend_pid()
  AND state = 'idle';
```

### Step 4 — If connections still stuck after termination

Restart the local Supabase project:

```bash
supabase stop
supabase start
```

This forcibly closes all connections and resets the pool.

---

## Connection configuration reference

File: `packages/db/src/client.ts`

| Option | Value | Reason |
|--------|-------|--------|
| `max` | `3` | Limits each Next.js process to 3 connections; headroom for dashboard and other tools |
| `idle_timeout` | `20` (seconds) | Releases connections when dev server is idle |
| `max_lifetime` | `1800` (seconds) | Recycles connections after 30 min to avoid stale state post-Supabase restart |

The `globalThis.__dartDb` singleton pattern ensures the pool is created once per Node.js process and survives Next.js HMR without leaking the old pool.

---

## Tests and DB connections

All `apps/web` and `packages/core` tests use **in-memory fake repositories**.  
No test file opens a real database connection.  
Running `pnpm test` or `pnpm --dir apps/web test` does **not** consume any Supabase connection slots.
