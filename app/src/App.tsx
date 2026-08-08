import { useState } from 'react'
import { FileText, ReceiptText, Wallet } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { FinancialReportWorkspace } from '@/features/financial-report/financial-report-workspace'
import { MoneyInWorkspace } from '@/features/receipt-voucher/money-in-workspace'
import { MoneyOutWorkspace } from '@/features/payment-voucher/money-out-workspace'

type Section = 'money-in' | 'money-out' | 'report'

function App() {
  const [section, setSection] = useState<Section>('money-in')

  return (
    <div className="min-h-screen bg-background text-foreground">
      <nav className="sticky top-0 z-10 border-b border-border/70 bg-background/85 backdrop-blur">
        <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-10">
          <div className="flex items-baseline gap-2">
            <span className="text-base font-semibold text-foreground">أرض كنعان</span>
            <span className="text-xs text-muted-foreground">مركز تدريب · دفتر مالي</span>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant={section === 'money-in' ? 'default' : 'ghost'}
              onClick={() => setSection('money-in')}
            >
              <ReceiptText className="size-4" />
              سند قبض
            </Button>
            <Button
              variant={section === 'money-out' ? 'default' : 'ghost'}
              onClick={() => setSection('money-out')}
            >
              <Wallet className="size-4" />
              سند صرف
            </Button>
            <Button
              variant={section === 'report' ? 'default' : 'ghost'}
              onClick={() => setSection('report')}
            >
              <FileText className="size-4" />
              التقرير المالي
            </Button>
          </div>
        </div>
      </nav>

      {section === 'money-in' ? <MoneyInWorkspace /> : null}
      {section === 'money-out' ? <MoneyOutWorkspace /> : null}
      {section === 'report' ? <FinancialReportWorkspace /> : null}
    </div>
  )
}

export default App
