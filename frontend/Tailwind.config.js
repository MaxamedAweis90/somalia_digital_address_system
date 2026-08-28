/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        blue: "#3E7FD1",
        "blue-deep": "#14345C",
        night: "#0A1F35",
        sand: "#D98C4A",
        teal: "#1FA69B",
        bg: "#F6F8FB",
        "bg-warm": "#FBF9F5",
        line: "#E3E8EF",
        ink: "#16233A",
        "ink-soft": "#566B8A",
        star: "#F6C453",
      },
      fontFamily: {
        display: ["Space Grotesk", "sans-serif"],
        sans: ["Inter", "sans-serif"],
        mono: ["IBM Plex Mono", "monospace"],
      },
      boxShadow: {
        card: "0 30px 60px -20px rgba(10,31,53,.25)",
        "card-sm": "0 1px 3px rgba(10,31,53,.08)",
        cta: "0 6px 20px -6px rgba(20,52,92,.5)",
        pill: "0 0 0 1px rgba(20,52,92,.06)",
      },
      borderRadius: {
        xl2: "16px",
        xl3: "28px",
      },
    },
  },
  plugins: [],
};