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
        bg: 'var(--bg)',
        surface: 'var(--surface)',
        card: 'var(--card)',
        text: 'var(--text)',
        muted: 'var(--muted)',
        border: 'var(--border)',
        accent: 'var(--accent)',
        'accent-weak': 'var(--accent-weak)',
        error: 'var(--color-error)',
      },
      borderRadius: {
        xl2: '14px'
      },
      aspectRatio: {
        '4/5': '4 / 5',
      },
      inset: {
        'safe-bottom': 'calc(16px + env(safe-area-inset-bottom, 0px))',
      }
    },
  },
  plugins: [
    require('@tailwindcss/line-clamp'),
    function({ addUtilities }) {
      addUtilities({
        '.scrollbar-hide': {
          '-ms-overflow-style': 'none',
          'scrollbar-width': 'none',
          '&::-webkit-scrollbar': {
            display: 'none',
          },
        },
      });
    },
  ],
}
