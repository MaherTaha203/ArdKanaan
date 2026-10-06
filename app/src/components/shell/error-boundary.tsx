import { Component, type ErrorInfo, type ReactNode } from 'react'

type ErrorBoundaryProps = {
  children: ReactNode
}

type ErrorBoundaryState = {
  hasError: boolean
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Unhandled render error', error, info)
  }

  render() {
    if (!this.state.hasError) return this.props.children

    return (
      <main
        className="grid min-h-screen place-items-center bg-background px-6 text-center text-foreground"
        dir="rtl"
      >
        <section className="w-full max-w-md">
          <h1 className="text-xl font-bold">تعذّر عرض الصفحة</h1>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            حدث خطأ غير متوقّع أثناء عرض التطبيق. أعد تحميل الصفحة للمتابعة.
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-6 inline-flex items-center justify-center border border-border-strong px-5 py-2.5 text-sm font-semibold text-foreground hover:bg-muted"
          >
            إعادة تحميل الصفحة
          </button>
        </section>
      </main>
    )
  }
}
