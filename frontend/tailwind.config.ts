import type { Config } from 'tailwindcss'

// Editorial palette: warm paper background, near-black ink, hairline warm
// borders, and a single deep-blue accent. Semantic colors (amber warnings,
// emerald reviewed, impact segments) come from the default palette.
const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        serif: ['Newsreader', 'Georgia', 'serif'],
      },
      colors: {
        border: 'hsl(38 14% 86%)',
        background: 'hsl(42 30% 97%)',
        foreground: 'hsl(24 12% 11%)',
        muted: {
          DEFAULT: 'hsl(40 22% 92%)',
          foreground: 'hsl(28 8% 42%)',
        },
        primary: {
          DEFAULT: 'hsl(24 12% 11%)',
          foreground: 'hsl(42 30% 97%)',
        },
        accent: {
          DEFAULT: 'hsl(221 65% 40%)',
          foreground: 'hsl(0 0% 100%)',
        },
      },
      borderRadius: {
        lg: '0.5rem',
        md: '0.375rem',
        sm: '0.25rem',
      },
    },
  },
  plugins: [],
}

export default config
