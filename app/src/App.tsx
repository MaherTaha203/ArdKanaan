import { AppShell } from '@/components/shell/app-shell'
import { OpeningGate } from '@/features/auth/opening-gate'
import { useShellStore } from '@/store/use-shell-store'

function App() {
  const authed = useShellStore((state) => state.authed)

  return authed ? <AppShell /> : <OpeningGate />
}

export default App
