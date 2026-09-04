import { z } from 'zod'

export const paymentVoucherFormSchema = z.object({
  paymentDate: z.string().min(1, 'تاريخ الدفع مطلوب'),
  expenseType: z.string().trim().min(1, 'بند المصروف مطلوب'),
  amount: z.coerce.number().int('المبلغ المدفوع يجب أن يكون عددًا صحيحًا من الشواكل').positive('المبلغ المدفوع يجب أن يكون أكبر من صفر'),
  notes: z.string().trim(),
})

export type PaymentVoucherFormValues = z.infer<typeof paymentVoucherFormSchema>
