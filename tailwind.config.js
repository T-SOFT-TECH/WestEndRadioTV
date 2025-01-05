/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        // Primary Colors
        primary: {
          50: '#EFF6FF',
          100: '#DBEAFE',
          200: '#BFDBFE',
          300: '#93C5FD',  // Light variations
          400: '#60A5FA',  // Your brand light blue
          500: '#3B82F6',
          600: '#2563EB',
          700: '#1D4ED8',
          800: '#1E40AF',
          900: '#1E3A8A',
          950: '#172554',
        },
        // Secondary Colors (Purple)
        secondary: {
          50: '#F5F3FF',
          100: '#EDE9FE',
          200: '#DDD6FE',
          300: '#C4B5FD',
          400: '#A78BFA',
          500: '#8B5CF6',
          600: '#7C3AED',
          700: '#6D28D9',
          800: '#5B21B6',
          900: '#4C1D95',
          950: '#2E1065',
        },
        // Background Colors
        background: {
          dark: '#0F172A',    // Main background
          surface: '#1E293B', // Component background
          card: '#334155',    // Card background
        },
        // Text Colors
        text: {
          primary: '#F8FAFC',
          secondary: '#94A3B8',
          muted: '#64748B',
        },
        // Status Colors
        status: {
          live: '#EF4444',     // Live indicator
          active: '#38BDF8',   // Active state
          success: '#22C55E',  // Success state
          warning: '#F59E0B',  // Warning state
          error: '#DC2626',    // Error state
        }
      }
    },
    plugins: [
      require('tailwindcss-animated'),
      require('tailwind-scrollbar'),
      require('tailwindcss-motion')
    ],
  }
}


