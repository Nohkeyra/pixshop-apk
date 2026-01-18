

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./services/**/*.{js,ts,jsx,tsx}",
    "./src/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        matrix: '#00FF9D', 
        primary: '#F8130D', // Harmonized with index.css
        secondary: '#FB4606', // Harmonized with index.css
        highlight: '#FCF721', // Harmonized with index.css
        lightning: '#D8B4FE',
        surface: {
          deep: '#030303',    
          panel: 'rgba(5, 5, 5, 0.95)',   
          grid: '#0a0a0a',    
          card: 'rgba(255, 255, 255, 0.03)', 
          elevated: 'rgba(255, 255, 255, 0.08)',
          hover: 'rgba(0, 255, 157, 0.12)',
          border: 'rgba(255, 255, 255, 0.15)',
        },
        flux: '#FF2D55',   
        vector: '#00FFCC', 
        filter: '#00F0FF', 
        type: '#FF00FF',   
        dna: '#A855F7',    
        adjust: '#FFCC00', 
        buff: '#3B82F6',   
        veo: '#00FF9D' 
      },
      spacing: {
        'safe-top': 'env(safe-area-inset-top)',
        'safe-bottom': 'env(safe-area-inset-bottom)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Koulen', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
        marker: ['"Rubik Wet Paint"', 'cursive'],
      },
      animation: {
        'fade-in': 'fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'pulse-glow': 'pulseGlow 2s infinite ease-in-out',
        'lightning-strike': 'lightningStrike 0.12s cubic-bezier(0.19, 1, 0.22, 1) forwards',
        'boot-line': 'bootLine 2s ease-in-out forwards',
        'glitch': 'glitch 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94) both infinite',
      },
      keyframes: {
        fadeIn: { '0%': { opacity: '0', transform: 'translateY(15px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        pulseGlow: { 
          '0%, 100%': { filter: 'brightness(1) contrast(1)', opacity: '1' }, 
          '50%': { filter: 'brightness(1.8) contrast(1.2)', opacity: '0.8' } 
        },
        lightningStrike: {
          '0%': { opacity: '0', filter: 'brightness(12) blur(8px)', transform: 'scale(0.6) skewX(-15deg)' },
          '10%': { opacity: '1', filter: 'brightness(6) blur(0px)', transform: 'scale(1.1) skewX(0deg)' },
          '100%': { opacity: '0', filter: 'brightness(1) blur(12px)', transform: 'scale(1.4) skewX(15deg)' },
        },
        bootLine: {
          '0%': { width: '0%', opacity: '0' },
          '100%': { width: '100%', opacity: '1' }
        },
        glitch: {
          '0%': { transform: 'translate(0)', textShadow: 'none' },
          '20%': { transform: 'translate(-2px, 2px)', textShadow: '2px 0 #ff00c1, -2px 0 #00fff9' },
          '40%': { transform: 'translate(-2px, -2px)', textShadow: '-2px 0 #ff00c1, 2px 0 #00fff9' },
          '60%': { transform: 'translate(2px, 2px)', textShadow: '2px 0 #ff00c1, -2px 0 #00fff9' },
          '80%': { transform: 'translate(2px, -2px)', textShadow: '-2px 0 #ff00c1, 2px 0 #00fff9' },
          '100%': { transform: 'translate(0)' }
        }
      },
      boxShadow: {
        'neon-matrix': '0 0 10px #00FF9D, 0 0 20px #00FF9D, 0 0 40px #00FF9D',
        'neon-flux': '0 0 10px #FF2D55, 0 0 20px #FF2D55, 0 0 40px #FF2D55',
        'neon-purple': '0 0 15px #A855F7, 0 0 30px #A855F7, 0 0 60px #A855F7',
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
      }
    },
  },
  plugins: [],
}