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
        // PLANTS 브랜드색(#2D5A27)은 어두운 배경에서 거의 안 보여 밝은 쪽으로 조정한 값
        'brand-leaf': '#6FBF57',
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
