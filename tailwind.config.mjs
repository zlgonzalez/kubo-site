/** @type {import('tailwindcss').Config} */
export default {
    content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
    theme: {
        extend: {
            colors: {
                primary: '#b45309', // Deeper amber for accessibility contrast (minimum 4.5:1)
                secondary: '#6c757d',
                dark: '#343a40',
                light: '#f8f9fa',
            },
            fontFamily: {
                sans: ['Lato', 'sans-serif'],
                serif: ['Playfair Display', 'serif'],
            },
        },
    },
    plugins: [],
};
