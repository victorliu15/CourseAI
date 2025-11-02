/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "#ffffff",
        primary: "#f8f9fa",
        "primary-border": "#e9ecef",
        footer: "#f8f9fa",
        "footer-border": "#e9ecef",
        accent: "#6366f1",
        "nav-text": "#495057",
        "nav-hover": "#6366f1",
        text: "#212529",
        "footer-text": "#6c757d",
      },
    },
  },
  plugins: [],
};
