import { z } from 'zod'

export const receiptVoucherFormSchema = z.object({
  paymentDate: z.string().min(1, 'تاريخ الدفع مطلوب'),
  studentName: z.string().trim().min(1, 'اسم الطالب مطلوب'),
  courseName: z.string().trim().min(1, 'اسم الدورة مطلوب'),
  courseValue: z.coerce.number().min(0, 'قيمة الدورة يجب أن تكون صفرًا أو أكثر'),
  amountReceived: z.coerce.number().positive('المبلغ المقبوض يجب أن يكون أكبر من صفر'),
  payerName: z.string().trim().min(1, 'اسم الدافع مطلوب'),
  notes: z.string().trim().min(1, 'الملاحظات مطلوبة'),
})

export type ReceiptVoucherFormValues = z.infer<typeof receiptVoucherFormSchema>