# 06 — Pagination, Server-Side Search, and On-Demand Loading: where each actually applies

**Read-only.** The task requires *not* naming "pagination" as a reflex. This report assigns
each of the three mechanisms — **pagination**, **server-side search**, **on-demand (lazy)
loading** — only to the specific paths where the data-flow map (`01`) proves the browser holds
more than the screen needs, and states where **none** applies. Tier: **[static]**.

## Decision rule used

For each path: *what does this screen render at one time?* If it is (a) a bounded list of many
rows → **pagination**; (b) a lookup over a large set → **server-side search**; (c) the detail of
one selected entity → **on-demand load on selection**; (d) a true whole-set summary or a backup
→ **server aggregate** or **keep full** (see `11`). "Pagination" is never the answer for (c) or
(d).

## Assignment

| Path | Screen renders | Mechanism | Why (not a reflex) |
|---|---|---|---|
| **Activity / audit log** (`activity-workspace`) | a scrollable log | **Pagination + server-side search** | A log is inherently ordered and paged; it is the fastest-growing table and is fully loaded + JS-filtered today (`02` #8). `changed_at desc` + `range` + a server `ilike`/filter on source/text is the natural shape. **First and cheapest win after `05`.** |
| **Student statement** (`students-workspace` selected student) | one student | **On-demand load** | Proven zero-result-change in `05`; load `.eq('student_id', …)` on selection. **Not** pagination — it's a single-entity detail. |
| **Course detail** (`course-detail-workspace`) | one course's roster | **On-demand load** | Same shape as the statement: fetch the selected course's enrolments/lines on open. |
| **Students directory** (`student-directory`, `students` list) | a roster with a balance each | **Server-side search + pagination of the list**, with the **balance column as a server per-student aggregate** | The list needs a page, not the center; search must not require the whole roster in memory. The balance column is the one financial figure here → server aggregate behind a **parity test** (`04`,`F3`). |
| **Financial report movement list** (`financial-report`) | movements in a date range | **Server date-range filter + pagination**, totals as **server aggregate** | The report already *scopes by date in JS* (`scoped`, `financial-report-workspace:64,70`); the same predicate belongs in the query (`.gte/.lte voucher_date`), and the sums become a server SUM (parity-tested, `04`,`F1/F2`). |
| **Courses list** (`courses-workspace`) | all courses | **Keep full (small)** — optional server search later | Slow-growing, small (`02` #5). Pagination would be premature (`YAGNI`). |
| **Backup export** | the whole center | **Keep full — must** | Correctness requires every row (`08`,`11`). Never paginate/scope. |
| **Home KPIs** (`glance`) | center totals + short lists | **Server aggregate** for totals; the "recent" list is already `slice(0,8)` → **limit at source** | The KPI is a true whole-set number → aggregate, not a full row load. |

## Where server-side *search* specifically applies

Student search (name/phone/id — currently `student-directory-workspace:53–60` client `.filter`),
activity search (`activity-workspace:106–126`), and account/party search in the report
(`financial-report-workspace:67`). Each is a text/φield lookup that today forces the whole table
into memory; each becomes a parameterized server query. Course search is optional (small set).

## Where on-demand loading specifically applies

Single-entity details: **student statement** (`05`), **course detail**, and the **report's
print-one-student** path (`financial-report-workspace:61–62`) — all of which today derive one
entity from a fully-loaded array and could fetch that entity on demand.

## What this report deliberately does NOT recommend

- No pagination on `courses`, `cancelled_vouchers` today (small/slow — premature).
- No "paginate everything" — center totals and backup are explicitly exempted.
- No sequencing here (that is `12`) and no formula move without the `04` parity gate.

**Read-only: nothing was paginated, searched, or lazy-loaded. This maps the mechanisms to the
paths that the evidence supports.**
