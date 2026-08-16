// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require("eslint-config-expo/flat");

module.exports = defineConfig([
  expoConfig,
  {
    // Build output and generated native projects. The web app and the API
    // are separate projects with their own tooling.
    ignores: [
      "dist/*",
      ".expo/**",
      "android/**",
      "ios/**",
      "node_modules/**",
    ],
  },
  {
    rules: {
      // React Compiler is not enabled for this app (app.json `experiments` sets
      // only typedRoutes), so compiler-bailout diagnostics do not apply here.
      'react-hooks/preserve-manual-memoization': 'off',

      // Warn, don't block. The remaining hits are deliberate "reset derived state
      // when a prop changes" effects in the order-tracking flow. Reworking them
      // (key-based remount / derived state) is a behaviour change that needs
      // on-device testing, so it is tracked rather than silently rewritten.
      'react-hooks/set-state-in-effect': 'warn',
    },
  },
]);
