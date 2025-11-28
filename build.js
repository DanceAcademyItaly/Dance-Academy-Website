const fs = require('fs');
const path = require('path');
const { minify } = require('terser');
const csso = require('csso');

console.log('🚀 Starting build process...\n');

// ============================================
// CONFIGURATION
// ============================================

const JS_SRC = './js';
const JS_DIST = './js/dist';
const CSS_SRC = './css';
const CSS_DIST = './css/dist';
const DIST_DIR = './dist';

// ============================================
// SETUP
// ============================================

// Create dist directories
if (!fs.existsSync(JS_DIST)) fs.mkdirSync(JS_DIST, { recursive: true });
if (!fs.existsSync(CSS_DIST)) fs.mkdirSync(CSS_DIST, { recursive: true });
if (!fs.existsSync(DIST_DIR)) fs.mkdirSync(DIST_DIR, { recursive: true });

// ============================================
// MINIFY JAVASCRIPT
// ============================================

console.log('📦 Minifying JavaScript files...');
const jsFiles = fs.readdirSync(JS_SRC).filter(f => f.endsWith('.js'));

let jsPromises = [];

for (const file of jsFiles) {
    const srcPath = path.join(JS_SRC, file);
    const destPath = path.join(JS_DIST, file);
    const code = fs.readFileSync(srcPath, 'utf8');

    const promise = minify(code, {
        module: true,
        compress: {
            dead_code: true,
            drop_console: false, // Keep console.error and console.warn
            passes: 2
        },
        mangle: {
            toplevel: false // Preserve exports
        }
    }).then(result => {
        fs.writeFileSync(destPath, result.code);
        const originalSize = (code.length / 1024).toFixed(2);
        const minifiedSize = (result.code.length / 1024).toFixed(2);
        const savings = ((1 - result.code.length / code.length) * 100).toFixed(1);
        console.log(`  ✓ ${file}: ${originalSize}KB → ${minifiedSize}KB (${savings}% smaller)`);
    }).catch(err => {
        console.error(`  ✗ ${file}: Error - ${err.message}`);
    });

    jsPromises.push(promise);
}

// Minify form-handler.js (root level)
console.log('\n📦 Minifying form-handler.js...');
if (fs.existsSync('form-handler.js')) {
    const formHandlerCode = fs.readFileSync('form-handler.js', 'utf8');

    const formHandlerPromise = minify(formHandlerCode, {
        compress: {
            dead_code: true,
            drop_console: false,
            passes: 2
        },
        mangle: true
    }).then(result => {
        fs.writeFileSync('./dist/form-handler.js', result.code);
        const originalSize = (formHandlerCode.length / 1024).toFixed(2);
        const minifiedSize = (result.code.length / 1024).toFixed(2);
        const savings = ((1 - result.code.length / formHandlerCode.length) * 100).toFixed(1);
        console.log(`  ✓ form-handler.js: ${originalSize}KB → ${minifiedSize}KB (${savings}% smaller)`);
    }).catch(err => {
        console.error(`  ✗ form-handler.js: Error - ${err.message}`);
    });

    jsPromises.push(formHandlerPromise);
}

// ============================================
// MINIFY CSS
// ============================================

console.log('\n📦 Minifying CSS files...');
const cssFiles = fs.readdirSync(CSS_SRC).filter(f => f.endsWith('.css'));

for (const file of cssFiles) {
    const srcPath = path.join(CSS_SRC, file);
    const destPath = path.join(CSS_DIST, file);
    const code = fs.readFileSync(srcPath, 'utf8');

    try {
        const result = csso.minify(code);
        fs.writeFileSync(destPath, result.css);

        const originalSize = (code.length / 1024).toFixed(2);
        const minifiedSize = (result.css.length / 1024).toFixed(2);
        const savings = ((1 - result.css.length / code.length) * 100).toFixed(1);
        console.log(`  ✓ ${file}: ${originalSize}KB → ${minifiedSize}KB (${savings}% smaller)`);
    } catch (err) {
        console.error(`  ✗ ${file}: Error - ${err.message}`);
    }
}

// ============================================
// CREATE PRODUCTION HTML
// ============================================

Promise.all(jsPromises).then(() => {
    console.log('\n📄 Creating index.prod.html...');
    let html = fs.readFileSync('index.html', 'utf8');

    // Update CSS paths
    html = html.replace(/href="css\//g, 'href="css/dist/');

    // Update JS paths
    html = html.replace(/src="js\//g, 'src="js/dist/');

    // Update form-handler.js path
    html = html.replace('src="form-handler.js"', 'src="dist/form-handler.js"');

    fs.writeFileSync('index.prod.html', html);
    console.log('  ✓ index.prod.html created');

    // ============================================
    // SUMMARY
    // ============================================

    console.log('\n✅ Build complete!');
    console.log('   📁 Minified files: js/dist/ and css/dist/');
    console.log('   🌐 Production HTML: index.prod.html');
    console.log('\n💡 Next steps:');
    console.log('   - Test with: open index.prod.html');
    console.log('   - Deploy: Use index.prod.html for production');
    console.log('   - Development: Continue using index.html\n');
});
