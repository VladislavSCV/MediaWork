/** @type {import('tailwindcss').Config} */
module.exports = {
  theme: {
    extend: {
      perspective: {
        1200: "1200px",
      },
      transformOrigin: {
        "center-bottom": "center bottom",
      },
      // rotate можно не трогать, если не используешь кастомные утилиты
    },
  },
};
