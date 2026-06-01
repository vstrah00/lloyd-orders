import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#151515",
        paper: "#f7f3ea",
        lime: "#b9f24d",
        coral: "#f06b4f",
        sea: "#1f9aa0"
      }
    }
  },
  plugins: []
};

export default config;
