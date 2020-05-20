module.exports = {
  plugins: [
    require('postcss-import'),
    require('tailwindcss'),
    require('postcss-url')({
      url: 'inline',
      optimizeSvgEncode: true
    }),
    require('postcss-nested'),
    require('autoprefixer'),
    ...process.env.NODE_ENV === 'production' ? [
      require('cssnano')({
        preset: 'default'
      })
    ] : []
  ]
};
