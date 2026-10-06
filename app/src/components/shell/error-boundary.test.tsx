// @vitest-environment jsdom

import { render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import '@testing-library/jest-dom/vitest'

import { ErrorBoundary } from '@/components/shell/error-boundary'

afterEach(() => {
  vi.restoreAllMocks()
})

function ThrowingChild(): never {
  throw new Error('render failure')
}

describe('ErrorBoundary', () => {
  it('replaces a render failure with a recoverable fallback', () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined)

    render(
      <ErrorBoundary>
        <ThrowingChild />
      </ErrorBoundary>,
    )

    expect(screen.getByRole('heading', { name: 'تعذّر عرض الصفحة' })).toBeVisible()
    expect(
      screen.getByRole('button', { name: 'إعادة تحميل الصفحة' }),
    ).toBeVisible()
  })
})
