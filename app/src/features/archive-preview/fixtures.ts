// Fixtures for the STUDENT ARCHIVING live preview. This is a design prototype only:
// pure in-memory sample data, no Supabase, no mutations, no financial effect. It
// exists to show the Owner exactly how the archiving lifecycle would look and behave
// inside the real app before any code or migration is approved.

export type PreviewCourseStatus = 'active' | 'ended'

export type PreviewCourse = {
  name: string
  status: PreviewCourseStatus
  endDate: string | null
  fee: number
  paid: number
}

export type PreviewVoucher = {
  ref: string
  date: string
  course: string
  amount: number
  payer: string
}

export type PreviewStatementLine = {
  date: string
  ref: string
  course: string
  received: number
  running: number
}

export type PreviewStudent = {
  id: string
  name: string
  phone: string | null
  idNumber: string | null
  // Administrative archive markers (the ONLY new state; nullable → old rows untouched).
  archivedAt: string | null
  archivedReason: string | null
  archivedBy: string | null
  // Derived operational signals (not stored — shown for the eligibility rules).
  completedAt: string | null
  courses: PreviewCourse[]
  paid: number
  remaining: number
  vouchers: PreviewVoucher[]
  statement: PreviewStatementLine[]
}

// Every course of the student has ended → archiving is a clean administrative close.
const ahmad: PreviewStudent = {
  id: 'p-ahmad',
  name: 'أحمد محمود',
  phone: '0590000001',
  idNumber: '900111222',
  archivedAt: null,
  archivedReason: null,
  archivedBy: null,
  completedAt: '2026-08-20',
  courses: [
    { name: 'دورة Excel', status: 'ended', endDate: '2026-06-30', fee: 500, paid: 500 },
    { name: 'دورة إدارة', status: 'ended', endDate: '2026-08-20', fee: 400, paid: 400 },
  ],
  paid: 900,
  remaining: 0,
  vouchers: [
    { ref: 'R-1012', date: '2026-05-02', course: 'دورة Excel', amount: 500, payer: 'أحمد محمود' },
    { ref: 'R-1044', date: '2026-07-11', course: 'دورة إدارة', amount: 400, payer: 'أحمد محمود' },
  ],
  statement: [
    { date: '2026-05-02', ref: 'R-1012', course: 'دورة Excel', received: 500, running: 0 },
    { date: '2026-07-11', ref: 'R-1044', course: 'دورة إدارة', received: 400, running: 0 },
  ],
}

// Courses ended but a residual balance remains → the "archive with balance?" decision.
const salma: PreviewStudent = {
  id: 'p-salma',
  name: 'سلمى خالد',
  phone: '0590000002',
  idNumber: '900333444',
  archivedAt: null,
  archivedReason: null,
  archivedBy: null,
  completedAt: '2026-07-15',
  courses: [{ name: 'دورة تصميم', status: 'ended', endDate: '2026-07-15', fee: 600, paid: 450 }],
  paid: 450,
  remaining: 150,
  vouchers: [
    { ref: 'R-1020', date: '2026-05-10', course: 'دورة تصميم', amount: 250, payer: 'سلمى خالد' },
    { ref: 'R-1039', date: '2026-06-20', course: 'دورة تصميم', amount: 200, payer: 'والد سلمى' },
  ],
  statement: [
    { date: '2026-05-10', ref: 'R-1020', course: 'دورة تصميم', received: 250, running: 350 },
    { date: '2026-06-20', ref: 'R-1039', course: 'دورة تصميم', received: 200, running: 150 },
  ],
}

// A course is still active → archiving must be blocked.
const yousef: PreviewStudent = {
  id: 'p-yousef',
  name: 'يوسف نبيل',
  phone: '0590000003',
  idNumber: null,
  archivedAt: null,
  archivedReason: null,
  archivedBy: null,
  completedAt: null,
  courses: [
    { name: 'دورة محاسبة', status: 'ended', endDate: '2026-06-01', fee: 500, paid: 500 },
    { name: 'دورة متقدمة', status: 'active', endDate: null, fee: 700, paid: 300 },
  ],
  paid: 800,
  remaining: 400,
  vouchers: [
    { ref: 'R-1001', date: '2026-04-01', course: 'دورة محاسبة', amount: 500, payer: 'يوسف نبيل' },
    { ref: 'R-1055', date: '2026-08-01', course: 'دورة متقدمة', amount: 300, payer: 'يوسف نبيل' },
  ],
  statement: [
    { date: '2026-04-01', ref: 'R-1001', course: 'دورة محاسبة', received: 500, running: 0 },
    { date: '2026-08-01', ref: 'R-1055', course: 'دورة متقدمة', received: 300, running: 400 },
  ],
}

// Already archived, fully settled — the canonical archived record.
const layla: PreviewStudent = {
  id: 'p-layla',
  name: 'ليلى عمر',
  phone: '0590000004',
  idNumber: '900555666',
  archivedAt: '2026-08-25',
  archivedReason: 'أنهت جميع دوراتها',
  archivedBy: 'ardkanaan2026@gmail.com',
  completedAt: '2026-08-10',
  courses: [{ name: 'دورة لغة', status: 'ended', endDate: '2026-08-10', fee: 800, paid: 800 }],
  paid: 800,
  remaining: 0,
  vouchers: [{ ref: 'R-0990', date: '2026-03-15', course: 'دورة لغة', amount: 800, payer: 'ليلى عمر' }],
  statement: [{ date: '2026-03-15', ref: 'R-0990', course: 'دورة لغة', received: 800, running: 0 }],
}

// Already archived, still owes — proves an archived debt stays visible & knowable.
const kareem: PreviewStudent = {
  id: 'p-kareem',
  name: 'كريم سامي',
  phone: null,
  idNumber: '900777888',
  archivedAt: '2026-07-30',
  archivedReason: 'انتهت الدورة مع بقاء رصيد',
  archivedBy: 'ardkanaan2026@gmail.com',
  completedAt: '2026-07-01',
  courses: [{ name: 'دورة برمجة', status: 'ended', endDate: '2026-07-01', fee: 900, paid: 700 }],
  paid: 700,
  remaining: 200,
  vouchers: [
    { ref: 'R-0975', date: '2026-02-10', course: 'دورة برمجة', amount: 400, payer: 'كريم سامي' },
    { ref: 'R-0988', date: '2026-04-18', course: 'دورة برمجة', amount: 300, payer: 'كريم سامي' },
  ],
  statement: [
    { date: '2026-02-10', ref: 'R-0975', course: 'دورة برمجة', received: 400, running: 500 },
    { date: '2026-04-18', ref: 'R-0988', course: 'دورة برمجة', received: 300, running: 200 },
  ],
}

export const PREVIEW_STUDENTS: PreviewStudent[] = [ahmad, salma, yousef, layla, kareem]

export function activeStudents(): PreviewStudent[] {
  return PREVIEW_STUDENTS.filter((s) => s.archivedAt === null)
}

export function archivedStudents(): PreviewStudent[] {
  return PREVIEW_STUDENTS.filter((s) => s.archivedAt !== null)
}

export function hasActiveCourse(student: PreviewStudent): boolean {
  return student.courses.some((c) => c.status === 'active')
}
