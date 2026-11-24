import { globSync } from 'glob';
import path from 'path';

const htmlFiles = globSync('public_html/**/*.html').reduce((acc, file) => {
  const name = path.relative('public_html', file).replace(/\.html$/, '');
  acc[name] = path.resolve(process.cwd(), file);
  return acc;
}, {});

console.log(htmlFiles);
