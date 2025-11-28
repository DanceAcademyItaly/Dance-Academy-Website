# Performance Optimization - Step-by-Step Task List

**Total Time:** 2-3 hours
**Date:** 2025-11-28
**Branch:** restructure-v2

Execute these tasks one at a time. Each task is independent and can be tested before moving to the next.

---

## Task 1: Add Resource Preconnect Hints
**Time:** 5 minutes
**Priority:** Initial Load Time
**Impact:** 200-500ms faster external resource loading

### Steps:
1. Open `index.html`
2. Find line 8 (first `<link rel="preload">` tag)
3. Add these lines BEFORE line 8:

```html
<!-- Performance: Preconnect to external domains -->
<link rel="dns-prefetch" href="https://unpkg.com">
<link rel="dns-prefetch" href="https://www.youtube.com">
<link rel="dns-prefetch" href="https://i.ytimg.com">
<link rel="preconnect" href="https://unpkg.com" crossorigin>
<link rel="preconnect" href="https://www.youtube.com" crossorigin>
```

### Test:
- Open page in browser
- Check Network tab → Connection Start times should be faster for unpkg.com and youtube.com
- Verify page loads normally

---

## Task 2: Remove Debug Console Statements
**Time:** 15 minutes
**Priority:** Code Quality
**Impact:** Cleaner production console

### Steps:

#### 2.1: Remove verbose navigation log
1. Open `js/candidates.js`
2. Find line 368 (or search for `console.log('[Candidati Navigation]'`)
3. Delete or comment out the entire console.log statement (should be ~8 lines)

#### 2.2: Review other console statements
1. Search for `console.log` across all JS files
2. Keep essential error messages
3. Remove or comment development-only debug logs

### Files to check:
- `js/candidates.js` (line 368 - priority removal)
- `js/episodes.js`
- `js/mission.js`
- `js/main.js`

### Test:
- Open page in browser
- Open Console tab
- Verify no debug spam during navigation
- Verify legitimate errors still show

---

## Task 3: Cache DOM Queries in Scroll Loop
**Time:** 20 minutes
**Priority:** Scroll Smoothness
**Impact:** 5-10% CPU reduction in RAF loop

### Steps:

#### 3.1: Update hero.js
1. Open `js/hero.js`
2. Find line 162 (search for `window.innerWidth > BREAKPOINTS.mobile`)
3. Replace:
```javascript
// OLD (line 162):
if (window.innerWidth > BREAKPOINTS.mobile) {

// NEW:
const isMobile = getState('cache.isMobile');
if (!isMobile) {
```

4. Find line 176 (second occurrence)
5. Replace the same way:
```javascript
// OLD (line 176):
if (window.innerWidth > BREAKPOINTS.mobile) {

// NEW:
const isMobile = getState('cache.isMobile');
if (!isMobile) {
```

#### 3.2: Verify imports
1. Check top of `hero.js` has: `import { getState } from './state.js';`
2. If missing, add it

### Test:
- Open page in browser
- Open Performance tab
- Record while scrolling
- Verify no visual changes to hero animations
- Check CPU usage is stable/lower

---

## Task 4: Fix MutationObserver Memory Leak
**Time:** 15 minutes
**Priority:** Scroll Smoothness
**Impact:** Prevents memory leak, better resource management

### Steps:

#### 4.1: Store observer at module level
1. Open `js/episodes.js`
2. Find line 68 (search for `const observer = new MutationObserver`)
3. Before line 68, add module-level variable:
```javascript
let episodiMutationObserver = null;
```

4. Change line 68 from:
```javascript
const observer = new MutationObserver((mutations) => {
```
to:
```javascript
episodiMutationObserver = new MutationObserver((mutations) => {
```

5. Update all references from `observer` to `episodiMutationObserver` in that section

#### 4.2: Add cleanup function
1. At the end of `js/episodes.js` (after all other functions), add:
```javascript
export function cleanupEpisodiObservers() {
    if (episodiMutationObserver) {
        episodiMutationObserver.disconnect();
        episodiMutationObserver = null;
    }
}
```

#### 4.3: Call cleanup on section deactivation
1. Open `js/navigation.js`
2. Find the `setActiveSection` function
3. When episodi section becomes inactive, call the cleanup
4. Add import at top: `import { cleanupEpisodiObservers } from './episodes.js';`
5. In setActiveSection, when switching away from episodi:
```javascript
if (currentActiveSection === 'episodi' && sectionName !== 'episodi') {
    cleanupEpisodiObservers();
}
```

### Test:
- Open page in browser
- Open Memory profiler
- Navigate to Episodes section
- Navigate away from Episodes
- Navigate back to Episodes
- Verify no memory growth over time
- Verify episode navigation still works

---

## Task 5: Optimize Province Dropdown
**Time:** 30 minutes
**Priority:** Initial Load Time + File Size
**Impact:** 1-2KB HTML reduction, faster parsing

