import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import { defineConfig, globalIgnores } from 'eslint/config';

export default defineConfig([
    globalIgnores(['node_modules/**', 'test-results/**', 'playwright-report/**']),
    {
        files: ['**/*.{js,mjs,cjs,ts,mts,cts}'],
        plugins: { js },
        languageOptions: {
            globals: {
                ...globals.browser,
                ...globals.node,

                page: 'readonly',
                browser: 'readonly',
                context: 'readonly',
                test: 'readonly',
                expect: 'readonly',
                describe: 'readonly',
                beforeEach: 'readonly',
                afterEach: 'readonly',
            },
            ecmaVersion: 2022,
            sourceType: 'module',
        },
        rules: {

            'quotes': ['error', 'single', { avoidEscape: true }],
            'eol-last': ['error', 'always'],
            'semi': ['error', 'always'],
            'indent': ['error', 4, { SwitchCase: 1 }],
            'linebreak-style': ['error', 'windows'], // Для Windows, если на Mac/Linux - "unix"
            'prefer-const': 'error',
            'no-console': 'off',
        },
    },

    {
        files: ['**/*.{ts,mts,cts}'],
        languageOptions: {
            parser: tseslint.parser,
            parserOptions: {
                project: true,
            },
        },
        rules: {
            '@typescript-eslint/no-unused-vars': [
                'error',
                {
                    argsIgnorePattern: '^_',
                    varsIgnorePattern: '^_',
                    caughtErrorsIgnorePattern: '^_'
                }
            ],
            '@typescript-eslint/no-explicit-any': 'warn',
            '@typescript-eslint/no-empty-function': 'warn',
        },
    },
    //     Подключаю рекомендованные конфиги
    ...tseslint.configs.recommended,
]);
