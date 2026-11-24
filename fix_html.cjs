const fs = require('fs');
const glob = require('glob');

const files = glob.sync('public_html/**/*.html');
files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/<script>\s*theme: \{[\s\S]*?\}[\s\S]*?\}[\s\S]*?\}[\s\S]*?\}[\s\S]*?<\/script>/, '');
  content = content.replace(/<script>\s*tailwind\.config[\s\S]*?<\/script>/, '');
  // Just in case it's still there
  fs.writeFileSync(file, content);
});
