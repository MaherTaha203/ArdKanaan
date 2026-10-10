import { z } from 'zod'

const MAX_SHEKEL_AMOUNT = 1_000_000

export const courseFormSchema = z.object({
  name: z.string().trim().min(1, 'اسم الدورة مطلوب'),
  monthlyFee: z
    .string()
    .trim()
    .refine(
      (value) => value === '' || (/^\d+$/.test(value) && Number(value) <= MAX_SHEKEL_AMOUNT),
      'قيمة الاشتراك الشهري يجب أن تكون عددًا صحيحًا من الشواكل ضمن الحدّ المسموح',
    ),
  startDate: z.string().trim(),
  endDate: z.string().trim(),
  status: z.enum(['active', 'ended']),
  notes: z.string().trim(),
})

export type CourseFormValues = z.infer<typeof courseFormSchema>

export const enrollFormSchema = z.object({
  studentId: z.string().trim().min(1, 'اختر الطالب من القائمة'),
  studentName: z.string().trim(),
})

export type EnrollFormValues = z.infer<typeof enrollFormSchema>
