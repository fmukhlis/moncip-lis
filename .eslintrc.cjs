module.exports = {
  root: true,
  extends: ["next/core-web-vitals", "next/typescript", "prettier"],
  ignorePatterns: [
    "node_modules/**",
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "*rc.(c|m)[jt]s",
    "*.config.(c|m)[jt]s",
    "pnpm-lock.yaml",
  ],
  rules: {
    // ...
  },
};
