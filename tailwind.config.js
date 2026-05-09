/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Tactical Performance Palette
        'tactical-bg': '#0a0f0a',
        'tactical-surface': '#131a13',
        'tactical-elevated': '#1a231a',
        'tactical-accent': '#7fb069',
        'tactical-glow': '#a6c36f',
        'tactical-dim': '#4a6b3a',
        'tactical-text': '#e8ede4',
        'tactical-muted': '#8a9a7c',
        'tactical-data': '#b8d4a0',

        // Legacy compat (still referenced in some components)
        'idf-olive': '#4a6b3a',
        'dark-olive': '#e8ede4',
        'light-sand': '#e8ede4',
        'military-green': '#7fb069',
        'accent-green': '#a6c36f',
      },
      fontFamily: {
        'inter': ['Inter', 'system-ui', 'sans-serif'],
        'mono': ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.4s ease-out forwards',
        'pulse-glow': 'pulseGlow 3s ease-in-out infinite',
        'subtle-pulse': 'subtlePulse 2s ease-in-out infinite',
      },
      backdropBlur: {
        'glass': '20px',
      }
    },
  },
  plugins: [],
}