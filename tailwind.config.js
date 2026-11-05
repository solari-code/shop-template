/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-inter)', 'sans-serif'],
      },
      colors: {
        'brand-base-100': 'var(--color-base-100)',
        'brand-base-200': 'var(--color-base-200)',
        'brand-base-300': 'var(--color-base-300)',
        'brand-content': 'var(--color-content)',
        'brand-blue': 'var(--color-blue)',
        'brand-purple': 'var(--color-purple)',
        'brand-accent': 'var(--color-accent)',
        'brand-neutral': 'var(--color-neutral)',
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