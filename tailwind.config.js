/** @type {import('tailwindcss').Config} */
const plugin = require('tailwindcss/plugin');
const palette = require('./src/theme/palette.js');

export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    daisyui: {
        themes: ["light"],
    },
    theme: {
        extend: {
            colors: palette,
            fontFamily: {
                'roboto': ['Roboto', 'sans-serif']
            },
            keyframes: {
                bouncy: {
                    '0%, 100%': { transform: 'translateY(-5px)' },
                    '50%': { transform: 'translateY(5px)' },

                },
                fadeup: {
                    '0%': { transform: 'translate3d(0, 30px, 0)', opacity: 0 },
                    '100%': { transform: 'translate3d(0, 0, 0)', opacity: 1 },
                },
                faderight: {
                    '0%': { transform: 'translate3d(-30px, 0, 0)', opacity: 0 },
                    '100%': { transform: 'translate3d(0, 0, 0)', opacity: 1 },
                },
                fadeleft: {
                    '0%': { transform: 'translate3d(30px, 0, 0)', opacity: 0 },
                    '100%': { transform: 'translate3d(0, 0, 0)', opacity: 1 },
                },
                fadeupSm: {
                    '0%': { transform: 'translate3d(0, 20px, 0)', opacity: 0 },
                    '100%': { transform: 'translate3d(0, 0, 0)', opacity: 1 },
                },
                fadedown: {
                    '0%': { transform: 'translate3d(0, -30px, 0)', opacity: 0 },
                    '100%': { transform: 'translate3d(0, 0, 0)', opacity: 1 },
                },
                fadedownSm: {
                    '0%': { transform: 'translate3d(0, -20px, 0)', opacity: 0 },
                    '100%': { transform: 'translate3d(0, 0, 0)', opacity: 1 },
                },
                zoomOut: {
                    '0%': { transform: 'scale(0%)', opacity: 0 },
                    '100%': { transform: 'scale(100%)', opacity: 1 },
                },
                spin: {
                    '0%': { transform: 'rotate(0deg)' },
                    '100%': { transform: 'rotate(-359deg)' },
                },
                spinRight: {
                    '0%': { transform: 'rotate(0deg)' },
                    '100%': { transform: 'rotate(359deg)' },
                },
            },
            animation: {
                bouncy: 'bouncy 1s ease-in-out infinite',
                fadeup: 'fadeup 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                faderight: 'faderight 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                fadeleft: 'fadeleft 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                fadeupSm: 'fadeupSm 0.15s',
                zoomOut: 'zoomOut 0.3s',
                fadedown: 'fadedown 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                fadedownSm: 'fadedownSm 0.15s',
                spin: 'spin 0.8s infinite',
                spinRight: 'spinRight 0.8s infinite'
            },
            screens: {
                'responsive-nav': '992px',
                'sm': '600px',
            },
            boxShadow: {
                100: '0px 4px 30px',
                200: '0px 10px 30px',
            },
            dropShadow: {
                100: '0px 4px 30px',
                200: '0px 10px 30px',
            },
            opacity: {
                15: "0.15"
            }
        },
    },
    variants: {
        extend: {
            borderStyle: ['important', 'hover', 'last'],
            borderColor: ['important', 'hover', 'last'],
            borderWidth: ['important', 'hover', 'last'],
            borderRadius: ['important', 'hover', 'last'],
            textColor: ['important', 'hover', 'first', 'last'],
            height: ['important', 'hover', 'first', 'last'],
            width: ['important', 'hover', 'first', 'last'],
            backgroundColor: ['important', 'hover', 'first', 'last'],
            padding: ['important', 'hover', 'first', 'last'],
            position: ['important', 'hover', 'first', 'last'],
            display: ['important', 'hover', 'first', 'last'],
            cursor: ['important', 'hover', 'first', 'last'],
            pointerEvents: ['important', 'hover', 'first', 'last'],
            zIndex: ['important', 'hover', 'first', 'last'],
            maxHeight: ['important', 'hover', 'first', 'last'],
            overflow: ['important', 'hover', 'first', 'last'],
            margin: ['important', 'hover', 'first', 'last'],
        }
    },
    plugins: [
        plugin(function ({ addVariant }) {
            addVariant('important', ({ container }) => {
                container.walkRules(rule => {
                    rule.selector = `.\\!${rule.selector.slice(1)}`
                    rule.walkDecls(decl => {
                        decl.important = true
                    })
                })
            })
        }),
        plugin(function ({ addVariant }) {
            addVariant('child', '& > *');
            addVariant('child-hover', '& > *:hover');
        }),
        require("daisyui")
    ],
    corePlugins: {
        preflight: false,
    }
}