### Steps:

#### 5.1: Add provinces array to config
1. Open `js/config.js`
2. At the end of the file, add:
```javascript
export const ITALIAN_PROVINCES = [
    'Agrigento', 'Alessandria', 'Ancona', 'Arezzo', 'Ascoli Piceno',
    'Asti', 'Avellino', 'Bari', 'Barletta-Andria-Trani', 'Belluno',
    'Benevento', 'Bergamo', 'Biella', 'Bologna', 'Bolzano',
    'Brescia', 'Brindisi', 'Cagliari', 'Caltanissetta', 'Campobasso',
    'Caserta', 'Catania', 'Catanzaro', 'Chieti', 'Como',
    'Cosenza', 'Cremona', 'Crotone', 'Cuneo', 'Enna',
    'Fermo', 'Ferrara', 'Firenze', 'Foggia', 'Forlì-Cesena',
    'Frosinone', 'Genova', 'Gorizia', 'Grosseto', 'Imperia',
    'Isernia', 'L\'Aquila', 'La Spezia', 'Latina', 'Lecce',
    'Lecco', 'Livorno', 'Lodi', 'Lucca', 'Macerata',
    'Mantova', 'Massa-Carrara', 'Matera', 'Messina', 'Milano',
    'Modena', 'Monza e Brianza', 'Napoli', 'Novara', 'Nuoro',
    'Oristano', 'Padova', 'Palermo', 'Parma', 'Pavia',
    'Perugia', 'Pesaro e Urbino', 'Pescara', 'Piacenza', 'Pisa',
    'Pistoia', 'Pordenone', 'Potenza', 'Prato', 'Ragusa',
    'Ravenna', 'Reggio Calabria', 'Reggio Emilia', 'Rieti', 'Rimini',
    'Roma', 'Rovigo', 'Salerno', 'Sassari', 'Savona',
    'Siena', 'Siracusa', 'Sondrio', 'Sud Sardegna', 'Taranto',
    'Teramo', 'Terni', 'Torino', 'Trapani', 'Trento',
    'Treviso', 'Trieste', 'Udine', 'Varese', 'Venezia',
    'Verbano-Cusio-Ossola', 'Vercelli', 'Verona', 'Vibo Valentia', 'Vicenza',
    'Viterbo'
];
```

#### 5.2: Update HTML
1. Open `index.html`
2. Find lines 128-241 (province dropdown with 113 options)
3. Replace ALL option elements (except the first "Seleziona provincia") with just:
```html
<select id="provincia" name="provincia" required>
    <option value="">Seleziona provincia</option>
    <!-- Populated by JavaScript -->
</select>
```

#### 5.3: Add population function
1. Open `js/content.js`
2. Add import at top: `import { ITALIAN_PROVINCES } from './config.js';`
3. Add this function:
```javascript
function populateProvinceDropdown() {
    const select = document.getElementById('provincia');
    if (!select) return;

    ITALIAN_PROVINCES.forEach(province => {
        const option = document.createElement('option');
        option.value = province;
        option.textContent = province;
        select.appendChild(option);
    });
}
```

4. Call it in the `populateContent` function (after DOM is populated):
```javascript
export async function populateContent() {
    // ... existing code ...

    // Populate province dropdown
    populateProvinceDropdown();

    return true;
}
```

### Test:
- Open page in browser
- Navigate to Candidati section
- Verify province dropdown shows all 107 provinces
- Verify form validation still works
- Submit form and verify provincia value is captured

---

## Task 6: Setup Minification Build System
**Time:** 45 minutes
**Priority:** File Size Reduction
**Impact:** 30-40% smaller files (~3MB savings)

### Steps:

#### 6.1: Create package.json
1. Create new file `package.json` in root directory
2. Add this content:
```json
{
  "name": "dance-academy-website",
  "version": "1.0.0",
  "private": true,
  "description": "Dance Academy website - production build system",
  "scripts": {
    "build": "node build.js",
    "dev": "echo 'Development mode - use source files directly'"
  },
  "devDependencies": {
    "terser": "^5.31.0",
    "csso": "^5.0.5"
  }
}
```

