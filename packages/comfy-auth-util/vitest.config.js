
/// <reference types="vitest/config" />

// Configure Vitest (https://vitest.dev/config/)

import { defineConfig } from 'vite'

export default defineConfig({
  test: {
    /* for example, use global to avoid globals imports (describe, test, expect): */
    // globals: true,
    // Send results to Test Engine
    reporters: [
        'default',
        'buildkite-test-collector/vitest/reporter'
    ],
    // Enable column + line capture for Test Engine
    includeTaskLocation: true,
  }
})
