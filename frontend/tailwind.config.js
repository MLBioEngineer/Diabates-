/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        medical: {
          50: '#f0fdfa',
          100: '#ccfbf1',
          200: '#99f6e4',
          300: '#5eead4',
          400: '#2dd4bf',
          500: '#14b8a6', // Teal clinical primary
          600: '#0d9488',
          700: '#0f766e',
          800: '#115e59',
          900: '#134e4a',
        },
        glycemic: {
          hypo: '#ef4444',     // Critical Red < 70
          target: '#10b981',   // In-Range Green 70-180
          hyper: '#f59e0b',    // Warning Amber 180-250
          critical: '#7f1d1d', // Severe Red > 250
        }
      },
    },
  },
  plugins: [],
}
