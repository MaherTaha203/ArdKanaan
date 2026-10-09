// @vitest-environment jsdom
import { fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup } from '@testing-library/react'
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

  it('preserves separators in numeric date fields while converting digits', () => {
    render(<Input inputMode="numeric" aria-label="التاريخ" />)

    const input = screen.getByRole('textbox', { name: 'التاريخ' })
    fireEvent.change(input, { target: { value: '٠٩/١٠/٢٠٢٦' } })

    expect(input).toHaveValue('09/10/2026')
  })
})
