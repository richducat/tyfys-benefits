module.exports = {
  content: [
    "./app-shell.html",
    "./sign-up.html",
    "./veteran-operating-system.html",
    "./apps/tyfys-platform/src/tyfys-platform-app.jsx",
    "./apps/mobile-nav.js",
    "./apps/ios-shell/www/index.html"
  ],
  safelist: [
    "border-blue-600",
    "bg-blue-50",
    "text-blue-900",
    "shadow-sm",
    "hover:border-blue-400",
    "hidden",
    "opacity-0",
    "translate-x-full",
    "pointer-events-none",
    "overflow-hidden"
  ],
  theme: {
    extend: {
      colors: {
        navy: { 50: "#f0f4ff", 100: "#e0eaff", 700: "#2d4a9e", 800: "#1e3a8a", 900: "#0f172a" },
        gold: { 400: "#fbbf24", 500: "#f59e0b", 600: "#d97706" }
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        serif: ["Merriweather", "serif"]
      },
      boxShadow: {
        soft: "0 4px 20px -2px rgba(0, 0, 0, 0.05)",
        glow: "0 0 15px rgba(245, 158, 11, 0.3)"
      }
    }
  }
};
