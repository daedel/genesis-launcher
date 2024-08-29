/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        'hero': "linear-gradient(#191b27, rgba(25, 27, 39, 0) 42%), linear-gradient(0deg, #191b27, rgba(25, 27, 39, 0) 30%), url(./assets/hero-banner-bg_1.webp)",
        'play_bg': "linear-gradient(270deg, #335275, #60b6db 64%)",
        'progress-bg': "url(./assets/progressBar/0_BG.png)",
        'progress-fill': "url(./assets/progressBar/0_FILL.png)",

      },
    },
  },
  plugins: [],
}