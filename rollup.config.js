import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import replace from '@rollup/plugin-replace';
import { terser } from 'rollup-plugin-terser';
import postcss from 'rollup-plugin-postcss';
import babel from '@rollup/plugin-babel';
import { join } from 'path';

const THEME_DIR = 'themes/tlwd';

const entry = (input, output) => ({
  input: join(THEME_DIR, input),
  output: {
    file: join(THEME_DIR, output),
    format: 'iife',
    sourcemap: process.env.NODE_ENV === 'production'
  },
  plugins: [
    replace({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development')
    }),
    resolve(),
    commonjs(),
    babel({
      exclude: 'node_modules/**'
    }),
    postcss(),
    ...process.env.NODE_ENV === 'production' ? [terser()] : []
  ]
});

export default [
  entry('js/app.js', 'source/js/app.js'),
  entry('js/sw.js', 'source/sw.js')
];
