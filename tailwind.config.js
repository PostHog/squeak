module.exports = {
    content: ['./pages/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}', './layout/**/*.{js,ts,jsx,tsx}'],
    theme: {
        extend: {
            colors: {
                light: '#EEEFE9',
                'accent-light': '#F54E00',
                'primary-light': '#404040',
                'gray-light': '#aaa',
                white: '#fff',
                red: '#F54E00',
            },
        },
    },
    plugins: [require('@tailwindcss/forms')],
}
