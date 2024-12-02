import daisyui from 'daisyui'

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './entrypoints/**/*.{html,tsx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [
    daisyui,
  ],
}

