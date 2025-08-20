/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './App.{js,jsx,ts,tsx}',
    './src/**/*.{js,jsx,ts,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        primary: '#FFFFFF',
        text: '#000000',
        accent: '#FE0100',
        background: '#F2F2F7'
      },
      borderRadius: {
        card: '20px'
      },
      fontFamily: {
        heading: ['Montserrat_700Bold', 'System'],
        body: ['Inter_400Regular', 'System']
      },
      boxShadow: {
        card: '0 2px 8px rgba(0,0,0,0.08)'
      }
    }
  },
  plugins: []
}