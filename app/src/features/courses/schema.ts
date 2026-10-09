import { z } from 'zod'

// Generous whole-shekel ceiling — a fat-finger guard, not a business rule. The DB
// checks remain authoritative.
const MAX_SHEKEL_AMOUNT = 1_000_000

// Course catalog form. baseFee remains a legacy total-registration value; monthlyFee
// is a separate optional price for future monthly obligations.
export const courseFormSchema = z.object({
  name: z.string().trim().min(1, 'اسم الدورة مطلوب'),
  // Optional whole-shekel default fee, kept as a string so the input stays simple
  // and RHF typing clean; '' means "no standard fee". Parsed to number|null on save.
  baseFee: z
    .string()
    .trim()
    .refine(
      (value) => value === '' || (/^\d+$/.test(value) && Number(value) <= MAX_SHEKEL_AMOUNT),
      'قيمة التسجيل القديمة يجب أن تكون عددًا صحيحًا من الشواكل ضمن الحدّ المسموح',
    ),
  monthlyFee: z
    .string()
    .trim()
    .refine(
      (value) => value === '' || (/^\d+$/.test(value) && Number(value) <= MAX_SHEKEL_AMOUNT),
      'الرسوم الشهرية يجب أن تكون عددًا صحيحًا من الشواكل ضمن الحدّ المسموح',
    ),
  startDate: z.string().trim(),
  endDate: z.string().trim(),
  status: z.enum(['active', 'ended']),
  notes: z.string().trim(),
})

export type CourseFormValues = z.infer<typeof courseFormSchema>

// Registering a student in a course establishes the enrollment fee (the snapshot the
// financial firewall enforces for receipts). An existing student must be chosen.
// The fee is a REQUIRED whole-shekel string: a blank field is rejected (not silently
// coerced to 0), so a course with no default fee forces a conscious amount — while an
// explicit 0 (a genuinely free course) is still accepted. Parsed to a number on save.
export const enrollFormSchema = z.object({
  studentId: z.string().trim().min(1, 'اختر الطالب من القائمة'),
  studentName: z.string().trim(),
})

export type EnrollFormValues = z.infer<typeof enrollFormSchema>
