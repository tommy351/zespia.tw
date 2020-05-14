'use strict';

const { colors } = require('tailwindcss/defaultTheme');

module.exports = {
  purge: [
    'themes/tlwd/layout/**/*.swig'
  ],
  theme: {
    fontFamily: {
      logo: ['Major Mono Display', 'monospace'],
      mono: ['Inconsolata', 'monospace']
    },
    colors: {
      ...colors,
      accent: colors.indigo[400],
      content: colors.gray[200],
      background: colors.gray[900]
    }
  },
  variants: {},
  plugins: []
};
