import { z } from 'zod'

export const paymentVoucherFormSchema = z.object({
  paymentDate: z.string().min(1, 'تاريخ الصرف مطلوب'),
  expenseType: z.string().trim().min(1, 'نوع المصروف مطلوب'),
  amount: z.coerce.number().int('المبلغ المصروف يجب أن يكون عددًا صحيحًا من الشواكل').positive('المبلغ المصروف يجب أن يكون أكبر من صفر'),
  notes: z.string().trim(),
})

export type PaymentVoucherFormValues = z.infer<typeof paymentVoucherFormSchema>
