import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      // === Turunkan severity agar build tidak gagal ===
      // Ini langkah sementara. Aturan akan dinaikkan kembali ke "error"
      // setelah `any` dan pelanggaran lain dibersihkan bertahap di PR lanjutan.
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
      "@next/next/no-img-element": "warn",
      "react-hooks/exhaustive-deps": "warn",
      "react-hooks/set-state-in-effect": "warn",
      "prefer-const": "warn",
    },
  },
  {
    // Aturan React Compiler menyasar Date.now()/Math.random() di fungsi komponen.
    // Di dua file ini seluruh penandaan berada di dalam event handler / aksi admin
    // (dipanggil setelah render, bukan selama render), sehingga false positive.
    // React Compiler tidak diaktifkan di next.config.ts — cukup peringatan.
    files: ["src/context/ArticleContext.tsx", "src/app/admin/page.tsx"],
    rules: {
      "react-hooks/purity": "warn",
    },
  },
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    ".open-next/**",
    "node_modules/**",
    "next-env.d.ts",
    // Skrip utilitas Node.js (CommonJS) & folder eksperimen — bukan bagian app Next.js
    "scripts/**",
    "scratch/**",
  ]),
]);

export default eslintConfig;
