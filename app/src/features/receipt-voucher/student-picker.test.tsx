// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom/vitest'
import { useForm } from 'react-hook-form'

import type { ReceiptVoucherFormValues } from '@/features/receipt-voucher/schema'
import { StudentPicker } from '@/features/receipt-voucher/student-picker'
import type { Student } from '@/types/domain'

afterEach(cleanup)

function student(id: string, name: string): Student {
  return { id, name, idNumber: null, phone: null, notes: null }
}

function Harness({ students }: { students: Student[] }) {
  const form = useForm<ReceiptVoucherFormValues>({
    defaultValues: {
      paymentDate: '',
      studentName: '',
      studentId: '',
      studentIdNumber: '',
      studentPhone: '',
      courseName: '',
      courseValue: 0,
      amountReceived: 0,
      payerName: '',
      notes: '',
    },
  })
  return <StudentPicker form={form} students={students} />
}

const PLACEHOLDER = 'ابحث بالاسم أو الهاتف أو رقم الهوية'

describe('StudentPicker ambiguity warning', () => {
  it('warns when the typed name matches several students', async () => {
    render(<Harness students={[student('s-1', 'محمد علي'), student('s-2', 'محمد علي')]} />)

    await userEvent.type(screen.getByPlaceholderText(PLACEHOLDER), 'محمد علي')

    expect(screen.getByRole('alert')).toHaveTextContent('أكثر من طالب')
  })

  it('does not warn for a name that matches at most one student', async () => {
    render(<Harness students={[student('s-1', 'محمد علي'), student('s-2', 'سارة أحمد')]} />)

    await userEvent.type(screen.getByPlaceholderText(PLACEHOLDER), 'سارة أحمد')

    expect(screen.queryByRole('alert')).toBeNull()
  })
})
