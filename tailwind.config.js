const { fontFamily } = require("tailwindcss/defaultTheme")

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
  	container: {
  		center: true,
  		padding: '2rem',
  		screens: {
  			'2xl': '1400px'
  		}
  	},
  	extend: {
  		colors: {
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			'brand-red': 'var(--color-brand-red)',
  			'brand-gold': 'var(--color-brand-gold)',
  			'brand-red-dark': 'var(--color-brand-red-dark)',
  			'brand-gold-light': 'var(--color-brand-gold-light)',
  			'primary-main': 'var(--color-primary-main)',
  			'primary-dark': 'var(--color-primary-dark)',
  			'primary-light': 'var(--color-primary-light)',
  			'text-primary': 'var(--color-text-primary)',
  			'text-secondary': 'var(--color-text-secondary)',
  			'text-muted': 'var(--color-text-muted)',
  			surface: 'var(--color-surface)',
  			success: 'var(--color-success)',
  			error: 'var(--color-error)',
  			warning: 'var(--color-warning)',
  			info: 'var(--color-info)',
  			sidebar: {
  				DEFAULT: 'hsl(var(--sidebar-background))',
  				foreground: 'hsl(var(--sidebar-foreground))',
  				primary: 'hsl(var(--sidebar-primary))',
  				'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
  				accent: 'hsl(var(--sidebar-accent))',
  				'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
  				border: 'hsl(var(--sidebar-border))',
  				ring: 'hsl(var(--sidebar-ring))'
  			},
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			}
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
  		fontFamily: {
  			sans: [
  				'Inter',
                    ...fontFamily.sans
                ],
  			mono: [
  				'JetBrains Mono',
                    ...fontFamily.mono
                ]
  		},
  		fontSize: {
  			display: [
  				'clamp(2rem, 4vw, 2.5rem)',
  				{
  					lineHeight: '1.2',
  					letterSpacing: '-0.025em'
  				}
  			],
  			h1: [
  				'clamp(1.5rem, 3vw, 2rem)',
  				{
  					lineHeight: '1.25',
  					fontWeight: '700'
  				}
  			],
  			h2: [
  				'clamp(1.25rem, 2.5vw, 1.5rem)',
  				{
  					lineHeight: '1.3',
  					fontWeight: '600'
  				}
  			],
  			h3: [
  				'clamp(1.125rem, 2vw, 1.25rem)',
  				{
  					lineHeight: '1.4',
  					fontWeight: '600'
  				}
  			]
  		},
  		spacing: {
  			'18': '4.5rem',
  			'88': '22rem'
  		},
  		animation: {
  			'fade-in': 'fadeIn 0.2s ease-in-out',
  			'slide-up': 'slideUp 0.3s ease-out',
  			'pulse-gentle': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
  			'accordion-down': 'accordion-down 0.2s ease-out',
  			'accordion-up': 'accordion-up 0.2s ease-out'
  		},
  		keyframes: {
  			fadeIn: {
  				'0%': {
  					opacity: '0'
  				},
  				'100%': {
  					opacity: '1'
  				}
  			},
  			slideUp: {
  				'0%': {
  					transform: 'translateY(10px)',
  					opacity: '0'
  				},
  				'100%': {
  					transform: 'translateY(0)',
  					opacity: '1'
  				}
  			},
  			'accordion-down': {
  				from: {
  					height: '0'
  				},
  				to: {
  					height: 'var(--radix-accordion-content-height)'
  				}
  			},
  			'accordion-up': {
  				from: {
  					height: 'var(--radix-accordion-content-height)'
  				},
  				to: {
  					height: '0'
  				}
  			}
  		},
  		boxShadow: {
  			soft: 'var(--shadow-sm)',
  			medium: 'var(--shadow-md)',
  			large: 'var(--shadow-lg)',
  			focus: 'var(--shadow-focus)'
  		},
  		transitionTimingFunction: {
  			'ease-out-smooth': 'cubic-bezier(0.215, 0.61, 0.355, 1)',
  			'ease-in-out-smooth': 'cubic-bezier(0.645, 0.045, 0.355, 1)',
  			spring: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)'
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
}