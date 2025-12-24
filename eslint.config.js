const js = require("@eslint/js");
const tseslint = require("typescript-eslint");
const prettier = require("eslint-config-prettier");

module.exports = tseslint.config(
    { ignores: ["**/node_modules", "**/dist", "**/.turbo", "**/.next"] },
    js.configs.recommended,
    ...tseslint.configs.recommended,
    prettier
);
