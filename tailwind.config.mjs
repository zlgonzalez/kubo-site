/** @type {import('tailwindcss').Config} */
export default {
    content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
    theme: {
        extend: {
            colors: {
                primary: '#f4b214', // Example from existing design (yellow)
                secondary: '#6c757d',
                dark: '#343a40',
                light: '#f8f9fa',
            },
            fontFamily: {
                sans: ['Raleway', 'sans-serif'],
            },
        },
    },
    plugins: [],
};
