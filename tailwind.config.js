/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        'brand-gold': '#D4AF37',
        'brand-emerald': '#10b981',
        'brand-black': '#0c0c0c',
      },
      fontFamily: {
        sans: ['Pretendard', 'system-ui', 'sans-serif'],
        display: ['Space Grotesk', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
