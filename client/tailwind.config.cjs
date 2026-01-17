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
          'linear-gradient(to right, rgba(148,163,184,0.09) 1px, transparent 1px), linear-gradient(to bottom, rgba(148,163,184,0.09) 1px, transparent 1px)',
        
        // Professional Gradients - Recommended
        'gradient-frosted-glass': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        'gradient-sophisticated-navy': 'linear-gradient(120deg, #1e3c72 0%, #2a5298 50%, #7e22ce 100%)',
        'gradient-minimal-premium': 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
        
        // Professional & Corporate
        'gradient-corporate-blue': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        'gradient-midnight-ocean': 'linear-gradient(120deg, #1e3c72 0%, #2a5298 50%, #7e22ce 100%)',
        'gradient-emerald-finance': 'linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)',
        
        // Clean & Minimal
        'gradient-soft-gray': 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
        'gradient-arctic-white': 'linear-gradient(120deg, #fdfbfb 0%, #ebedee 100%)',
        
        // Luxury & Premium
        'gradient-deep-space': 'linear-gradient(135deg, #434343 0%, #000000 100%)',
        'gradient-rose-gold': 'linear-gradient(135deg, #d4af37 0%, #f7ef8a 50%, #d4af37 100%)',
        
        // Tech & Modern
        'gradient-tech': 'linear-gradient(135deg, #2d3748 0%, #1a202c 100%)',
        'gradient-electric-violet': 'linear-gradient(135deg, #8E2DE2 0%, #4A00E0 100%)',
        
        // Fresh & Energetic
        'gradient-fresh-mint': 'linear-gradient(135deg, #abecd6 0%, #fbed96 100%)',
        'gradient-sunset': 'linear-gradient(135deg, #ff6a00 0%, #ee0979 100%)',
        'gradient-ocean-breeze': 'linear-gradient(135deg, #2E3192 0%, #1BFFFF 100%)',
        
        // Warm & Natural
        'gradient-sunny-morning': 'linear-gradient(135deg, #F6D365 0%, #FDA085 100%)',
        'gradient-forest-emerald': 'linear-gradient(135deg, #134E5E 0%, #71B280 100%)',
        
        // Bold & Creative
        'gradient-cosmic-purple': 'linear-gradient(135deg, #5f2c82 0%, #49a09d 100%)',
        'gradient-crimson-sunset': 'linear-gradient(135deg, #EC008C 0%, #FC6767 100%)',
        
        // Professional Variations
        'gradient-steel-silver': 'linear-gradient(135deg, #BDC3C7 0%, #2C3E50 100%)',
        'gradient-peaceful-lavender': 'linear-gradient(135deg, #E0C3FC 0%, #8EC5FC 100%)'
      },
      boxShadow: {
        'brand-soft': '0 18px 45px rgba(34,197,94,0.25)',
        'brand-blue': '0 16px 40px rgba(59,130,246,0.35)'
      }
    }
  },
  plugins: []
};