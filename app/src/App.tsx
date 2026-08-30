import { AppShell } from '@/components/shell/app-shell'
import { OpeningGate } from '@/features/auth/opening-gate'
import { RecoveryGate } from '@/features/auth/recovery-gate'
import { useAuthStore } from '@/store/use-auth-store'

function App() {
  const ready = useAuthStore((state) => state.ready)
  const session = useAuthStore((state) => state.session)
  const isRecovering = useAuthStore((state) => state.isRecovering)

  // Restoring the session is async; hold the shell until we know, so a signed-in
  // operator never flashes the login gate on reload.
  if (!ready) {
    return (
      <div className="grid min-h-screen place-items-center bg-background text-sm text-muted-foreground">
        جارٍ التحضير…
      </div>
    )
  }

  // A password-recovery link takes precedence over everything: the operator must
  // set a new password before reaching the shell, even though a session exists.
  if (isRecovering) return <RecoveryGate />

  return session ? <AppShell /> : <OpeningGate />
}

export default App
