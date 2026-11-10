/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      // Fonts and colours come from config/theme.mjs, as CSS variables set
      // by the root layout (app/layout.js).
      fontFamily: {
        sans: ['var(--font-body)', 'sans-serif'],
        heading: ['var(--font-heading)', 'sans-serif'],
      },
      colors: {
        'brand-base-100': 'var(--color-base-100)',
        'brand-base-200': 'var(--color-base-200)',
        'brand-base-300': 'var(--color-base-300)',
        'brand-content': 'var(--color-content)',
        'brand-primary': 'var(--color-primary)',
        'brand-neutral': 'var(--color-neutral)',
        // These also work with an opacity, e.g. bg-brand-surface/90
        'brand-surface': 'rgb(var(--color-surface-rgb) / <alpha-value>)',
        'brand-content-inverse': 'rgb(var(--color-content-inverse-rgb) / <alpha-value>)',
        'brand-content-soft': 'rgb(var(--color-content-soft-rgb) / <alpha-value>)',
        'brand-content-muted': 'rgb(var(--color-content-muted-rgb) / <alpha-value>)',
        'brand-content-subtle': 'rgb(var(--color-content-subtle-rgb) / <alpha-value>)',
        'brand-on-image': 'rgb(var(--color-on-image-rgb) / <alpha-value>)',
        'brand-badge': 'rgb(var(--color-badge-rgb) / <alpha-value>)',
        'brand-badge-text': 'rgb(var(--color-badge-text-rgb) / <alpha-value>)',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: 0 },
          '100%': { opacity: 1 },
        },
      },
      animation: {
        'fade-in': 'fadeIn 1s ease-out forwards',
      },
    },
  },
  plugins: [],
};