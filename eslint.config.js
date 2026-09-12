import globals from "globals";
import tseslint from "typescript-eslint";

export default tseslint.config({
  ignores: ["dist/**", "node_modules/**", "*.tsbuildinfo"],
  files: ["src/**/*.{ts,tsx}"],
  languageOptions: {
    parser: tseslint.parser,
    ecmaVersion: 2020,
    sourceType: "module",
    globals: {
      ...globals.browser,
    },
  },
  rules: {
    "no-unreachable": "error",
    "no-constant-condition": "error",
  },
});
