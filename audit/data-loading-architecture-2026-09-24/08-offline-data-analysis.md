# 08 — Offline Data Analysis: is any of this loaded to work offline? (No.)

**Read-only.** A common justification for loading everything is "so the app works offline / is
snappy without the network." This report checks that hypothesis against the code **first-hand**
and rejects it: **there is no offline layer.** The full load is therefore serving eager caching
and client aggregation — not offline. Tier: **[static]** (grep + file reads at `cbf7dbb`).

## What was searched (first-hand)

Searched the app source for every offline/persistence mechanism:
- **IndexedDB** — none (`idb`, `indexedDB`, `openDB`: no application usage).
- **Service worker / PWA** — none (no `serviceWorker.register`, no `workbox`, no
  `vite-plugin-pwa`, no `manifest` wiring for offline).
- **Cache Storage API** — none.
- **State persistence middleware** — no `zustand/middleware persist` on the workspace store;
  `use-workspace-store` holds data **in memory only** and re-fetches on every app mount
  (`if (!loaded) load()`).
- **localStorage / sessionStorage** — used only for **(a)** the Supabase **auth session**
  (`persistSession`, standard) and **(b)** local **app settings/preferences**. **No financial
  rows** (students, statement lines, movements, fees, audit log) are written to any browser
  store.

## Conclusion

**No student, financial, enrolment, fee, or audit data is persisted in the browser for offline
use.** When the tab closes or reloads, the entire in-memory cache is gone and is re-fetched from
Supabase. The full load exists to **(1)** let every page read from one in-memory cache and
**(2)** let `aggregate.ts` compute over complete arrays — i.e. eager caching + client
aggregation (`01`, `03`), **not** offline capability.

## Direct consequence for the task's questions

- **"Which offline data must stay local?"** → **None today.** There is no offline design to
  preserve. Any future decision to support offline would be a *new* capability with its own
  design (and its own financial-integrity questions about stale/queued writes) — it is **not**
  what the current full load is doing, and it cannot be used to justify keeping the full load.
- The one thing that *does* legitimately need "all rows" is the **backup export** — and that is
  an **online, on-demand** operation (it reads everything at the moment of export), not an
  offline cache. Keeping the backup reading all rows is correct (`11`) and is unrelated to
  offline.

## If offline is ever wanted (out of scope — not recommended here)

It would require: a deliberate local store (IndexedDB) with an explicit sync/conflict model, a
service worker, and — critically — a financial-safety design for writes made while offline
(idempotency keys already exist server-side, but a queued-write UX and reconciliation would be
new). That is a **separate project**, gated on Owner decision, and **must not** be conflated
with the present performance/architecture question. This audit neither designs nor recommends
it.

**Nothing was changed. This report closes the "it's for offline" hypothesis with first-hand
evidence that no offline layer exists.**
