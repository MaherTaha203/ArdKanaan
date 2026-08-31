import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

// Unit/integration tests only (Playwright E2E lives in ./e2e and runs separately).
// Default environment is node — pure logic and store tests need no DOM; the few
// component tests opt into jsdom with a `// @vitest-environment jsdom` docblock.
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': `${import.meta.dirname}/src`,
    },
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      include: ['src/lib/**', 'src/store/**'],
      reporter: ['text', 'html'],
    },
  },
})
