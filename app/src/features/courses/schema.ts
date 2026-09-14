import { z } from 'zod'

// Generous whole-shekel ceiling — a fat-finger guard, not a business rule. The DB
// checks remain authoritative.
const MAX_SHEKEL_AMOUNT = 1_000_000

// Course catalog form. base_fee is only the DEFAULT proposed at registration and is
// optional (a course may have no standard fee); dates and notes are optional too.
export const courseFormSchema = z.object({
  name: z.string().trim().min(1, 'اسم الدورة مطلوب'),
  // Optional whole-shekel default fee, kept as a string so the input stays simple
  // and RHF typing clean; '' means "no standard fee". Parsed to number|null on save.
  baseFee: z
    .string()
    .trim()
    .refine(
      (value) => value === '' || (/^\d+$/.test(value) && Number(value) <= MAX_SHEKEL_AMOUNT),
      'الرسوم يجب أن تكون عددًا صحيحًا من الشواكل ضمن الحدّ المسموح',
    ),
  startDate: z.string().trim(),
  endDate: z.string().trim(),
  status: z.enum(['active', 'ended']),
  notes: z.string().trim(),
})

export type CourseFormValues = z.infer<typeof courseFormSchema>

// Registering a student in a course establishes the enrollment fee (the snapshot the
// financial firewall enforces for receipts). An existing student must be chosen.
export const enrollFormSchema = z.object({
  studentId: z.string().trim().min(1, 'اختر الطالب من القائمة'),
  studentName: z.string().trim(),
  fee: z.coerce
    .number()
    .int('الرسوم يجب أن تكون عددًا صحيحًا من الشواكل')
    .min(0, 'الرسوم يجب أن تكون صفرًا أو أكثر')
    .max(MAX_SHEKEL_AMOUNT, 'الرسوم أكبر من الحدّ المسموح'),
})

export type EnrollFormValues = z.infer<typeof enrollFormSchema>
