/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./lib/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      perspective: {
        1200: "1200px",
      },
      rotate: {
        "y-12": "rotateY(12deg)",
        "-y-12": "rotateY(-12deg)",
      },
      transformOrigin: {
        "center-bottom": "center bottom",
      },
    },
  },
  plugins: [],
};
