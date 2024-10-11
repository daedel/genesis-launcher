/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        'hero': "url(./assets/bg-hero.png)",
        'play_bg': "linear-gradient(270deg, #335275, #60b6db 64%)",
        'window_frame': "url(./assets/window-frame.png)",
        'settings_frame': "url(./assets/settings_frame.svg)",
        'logo': "url(./assets/genesis-logo.png)",
        'settings_bg': "url(./assets/settings_bg_cog.svg)",
        'settings_icon': "url(./assets/settings_icon.svg)",
        'settings_icon_hv': "url(./assets/settings_icon_hover.svg)",
        'minimalize_icon': "url(./assets/minimalize_icon.svg)",
        'minimalize_icon_hv': "url(./assets/minimalize_icon_hv.svg)",
        'close_icon': "url(./assets/close_icon.svg)",
        'close_icon_hv': "url(./assets/close_icon_hv.svg)",
        'status_frame': "url(./assets/status_frame.svg)",



      },
    },
  },
  plugins: [],
}