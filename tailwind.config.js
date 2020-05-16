'use strict';

const { colors, spacing } = require('tailwindcss/defaultTheme');

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
    },
    padding: {
      ...spacing,
      '3/4': `${3 / 4 * 100}%`,
      '9/16': `${9 / 16 * 100}%`
    }
  },
  variants: {},
  plugins: []
};
