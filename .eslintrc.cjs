module.exports = {
  root: true,
  extends: ["next/core-web-vitals", "next/typescript", "prettier"],
  ignorePatterns: [
    "node_modules/**",
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ],
  rules: {
    // ...
  },
};
