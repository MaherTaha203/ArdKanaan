import { z } from 'zod'

const MAX_SHEKEL_AMOUNT = 1_000_000

const receiptAllocationSchema = z.object({
  type: z.enum(['course', 'fee']),
  enrollmentId: z.string().uuid().optional(),
  feeObligationId: z.string().uuid().optional(),
  amount: z.coerce.number().int('قيمة التخصيص يجب أن تكون عددًا صحيحًا من الشواكل').positive('قيمة التخصيص يجب أن تكون أكبر من صفر').max(MAX_SHEKEL_AMOUNT),
})

export const receiptVoucherFormSchema = z
  .object({
    paymentDate: z.string().min(1, 'تاريخ الدفع مطلوب'),
    studentName: z.string().trim().min(1, 'اسم الطالب مطلوب'),
    studentId: z.string().trim(),
    studentIdNumber: z.string().trim(),
    studentPhone: z.string().trim(),
    courseName: z.string().trim().min(1, 'اسم الدورة مطلوب'),
    courseValue: z.coerce.number().int('قيمة الدورة يجب أن تكون عددًا صحيحًا من الشواكل').min(0).max(MAX_SHEKEL_AMOUNT).optional(),
    amountReceived: z.coerce.number().int('المبلغ المقبوض يجب أن يكون عددًا صحيحًا من الشواكل').positive('المبلغ المقبوض يجب أن يكون أكبر من صفر').max(MAX_SHEKEL_AMOUNT),
    payerName: z.string().trim(),
    notes: z.string().trim(),
    entryType: z.enum(['course', 'fee']),
    feeCategory: z.enum(['institute', 'external', 'shared']).optional(),
    externalShare: z.coerce.number().int('حصة الجهة الخارجية يجب أن تكون عددًا صحيحًا من الشواكل').min(0).max(MAX_SHEKEL_AMOUNT).optional(),
    allocations: z.array(receiptAllocationSchema).default([]),
  })
  .superRefine((values, ctx) => {
    if (values.entryType === 'course') {
      if (values.courseValue == null) {
        ctx.addIssue({ path: ['courseValue'], code: z.ZodIssueCode.custom, message: 'قيمة الدورة مطلوبة' })
      }
      return
    }

    if (!values.feeCategory) {
      ctx.addIssue({ path: ['feeCategory'], code: z.ZodIssueCode.custom, message: 'اختر تصنيف الرسم' })
      return
    }
    if (values.feeCategory === 'shared') {
      const external = values.externalShare
      if (external == null || external <= 0 || external >= values.amountReceived) {
        ctx.addIssue({ path: ['externalShare'], code: z.ZodIssueCode.custom, message: 'حصة الجهة الخارجية يجب أن تكون بين صفر وإجمالي الرسم' })
      }
    }
  })

export type ReceiptVoucherFormValues = z.infer<typeof receiptVoucherFormSchema>
export type ReceiptAllocationFormValue = z.infer<typeof receiptAllocationSchema>
