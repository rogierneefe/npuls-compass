import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        npuls: {
          orange: '#E87722',
          'orange-light': '#FFF3E8',
          'orange-dark': '#C5621A',
        },
      },
    },
  },
  plugins: [],
}

export default config
