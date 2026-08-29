import { AppShell } from '@/components/shell/app-shell'
import { OpeningGate } from '@/features/auth/opening-gate'
import { useAuthStore } from '@/store/use-auth-store'

function App() {
  const ready = useAuthStore((state) => state.ready)
  const session = useAuthStore((state) => state.session)

  // Restoring the session is async; hold the shell until we know, so a signed-in
  // operator never flashes the login gate on reload.
  if (!ready) {
    return (
      <div className="grid min-h-screen place-items-center bg-background text-sm text-muted-foreground">
        جارٍ التحضير…
      </div>
    )
  }

  return session ? <AppShell /> : <OpeningGate />
}

export default App
