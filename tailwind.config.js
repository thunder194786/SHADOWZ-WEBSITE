/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        surface: 'rgb(var(--color-surface-rgb) / <alpha-value>)',
        surface2: 'rgb(var(--color-surface2-rgb) / <alpha-value>)',
        neon: 'rgb(var(--color-neon-rgb) / <alpha-value>)',
        violet: 'rgb(var(--color-violet-rgb) / <alpha-value>)',
      },
      fontFamily: {
        heading: ['Orbitron', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
