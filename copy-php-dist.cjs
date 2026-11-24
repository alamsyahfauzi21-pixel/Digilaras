const fs = require('fs');
const path = require('path');

function copyFile(src, dest) {
    try {
        const destDir = path.dirname(dest);
        if (!fs.existsSync(destDir)) {
            fs.mkdirSync(destDir, { recursive: true });
        }
        fs.copyFileSync(src, dest);
        console.log(`Successfully copied: ${src} -> ${dest}`);
    } catch (err) {
        console.error(`Failed to copy: ${src} -> ${dest}`, err);
    }
}

console.log('Copying PHP files and data files to dist/ for Hostinger deployment...');

// Copy api.php and .htaccess to dist
copyFile(path.join(__dirname, 'public_html', 'api.php'), path.join(__dirname, 'dist', 'api.php'));
copyFile(path.join(__dirname, 'public_html', '.htaccess'), path.join(__dirname, 'dist', '.htaccess'));

// Copy artikel/baca.php to dist
copyFile(path.join(__dirname, 'public_html', 'artikel', 'baca.php'), path.join(__dirname, 'dist', 'artikel', 'baca.php'));

// Copy data/articles.json to dist/data
copyFile(path.join(__dirname, 'data', 'articles.json'), path.join(__dirname, 'dist', 'data', 'articles.json'));

console.log('Finished copying deployment assets.');
