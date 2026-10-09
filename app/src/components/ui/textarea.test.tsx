// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import { afterEach, describe, expect, it } from 'vitest'

import { Textarea } from '@/components/ui/textarea'

afterEach(cleanup)

describe('Textarea digit handling', () => {
  it('normalizes Arabic-Indic and Persian digits to Western digits', () => {
    render(<Textarea aria-label="ملاحظات" />)

    const textarea = screen.getByRole('textbox', { name: 'ملاحظات' })
    fireEvent.change(textarea, { target: { value: 'دفعة ١ ودفعة ۲' } })

    expect(textarea).toHaveValue('دفعة 1 ودفعة 2')
  })
})
