import type { FinancialMovement } from '@/types/domain'

export type RunningMovement = FinancialMovement & {
  runningBalance: number
}

export function chronological(movements: FinancialMovement[]) {
  return [...movements].sort((a, b) => {
    const dateCompare = a.voucherDate.localeCompare(b.voucherDate)
    return dateCompare || a.voucherNumber - b.voucherNumber
  })
}

export function withRunningBalance(movements: FinancialMovement[], opening: number): RunningMovement[] {
  let runningBalance = opening

  return chronological(movements).map((movement) => {
    const isReceipt = movement.movementType === 'receipt'
    runningBalance += isReceipt ? movement.amount : -movement.amount
    return { ...movement, runningBalance }
  })
}
