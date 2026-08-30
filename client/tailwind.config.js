/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: '#f6f8fc',
        surface: '#ffffff',
        'surface-elevated': '#f2f6fc',
        border: '#e0e2ec',
        google: {
          blue: '#1a73e8',
          'blue-dark': '#0b57d0',
          'blue-light': '#c2e7ff',
          'blue-active': '#d3e3fd',
          red: '#ea4335',
          yellow: '#fbbc04',
          green: '#34a853',
        },
      },
      fontFamily: {
        sans: ['Roboto', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
        google: ['"Google Sans"', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
    },
  },
  plugins: [],
};
