/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        bg: 'var(--color-bg)',
        card: 'var(--color-card)',
        text: 'var(--color-text)',
        'text-secondary': 'var(--color-text-secondary)',
        accent: 'var(--color-accent)',
        border: 'var(--color-border)',
        success: 'var(--color-success)',
        error: 'var(--color-error)',
        warning: 'var(--color-warning)',
        // Additional semantic tokens
        surface: 'var(--color-surface)',
        pill: 'var(--color-pill)',
        muted: 'var(--color-muted)',
        'success-bg': 'var(--color-success-bg)',
        'success-text': 'var(--color-success-text)',
        'warning-bg': 'var(--color-warning-bg)',
        'warning-text': 'var(--color-warning-text)',
        'error-bg': 'var(--color-error-bg)',
        'error-text': 'var(--color-error-text)',
        'info-bg': 'var(--color-info-bg)',
        'info-text': 'var(--color-info-text)',
      },
    },
  },
  plugins: [],
}
