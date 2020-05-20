module.exports = {
  plugins: [
    require('postcss-import'),
    require('tailwindcss'),
    require('postcss-url')({
      url: 'inline'
    }),
    require('postcss-nested'),
    require('autoprefixer'),
    ...process.env.NODE_ENV === 'production' ? [
      require('postcss-svgo'),
      require('cssnano')({
        preset: 'default'
      })
    ] : []
  ]
};
