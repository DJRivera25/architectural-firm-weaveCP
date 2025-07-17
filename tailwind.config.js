module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}", "./pages/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        archivo: ["var(--font-archivo)", "sans-serif"],
        archivoNarrow: ["var(--font-archivo-narrow)", "sans-serif"],
        workSans: ["var(--font-work-sans)", "sans-serif"],
      },
    },
  },
};
