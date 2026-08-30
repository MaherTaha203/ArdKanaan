import { z } from 'zod'

export const receiptVoucherFormSchema = z.object({
  paymentDate: z.string().min(1, 'تاريخ الدفع مطلوب'),
  studentName: z.string().trim().min(1, 'اسم الطالب مطلوب'),
  courseName: z.string().trim().min(1, 'اسم الدورة مطلوب'),
  courseValue: z.coerce.number().min(0, 'قيمة الدورة يجب أن تكون صفرًا أو أكثر'),
  amountReceived: z.coerce.number().positive('المبلغ المقبوض يجب أن يكون أكبر من صفر'),
  // BUG-1 (approved): payer name and notes are truly optional. Empty is valid;
  // only the financial fields above gate save. Sent to the DB as '' (NOT NULL-safe).
  payerName: z.string().trim(),
  notes: z.string().trim(),
})

export type ReceiptVoucherFormValues = z.infer<typeof receiptVoucherFormSchema>