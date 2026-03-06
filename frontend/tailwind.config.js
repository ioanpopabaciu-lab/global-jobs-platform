/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: ["class"],
    content: [
        "./src/**/*.{js,jsx,ts,tsx}",
        "./public/index.html"
    ],
    theme: {
        extend: {
            /* ===== GJC FONTS ===== */
            fontFamily: {
                heading: ['Sora', 'sans-serif'],
                body: ['Inter', 'sans-serif'],
                sora: ['Sora', 'sans-serif'],
                inter: ['Inter', 'sans-serif'],
            },
            
            /* ===== GJC COLORS ===== */
            colors: {
                /* Brand Colors */
                gjc: {
                    primary: '#1E3A8A',      /* Navy - Titluri, header */
                    cta: '#10B981',          /* Verde - CTA principal */
                    'cta-hover': '#059669',  /* Verde închis - hover */
                    'text-dark': '#1F2937',  /* Text principal */
                    'text-grey': '#6B7280',  /* Text secundar */
                    background: '#F9FAFB',   /* Fundal pagini */
                    white: '#FFFFFF',        /* Carduri, secțiuni */
                    accent: '#F97316',       /* Portocaliu - highlight */
                    border: '#E5E7EB',       /* Borduri subtile */
                    'navy-light': '#EFF6FF', /* Fundal secțiuni albastre */
                },
                
                /* Navy palette */
                navy: {
                    50: '#EFF6FF',
                    100: '#DBEAFE',
                    200: '#BFDBFE',
                    300: '#93C5FD',
                    400: '#60A5FA',
                    500: '#3B82F6',
                    600: '#2563EB',
                    700: '#1D4ED8',
                    800: '#1E40AF',
                    900: '#1E3A8A',
                },
                
                /* Green palette for CTA */
                emerald: {
                    50: '#ECFDF5',
                    100: '#D1FAE5',
                    200: '#A7F3D0',
                    300: '#6EE7B7',
                    400: '#34D399',
                    500: '#10B981',
                    600: '#059669',
                    700: '#047857',
                    800: '#065F46',
                    900: '#064E3B',
                },
                
                /* Shadcn/UI compatible */
                background: 'hsl(var(--background))',
                foreground: 'hsl(var(--foreground))',
                card: {
                    DEFAULT: 'hsl(var(--card))',
                    foreground: 'hsl(var(--card-foreground))'
                },
                popover: {
                    DEFAULT: 'hsl(var(--popover))',
                    foreground: 'hsl(var(--popover-foreground))'
                },
                primary: {
                    DEFAULT: 'hsl(var(--primary))',
                    foreground: 'hsl(var(--primary-foreground))'
                },
                secondary: {
                    DEFAULT: 'hsl(var(--secondary))',
                    foreground: 'hsl(var(--secondary-foreground))'
                },
                muted: {
                    DEFAULT: 'hsl(var(--muted))',
                    foreground: 'hsl(var(--muted-foreground))'
                },
                accent: {
                    DEFAULT: 'hsl(var(--accent))',
                    foreground: 'hsl(var(--accent-foreground))'
                },
                destructive: {
                    DEFAULT: 'hsl(var(--destructive))',
                    foreground: 'hsl(var(--destructive-foreground))'
                },
                border: 'hsl(var(--border))',
                input: 'hsl(var(--input))',
                ring: 'hsl(var(--ring))',
            },
            
            /* ===== GJC TYPOGRAPHY ===== */
            fontSize: {
                'h1': ['56px', { lineHeight: '1.15', fontWeight: '700' }],
                'h2': ['40px', { lineHeight: '1.2', fontWeight: '700' }],
                'h3': ['28px', { lineHeight: '1.3', fontWeight: '600' }],
                'h4': ['20px', { lineHeight: '1.4', fontWeight: '600' }],
                'body-lg': ['18px', { lineHeight: '1.7', fontWeight: '400' }],
                'body': ['16px', { lineHeight: '1.6', fontWeight: '400' }],
                'small': ['14px', { lineHeight: '1.5', fontWeight: '400' }],
                'caption': ['12px', { lineHeight: '1.4', fontWeight: '400' }],
            },
            
            /* ===== GJC SPACING (8px Grid) ===== */
            spacing: {
                'xs': '8px',
                'sm': '16px',
                'md': '24px',
                'lg': '32px',
                'xl': '48px',
                '2xl': '64px',
                '3xl': '96px',
            },
            
            /* ===== GJC SHADOWS ===== */
            boxShadow: {
                'card': '0 1px 3px rgba(0, 0, 0, 0.1)',
                'card-hover': '0 8px 25px rgba(0, 0, 0, 0.12)',
                'modal': '0 20px 60px rgba(0, 0, 0, 0.15)',
                'button': '0 4px 14px rgba(16, 185, 129, 0.35)',
                'button-navy': '0 4px 14px rgba(30, 58, 138, 0.25)',
            },
            
            /* ===== BORDER RADIUS ===== */
            borderRadius: {
                'lg': 'var(--radius)',
                'md': 'calc(var(--radius) - 2px)',
                'sm': 'calc(var(--radius) - 4px)',
                'button': '8px',
                'card': '12px',
            },
            
            /* ===== ANIMATIONS ===== */
            keyframes: {
                'accordion-down': {
                    from: { height: '0' },
                    to: { height: 'var(--radix-accordion-content-height)' }
                },
                'accordion-up': {
                    from: { height: 'var(--radix-accordion-content-height)' },
                    to: { height: '0' }
                },
                'slide-up': {
                    from: { opacity: '0', transform: 'translateY(20px)' },
                    to: { opacity: '1', transform: 'translateY(0)' }
                },
                'slide-down': {
                    from: { opacity: '0', transform: 'translateY(-20px)' },
                    to: { opacity: '1', transform: 'translateY(0)' }
                },
                'slide-left': {
                    from: { opacity: '0', transform: 'translateX(-20px)' },
                    to: { opacity: '1', transform: 'translateX(0)' }
                },
                'slide-right': {
                    from: { opacity: '0', transform: 'translateX(20px)' },
                    to: { opacity: '1', transform: 'translateX(0)' }
                },
                'fade-in': {
                    from: { opacity: '0' },
                    to: { opacity: '1' }
                },
                'scale-in': {
                    from: { opacity: '0', transform: 'scale(0.95)' },
                    to: { opacity: '1', transform: 'scale(1)' }
                },
                'pulse-glow': {
                    '0%, 100%': { boxShadow: '0 0 0 0 rgba(16, 185, 129, 0.4)' },
                    '50%': { boxShadow: '0 0 0 12px rgba(16, 185, 129, 0)' }
                }
            },
            animation: {
                'accordion-down': 'accordion-down 0.2s ease-out',
                'accordion-up': 'accordion-up 0.2s ease-out',
                'slide-up': 'slide-up 0.5s ease-out forwards',
                'slide-down': 'slide-down 0.5s ease-out forwards',
                'slide-left': 'slide-left 0.5s ease-out forwards',
                'slide-right': 'slide-right 0.5s ease-out forwards',
                'fade-in': 'fade-in 0.5s ease-out forwards',
                'scale-in': 'scale-in 0.3s ease-out forwards',
                'pulse-glow': 'pulse-glow 2s infinite'
            },
            
            /* ===== TRANSITIONS ===== */
            transitionDuration: {
                'fast': '150ms',
                'normal': '200ms',
                'slow': '300ms',
            }
        }
    },
    plugins: [require("tailwindcss-animate")],
};
