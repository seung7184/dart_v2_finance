/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class'],
  content: [],
  theme: {
    extend: {
      colors: {
        // All colors via CSS variables — never hardcode
        bg: 'var(--color-bg)',
        surface: 'var(--color-surface)',
        'surface-hover': 'var(--color-surface-hover)',
        border: 'var(--color-border)',
        text: 'var(--color-text)',
        'text-muted': 'var(--color-text-muted)',
        'text-faint': 'var(--color-text-faint)',
        accent: 'var(--color-accent)',
        'accent-muted': 'var(--color-accent-muted)',
        positive: 'var(--color-positive)',
        warning: 'var(--color-warning)',
        safe: 'var(--color-safe)',
        sidebar: 'var(--color-sidebar)',
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'system-ui', 'sans-serif'],
      },
    },
  },
};
