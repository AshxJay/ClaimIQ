import type { Config } from 'tailwindcss'
import forms from '@tailwindcss/forms'
import typography from '@tailwindcss/typography'

const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        bg: {
          deep: '#F8FAFC',
          surface: '#FFFFFF',
          card: '#FFFFFF',
          elevated: '#FFFFFF',
        },
        brand: {
          blue: '#3B82F6',
          'blue-light': '#60A5FA',
          teal: '#14B8A6',
        },
        status: {
          success: '#10B981',
          warning: '#F59E0B',
          danger: '#EF4444',
          info: '#3B82F6',
        },
        text: {
          primary: '#0F172A',
          secondary: '#334155',
          muted: '#64748B',
        },
        border: {
          subtle: 'rgba(0,0,0,0.06)',
          DEFAULT: 'rgba(0,0,0,0.08)',
          strong: 'rgba(0,0,0,0.12)',
        },
      },
      fontFamily: {
        display: ['Syne', 'sans-serif'],
        sans: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '0.875rem' }],
      },
      boxShadow: {
        card: '0 0 0 1px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.05)',
        elevated: '0 0 0 1px rgba(0,0,0,0.06), 0 8px 24px rgba(0,0,0,0.08)',
        floating: '0 0 0 1px rgba(59,130,246,0.1), 0 20px 40px rgba(0,0,0,0.1)',
        glow: '0 0 20px rgba(59,130,246,0.3)',
        'glow-teal': '0 0 20px rgba(20,184,166,0.3)',
        'glow-success': '0 0 20px rgba(16,185,129,0.3)',
      },
      borderRadius: {
        xl: '0.75rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      spacing: {
        18: '4.5rem',
        22: '5.5rem',
      },
      animation: {
        shimmer: 'shimmer 2s linear infinite',
        'spin-slow': 'spin 3s linear infinite',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'count-up': 'countUp 1s ease-out forwards',
        float: 'float 6s ease-in-out infinite',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: '1', boxShadow: '0 0 8px rgba(59,130,246,0.4)' },
          '50%': { opacity: '0.8', boxShadow: '0 0 20px rgba(59,130,246,0.7)' },
        },
        countUp: {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-mesh': 'linear-gradient(135deg, #F8FAFC 0%, #FFFFFF 50%, #F1F5F9 100%)',
        shimmer: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.6) 50%, transparent 100%)',
      },
      transitionTimingFunction: {
        spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
    },
  },
  plugins: [forms, typography],
}

export default config
