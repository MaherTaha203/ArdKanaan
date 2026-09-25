
// ---- Isolated micro-benchmark of the ACTUAL client aggregation (agg.ts above) ----
// Synthetic data only. Measures the browser-side cost the app pays on every load,
// since useWorkspaceStore loads all rows then calls aggregateStudents/studentLedger.

function buildDataset(students: number, coursesPer: number, installmentsPer: number) {
  const S: any[] = [], E: any[] = [], L: any[] = [], F: any[] = []
  let vno = 0
  for (let s = 0; s < students; s++) {
    const sid = 'st-' + s
    S.push({ id: sid, name: 'Student ' + s, status: 'active' })
    for (let c = 0; c < coursesPer; c++) {
      const eid = sid + '-e' + c
      const cid = 'course-' + (c % 40) // 40 distinct courses reused
      const cname = 'Course ' + (c % 40)
      const cvalue = 400
      E.push({ id: eid, studentId: sid, courseId: cid, courseName: cname, courseValue: cvalue, createdAt: '2020-01-01T00:00:00Z' })
      for (let k = 0; k < installmentsPer; k++) {
        vno++
        L.push({
          id: 'l-' + vno, studentId: sid, voucherNumber: vno,
          voucherDate: '2020-0' + (1 + (k % 9)) + '-15', courseName: cname, courseValue: cvalue,
          amountReceived: 100, remainingBalance: Math.max(0, cvalue - (k + 1) * 100),
          entryType: 'course', enrollmentId: eid, feeObligationId: null,
        })
      }
    }
    // one fee obligation + one fee payment line per 4th student
    if (s % 4 === 0) {
      const fid = sid + '-f0'
      F.push({ id: fid, studentId: sid, courseId: 'course-1', enrollmentId: sid + '-e0', courseName: 'Course 1', description: 'Exam fee', amount: 50, externalShare: 0, feeCategory: 'institute', cancelledAt: null, createdAt: '2020-02-01T00:00:00Z' })
      vno++
      L.push({ id: 'l-' + vno, studentId: sid, voucherNumber: vno, voucherDate: '2020-03-01', courseName: 'Course 1', courseValue: 50, amountReceived: 50, remainingBalance: 0, entryType: 'fee', enrollmentId: null, feeObligationId: fid })
    }
  }
  return { S, E, L, F }
}

function bench(label: string, fn: () => void, runs = 5) {
  fn() // warm
  const t: number[] = []
  for (let i = 0; i < runs; i++) { const a = performance.now(); fn(); t.push(performance.now() - a) }
  t.sort((x, y) => x - y)
  const avg = t.reduce((s, v) => s + v, 0) / t.length
  return { label, avg: +avg.toFixed(1), min: +t[0].toFixed(1), max: +t[t.length - 1].toFixed(1) }
}

const sizes = [
  { students: 84, c: 3, i: 4 },     // ~1k lines
  { students: 420, c: 3, i: 4 },    // ~5k
  { students: 1700, c: 3, i: 4 },   // ~20k
  { students: 4200, c: 3, i: 4 },   // ~50k
  { students: 8400, c: 3, i: 4 },   // ~100k
  { students: 16700, c: 3, i: 4 },  // ~200k
]

console.log('N_lines\tstudents\tenroll\tfees\taggregateStudents(ms avg/min/max)\tstudentLedger-1(ms)\theapMB')
for (const sz of sizes) {
  const { S, E, L, F } = buildDataset(sz.students, sz.c, sz.i)
  const r1 = bench('agg', () => { (globalThis as any).__x = aggregateStudents(S, L, E, F) })
  // studentLedger for one student (their ~13 lines) — the per-open-statement cost
  const one = S[0].id
  const r2 = bench('ledger', () => { (globalThis as any).__y = studentLedger(one, L, E, F) }, 5)
  const heapMB = Math.round(process.memoryUsage().heapUsed / 1048576)
  console.log(`${L.length}\t${S.length}\t${E.length}\t${F.length}\t${r1.avg}/${r1.min}/${r1.max}\t${r2.avg}\t${heapMB}`)
}
console.log('done')
