/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      // ── Color System — ESTIMATED from §3.1 ──────────────────────────────────
      // Values flagged /* ESTIMATED */ — correct against real Figma design tokens
      colors: {
        primary: {
          DEFAULT: 'var(--color-primary)',
          hover:   'var(--color-primary-hover)',
          light:   '#2A3D7A',
        },
        accent: {
          teal:    'var(--color-accent-teal)',
          'teal-light': '#E6F6F2',
        },
        critical: {
          DEFAULT: 'var(--color-critical)',
          light:   '#FEF2F2',
          border:  '#FECACA',
        },
        warning: {
          DEFAULT: 'var(--color-warning)',
          light:   '#FFFBEB',
          border:  '#FDE68A',
        },
        info: {
          DEFAULT: 'var(--color-info)',
          light:   '#EEF2FF',
        },
        ai: {
          bg:     'var(--color-ai-bg)',
          text:   'var(--color-ai-text)',
          border: '#C7D2FE',
        },
        surface:     'var(--color-surface)',
        background:  'var(--color-background)',
        border:      'var(--color-border)',
        'text-primary':   'var(--color-text-primary)',
        'text-secondary': 'var(--color-text-secondary)',
        'text-on-primary': '#FFFFFF',
      },

      // ── Typography — §3.2 ──────────────────────────────────────────────────
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'], /* IMPLEMENTATION DECISION */
      },

      // ── Spacing — §3.3 8px grid ────────────────────────────────────────────
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
      },

      // ── Border Radius — §3.4 ───────────────────────────────────────────────
      borderRadius: {
        card:   '14px', /* ESTIMATED */
        button: '9px',  /* ESTIMATED */
        input:  '8px',  /* ESTIMATED */
        pill:   '999px',
      },

      // ── Box Shadow — §3.5 ──────────────────────────────────────────────────
      boxShadow: {
        card:  '0 1px 2px rgba(16,24,40,0.04), 0 1px 3px rgba(16,24,40,0.06)', /* ESTIMATED */
        modal: '0 20px 60px rgba(16,24,40,0.14)',
        'card-hover': '0 4px 12px rgba(16,24,40,0.10)',
      },

      // ── Font Sizes — §3.2 ──────────────────────────────────────────────────
      fontSize: {
        'display': ['30px', { lineHeight: '1.2', fontWeight: '700' }],
        'h2':      ['22px', { lineHeight: '1.3', fontWeight: '700' }],
        'stat':    ['32px', { lineHeight: '1.1', fontWeight: '700' }],
        'eyebrow': ['11px', { lineHeight: '1.4', fontWeight: '600', letterSpacing: '0.06em' }],
      },

      // ── Animation ──────────────────────────────────────────────────────────
      keyframes: {
        'fade-in': { from: { opacity: '0', transform: 'translateY(8px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        'slide-up': { from: { opacity: '0', transform: 'translateY(20px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        'pulse-ring': { '0%,100%': { opacity: '1' }, '50%': { opacity: '0.6' } },
      },
      animation: {
        'fade-in': 'fade-in 0.25s ease-out',
        'slide-up': 'slide-up 0.35s ease-out',
        'pulse-ring': 'pulse-ring 2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
