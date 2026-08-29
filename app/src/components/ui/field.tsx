import { type ReactNode, useId } from 'react'

type FieldControl = {
  id: string
  'aria-invalid'?: true
  'aria-describedby'?: string
}

type FieldProps = {
  label: string
  error?: string
  /**
   * Render prop that receives the control props (id + aria) to spread onto the
   * input/textarea/select, so the label is programmatically associated and the
   * error is announced. These keys (id, aria-*) are disjoint from what
   * react-hook-form's register() returns (name, ref, onChange, onBlur), so spread
   * order is safe: {(control) => <Input {...control} {...register('x')} />}.
   */
  children: (control: FieldControl) => ReactNode
}

/**
 * A labelled form field. Binds <label htmlFor> to the control's id (a11y), and
 * wires aria-invalid / aria-describedby to the error message. Presentation only —
 * it asserts no business fact (UX-005 LA-03).
 */
export function Field({ label, error, children }: FieldProps) {
  const id = useId()
  const errorId = error ? `${id}-error` : undefined

  const control: FieldControl = {
    id,
    'aria-invalid': error ? true : undefined,
    'aria-describedby': errorId,
  }

  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-[13px] font-medium text-muted-foreground">
        {label}
      </label>
      {children(control)}
      {error ? (
        <p id={errorId} className="mt-1.5 text-xs font-medium text-clay">
          {error}
        </p>
      ) : null}
    </div>
  )
}
