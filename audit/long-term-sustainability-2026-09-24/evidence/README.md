# Client aggregation benchmark — how to reproduce

Isolated, synthetic data only (no project or DB touched). Node 22 --experimental-strip-types.
Copy app/src/lib/aggregate.ts, remove its 'import type' line, concatenate with
aggregate-benchmark-harness.ts, run with: node --experimental-strip-types run.ts

Result recorded in aggregate-benchmark.txt. Server-class CPU; a modest browser/tablet is 3-8x slower.
