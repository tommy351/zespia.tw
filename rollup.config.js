import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import replace from '@rollup/plugin-replace';
import { terser } from 'rollup-plugin-terser';
import postcss from 'rollup-plugin-postcss';
import babel from '@rollup/plugin-babel';
import { join } from 'path';

const THEME_DIR = 'themes/tlwd';

const entry = (input, output) => ({
  input,
  output: {
    ...output,
    sourcemap: process.env.NODE_ENV === 'production',
    compact: true
  },
  preserveEntrySignatures: 'strict',
  plugins: [
    replace({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development')
    }),
    resolve(),
    commonjs(),
    babel({
      exclude: 'node_modules/**',
      babelHelpers: 'bundled'
    }),
    postcss(),
    ...process.env.NODE_ENV === 'production' ? [terser()] : []
  ]
});

export default [
  entry(join(THEME_DIR, 'js/app.js'), {
    dir: join(THEME_DIR, 'source/js'),
    chunkFileNames: 'chunks/[name]-[hash].js',
    format: 'es'
  }),
  entry(join(THEME_DIR, 'js/sw.js'), {
    file: join(THEME_DIR, 'source/sw.js'),
    format: 'iife'
  })
];
