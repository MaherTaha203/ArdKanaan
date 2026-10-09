// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import '@testing-library/jest-dom/vitest'

import { Input } from '@/components/ui/input'

afterEach(cleanup)

describe('Input numeric digit handling', () => {
  it('shows Western digits immediately for Arabic-Indic and Persian numeric input', () => {
    const onChange = vi.fn()
    render(<Input type="number" aria-label="المبلغ" onChange={onChange} />)

    const input = screen.getByRole('textbox', { name: 'المبلغ' })
    fireEvent.change(input, { target: { value: '١٢۳٤' } })

    expect(input).toHaveValue('1234')
    expect(input).toHaveAttribute('inputmode', 'numeric')
    expect(input).toHaveAttribute('dir', 'ltr')
    expect(onChange).toHaveBeenCalledTimes(1)
  })

  it('normalizes digits in regular text fields but leaves passwords unchanged', () => {
    render(
      <>
        <Input aria-label="ملاحظات" />
        <Input type="password" aria-label="كلمة المرور" />
      </>,
    )

    const notes = screen.getByRole('textbox', { name: 'ملاحظات' })
    fireEvent.change(notes, { target: { value: 'المستوى ٢' } })
    expect(notes).toHaveValue('المستوى 2')

    const password = screen.getByLabelText('كلمة المرور')
    fireEvent.change(password, { target: { value: 'رمز٢' } })
    expect(password).toHaveValue('رمز٢')
  })

  it('preserves separators in numeric date fields while converting digits', () => {
    render(<Input inputMode="numeric" aria-label="التاريخ" />)

    const input = screen.getByRole('textbox', { name: 'التاريخ' })
    fireEvent.change(input, { target: { value: '٠٩/١٠/٢٠٢٦' } })

    expect(input).toHaveValue('09/10/2026')
  })
})
