import { useEffect, useId, useMemo, useState } from 'react'

import type { KeyboardEvent } from 'react'
import type { UseFormReturn } from 'react-hook-form'

import { Field } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { countNameMatches } from '@/lib/student-identity'
import { normalizeArabic } from '@/lib/text'
import type { Student } from '@/types/domain'

import type { ReceiptVoucherFormValues } from './schema'

// Up to this many suggestions show in the dropdown at once.
const MAX_SUGGESTIONS = 8

type StudentPickerProps = {
  form: UseFormReturn<ReceiptVoucherFormValues>
  students: Student[]
}

function digitsOf(value: string): string {
  return value.replace(/\D/g, '')
}

/**
 * The receipt's student field: a search-and-pick over existing students that
 * auto-fills the picked student's id_number + phone (read-only), or — when the
 * typed name matches no student — reveals optional id_number/phone inputs for the
 * new student being created. Identity only; it asserts no financial fact.
 */
export function StudentPicker({ form, students }: StudentPickerProps) {
  const { register, setValue, watch } = form
  const name = watch('studentName')
  const studentId = watch('studentId')
  const idNumber = watch('studentIdNumber')
  const phone = watch('studentPhone')
  const error = form.formState.errors.studentName?.message

  const [open, setOpen] = useState(false)
  // Index of the keyboard-highlighted option in `suggestions`, or -1 for none.
  const [highlighted, setHighlighted] = useState(-1)
  const listId = useId()
  const optionId = (index: number) => `${listId}-opt-${index}`

  const suggestions = useMemo(() => {
    const query = name.trim()
    if (!query) return []
    const term = normalizeArabic(query)
    const digits = digitsOf(query)
    return students
      .filter((student) => {
        const nameHit = normalizeArabic(student.name).includes(term)
        const phoneHit = digits.length > 0 && student.phone ? digitsOf(student.phone).includes(digits) : false
        const idHit =
          digits.length > 0 && student.idNumber ? digitsOf(student.idNumber).includes(digits) : false
        return nameHit || phoneHit || idHit
      })
      .slice(0, MAX_SUGGESTIONS)
  }, [students, name])

  const hasExactMatch = useMemo(() => {
    const term = normalizeArabic(name)
    return term.length > 0 && students.some((student) => normalizeArabic(student.name) === term)
  }, [students, name])

  const isNewStudent = !studentId && name.trim().length > 0 && !hasExactMatch

  // Several existing students share this exact name and none is picked yet: binding
  // now would be a guess. Warn so the operator resolves it from the list.
  const isAmbiguous = useMemo(
    () => !studentId && countNameMatches(students, name) > 1,
    [studentId, students, name],
  )

  const showDropdown = open && suggestions.length > 0

  // Keep the keyboard-highlighted option within the list bounds as it changes, and
  // scroll it into view. Runs whenever the highlight or the visible options change.
  useEffect(() => {
    if (showDropdown && highlighted >= 0) {
      // Optional call: not every environment implements scrollIntoView (e.g. jsdom).
      document.getElementById(optionId(highlighted))?.scrollIntoView?.({ block: 'nearest' })
    }
    // optionId is derived from a stable useId; not a reactive dependency.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [highlighted, showDropdown])

  function pick(student: Student) {
    setValue('studentName', student.name, { shouldValidate: true })
    setValue('studentId', student.id)
    setValue('studentIdNumber', student.idNumber ?? '')
    setValue('studentPhone', student.phone ?? '')
    setOpen(false)
    setHighlighted(-1)
  }

  function onType(value: string) {
    setValue('studentName', value, { shouldValidate: true })
    // Typing invalidates any prior selection and its auto-filled identity fields.
    if (studentId) {
      setValue('studentId', '')
      setValue('studentIdNumber', '')
      setValue('studentPhone', '')
    }
    setOpen(true)
    setHighlighted(-1)
  }

  // Full keyboard operation of the combobox. Arrow keys move the highlight, Enter
  // picks the highlighted option, Escape closes the list. When nothing is
  // highlighted, Enter/Escape are left to bubble to the sheet (advance / close).
  function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      if (!open) setOpen(true)
      setHighlighted((index) => Math.min(index + 1, suggestions.length - 1))
      return
    }
    if (event.key === 'ArrowUp') {
      event.preventDefault()
      setHighlighted((index) => Math.max(index - 1, 0))
      return
    }
    if (event.key === 'Enter' && showDropdown && highlighted >= 0 && suggestions[highlighted]) {
      // Select the highlighted student; stop the sheet from advancing/submitting.
      event.preventDefault()
      event.stopPropagation()
      pick(suggestions[highlighted])
      return
    }
    if (event.key === 'Escape' && showDropdown) {
      // Close only the list, not the whole sheet.
      event.stopPropagation()
      setOpen(false)
      setHighlighted(-1)
    }
  }

  const activeOptionId = showDropdown && highlighted >= 0 ? optionId(highlighted) : undefined

  return (
    <div>
      <Field label="اسم الطالب" error={error}>
        {(control) => (
          <div className="relative">
            <input type="hidden" {...register('studentId')} />
            <Input
              {...control}
              autoComplete="off"
              placeholder="ابحث بالاسم أو الهاتف أو رقم الهوية"
              value={name}
              role="combobox"
              aria-expanded={showDropdown}
              aria-controls={listId}
              aria-autocomplete="list"
              aria-activedescendant={activeOptionId}
              onChange={(event) => onType(event.target.value)}
              onFocus={() => setOpen(true)}
              onBlur={() => {
                setOpen(false)
                setHighlighted(-1)
              }}
              onKeyDown={onKeyDown}
            />
            {showDropdown ? (
              <ul
                id={listId}
                role="listbox"
                className="absolute z-10 mt-1 max-h-64 w-full overflow-auto rounded-xl border border-border-strong bg-panel py-1 shadow-lg"
                onMouseDown={(event) => {
                  // Keep focus on the input so a mouse pick does not blur-close first.
                  event.preventDefault()
                }}
              >
                {suggestions.map((student, index) => (
                  <li
                    key={student.id}
                    id={optionId(index)}
                    role="option"
                    aria-selected={highlighted === index}
                    onMouseMove={() => setHighlighted(index)}
                    onClick={() => pick(student)}
                    className={`flex w-full cursor-pointer flex-col items-start gap-0.5 px-3.5 py-2 text-start ${
                      highlighted === index ? 'bg-highlight' : ''
                    }`}
                  >
                    <span className="text-sm font-medium text-foreground">{student.name}</span>
                    {student.idNumber || student.phone ? (
                      <span className="figure text-[11.5px] text-faint" dir="ltr">
                        {[student.idNumber, student.phone].filter(Boolean).join(' · ')}
                      </span>
                    ) : null}
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        )}
      </Field>

      {/* Ambiguous name: several students share it — force an explicit choice. */}
      {isAmbiguous ? (
        <div
          role="alert"
          className="mt-2 rounded-xl border border-warn/40 bg-warn/10 px-3 py-2 text-[12.5px] text-warn"
        >
          يوجد أكثر من طالب بهذا الاسم — اختر المقصود من القائمة لتفادي ربط السند بالطالب غير المقصود.
        </div>
      ) : null}

      {/* Picked existing student: show their identity fields, read-only. */}
      {studentId ? (
        <div className="mt-2 flex flex-wrap gap-2">
          <IdentityChip label="رقم الهوية" value={idNumber} />
          <IdentityChip label="الهاتف" value={phone} />
        </div>
      ) : null}

      {/* New student: capture optional identity fields at creation time. */}
      {isNewStudent ? (
        <div className="mt-3 rounded-xl border border-dashed border-border-strong bg-highlight/50 p-3">
          <div className="mb-2 text-[12px] font-medium text-muted-foreground">
            طالب جديد — بيانات اختيارية
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="رقم الهوية">
              {(control) => (
                <Input
                  {...control}
                  className="figure"
                  dir="ltr"
                  inputMode="numeric"
                  placeholder="اختياري"
                  {...register('studentIdNumber')}
                />
              )}
            </Field>
            <Field label="الهاتف">
              {(control) => (
                <Input
                  {...control}
                  className="figure"
                  dir="ltr"
                  inputMode="tel"
                  placeholder="اختياري"
                  {...register('studentPhone')}
                />
              )}
            </Field>
          </div>
        </div>
      ) : null}
    </div>
  )
}

function IdentityChip({ label, value }: { label: string; value: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-highlight px-2.5 py-1 text-[12px]">
      <span className="text-faint">{label}</span>
      <span className="figure font-medium text-foreground" dir="ltr">
        {value ? value : '—'}
      </span>
    </span>
  )
}
