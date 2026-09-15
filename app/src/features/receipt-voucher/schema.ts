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
    entryType: z.enum(['course', 'fee', 'mixed']),
    feeCategory: z.enum(['institute', 'external', 'shared']).optional(),
    externalShare: z.coerce.number().int('حصة الجهة الخارجية يجب أن تكون عددًا صحيحًا من الشواكل').min(0).max(MAX_SHEKEL_AMOUNT).optional(),
    allocations: z.array(receiptAllocationSchema).default([]),
  })
  .superRefine((values, ctx) => {
    if (values.allocations.length > 0) {
      const sum = values.allocations.reduce((total, item) => total + item.amount, 0)
      if (sum !== values.amountReceived) {
        ctx.addIssue({ path: ['amountReceived'], code: z.ZodIssueCode.custom, message: 'مجموع بنود التحصيل يجب أن يساوي المبلغ المقبوض' })
      }
      return
    }

    if (values.entryType === 'fee') {
      ctx.addIssue({ path: ['allocations'], code: z.ZodIssueCode.custom, message: 'اختر الرسم المستحق' })
      return
    }

    if (values.entryType === 'course' && values.courseValue == null) {
      ctx.addIssue({ path: ['courseValue'], code: z.ZodIssueCode.custom, message: 'قيمة الدورة مطلوبة' })
    }
  })

export type ReceiptVoucherFormValues = z.infer<typeof receiptVoucherFormSchema>
export type ReceiptAllocationFormValue = z.infer<typeof receiptAllocationSchema>
