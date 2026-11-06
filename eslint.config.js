import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  { ignores: ['dist', 'src/shared/api/schema.d.ts'] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['**/*.{ts,tsx}'],
    languageOptions: { ecmaVersion: 2022, globals: globals.browser },
    plugins: { 'react-hooks': reactHooks },
    rules: {
      ...reactHooks.configs.recommended.rules,
      // 컴포넌트에서 fetch 직접 호출 금지 → shared/api 클라이언트 + TanStack Query 사용
      'no-restricted-globals': ['error', { name: 'fetch', message: 'shared/api 의 apiClient 를 사용하세요.' }],
    },
  },
  {
    files: ['src/shared/api/**'],
    rules: { 'no-restricted-globals': 'off' },
  },
);
