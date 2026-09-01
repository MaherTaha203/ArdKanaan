import { z } from 'zod'

// Editing a student corrects IDENTITY only — never a financial fact. The name is
// required (it is how the operator recognizes the record); id_number, phone and
// notes are optional and stored as null when blank.
export const studentEditFormSchema = z.object({
  name: z.string().trim().min(1, 'اسم الطالب مطلوب'),
  idNumber: z.string().trim(),
  phone: z.string().trim(),
  notes: z.string().trim(),
})

export type StudentEditFormValues = z.infer<typeof studentEditFormSchema>
