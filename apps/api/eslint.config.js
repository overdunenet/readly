// eslint.config.js
import typescriptEslint from '@typescript-eslint/eslint-plugin';
import typescriptParser from '@typescript-eslint/parser';
import unusedImports from 'eslint-plugin-unused-imports';
import prettier from 'eslint-plugin-prettier';
import prettierConfig from 'eslint-config-prettier';

export default [
  // TypeScript 파일에 대한 설정
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        project: './tsconfig.json',
        tsconfigRootDir: import.meta.dirname,
        sourceType: 'module',
      },
      globals: {
        // Node.js 환경
        process: 'readonly',
        Buffer: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        // Jest 환경
        describe: 'readonly',
        it: 'readonly',
        test: 'readonly',
        expect: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        beforeAll: 'readonly',
        afterAll: 'readonly',
        jest: 'readonly',
      },
    },
    plugins: {
      '@typescript-eslint': typescriptEslint,
      'unused-imports': unusedImports,
      prettier: prettier,
    },
    rules: {
      // TypeScript ESLint 추천 규칙들 (개별적으로 적용)
      '@typescript-eslint/no-unused-vars': 'warn',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-empty-function': 'warn',

      // Prettier 설정
      ...prettierConfig.rules,
      'prettier/prettier': 'warn',

      // 커스텀 규칙들
      'no-await-in-loop': 'warn',
      'arrow-body-style': ['warn', 'as-needed'],
      '@typescript-eslint/no-restricted-types': 'warn', // ban-types 대체
      'max-params': 'warn',
      '@typescript-eslint/naming-convention': 'warn',
      'unused-imports/no-unused-imports': 'warn',
    },
  },

  // JavaScript 파일에 대한 설정
  {
    files: ['**/*.js', '**/*.jsx'],
    languageOptions: {
      sourceType: 'module',
      globals: {
        process: 'readonly',
        Buffer: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
      },
    },
    plugins: {
      'unused-imports': unusedImports,
      prettier: prettier,
    },
    rules: {
      ...prettierConfig.rules,
      'prettier/prettier': 'warn',
      'no-await-in-loop': 'warn',
      'arrow-body-style': ['warn', 'as-needed'],
      'max-params': 'warn',
      'unused-imports/no-unused-imports': 'warn',
    },
  },

  // 무시할 파일들
  {
    ignores: [
      'node_modules/',
      'dist/',
      'build/',
      '.next/',
      'coverage/',
      '*.min.js',
      'eslint.config.js', // 설정 파일 자체는 무시
    ],
  },
];