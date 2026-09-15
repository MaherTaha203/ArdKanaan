import { z } from 'zod'

// Generous data-entry ceiling in whole shekels. Not a business rule — the DB
// financial firewall remains the authoritative cap; this only stops an obvious
// fat-finger (an extra zero) from being submitted in the first place.
const MAX_SHEKEL_AMOUNT = 1_000_000

export const receiptVoucherFormSchema = z
  .object({
    paymentDate: z.string().min(1, 'تاريخ الدفع مطلوب'),
    studentName: z.string().trim().min(1, 'اسم الطالب مطلوب'),
    // Identity of a picked existing student. Empty string = the name is free text and
    // the student will be resolved by name (created if new). Never a financial field.
    studentId: z.string().trim(),
    // Only used when a NEW student is being created (no studentId). For an existing,
    // picked student these are shown read-only and never overwrite their record.
    studentIdNumber: z.string().trim(),
    studentPhone: z.string().trim(),
    // A course name for a course payment, or the fee name (e.g. رسوم تخريج) for a fee.
    courseName: z.string().trim().min(1, 'اسم الدورة مطلوب'),
    // Optional at field level: a fee derives its course_value from the amount, so
    // course_value is only required for a course payment (enforced in superRefine).
    courseValue: z.coerce.number().int('قيمة الدورة يجب أن تكون عددًا صحيحًا من الشواكل').min(0, 'قيمة الدورة يجب أن تكون صفرًا أو أكثر').max(MAX_SHEKEL_AMOUNT, 'قيمة الدورة أكبر من الحدّ المسموح').optional(),
    amountReceived: z.coerce.number().int('المبلغ المقبوض يجب أن يكون عددًا صحيحًا من الشواكل').positive('المبلغ المقبوض يجب أن يكون أكبر من صفر').max(MAX_SHEKEL_AMOUNT, 'المبلغ المقبوض أكبر من الحدّ المسموح'),
    // BUG-1 (approved): payer name and notes are truly optional. Empty is valid;
    // only the financial fields above gate save. Sent to the DB as '' (NOT NULL-safe).
    payerName: z.string().trim(),
    notes: z.string().trim(),
    // --- Student-fees feature (additive; callers always pass 'course' by default) ---
    // 'course' = a payment toward a course enrolment (unchanged behaviour).
    // 'fee'    = a one-off fee collected in this SAME receipt, split institute/external.
    entryType: z.enum(['course', 'fee']),
    feeCategory: z.enum(['institute', 'external', 'shared']).optional(),
    // The third-party portion of a fee, in whole shekels. Only entered for a
    // 'shared' fee; for institute/external it is derived (0 or the full amount).
    // The institute's share is always (amountReceived − externalShare).
    externalShare: z.coerce.number().int('حصة الجهة الخارجية يجب أن تكون عددًا صحيحًا من الشواكل').min(0, 'حصة الجهة الخارجية يجب أن تكون صفرًا أو أكثر').max(MAX_SHEKEL_AMOUNT, 'حصة الجهة الخارجية أكبر من الحدّ المسموح').optional(),
  })
  .superRefine((values, ctx) => {
    if (values.entryType === 'course') {
      if (values.courseValue == null) {
        ctx.addIssue({ path: ['courseValue'], code: z.ZodIssueCode.custom, message: 'قيمة الدورة مطلوبة' })
      }
      return
    }

    // A fee must carry a classification; a shared fee must carry a valid split so
    // that institute + external = the full fee, both strictly positive.
    if (!values.feeCategory) {
      ctx.addIssue({ path: ['feeCategory'], code: z.ZodIssueCode.custom, message: 'اختر تصنيف الرسم' })
      return
    }
    if (values.feeCategory === 'shared') {
      const external = values.externalShare
      if (external == null) {
        ctx.addIssue({ path: ['externalShare'], code: z.ZodIssueCode.custom, message: 'أدخل حصة الجهة الخارجية' })
      } else if (external <= 0 || external >= values.amountReceived) {
        ctx.addIssue({ path: ['externalShare'], code: z.ZodIssueCode.custom, message: 'حصة الجهة الخارجية يجب أن تكون بين صفر وإجمالي الرسم' })
      }
    }
  })

export type ReceiptVoucherFormValues = z.infer<typeof receiptVoucherFormSchema>
