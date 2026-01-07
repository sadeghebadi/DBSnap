// @ts-check
import { config as sharedConfig } from '@dbsnap/config/eslint';
import tseslint from 'typescript-eslint';

export default tseslint.config(
    ...sharedConfig,
    {
        ignores: ['eslint.config.mjs', 'dist/**'],
    },
    {
        languageOptions: {
            parserOptions: {
                projectService: true,
                tsconfigRootDir: import.meta.dirname,
            },
        },
    },
);
