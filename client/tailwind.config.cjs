/* Tailwind Configuration
 * Defines WealthWise color palette and shadcn-like design tokens.
 */

module.exports = {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['system-ui', 'ui-sans-serif', 'sans-serif']
      },
      colors: {
        brand: {
          DEFAULT: '#22C55E',
          foreground: '#0B1921',
          soft: '#DCFCE7'
        },
        brandBlue: {
          DEFAULT: '#3B82F6',
          soft: '#DBEAFE'
        },
        background: '#020617', // deep navy
        surface: '#020617',
        card: '#020617',
        border: '#1E293B'
      },
      backgroundImage: {
        'hero-glow':
          'radial-gradient(circle at top left, rgba(59,130,246,0.4), transparent 60%), radial-gradient(circle at bottom right, rgba(34,197,94,0.35), transparent 55%)',
        'grid-pattern':
          'linear-gradient(to right, rgba(148,163,184,0.09) 1px, transparent 1px), linear-gradient(to bottom, rgba(148,163,184,0.09) 1px, transparent 1px)'
      },
      boxShadow: {
        'brand-soft': '0 18px 45px rgba(34,197,94,0.25)',
        'brand-blue': '0 16px 40px rgba(59,130,246,0.35)'
      }
    }
  },
  plugins: []
};