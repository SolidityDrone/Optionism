import type { Config } from 'tailwindcss'

const config: Config = {
  theme: {
    extend: {
      colors: {
        tv: '#131722',
        head: '#182030',
      },
    },
  },
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  plugins: [require("@tailwindcss/typography"), require("daisyui")],
  daisyui: {
    themes: ['dark'],
  },
}

export default config
