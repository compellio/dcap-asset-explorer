import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  
  // Override rules to downgrade errors to warnings
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'warn', // Downgrade from error to warning
      '@typescript-eslint/no-unused-vars': 'warn',  // Downgrade from error to warning
      'react/no-unescaped-entities': 'warn',        // Downgrade from error to warning
      'react-hooks/exhaustive-deps': 'warn'         // Downgrade from error to warning
    }
  },
  
  // Ignore patterns
  {
    ignores: [
      '.next/**',
      'node_modules/**',
      'out/**',
      'build/**',
      'dist/**',
      'public/**',
      'next-env.d.ts'
    ]
  }
];

export default eslintConfig;
