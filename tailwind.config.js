/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["DM Sans", "ui-sans-serif", "system-ui", "sans-serif"],
        display: ["Manrope", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      colors: {
        ink: "#17211d",
        mint: "#c5f36a",
        forest: "#244b3b",
      },
    },
  },
  plugins: [],
};
