/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      screens: {
        'xs': '480px',
      },
      colors: {
        // Extended blue palette for the health portal
        blue: {
          50:  '#eff6ff',
          100: '#dbeafe',
          150: '#c8dcfd',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          650: '#1d57e3',
          700: '#1d4ed8',
          750: '#1a43c4',
          800: '#1e40af',
          900: '#1e3a8a',
          950: '#172554',
        },
        sky: {
          50:  '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease-out forwards',
        'float': 'floatOrb 6s ease-in-out infinite',
        'pulse-glow': 'pulseGlow 2s infinite',
        'shimmer': 'shimmer 2s infinite linear',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        floatOrb: {
          '0%, 100%': { transform: 'translateY(0px) scale(1)' },
          '50%': { transform: 'translateY(-20px) scale(1.05)' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(59, 130, 246, 0.4)' },
          '50%': { boxShadow: '0 0 0 12px rgba(59, 130, 246, 0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% center' },
          '100%': { backgroundPosition: '200% center' },
        },
      },
      boxShadow: {
        'blue-sm': '0 2px 8px rgba(59, 130, 246, 0.15)',
        'blue-md': '0 8px 30px rgba(59, 130, 246, 0.12)',
        'blue-lg': '0 20px 60px rgba(59, 130, 246, 0.15)',
        'blue-xl': '0 30px 80px rgba(59, 130, 246, 0.20)',
      },
      backgroundImage: {
        'gradient-blue-white': 'linear-gradient(135deg, #eff6ff 0%, #ffffff 50%, #f0f9ff 100%)',
        'gradient-blue-vibrant': 'linear-gradient(135deg, #2563eb 0%, #0ea5e9 100%)',
        'gradient-blue-deep': 'linear-gradient(135deg, #1e40af 0%, #1d4ed8 50%, #312e81 100%)',
      },
    },
  },
  plugins: [],
}
