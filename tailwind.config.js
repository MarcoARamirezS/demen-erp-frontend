/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./app/**/*.{vue,js}",
    "./components/**/*.{vue,js}",
    "./layouts/**/*.{vue,js}",
    "./pages/**/*.{vue,js}",
    "./plugins/**/*.js",
  ],

  theme: {
    extend: {
      fontFamily: {
        sans: ["Manrope", "ui-sans-serif", "system-ui"],
        serif: ["Times New Roman", "serif"],
      },
      borderRadius: {
        danam: "0.75rem",
      },
    },
  },

  plugins: [require("daisyui")],

  daisyui: {
    themes: [
      {
        danam: {
          /* === PALETA CORPORATIVA DANAM === */

          primary: "#5a6b1c",          // Verde principal
          "primary-content": "#ffffff",

          secondary: "#517647",        // Verde secundario
          "secondary-content": "#ffffff",

          accent: "#7e8b4d",           // Verde acento
          "accent-content": "#ffffff",

          /* === NEUTROS === */
          neutral: "#485555",
          "neutral-content": "#ffffff",

          "base-100": "#edf1e7",       // Fondo principal
          "base-200": "#d6dadc",
          "base-300": "#cccbc2",
          "base-content": "#485555",

          /* === ESTADOS === */
          info: "#627275",
          success: "#5a6b1c",
          warning: "#b3ba8f",
          error: "#626455",
        },
      },
    ],

    darkTheme: "danam",
  },
}
