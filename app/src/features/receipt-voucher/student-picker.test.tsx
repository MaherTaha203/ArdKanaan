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

const PLACEHOLDER = 'ابحث عن طالب بالاسم أو الهاتف أو الرقم التعريفي'

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

describe('StudentPicker keyboard operation', () => {
  it('exposes a combobox with a listbox of options', async () => {
    render(<Harness students={[student('s-1', 'محمد علي')]} />)

    const input = screen.getByRole('combobox')
    await userEvent.type(input, 'محمد')

    expect(input).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByRole('listbox')).toBeInTheDocument()
    expect(screen.getAllByRole('option').length).toBeGreaterThan(0)
  })

  it('opens with ArrowDown, highlights, and selects with Enter', async () => {
    render(
      <Harness
        students={[{ id: 's-1', name: 'محمد علي', idNumber: '900111', phone: null, notes: null }]}
      />,
    )
    const input = screen.getByRole('combobox')
    await userEvent.type(input, 'محمد')
    await userEvent.keyboard('{ArrowDown}{Enter}')

    expect(input).toHaveValue('محمد علي')
    expect(screen.queryByRole('listbox')).toBeNull()
    // The identity chip only renders once a student is actually selected.
    expect(screen.getByText('900111')).toBeInTheDocument()
  })

  it('closes the list with Escape without selecting', async () => {
    render(<Harness students={[student('s-1', 'محمد علي')]} />)
    const input = screen.getByRole('combobox')
    await userEvent.type(input, 'محمد')
    expect(screen.getByRole('listbox')).toBeInTheDocument()

    await userEvent.keyboard('{Escape}')

    expect(screen.queryByRole('listbox')).toBeNull()
    expect(input).toHaveValue('محمد')
  })
})
