/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"DM Sans"', "system-ui", "sans-serif"],
        mono: ['"JetBrains Mono"', "monospace"],
      },
      colors: {
        surface: {
          DEFAULT: "#FAFAF9",
          secondary: "#F5F4F0",
          tertiary: "#EEECE8",
          inverse: "#1C1B18",
        },
        border: {
          DEFAULT: "#E2DFD8",
          strong: "#C9C5BC",
        },
        text: {
          primary: "#1C1B18",
          secondary: "#6B6860",
          tertiary: "#9C9A93",
          inverse: "#FAFAF9",
        },
        accent: {
          DEFAULT: "#1C1B18",
          hover: "#3D3B35",
        },
        info: { bg: "#EBF4FE", text: "#1A5FA8", border: "#BDDAF9" },
        success: { bg: "#EDFAF0", text: "#166534", border: "#BBF7D0" },
        warning: { bg: "#FFFBEB", text: "#92400E", border: "#FDE68A" },
        danger: { bg: "#FEF2F2", text: "#991B1B", border: "#FECACA" },
        purple: { bg: "#F3F0FF", text: "#4C1D95", border: "#DDD6FE" },
        teal: { bg: "#F0FDFA", text: "#134E4A", border: "#99F6E4" },
        amber: { bg: "#FFFBEB", text: "#78350F", border: "#FDE68A" },
      },
      borderRadius: {
        DEFAULT: "6px",
        md: "8px",
        lg: "12px",
        xl: "16px",
      },
      boxShadow: {
        card: "0 1px 3px 0 rgb(0 0 0 / 0.06), 0 1px 2px -1px rgb(0 0 0 / 0.06)",
        dropdown:
          "0 4px 6px -1px rgb(0 0 0 / 0.08), 0 2px 4px -2px rgb(0 0 0 / 0.08)",
        modal:
          "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
      },
    },
  },
  plugins: [],
};
