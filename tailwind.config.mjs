/** @type {import('tailwindcss').Config} */
export default {
    content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
    theme: {
        extend: {
            colors: {
                primary: '#b45309', // Deeper warm amber/gold for WCAG AA 4.8:1 contrast
                secondary: '#64748b', // Slate Gray
                dark: '#0f172a', // Deep Slate Navy
                light: '#f8fafc', // Soft Off-White
            },
            fontFamily: {
                sans: ['Lato', 'sans-serif'],
                serif: ['Playfair Display', 'serif'],
            },
        },
    },
    plugins: [],
};
