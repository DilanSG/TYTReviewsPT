/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                // Dark luxury palette
                night: {
                    900: '#0a0a0a',  // Deep black
                    800: '#121212',  // Carbon black
                    700: '#1a1a1a',  // Dark gray
                    600: '#242424',  // Medium dark
                    500: '#2d2d2d',  // Lighter dark
                },
                gold: {
                    50: '#fef9e7',
                    100: '#fdf3d0',
                    200: '#fbe7a1',
                    300: '#f9db72',
                    400: '#d4af37',  // Subtle gold
                    500: '#b8941f',  // Muted gold
                    600: '#9c7a1a',
                    700: '#806015',
                },
                neon: {
                    red: '#ff3366',      // Soft neon red
                    redGlow: '#ff336620', // Red glow overlay
                },
            },
            fontFamily: {
                display: ['Montserrat', 'Poppins', 'sans-serif'],
                sans: ['Inter', 'Open Sans', 'system-ui', 'sans-serif'],
            },
            backgroundImage: {
                'gradient-night': 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 50%, #121212 100%)',
                'gradient-gold': 'linear-gradient(135deg, #d4af37 0%, #b8941f 100%)',
                'gradient-glow': 'radial-gradient(circle at center, rgba(212, 175, 55, 0.1) 0%, transparent 70%)',
            },
            boxShadow: {
                'gold': '0 0 20px rgba(212, 175, 55, 0.15)',
                'gold-lg': '0 0 40px rgba(212, 175, 55, 0.25)',
                'neon': '0 0 15px rgba(255, 51, 102, 0.3)',
                'luxury': '0 8px 32px 0 rgba(0, 0, 0, 0.5)',
            },
            animation: {
                'fade-in': 'fadeIn 0.6s ease-in-out',
                'slide-up': 'slideUp 0.6s ease-out',
                'glow-pulse': 'glowPulse 3s ease-in-out infinite',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                slideUp: {
                    '0%': { transform: 'translateY(30px)', opacity: '0' },
                    '100%': { transform: 'translateY(0)', opacity: '1' },
                },
                glowPulse: {
                    '0%, 100%': { boxShadow: '0 0 20px rgba(212, 175, 55, 0.15)' },
                    '50%': { boxShadow: '0 0 30px rgba(212, 175, 55, 0.25)' },
                },
            },
        },
    },
    plugins: [],
}
