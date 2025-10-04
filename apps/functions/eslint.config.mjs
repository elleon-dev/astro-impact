import js from "@eslint/js";
import globals from "globals";
import typescriptParser from "@typescript-eslint/parser"; // Parser para TypeScript
import typescriptPlugin from "@typescript-eslint/eslint-plugin"; // Plugin para TypeScript

export default [
  { ignores: ["dist"] }, // Ignora la carpeta de distribución
  {
    files: ["**/*.{js,ts}"], // Linting para archivos .js y .ts
    languageOptions: {
      ecmaVersion: 2020, // Versión de ECMAScript
      globals: globals.node, // Habilita las variables globales de Node.js
      parser: typescriptParser, // Parser de TypeScript
      parserOptions: {
        ecmaVersion: "latest", // Versión moderna de ECMAScript
        sourceType: "module", // Permite módulos ES
        project: "./tsconfig.json", // Asegúrate de tener un tsconfig.json
      },
    },
    plugins: {
      "@typescript-eslint": typescriptPlugin, // Añade el plugin de TypeScript
    },
    rules: {
      ...js.configs.recommended.rules, // Reglas recomendadas para JavaScript
      ...typescriptPlugin.configs.recommended.rules, // Reglas recomendadas para TypeScript
      "no-undef": "off", // TypeScript ya se encarga de esto
      "@typescript-eslint/no-require-imports": "off", // Para evitar `require()`
      "@typescript-eslint/no-unused-expressions": "off",
    },
  },
];
