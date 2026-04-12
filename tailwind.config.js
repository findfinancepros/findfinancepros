/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0f7f4',
          100: '#d9ede3',
          200: '#b5dbca',
          300: '#84c2aa',
          400: '#56a488',
          500: '#3a8a6e',
          600: '#2b6e58',
          700: '#245948',
          800: '#20483b',
          900: '#1c3c33',
          950: '#0e221c',
        },
        midnight: {
          50: '#f4f6fb',
          100: '#e8ecf6',
          200: '#ccd5eb',
          300: '#9faed8',
          400: '#6c82c0',
          500: '#4963a9',
          600: '#374d8e',
          700: '#2e3f73',
          800: '#293760',
          900: '#273151',
          950: '#0f1422',
        },
        warm: {
          50: '#fdf8f0',
          100: '#f9eddb',
          200: '#f2d8b6',
          300: '#e9bc87',
          400: '#df9a56',
          500: '#d88035',
          600: '#c9692b',
          700: '#a75125',
          800: '#864224',
          900: '#6d3820',
        }
      },
      fontFamily: {
        display: ['"DM Serif Display"', 'Georgia', 'serif'],
        body: ['"DM Sans"', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