#### 6.2: Create build.js script
1. Create new file `build.js` in root directory
2. Add this content:
```javascript
const fs = require('fs');
const path = require('path');
const { minify } = require('terser');
const csso = require('csso');

// Directories
const JS_SRC = './js';
const JS_DIST = './js/dist';
const CSS_SRC = './css';
const CSS_DIST = './css/dist';

// Create dist directories
if (!fs.existsSync(JS_DIST)) fs.mkdirSync(JS_DIST, { recursive: true });
if (!fs.existsSync(CSS_DIST)) fs.mkdirSync(CSS_DIST, { recursive: true });

// Minify JavaScript files
console.log('Minifying JavaScript...');
const jsFiles = fs.readdirSync(JS_SRC).filter(f => f.endsWith('.js'));

for (const file of jsFiles) {
    const srcPath = path.join(JS_SRC, file);
    const destPath = path.join(JS_DIST, file);
    const code = fs.readFileSync(srcPath, 'utf8');

    minify(code, {
        module: true,
        compress: {
            dead_code: true,
            drop_console: false, // Keep console.error
            passes: 2
        },
        mangle: {
            toplevel: false // Preserve exports
        }
    }).then(result => {
        fs.writeFileSync(destPath, result.code);
        const savings = ((1 - result.code.length / code.length) * 100).toFixed(1);
        console.log(`  ${file}: ${savings}% smaller`);
    });
}

// Minify CSS files
console.log('\nMinifying CSS...');
const cssFiles = fs.readdirSync(CSS_SRC).filter(f => f.endsWith('.css'));

for (const file of cssFiles) {
    const srcPath = path.join(CSS_SRC, file);
    const destPath = path.join(CSS_DIST, file);
    const code = fs.readFileSync(srcPath, 'utf8');

    const result = csso.minify(code);
    fs.writeFileSync(destPath, result.css);

    const savings = ((1 - result.css.length / code.length) * 100).toFixed(1);
    console.log(`  ${file}: ${savings}% smaller`);
}

// Create production HTML
console.log('\nCreating index.prod.html...');
let html = fs.readFileSync('index.html', 'utf8');

// Update CSS paths
html = html.replace(/href="css\//g, 'href="css/dist/');

// Update JS paths
html = html.replace(/src="js\//g, 'src="js/dist/');

// Update form-handler.js
html = html.replace('src="form-handler.js"', 'src="dist/form-handler.js"');

fs.writeFileSync('index.prod.html', html);

console.log('\n✅ Build complete!');
console.log('   Use index.prod.html for production deployment');
```

#### 6.3: Minify form-handler.js
1. Update build.js to also handle root-level form-handler.js
2. Add after JS minification section:
```javascript
// Minify form-handler.js (root level)
console.log('\nMinifying form-handler.js...');
const formHandlerCode = fs.readFileSync('form-handler.js', 'utf8');
const distDir = './dist';
if (!fs.existsSync(distDir)) fs.mkdirSync(distDir);

minify(formHandlerCode, {
    compress: { dead_code: true, passes: 2 },
    mangle: true
}).then(result => {
    fs.writeFileSync('./dist/form-handler.js', result.code);
    const savings = ((1 - result.code.length / formHandlerCode.length) * 100).toFixed(1);
    console.log(`  form-handler.js: ${savings}% smaller`);
});
```

#### 6.4: Update .gitignore
1. Open `.gitignore` (or create if doesn't exist)
2. Add these lines:
```
node_modules/
js/dist/
css/dist/
dist/
index.prod.html
```

#### 6.5: Install and build
1. Open terminal in project root
2. Run:
```bash
npm install
npm run build
```

### Test:
- Open `index.prod.html` in browser
- Test ALL functionality:
  - Hero scroll animations
  - Episodes selection and playback
  - Carousel navigation
  - Mission section
  - Candidati form (all steps)
  - Form validation
  - Contact section
- Verify no console errors
- Compare file sizes in DevTools Network tab

---

## Verification Checklist

After completing all tasks:

- [ ] Page loads without errors
- [ ] Hero section animates correctly on scroll
- [ ] Episodes section:
  - [ ] Desktop sidebar navigation works
  - [ ] Mobile carousel works
  - [ ] YouTube videos play
  - [ ] Choreography accordion works
- [ ] Mission section animates on scroll
- [ ] Candidati section:
  - [ ] All 5 form cards navigate correctly
  - [ ] Province dropdown populated (107 options)
  - [ ] Form validation works
  - [ ] Can submit form
- [ ] Contact section displays correctly
- [ ] Smooth scroll works throughout
- [ ] Console is clean (no debug spam)
- [ ] Build produces minified files
- [ ] index.prod.html works identically to index.html

---

## Performance Metrics to Compare

### Before optimization:
Run in Chrome DevTools:
1. Network tab → Disable cache → Hard refresh
   - Record total transfer size
   - Record DOMContentLoaded time
   - Record Load time

2. Performance tab → Record scrolling
   - Check for 60fps maintenance
   - Note CPU usage percentage

### After optimization:
Run same tests with index.prod.html and compare improvements.

---

## Rollback Instructions

If anything breaks:
1. Git: `git checkout index.html` (restore original)
2. Delete dist folders: `rm -rf js/dist css/dist dist`
3. Revert individual file changes as needed
4. Use `git diff` to see what changed

---

## Notes

- Each task is independent - you can skip tasks if needed
- Test after EACH task before moving to next
- Keep original files - build creates separate minified versions
- Production uses `index.prod.html`, development uses `index.html`
- Total expected time: 2-3 hours for all 6 tasks
