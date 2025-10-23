module.exports = {
  root: true,
  env: { browser: true, es2020: true },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react/jsx-runtime', // Para el nuevo JSX de React
    'plugin:prettier/recommended', // ¡Importante! Integra Prettier
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    project: './tsconfig.json', // Ayuda a ESLint a entender TS
  },
  plugins: ['react', '@typescript-eslint', 'prettier'],
  rules: {
    'prettier/prettier': 'error',
    // Puedes añadir reglas personalizadas aquí si quieres
  },
  settings: {
    react: {
      version: 'detect', // Detecta la versión de React automáticamente
    },
  },
};