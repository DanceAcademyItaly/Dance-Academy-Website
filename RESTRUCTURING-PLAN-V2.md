# Dance Academy Website - Restructuring Plan V2 (REVISED)

**Version:** 2.1 (CRITICAL FIXES APPLIED)
**Created:** 2025-11-09
**Revised:** 2025-11-09
**Philosophy:** Pragmatic simplicity with systematic verification

---

## ⚠️ CRITICAL REVISIONS

This plan has been revised to address **17 critical failure points** identified in risk analysis:
- Added extraction tracking mechanisms
- Added dependency mapping tasks
- Enhanced verification steps
- Specific testing protocols instead of vague "looks identical"
- Hierarchical state management
- CSS cascade preservation
- Complete accountability for all 5,422 lines

**This plan is now executable by AI with no context - everything is documented.**

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Current State Analysis](#current-state-analysis)
3. [Guiding Principles](#guiding-principles)
4. [Phase-by-Phase Restructuring](#phase-by-phase-restructuring)
5. [File Structure (Target)](#file-structure-target)
6. [Testing Strategy](#testing-strategy)
7. [Verification Documents](#verification-documents)

---

## Executive Summary

### Current State
- **dance-academy.js**: 5,422 lines - single monolithic file
- **index.html**: 2,195 lines with 1,794 lines of embedded CSS
- **110 console.log statements** (22 with emojis)
- **25+ scattered global state objects**
- **Massive mobile/desktop code duplication**
- **No CSS files** - everything embedded in HTML

### Target State
- **~8-10 JavaScript modules** of 200-400 lines each
- **5-6 CSS files** logically organized
- **ZERO emoji logging, minimal console output**
- **Clean, straightforward code** - no over-engineering
- **30-40% code reduction** through deduplication
- **IDENTICAL functionality** - pixel-perfect preservation

### Key Philosophy
**This is a simple website with complex animations - NOT a complex web application.**
We need clean code with straightforward logic, not architectural astronautics.

**FUNCTIONALITY MUST BE IDENTICAL** - Any visual or behavioral change is a failure.

---

## Current State Analysis

### File Breakdown
```
index.html                  2,195 lines  (1,794 CSS embedded!)
dance-academy.js            5,422 lines  (should be ~8 files)
form-handler.js               473 lines  (OK, but needs cleanup)
content.json                  215 lines  (GOOD)
TOTAL                       8,305 lines
```

### Critical Issues

**🔴 CRITICAL:**
1. No CSS file - 1,794 lines embedded in HTML
2. Single 5,422-line JavaScript monolith
3. 110 console.log statements polluting production
4. 22 emoji logs (🎯 ✅ ⏳ ⚠️ 🔍 ✓) - unprofessional
5. 25+ global state objects scattered everywhere

**🟡 HIGH:**
6. Mobile/desktop logic duplicated (48 references)
7. Animation code repeated across sections
8. Complex functions (100-400 lines)
9. Magic numbers everywhere
10. Dead code and commented-out features

**🟢 MEDIUM:**
11. CSS duplication (borders, shadows, colors)
12. Unoptimized DOM manipulation
13. Form validation duplicated
14. Hard-coded content in HTML

---

## Guiding Principles

### 1. Functionality Must Be Identical
- **ZERO visual changes** - pixel-perfect preservation
- **ZERO behavioral changes** - animations, timing, interactions identical
- Any change = failure
- Use objective measurements, not "looks good"

### 2. Systematic Verification
- Track every line of code
- Document every dependency
- Verify completeness at each step
- Never assume - always verify

### 3. Small, Verifiable Changes
- Each task completable in 15-45 minutes
- Clear before/after verification
- Independent tasks that don't break each other

### 4. Delete Ruthlessly
- Dead code: DELETE immediately after verification
- Commented code: DELETE (git has history)
- Debug logs: DELETE all
- Emoji logs: DELETE with extreme prejudice

### 5. Test After Every Change
- Visual regression check with screenshots
- Functionality verification with test script
- Console error check
- No moving forward with broken code

---

## Verification Documents

Throughout this process, you will create these tracking documents (all temporary, in .gitignore):

1. **EXTRACTION-TRACKER.md** - Line-by-line accounting of code migration
2. **GLOBAL-STATE-MAP.md** - All 25+ global variables and dependencies
3. **FUNCTION-CALL-GRAPH.md** - Function interdependencies
4. **INIT-ORDER.md** - Critical initialization sequence
5. **CSS-EXTRACTION-LOG.md** - CSS cascade order preservation
6. **TEST-SCRIPT.md** - Repeatable test protocol
7. **BASELINE-MEASUREMENTS.txt** - Before/after metrics

---

## PHASE 0: Preparation & Safety (1 hour)

### Task 0.1: Create Safety Branch
**Objective:** Set up version control safety net

**Steps:**
```bash
git checkout -b restructure-v2
git tag pre-restructure-v2
```

**Success:** Branch created, tag in place

---

### Task 0.2: Baseline Measurements (**ENHANCED**)
**Objective:** Document current state for objective comparison

**Create:** `baseline-measurements.txt`

**Measure and document:**

**1. File Metrics:**
```bash
wc -l dance-academy.js  # Should be 5,422
wc -l index.html        # Should be 2,195
wc -l form-handler.js   # Should be ~473
```

**2. Console Log Count:**
```bash
grep -c "console.log" dance-academy.js    # Should be ~110
grep -c "console.warn" dance-academy.js   # Should be ~9
grep -c "console.error" dance-academy.js  # Should be ~4
```

**3. Performance Baseline (Chrome DevTools):**
- Open Chrome DevTools > Performance
- Record page load
- Document:
  - DOMContentLoaded: ___ ms
  - Load event: ___ ms
  - First Contentful Paint: ___ ms
  - Time to Interactive: ___ ms
- Run Lighthouse:
  - Performance score: ___
  - Best Practices score: ___

**4. Animation Performance:**
- Record 10-second scroll from top to bottom
- Check for dropped frames
- Document average FPS: ___

**5. Visual Baseline (Screenshots):**
Take screenshots at these scroll positions:
- Desktop (1920px width): 0px, 500px, 1000px, 2000px, 3000px, 4000px
- Mobile (768px width): 0px, 300px, 600px, 1200px, 1800px, 2400px
- Save in `baseline-screenshots/` folder

**6. Screen Recording:**
- Desktop: Full scroll top to bottom (30 seconds)
- Mobile: Full scroll top to bottom (30 seconds)
- Save videos for reference

**Success:** All metrics documented, screenshots saved

**Risk:** NONE (measurement only)

---

### Task 0.3: Create Detailed Test Script (**ENHANCED**)
**Objective:** Repeatable, objective testing protocol

**Create:** `TEST-SCRIPT.md`

```markdown
# Test Script - Dance Academy Website

## Pre-Test Setup
1. Clear browser cache
2. Open DevTools Console
3. Disable browser extensions
4. Set viewport to specified size

---

## DESKTOP TEST (1920px width) - 10 minutes

### Initial Load
- [ ] Page loads without console errors
- [ ] Hero section visible with logo
- [ ] Background video playing (if enabled)

### Scroll Test
- [ ] Scroll smoothly from 0 to bottom (15 seconds)
- [ ] Hero section fades out as you scroll down
- [ ] Episodi section appears
- [ ] Missione section appears
- [ ] Candidati section appears
- [ ] Contatti section appears
- [ ] No visual glitches or jumps
- [ ] Smooth 60fps throughout (check DevTools)

### Header Navigation
- [ ] Click "EPISODI" - smooth scroll to episodi section
- [ ] Header highlight updates to "EPISODI"
- [ ] Click "MISSIONE" - smooth scroll to missione section
- [ ] Header highlight updates to "MISSIONE"
- [ ] Click "CANDIDATI" - smooth scroll to candidati section
- [ ] Header highlight updates to "CANDIDATI"
- [ ] Click "CONTATTI" - smooth scroll to contatti section
- [ ] Header highlight updates to "CONTATTI"
- [ ] Click "HOME" - smooth scroll back to hero
- [ ] Header highlight updates to "HOME"

### Progress Bar
- [ ] Scroll from top to bottom
- [ ] Progress bar fills from 0% to 100%
- [ ] Progress bar updates smoothly

### Episodi Section
- [ ] Sidebar visible on left
- [ ] Click "SEASON 1" accordion - expands
- [ ] Episode buttons 1, 2, 3 visible
- [ ] Click "Episode 1" - content changes to Episode 1
- [ ] Click "Episode 2" - content changes to Episode 2
- [ ] Click "Episode 3" - content changes to Episode 3
- [ ] Click "SEASON 2" accordion - expands, Season 1 collapses
- [ ] Episode buttons 4, 5, 6 visible
- [ ] Click each episode - content updates
- [ ] Video players load correctly
- [ ] Choreography accordion expands/collapses

### Missione Section
- [ ] Content visible and readable
- [ ] Fade-in animation on scroll
- [ ] Fade-out animation on continued scroll

### Candidati Section
- [ ] Card stack visible
- [ ] Scroll through section - cards animate
- [ ] Click in form area
- [ ] Fill "Nome" field - real-time validation works
- [ ] Fill "Cognome" field - validation works
- [ ] Fill "Email" field - validation works
- [ ] Fill "Telefono" field - validation works
- [ ] Click "PROCEDI" - advances to Phase 2
- [ ] Fill Phase 2 fields
- [ ] Click "PROCEDI" - advances to Phase 3
- [ ] Fill Phase 3 fields
- [ ] Click "INDIETRO" - goes back to Phase 2
- [ ] Click "INDIETRO" - goes back to Phase 1
- [ ] Form navigation works both directions

### Contatti Section
- [ ] Content displays correctly
- [ ] Links are clickable

### Console Check
- [ ] ZERO console errors (CRITICAL)
- [ ] ZERO console warnings (after Phase 2)
- [ ] ZERO console logs (after Phase 2)

---

## MOBILE TEST (768px width) - 10 minutes

### Initial Load
- [ ] Page loads without console errors
- [ ] Hero section visible, logo visible
- [ ] No horizontal overflow

### Scroll Test
- [ ] Touch scroll works smoothly
- [ ] All sections appear
- [ ] Animations work

### Episodi Section (Mobile)
- [ ] Dropdown selector visible (NOT sidebar)
- [ ] Click dropdown - shows seasons/episodes
- [ ] Select different episodes - content changes
- [ ] Carousel auto-plays videos
- [ ] Can swipe/click through carousel

### Candidati Section (Mobile)
- [ ] Form displays correctly
- [ ] All fields accessible
- [ ] Buttons large enough to tap easily
- [ ] Phase navigation works

### Console Check
- [ ] ZERO console errors

---

## TABLET TEST (1024px width) - 5 minutes

### Quick Checks
- [ ] Layout looks good between mobile and desktop
- [ ] Episodi section uses appropriate layout
- [ ] All interactions work

---

## BROWSER COMPATIBILITY

Test in:
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)

---

## REGRESSION CHECK

After each phase, compare to baseline:
- [ ] Screenshots match (pixel-perfect)
- [ ] Performance within 10% of baseline
- [ ] All functionality identical
```

**Success:** Comprehensive test script created

**Risk:** NONE

---

### Task 0.4: Test Rollback Procedure (**NEW**)
**Objective:** Verify rollback works BEFORE you need it

**Steps:**

1. **Create dummy commit:**
```bash
echo "test" >> test-file.txt
git add test-file.txt
git commit -m "Test commit for rollback practice"
```

2. **Test reset to previous commit:**
```bash
git reset --hard HEAD~1
```

3. **Verify:**
```bash
ls test-file.txt  # Should not exist
```

4. **Test tag rollback:**
```bash
echo "test2" >> test-file2.txt
git add test-file2.txt
git commit -m "Test commit 2"
git reset --hard pre-restructure-v2
```

5. **Verify:**
```bash
ls test-file2.txt  # Should not exist
```

6. **Load website - verify still works**

**Success:** Rollback procedure tested and working

**Risk:** NONE (just practice)

---

## PHASE 0 CHECKPOINT ✓

**Deliverable:**
- Branch and tag created
- Comprehensive baseline measurements
- Detailed test script
- Rollback procedure tested
- Ready to begin restructuring

---

## PHASE 1: Extract CSS (2-3 hours)

### Task 1.1: Create CSS Directory Structure
**Objective:** Set up organized CSS file structure

**Create:**
```
/css/
  base.css          (CSS variables, resets, typography)
  layout.css        (sections, grid, positioning)
  components.css    (buttons, forms, cards, sidebar)
  animations.css    (transitions, scroll animations)
  responsive.css    (media queries)
```

**Success:** 5 empty CSS files created

**Risk:** LOW (just file creation)

---

### Task 1.2: Extract Base Styles (**ENHANCED**)
**Objective:** Move CSS variables and typography to base.css

**Create:** `CSS-EXTRACTION-LOG.md` to track order

**From:** index.html `<style>` block (approximately lines 1-200)
**To:** `/css/base.css`

**CRITICAL: Preserve exact order and specificity**

**Extract in this order:**
1. `:root` CSS variables (all --color-*, --font-*, --spacing-*)
2. `*` reset styles
3. `html, body` base styles
4. Typography (`h1`, `h2`, `h3`, `p`, `.title`, `.subtitle`, etc.)
5. Fluid typography clamp() functions

**Log each extraction:**
```markdown
# CSS-EXTRACTION-LOG.md

## base.css Extraction

Line 1-50 in index.html → base.css lines 1-50
- :root variables
- Preserved order: yes
- Specificity unchanged: yes

Line 51-100 in index.html → base.css lines 51-100
- Reset styles
- ...
```

**In index.html:**
1. **BEFORE deleting**, note starting line number
2. Copy CSS to base.css
3. Add: `<link rel="stylesheet" href="css/base.css">`
4. Delete extracted CSS from index.html
5. **Immediately test**: Run TEST-SCRIPT.md "Initial Load" section

**Verification:**
```bash
# Take new screenshot
# Compare to baseline screenshot pixel-by-pixel
# Should be IDENTICAL
```

**Test:** Page should look pixel-perfect identical

**Success:** ~200 lines moved, page looks identical

**Risk:** LOW

---

### Task 1.3: Extract Layout Styles (**ENHANCED**)
**Objective:** Move section layout to layout.css

**From:** index.html `<style>` block
**To:** `/css/layout.css`

**PRESERVE EXACT ORDER FROM index.html**

**Extract:**
- `.section` styles
- `#hero`, `#episodi`, `#missione`, `#candidati`, `#contatti` section containers
- `.container`, `.content-wrapper` styles
- Grid layouts
- Fixed positioning for scroll sections
- Z-index layering

**CRITICAL: Do not simplify selectors**
- If original is `#hero .title` - keep `#hero .title`
- Do NOT change to `.title` (loses specificity)

**Log extraction in CSS-EXTRACTION-LOG.md**

**In index.html:**
- Add: `<link rel="stylesheet" href="css/layout.css">` AFTER base.css
- Delete extracted CSS
- Test immediately

**Test:** Layout should be pixel-perfect identical

**Success:** ~300 lines moved, layout unchanged

**Risk:** LOW-MEDIUM

---

### Task 1.4: Extract Component Styles (**ENHANCED**)
**Objective:** Move UI components to components.css

**From:** index.html `<style>` block
**To:** `/css/components.css`

**Extract in order:**
- Header/navigation styles
- Progress bar
- Buttons (all variants)
- Forms and inputs
- Cards (episodi cards, form cards, candidati cards)
- Sidebar (episodi sidebar)
- Modals/popups
- Video players and containers
- Accordion styles

**PRESERVE cascade order** - if button style is overridden later, maintain that relationship

**Log extraction in CSS-EXTRACTION-LOG.md**

**In index.html:**
- Add: `<link rel="stylesheet" href="css/components.css">` AFTER layout.css
- Delete extracted CSS
- Test all components

**Test:** Run TEST-SCRIPT.md "Desktop Test" - all components identical

**Success:** ~400 lines moved, components unchanged

**Risk:** MEDIUM (many components)

---

### Task 1.5: Extract Animation Styles (**ENHANCED**)
**Objective:** Move CSS animations to animations.css

**From:** index.html `<style>` block
**To:** `/css/animations.css`

**Extract:**
- `@keyframes` declarations
- Transition rules
- Transform origins
- Opacity transitions
- Scroll-triggered animation classes
- Reduced motion queries

**In index.html:**
- Add: `<link rel="stylesheet" href="css/animations.css">` AFTER components.css
- Delete extracted CSS
- Test animations

**Test:** Run full scroll test - animations must be identical timing/feel

**Success:** ~200 lines moved, animations work identically

**Risk:** MEDIUM (animations are delicate)

---

### Task 1.6: Extract Responsive Styles (**ENHANCED**)
**Objective:** Move all media queries to responsive.css

**From:** index.html `<style>` block
**To:** `/css/responsive.css`

**Extract ALL:**
- `@media (max-width: 768px)` blocks
- `@media (max-width: 480px)` blocks
- `@media (max-width: 320px)` blocks
- Mobile overrides

**Organize by breakpoint:**
```css
/* ============================================
   TABLET AND BELOW (768px)
   ============================================ */
@media (max-width: 768px) {
  /* All tablet overrides in original order */
}

/* ============================================
   MOBILE (480px)
   ============================================ */
@media (max-width: 480px) {
  /* All mobile overrides in original order */
}
```

**CRITICAL: Maintain override order**
- If base.css has `.button { padding: 20px }`
- And responsive.css has `.button { padding: 10px }`
- responsive.css MUST load last

**In index.html:**
- Add: `<link rel="stylesheet" href="css/responsive.css">` LAST
- Delete extracted CSS
- Test at multiple viewports

**Test:**
- Test at 1920px, 1440px, 1024px, 768px, 414px
- Compare screenshots to baseline
- Must be pixel-perfect

**Success:** ~300-400 lines moved, responsive works

**Risk:** MEDIUM (responsive is delicate)

---

### Task 1.7: Verify CSS Extraction Complete
**Objective:** Verify all CSS extracted, HTML clean

**Check:**
```bash
# index.html should have minimal/no CSS
grep -c "<style>" index.html  # Should be 0 or 1 (if tiny inline)

# Count CSS in new files
wc -l css/base.css css/layout.css css/components.css css/animations.css css/responsive.css

# Total should be ~1,794 lines (from baseline measurement)
```

**Final HTML head should have EXACTLY this order:**
```html
<link rel="stylesheet" href="css/base.css">
<link rel="stylesheet" href="css/layout.css">
<link rel="stylesheet" href="css/components.css">
<link rel="stylesheet" href="css/animations.css">
<link rel="stylesheet" href="css/responsive.css">
```

**Complete verification:**
- [ ] Run full TEST-SCRIPT.md
- [ ] Compare screenshots to baseline (must be identical)
- [ ] Check console (0 errors)
- [ ] Test all viewports
- [ ] Review CSS-EXTRACTION-LOG.md (all documented)

**Success:** index.html reduced by ~1,794 lines, CSS in proper files, site identical

**Risk:** LOW

---

## PHASE 1 CHECKPOINT ✓

**Deliverable:**
- 5 organized CSS files (~1,794 lines total)
- index.html reduced from 2,195 → ~400 lines
- CSS-EXTRACTION-LOG.md documenting process
- All styling working identically
- Screenshots match baseline

**STOP AND TEST THOROUGHLY BEFORE PHASE 2**

---

## PHASE 2: Remove Dead Code & Clean Logging (1-2 hours)

### Task 2.1: Remove ALL Console Logs
**Objective:** Delete 110 console.log statements

**In:** dance-academy.js, form-handler.js

**Find all:**
```bash
grep -n "console.log" dance-academy.js > console-logs.txt
grep -n "console.warn" dance-academy.js >> console-logs.txt
grep -n "console.error" dance-academy.js >> console-logs.txt
```

**Review console-logs.txt:**
- Mark which errors to KEEP (only critical failures)
- DELETE all others

**Keep ONLY (2-3 total):**
```javascript
// Keep only actual errors that should never happen
console.error('Failed to load content.json:', error);
console.error('Form submission failed:', error);
console.error('Lenis failed to initialize:', error);
```

**DELETE (110+ lines):**
- ALL `console.log()` statements (especially with emojis 🎯 ✅ ⏳)
- Most `console.warn()`
- Debug `console.error()`

**Verification:**
```bash
grep "console.log" dance-academy.js   # Should return NOTHING
grep "🎯\|✅\|⏳\|⚠️" dance-academy.js  # Should return NOTHING
grep -c "console" dance-academy.js    # Should be 2-3
```

**Test:**
- Run TEST-SCRIPT.md
- Console should be SILENT except for kept errors (if triggered)
- Functionality identical

**Success:**
- console.log count: 110 → 0
- console.warn count: 9 → 0-1
- console.error count: 4 → 2-3
- ZERO emojis

**Risk:** LOW (removing logs doesn't break functionality)

---

### Task 2.2: Remove Commented-Out Code
**Objective:** Delete all commented code blocks

**In:** dance-academy.js, form-handler.js

**Find:**
```bash
# Look for comment patterns
grep -n "// Old\|// TODO\|// DEBUG\|// FIX\|/\* .* \*/" dance-academy.js > comments.txt
```

**Remove:**
- All `// Old approach:` blocks
- All `/* Commented out ... */` blocks
- Alternative implementations in comments
- Debug comments
- TODO comments (move to actual todo list if needed)

**Keep ONLY:**
- Section markers (e.g., `// === HERO SECTION ===`)
- Brief explanatory comments for complex logic
- Function documentation (if any)

**Success:** Significant comment reduction, code cleaner

**Risk:** LOW (git has history)

---

### Task 2.3: Identify and Remove Dead Code
**Objective:** Delete unused functions and variables

**Search for unused code:**

**1. Find all function definitions:**
```bash
grep -n "^function " dance-academy.js > functions.txt
grep -n "^const .* = function" dance-academy.js >> functions.txt
```

**2. For each function, verify it's called:**
```bash
# Example: check if "processScrollInput" is called
grep "processScrollInput(" dance-academy.js
# If only definition appears → DEAD CODE
```

**3. Common dead code candidates:**
- Scroll decoupling system (if configured but not active)
- Unused easing functions
- Debug helper functions
- Old animation approaches

**Process:**
1. Identify potentially dead function
2. Search entire file for calls
3. If no calls found → DELETE
4. Test immediately after deletion

**Success:** 100-200 lines of dead code removed

**Risk:** MEDIUM (need to verify truly unused)

---

### Task 2.4: Document Magic Numbers
**Objective:** Add comments explaining magic numbers

**Find patterns:**
```bash
grep -n "0\.[0-9]" dance-academy.js | grep -v "rgba\|hsla" > magic-numbers.txt
```

**For each magic number:**

**Before:**
```javascript
const entranceRatio = 0.286;
const buffer = vh * 0.05;
```

**After:**
```javascript
const entranceRatio = 0.286; // 2/7 of section height for entrance animation
const buffer = vh * 0.05;     // 5vh buffer zone for section transitions
```

**Don't over-do it** - obvious numbers (0, 1, 100, 0.5) don't need comments

**Success:** All non-obvious magic numbers documented

**Risk:** LOW

---

## PHASE 2 CHECKPOINT ✓

**Deliverable:**
- ZERO console.log statements
- ZERO emoji logs
- ZERO commented-out code
- 100-200 lines of dead code removed
- Magic numbers documented
- Clean, professional code
- Functionality still identical

**Test:** Run full TEST-SCRIPT.md, console should be silent

---

## PHASE 3: Extract Utilities & Config (1-2 hours)

### Task 3.1: Create JavaScript Directory
**Objective:** Set up modular file structure

**Create:**
```
/js/
  config.js
  utils.js
  main.js (will be created later)
```

**Success:** 3 empty files created

**Risk:** LOW

---

### Task 3.2: Create config.js
**Objective:** Centralize configuration constants

**Create:** `/js/config.js`

**Extract hardcoded constants from dance-academy.js:**

```javascript
/**
 * Configuration constants for Dance Academy Website
 */

// Animation timing
export const ANIMATION = {
  resizeDebounceMs: 150,
  carouselAutoPlayMs: 8000,
  scrollUpdateThrottle: 16, // ~60fps
};

// Breakpoints
export const BREAKPOINTS = {
  mobile: 768,
  smallMobile: 480,
  tinyMobile: 320,
};

// Z-index hierarchy (extract from current code)
export const Z_INDEX = {
  background: -1,
  content: 1,
  episodiSidebar: 100,
  episodiContent: 101,
  episodiTitle: 102,
  cardStack: 105,
  submitButton: 106,
  header: 110,
  progressBar: 111,
  intro: 120,
};

// Scroll configuration
export const SCROLL = {
  sectionBufferVH: 0.05, // 5vh buffer for section transitions
};

// API endpoints
export const API = {
  contentUrl: './content.json',
  formSubmitUrl: '', // Set in form-handler.js
};

// Feature flags (extract from code)
export const FEATURES = {
  enableVideoBackground: true,
  enableSmoothScroll: true,
  enableTypographySystem: true,
};
```

**Success:** All configuration centralized

**Risk:** LOW

---

### Task 3.3-3.6: Create utils.js
**Objective:** Extract all reusable utility functions

**Create:** `/js/utils.js`

**Extract from dance-academy.js:**

```javascript
/**
 * Utility functions for Dance Academy Website
 */

// ============================================
// EASING FUNCTIONS
// ============================================

export function easeOutCubic(t) {
  return 1 - Math.pow(1 - t, 3);
}

export function easeInOutCubic(t) {
  return t < 0.5
    ? 4 * t * t * t
    : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

export function easeInCubic(t) {
  return t * t * t;
}

// Add any other easing functions from code

// ============================================
// MATH UTILITIES
// ============================================

export function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

export function lerp(start, end, t) {
  return start + (end - start) * t;
}

export function mapRange(value, inMin, inMax, outMin, outMax) {
  return outMin + ((value - inMin) / (inMax - inMin)) * (outMax - outMin);
}

export function normalize(value, min, max) {
  return (value - min) / (max - min);
}

// ============================================
// DOM UTILITIES
// ============================================

export function setStyles(element, styles) {
  if (!element) return;
  Object.assign(element.style, styles);
}

export function getViewportHeight() {
  return window.innerHeight;
}

export function getScrollY() {
  return window.scrollY || document.documentElement.scrollTop;
}

export function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function isMobile() {
  return window.innerWidth <= 768;
}

// ============================================
// PERFORMANCE UTILITIES
// ============================================

export function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

export function throttle(func, limit) {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}
```

**Success:** All utilities extracted and available

**Risk:** LOW

---

## PHASE 3 CHECKPOINT ✓

**Deliverable:**
- config.js with all constants
- utils.js with reusable helpers
- Ready to modularize main code

**Note:** Don't update dance-academy.js to USE these yet - just create them. We'll do the conversion in Phase 4.

---

## PHASE 4: Split JavaScript into Modules (4-6 hours)

**⚠️ CRITICAL PHASE - HIGHEST RISK**

This phase requires systematic tracking to ensure ALL 5,422 lines are accounted for.

---

### Task 4.0.1: Create Extraction Tracker (**CRITICAL**)
**Objective:** Track every line of code migration

**Create:** `EXTRACTION-TRACKER.md`

```markdown
# JavaScript Extraction Tracker

## Source File
- dance-academy.js: 5,422 lines

## Target Modules (estimated)
- state.js: ~100 lines
- scroll.js: ~200 lines
- content.js: ~300 lines
- hero.js: ~300 lines
- episodes.js: ~800 lines
- mission.js: ~250 lines
- candidates.js: ~500 lines
- contacts.js: ~200 lines
- carousel.js: ~300 lines
- navigation.js: ~300 lines
- main.js: ~150 lines

## Total Target: ~3,400 lines
## Reduction (dead code, comments, logs): ~2,022 lines
## Must account for all 5,422 lines

---

## Line-by-Line Accounting

### Lines 1-100: Initialization and Config
- [ ] Lines 1-20: Initial comments → DELETE (dead code)
- [ ] Lines 21-45: Global variables → state.js
- [ ] Lines 46-100: Lenis setup → scroll.js

### Lines 101-200: ...
(Continue for entire file)

---

## Verification
Total extracted: _____ lines
Total deleted (dead code/comments): _____ lines
Sum must equal 5,422
```

**Success:** Comprehensive tracker created

---

### Task 4.0.2: Map Global State (**CRITICAL**)
**Objective:** Document all global variables and dependencies

**Create:** `GLOBAL-STATE-MAP.md`

**Find all global variables:**
```bash
# Find let/const/var declarations at file level
grep -n "^let \|^const \|^var " dance-academy.js > globals.txt
```

**Document each:**

```markdown
# Global State Map

## Global Variables Found (25+)

| Variable | Type | Used By | Dependencies | Target Module |
|----------|------|---------|-------------|---------------|
| siteContent | object | all sections | none | state.js |
| hasEpisodes | boolean | episodes | siteContent | state.js |
| lenis | object | scroll system | none | scroll.js |
| isScrollSystemInitialized | boolean | main | lenis | state.js |
| typographyState | object | typography | viewport | state.js |
| currentActiveSection | string | navigation | sections | state.js |
| currentVideoState | object | hero | none | state.js |
| HEADER_REGISTRY | object | navigation | sections | navigation.js |
| episodiAnimationState | object | episodes | viewport | episodes.js |
| missioneAnimationState | object | mission | viewport | mission.js |
| candidatiCardState | object | candidates | viewport | candidates.js |
| contattiAnimationState | object | contacts | viewport | contacts.js |
| cachedViewportHeight | number | all | none | state.js |
| cachedHeaderSpans | array | navigation | DOM | navigation.js |
| rafId | number | scroll | lenis | scroll.js |
| carouselState | object | carousel | episodes | carousel.js |
| formState | object | form | none | form.js |
| players | array | episodes | YouTube API | episodes.js |
| ... | ... | ... | ... | ... |

## Initialization Order (CRITICAL)
1. Constants (no dependencies)
2. DOM queries (needs DOM ready)
3. State initialization
4. Lenis initialization
5. Section initialization
6. Event binding
```

**Success:** All globals documented

---

### Task 4.0.3: Create Function Call Graph (**CRITICAL**)
**Objective:** Map function dependencies

**Create:** `FUNCTION-CALL-GRAPH.md`

**Find all functions:**
```bash
grep -n "^function \|^const .* = function\|^const .* = (" dance-academy.js > all-functions.txt
```

**For each function, document:**

```markdown
# Function Call Graph

## Function Dependencies

### getCurrentScroll()
- Called by: updateHeroAnimations, updateEpisodiAnimations, updateMissioneAnimations, etc.
- Calls: lenis.scroll, window.scrollY
- Target: utils.js (shared utility)

### setActiveSection(sectionName)
- Called by: scroll handler, navigation clicks
- Calls: updateHeaderHighlight, HEADER_REGISTRY methods
- Target: navigation.js

### updateHeroAnimations(scrollY)
- Called by: RAF loop
- Calls: setStyles, calculateOpacity
- Target: hero.js

### initEpisodiDesktop()
- Called by: init
- Calls: populateEpisodes, setupEventListeners
- Target: episodes.js

... (continue for all ~78 functions)

## Shared Utilities (go to utils.js)
- getCurrentScroll
- setStyles
- clamp, lerp, mapRange
- All easing functions

## Section-Specific (stay in modules)
- updateHeroAnimations → hero.js
- initEpisodiDesktop → episodes.js
- ...
```

**Success:** All function dependencies mapped

---

### Task 4.0.4: Document Initialization Order (**CRITICAL**)
**Objective:** Define correct initialization sequence

**Create:** `INIT-ORDER.md`

```markdown
# Initialization Order

## Critical Sequence (MUST be in this order)

### PHASE 1: Constants (no dependencies)
- Config constants
- Feature flags
- Z-index values

### PHASE 2: DOM Ready Check
- Wait for DOMContentLoaded
- Only then proceed

### PHASE 3: DOM Queries
- Cache all element references
- Calculate viewport dimensions
- Store in state

### PHASE 4: State Initialization
- Initialize state object
- Set initial values
- No DOM manipulation yet

### PHASE 5: Lenis Initialization
- Check Lenis available
- Initialize Lenis
- Set up RAF loop
- MUST happen before sections

### PHASE 6: Content Loading
- Fetch content.json
- Wait for response
- Store in state

### PHASE 7: Section Initialization
- initHero()
- initEpisodes()
- initMission()
- initCandidates()
- initContacts()
- initNavigation()
- Each calculates its scroll ranges

### PHASE 8: Event Binding
- Register scroll callbacks
- Register resize handlers
- Bind navigation clicks

## Dependencies

- Sections depend on: DOM ready, state, content loaded
- Scroll depends on: Lenis available
- Navigation depends on: sections initialized
- Animations depend on: scroll system running
```

**Success:** Initialization order documented

---

### Task 4.1: Plan Module Split
**Objective:** Define clear module boundaries

**Target structure:**
```
/js/
  config.js           (done)
  utils.js            (done)
  state.js            (NEW - hierarchical state)
  scroll.js           (NEW - Lenis integration)
  content.js          (NEW - content loading)
  hero.js             (NEW - hero section)
  episodes.js         (NEW - episodi section)
  mission.js          (NEW - missione section)
  candidates.js       (NEW - candidati section)
  contacts.js         (NEW - contatti section)
  carousel.js         (NEW - mobile carousel)
  navigation.js       (NEW - header, progress bar)
  main.js             (NEW - initialization)
```

**Success:** Clear mental model of module responsibilities

---

### Task 4.2: Create state.js - Hierarchical State (**REVISED**)
**Objective:** Centralize state with proper structure

**Create:** `/js/state.js`

**IMPORTANT:** State structure must match the complex state in original code

```javascript
/**
 * Centralized application state
 * Single source of truth for all global state
 */

export const state = {
  // ============================================
  // SCROLL STATE
  // ============================================
  scroll: {
    y: 0,
    lastY: 0,
    direction: 'down',
    isScrolling: false,
  },

  // ============================================
  // SECTION STATE
  // ============================================
  activeSection: 'hero',

  // ============================================
  // HEADER REGISTRY (complex nested object)
  // ============================================
  header: {
    sections: [
      // Will be populated with:
      // { name: 'hero', order: 0, enabled: true, targetScroll: 0, registered: false }
    ],
    maxScroll: null,
    initialized: false,
    cache: {
      enabledSections: null,
      progressDivisions: null,
    },
  },

  // ============================================
  // ANIMATION STATES (complex objects per section)
  // ============================================
  animations: {
    hero: null,      // Will be assigned complex object
    episodi: null,   // Will be assigned complex object
    missione: null,  // Will be assigned complex object
    candidati: null, // Will be assigned complex object
    contatti: null,  // Will be assigned complex object
  },

  // ============================================
  // EPISODI STATE
  // ============================================
  episodi: {
    currentSeason: 1,
    currentEpisode: 1,
    accordionOpen: false,
  },

  // ============================================
  // CANDIDATI STATE
  // ============================================
  candidati: {
    currentCard: 1,
    totalCards: 5,
  },

  // ============================================
  // CAROUSEL STATE (mobile)
  // ============================================
  carousel: {
    currentIndex: 0,
    autoPlayTimer: null,
  },

  // ============================================
  // CONTENT
  // ============================================
  content: null,

  // ============================================
  // CACHED VALUES (performance)
  // ============================================
  cache: {
    viewportHeight: 0,
    headerSpans: null,
    blocks: null,
    visibleBlocks: null,
    progressBar: null,
    documentHeight: 0,
  },

  // ============================================
  // FLAGS
  // ============================================
  flags: {
    introComplete: false,
    isScrollSystemInitialized: false,
    isMobile: window.innerWidth <= 768,
  },

  // ============================================
  // VIDEO STATE
  // ============================================
  video: {
    currentState: 'playing',
    lastState: null,
  },

  // ============================================
  // TYPOGRAPHY STATE
  // ============================================
  typography: {
    enhancementsApplied: false,
    config: null,
  },
};

/**
 * Update state (shallow or deep merge)
 */
export function setState(updates) {
  Object.assign(state, updates);
}

/**
 * Deep update (for nested properties)
 */
export function updateState(path, value) {
  const keys = path.split('.');
  let current = state;

  for (let i = 0; i < keys.length - 1; i++) {
    current = current[keys[i]];
  }

  current[keys[keys.length - 1]] = value;
}

/**
 * Get state value
 */
export function getState(key) {
  if (!key) return state;

  const keys = key.split('.');
  let value = state;

  for (const k of keys) {
    value = value[k];
    if (value === undefined) break;
  }

  return value;
}
```

**Map all global variables from GLOBAL-STATE-MAP.md to this structure**

**Success:** Comprehensive state management

**Risk:** LOW

---

### Task 4.3: Create scroll.js - Lenis Integration
**Objective:** Extract scroll system to dedicated module

**Create:** `/js/scroll.js`

**Extract from dance-academy.js:**
- Lenis initialization (find where `new Lenis` appears)
- RAF loop setup
- Scroll event handling
- Reduced motion detection

**Reference EXTRACTION-TRACKER.md** - note which lines you're extracting

```javascript
/**
 * Smooth scroll system using Lenis
 */
import { setState, getState, updateState } from './state.js';
import { prefersReducedMotion } from './utils.js';

let lenis = null;
let rafId = null;
const scrollCallbacks = [];

/**
 * Initialize scroll system
 * MUST be called after DOM ready but before sections
 */
export function initScroll() {
  if (prefersReducedMotion()) {
    document.documentElement.style.scrollBehavior = 'smooth';
    setState({ flags: { ...getState('flags'), smoothScrollEnabled: false } });
    startFallbackRAF();
    return;
  }

  // Check if Lenis is available globally
  if (typeof window.Lenis === 'undefined') {
    console.error('Lenis not loaded - using fallback scroll');
    startFallbackRAF();
    return;
  }

  try {
    lenis = new window.Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1,
      smoothTouch: false,
      touchMultiplier: 2,
      infinite: false,
    });

    setState({ flags: { ...getState('flags'), isScrollSystemInitialized: true } });
    startRAF();

  } catch (error) {
    console.error('Lenis initialization failed:', error);
    startFallbackRAF();
  }
}

/**
 * Start RAF loop with Lenis
 */
function startRAF() {
  function raf(time) {
    if (lenis) {
      lenis.raf(time);
    }

    const scrollY = lenis ? lenis.scroll : window.scrollY;
    const lastY = getState('scroll.lastY');

    // Update state
    updateState('scroll', {
      y: scrollY,
      lastY: scrollY,
      direction: scrollY > lastY ? 'down' : 'up',
      isScrolling: true,
    });

    // Call all registered callbacks
    scrollCallbacks.forEach(cb => cb(scrollY));

    rafId = requestAnimationFrame(raf);
  }

  rafId = requestAnimationFrame(raf);
}

/**
 * Fallback RAF without Lenis
 */
function startFallbackRAF() {
  function raf() {
    const scrollY = window.scrollY;
    const lastY = getState('scroll.lastY');

    updateState('scroll', {
      y: scrollY,
      lastY: scrollY,
      direction: scrollY > lastY ? 'down' : 'up',
      isScrolling: true,
    });

    scrollCallbacks.forEach(cb => cb(scrollY));

    rafId = requestAnimationFrame(raf);
  }

  rafId = requestAnimationFrame(raf);
}

/**
 * Register scroll callback
 */
export function onScroll(callback) {
  scrollCallbacks.push(callback);

  // Return unsubscribe function
  return () => {
    const index = scrollCallbacks.indexOf(callback);
    if (index > -1) scrollCallbacks.splice(index, 1);
  };
}

/**
 * Scroll to element
 */
export function scrollTo(target) {
  if (lenis) {
    lenis.scrollTo(target);
  } else {
    const element = typeof target === 'string' ? document.querySelector(target) : target;
    element?.scrollIntoView({ behavior: 'smooth' });
  }
}

/**
 * Get current scroll position
 */
export function getScrollY() {
  return getState('scroll.y');
}

/**
 * Destroy scroll system
 */
export function destroy() {
  if (lenis) {
    lenis.destroy();
  }
  if (rafId) {
    cancelAnimationFrame(rafId);
  }
  scrollCallbacks.length = 0;
}
```

**Update EXTRACTION-TRACKER.md** - mark lines as extracted

**Success:** Scroll system isolated in dedicated module

**Risk:** MEDIUM (scroll is core functionality)

---

### Task 4.4: Create content.js - Content Loading
**Objective:** Extract content loading logic

**Create:** `/js/content.js`

**Extract from dance-academy.js:**
- fetch content.json
- populate DOM with content
- handle loading states

**Reference FUNCTION-CALL-GRAPH.md** - extract related functions

```javascript
/**
 * Content loading and DOM population
 */
import { setState } from './state.js';
import { API } from './config.js';

/**
 * Load content.json
 */
export async function loadContent() {
  try {
    const response = await fetch(API.contentUrl);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const content = await response.json();
    setState({ content });

    return content;

  } catch (error) {
    console.error('Failed to load content.json:', error);
    throw error;
  }
}

/**
 * Populate episodi section with content
 * Extract from dance-academy.js
 */
export function populateEpisodi(content) {
  // Find and extract the episodi population logic
  // This builds the sidebar, episode cards, etc.
  // Copy exactly from original code
}

/**
 * Populate missione section with content
 */
export function populateMissione(content) {
  // Extract missione population logic
}

/**
 * Populate other sections...
 */
// Add other population functions as found in original code
```

**Update EXTRACTION-TRACKER.md** - mark lines as extracted

**Success:** Content logic isolated

**Risk:** LOW-MEDIUM

---

### Task 4.5: Create Section Modules
**Objective:** Split each section into its own file

**For each section, follow this pattern:**

---

#### Task 4.5.1: Create hero.js
**Objective:** Extract hero section logic

**Create:** `/js/hero.js`

**Extract from dance-academy.js using FUNCTION-CALL-GRAPH.md:**
- All hero-related functions
- Hero animation logic
- Hero initialization

```javascript
/**
 * Hero section animations and logic
 */
import { setStyles, clamp } from './utils.js';
import { getState } from './state.js';

let heroElements = {};
let heroRanges = {};

/**
 * Initialize hero section
 */
export function initHero() {
  // Cache elements
  heroElements = {
    section: document.querySelector('#hero'),
    title: document.querySelector('#hero .title'),
    subtitle: document.querySelector('#hero .subtitle'),
    logo: document.querySelector('#hero .logo'),
    video: document.querySelector('#hero .background-video'),
  };

  // Calculate scroll ranges
  calculateRanges();

  // Setup any hero-specific event listeners
  // Extract from original code
}

/**
 * Update hero animations based on scroll position
 * Extract exact logic from dance-academy.js
 */
export function updateHero(scrollY) {
  if (!heroRanges.calculated) return;

  // Extract and copy exact animation logic from original
  // Find updateHeroAnimations or similar function
  // Copy calculations exactly - must be identical behavior
}

/**
 * Calculate scroll ranges for this section
 */
function calculateRanges() {
  if (!heroElements.section) return;

  const rect = heroElements.section.getBoundingClientRect();
  const sectionTop = rect.top + window.scrollY;
  const sectionHeight = rect.height;

  heroRanges = {
    start: sectionTop,
    end: sectionTop + sectionHeight,
    height: sectionHeight,
    calculated: true,
  };

  // Store in state if needed
  // setState({ animations: { hero: heroRanges } });
}

// Extract any other hero-specific functions from original code
```

**Update EXTRACTION-TRACKER.MD** - mark hero section lines as extracted

**Test:** Hero section must work identically

---

#### Task 4.5.2: Create episodes.js
**Objective:** Extract episodi section logic (largest/most complex)

**Create:** `/js/episodes.js`

**This is the MOST COMPLEX section - be methodical**

**Extract from dance-academy.js:**
- initEpisodiDesktop()
- initEpisodiMobile()
- updateEpisodiAnimations()
- Episode switching logic
- Accordion logic
- All episodi-related functions

**Use FUNCTION-CALL-GRAPH.md** to find all related functions

```javascript
/**
 * Episodi section - handles both mobile and desktop
 */
import { setStyles, clamp, isMobile } from './utils.js';
import { getState, setState } from './state.js';

let episodiElements = {};
let episodiRanges = {};
let players = []; // YouTube players

/**
 * Initialize episodi section
 */
export function initEpisodes() {
  // Check mobile or desktop
  const mobile = isMobile();
  setState({ flags: { ...getState('flags'), isMobile: mobile } });

  // Cache elements
  cacheElements();

  // Responsive initialization
  if (mobile) {
    initMobileLayout();
  } else {
    initDesktopLayout();
  }

  // Calculate ranges
  calculateRanges();
}

/**
 * Cache all episodi elements
 */
function cacheElements() {
  episodiElements = {
    section: document.querySelector('#episodi'),
    sidebar: document.querySelector('.episodi-sidebar-wrapper'),
    content: document.querySelector('.episodi-content-wrapper'),
    seasonToggles: document.querySelectorAll('[data-season-toggle]'),
    episodeButtons: document.querySelectorAll('[data-episode-button]'),
    // ... cache all needed elements
  };
}

/**
 * Initialize desktop layout
 * Extract exact logic from initEpisodiDesktop()
 */
function initDesktopLayout() {
  // Copy exact logic from dance-academy.js
  // Find initEpisodiDesktop function
  // Must preserve exact behavior
}

/**
 * Initialize mobile layout
 * Extract exact logic from initEpisodiMobile()
 */
function initMobileLayout() {
  // Copy exact logic from dance-academy.js
  // Find initEpisodiMobile function
}

/**
 * Update episodi animations
 * Extract exact logic from updateEpisodiAnimations()
 */
export function updateEpisodes(scrollY) {
  if (!episodiRanges.calculated) return;

  const mobile = getState('flags.isMobile');

  if (mobile) {
    updateMobileAnimations(scrollY);
  } else {
    updateDesktopAnimations(scrollY);
  }
}

/**
 * Update desktop animations
 * Extract exact logic
 */
function updateDesktopAnimations(scrollY) {
  // Copy exact logic from dance-academy.js
}

/**
 * Update mobile animations
 * Extract exact logic
 */
function updateMobileAnimations(scrollY) {
  // Copy exact logic from dance-academy.js
}

/**
 * Switch to a specific episode
 * Extract episode switching logic
 */
export function switchEpisode(seasonId, episodeId) {
  // Copy exact logic
  // This should work for both mobile and desktop
}

/**
 * Calculate scroll ranges
 */
function calculateRanges() {
  // Calculate episodi section ranges
}

// Extract ALL other episodi-related functions
// Reference FUNCTION-CALL-GRAPH.md
```

**Update EXTRACTION-TRACKER.MD** - mark all episodi lines as extracted

**Test:** Episodi section must work identically on both mobile and desktop

---

#### Task 4.5.3-4.5.5: Create mission.js, candidates.js, contacts.js
**Objective:** Extract remaining section logic

**Follow same pattern as hero.js and episodes.js:**

Each file exports:
- `initSectionName()`
- `updateSectionName(scrollY)`
- Internal helper functions

**Extract using:**
- FUNCTION-CALL-GRAPH.md
- EXTRACTION-TRACKER.md

**mission.js** - extract missione section logic
**candidates.js** - extract candidati section logic
**contacts.js** - extract contatti section logic

**Update EXTRACTION-TRACKER.MD** after each

---

### Task 4.6: Create carousel.js
**Objective:** Extract mobile carousel to dedicated module

**Create:** `/js/carousel.js`

**Extract from dance-academy.js:**
- Mobile carousel logic
- YouTube player integration
- Auto-play functionality
- Touch/swipe handling (if present)

**Update EXTRACTION-TRACKER.MD**

---

### Task 4.7: Create navigation.js
**Objective:** Extract header and progress bar logic

**Create:** `/js/navigation.js`

**Extract from dance-academy.js:**
- HEADER_REGISTRY logic
- Header active section highlighting
- Progress bar updates
- Section tracking
- Anchor link handling

**This includes complex logic - reference FUNCTION-CALL-GRAPH.md**

**Update EXTRACTION-TRACKER.MD**

---

### Task 4.8: Create main.js - Orchestration (**ENHANCED**)
**Objective:** Create entry point that coordinates all modules

**Create:** `/js/main.js`

**CRITICAL: Follow INIT-ORDER.md exactly**

```javascript
/**
 * Dance Academy Website - Main Entry Point
 *
 * Initialization sequence:
 * 1. DOM ready check
 * 2. Content loading
 * 3. Section initialization
 * 4. Scroll system initialization
 * 5. Event registration
 */

import { initScroll, onScroll } from './scroll.js';
import { loadContent, populateEpisodi, populateMissione } from './content.js';
import { initHero, updateHero } from './hero.js';
import { initEpisodes, updateEpisodes } from './episodes.js';
import { initMission, updateMission } from './mission.js';
import { initCandidates, updateCandidates } from './candidates.js';
import { initContacts, updateContacts } from './contacts.js';
import { initCarousel } from './carousel.js';
import { initNavigation, updateNavigation } from './navigation.js';
import { setState, getState } from './state.js';
import { isMobile } from './utils.js';

/**
 * Initialize application
 * MUST follow exact order from INIT-ORDER.md
 */
async function init() {
  try {
    console.log('Initializing Dance Academy Website...');

    // PHASE 1: Load content first
    const content = await loadContent();

    // PHASE 2: Populate DOM with content
    populateEpisodi(content);
    populateMissione(content);
    // ... populate other sections

    // PHASE 3: Initialize sections (calculates scroll ranges)
    initHero();
    initEpisodes();
    initMission();
    initCandidates();
    initContacts();
    initNavigation();

    // PHASE 4: Initialize mobile carousel if needed
    if (isMobile()) {
      initCarousel();
    }

    // PHASE 5: Start scroll system (AFTER sections initialized)
    initScroll();

    // PHASE 6: Register scroll updates
    onScroll((scrollY) => {
      updateNavigation(scrollY);
      updateHero(scrollY);
      updateEpisodes(scrollY);
      updateMission(scrollY);
      updateCandidates(scrollY);
      updateContacts(scrollY);
    });

    console.log('Initialization complete');

  } catch (error) {
    console.error('Initialization failed:', error);
    // Show user-friendly error
    showError('Failed to load website. Please refresh the page.');
  }
}

/**
 * Show error message to user
 */
function showError(message) {
  const errorDiv = document.createElement('div');
  errorDiv.style.cssText = 'position:fixed;top:20px;left:50%;transform:translateX(-50%);background:red;color:white;padding:20px;border-radius:8px;z-index:9999;';
  errorDiv.textContent = message;
  document.body.appendChild(errorDiv);
}

/**
 * Start when DOM is ready
 * CRITICAL: Modules load asynchronously, must wait for DOM
 */
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  // DOM already loaded
  init();
}
```

**Success:** Clean entry point, clear initialization flow

**Risk:** LOW

---

### Task 4.9: Update index.html Script Tags (**ENHANCED**)
**Objective:** Load new modular JavaScript

**In index.html:**

**Find current:**
```html
<script src="dance-academy.js"></script>
```

**Replace with (EXACT ORDER MATTERS):**
```html
<!-- Lenis must load BEFORE modules -->
<script src="https://cdn.jsdelivr.net/gh/studio-freight/lenis@latest/bundled/lenis.min.js"></script>

<!-- Main module entry point -->
<script type="module" src="js/main.js"></script>

<!-- Form handler (keep separate for now) -->
<script src="form-handler.js"></script>

<!-- Browser compatibility warning -->
<script nomodule>
  alert('Your browser is too old to view this site. Please update to a modern browser.');
</script>
```

**Test with slow network:**
- Chrome DevTools > Network > Throttling > Slow 3G
- Reload page
- Verify everything still loads correctly
- No race conditions

**Success:** Modules load, site works

**Risk:** MEDIUM (integration point)

---

### Task 4.10: Verify Extraction Complete (**CRITICAL - ENHANCED**)
**Objective:** Verify ALL code migrated before deleting dance-academy.js

**⚠️ DO NOT DELETE dance-academy.js UNTIL ALL CHECKS PASS**

**Create:** `EXTRACTION-COMPLETENESS.md`

```markdown
# Extraction Completeness Verification

## 1. Line Count Verification

### Original File:
- dance-academy.js: 5,422 lines

### New Modules (measure actual):
```bash
wc -l js/state.js
wc -l js/scroll.js
wc -l js/content.js
wc -l js/hero.js
wc -l js/episodes.js
wc -l js/mission.js
wc -l js/candidates.js
wc -l js/contacts.js
wc -l js/carousel.js
wc -l js/navigation.js
wc -l js/main.js
```

### Sum of new modules: _____ lines
### Dead code deleted: _____ lines (from Phase 2)
### Comments deleted: _____ lines (from Phase 2)
### Console logs deleted: _____ lines (from Phase 2)

### TOTAL MUST EQUAL 5,422: _____

---

## 2. Function Verification

From FUNCTION-CALL-GRAPH.md (78 functions):

- [ ] getCurrentScroll → utils.js
- [ ] setActiveSection → navigation.js
- [ ] updateHeroAnimations → hero.js
- [ ] initEpisodiDesktop → episodes.js
- [ ] initEpisodiMobile → episodes.js
- [ ] updateEpisodiAnimations → episodes.js
- [ ] ... (continue for all 78 functions)

### All 78 functions accounted for: YES / NO

---

## 3. Global Variable Verification

From GLOBAL-STATE-MAP.md (25+ globals):

- [ ] siteContent → state.js
- [ ] hasEpisodes → state.js
- [ ] lenis → scroll.js (local)
- [ ] isScrollSystemInitialized → state.js
- [ ] typographyState → state.js
- [ ] currentActiveSection → state.js
- [ ] HEADER_REGISTRY → navigation.js OR state.js
- [ ] episodiAnimationState → episodes.js OR state.js
- [ ] ... (continue for all globals)

### All globals accounted for: YES / NO

---

## 4. Event Listener Verification

Count event listeners in original:
```bash
grep -c "addEventListener" dance-academy.js
```
Result: _____ listeners

Count in new modules:
```bash
grep -c "addEventListener" js/*.js
```
Result: _____ listeners

### Counts match: YES / NO

---

## 5. DOM Query Verification

Count DOM queries in original:
```bash
grep -c "querySelector\|getElementById\|getElementsBy" dance-academy.js
```
Result: _____ queries

Verify all are in new modules - no broken references

### All queries migrated: YES / NO

---

## 6. Animation Logic Verification

- [ ] Hero animations: in hero.js
- [ ] Episodi animations: in episodes.js
- [ ] Missione animations: in mission.js
- [ ] Candidati animations: in candidates.js
- [ ] Contatti animations: in contacts.js

### All animations migrated: YES / NO

---

## 7. Special Systems Verification

- [ ] Section isolation system → where? ___________
- [ ] Video background system → where? ___________
- [ ] Header registry → navigation.js
- [ ] Typography system → where? ___________
- [ ] Scroll coupling/decoupling → scroll.js

### All systems accounted for: YES / NO

---

## 8. Remaining Code in dance-academy.js

```bash
# Count non-comment, non-blank lines
grep -v "^//" dance-academy.js | grep -v "^$" | grep -v "^\s*$" | wc -l
```

Result: _____ lines

### Should be ZERO (or only dead code marked for deletion)

If > 0, investigate each line:
```bash
grep -v "^//" dance-academy.js | grep -v "^$" | grep -v "^\s*$" | head -20
```

### Verify all remaining lines are:
- [ ] Dead code (verified unused)
- [ ] OR already extracted elsewhere

---

## 9. Final Functional Test

Run complete TEST-SCRIPT.md:
- [ ] Desktop test: PASS
- [ ] Mobile test: PASS
- [ ] Console errors: ZERO
- [ ] All animations working: YES
- [ ] All interactions working: YES

---

## 10. Final Checklist

- [ ] Line count accounts for all 5,422 lines
- [ ] All 78 functions migrated
- [ ] All 25+ globals migrated
- [ ] Event listeners match
- [ ] DOM queries match
- [ ] All animations working
- [ ] All special systems migrated
- [ ] dance-academy.js contains only dead code
- [ ] Full test passes
- [ ] Screenshots match baseline

### READY TO DELETE: YES / NO
```

**Work through this checklist methodically**

**Only when ALL checks pass, proceed to next task**

---

### Task 4.11: Delete dance-academy.js (**FINAL STEP**)
**Objective:** Remove monolithic file after successful migration

**Prerequisites (ALL must be true):**
- [ ] EXTRACTION-COMPLETENESS.md: ALL checks passed
- [ ] Full TEST-SCRIPT.md: PASSED
- [ ] Screenshots: MATCH baseline
- [ ] Console: ZERO errors
- [ ] Performance: Within 10% of baseline

**If ANY prerequisite fails: DO NOT DELETE, fix issue first**

**When all pass:**

```bash
# One final test
npm start  # or however you run the site
# Test thoroughly

# If all good, delete
git rm dance-academy.js
git commit -m "Remove monolithic dance-academy.js - successfully split into modules"

# Tag this milestone
git tag modules-complete
```

**Success:** Monolithic file gone, modular structure works perfectly

**Risk:** LOW (after comprehensive verification)

---

## PHASE 4 CHECKPOINT ✓

**Deliverable:**
- 13 focused JavaScript modules
- Each module 100-500 lines
- Clear separation of concerns
- dance-academy.js deleted
- Everything working identically
- All verification documents completed
- All 5,422 lines accounted for

**STOP AND TEST THOROUGHLY FOR 30+ MINUTES**

---

## PHASE 5: Consolidate Mobile/Desktop (2-3 hours)

### Task 5.1: Analyze Mobile/Desktop Duplication
**Objective:** Identify where logic is duplicated

**Search for:**
```bash
grep -n "isMobile\|window.innerWidth.*768" js/*.js > mobile-checks.txt
```

**Document in mobile-checks.txt:**
- Where mobile/desktop branches exist
- Which logic is duplicated vs truly different
- Opportunities for unification

**Success:** Clear picture of duplication

**Risk:** LOW (analysis only)

---

### Task 5.2: Unify Episodes Logic
**Objective:** Single codebase for episodes, responsive behavior

**In `/js/episodes.js`:**

**Current (duplicated):**
```javascript
if (isMobile) {
  initMobileEpisodes(); // Separate implementation
} else {
  initDesktopEpisodes(); // Separate implementation
}
```

**Target (unified):**
```javascript
function initEpisodes() {
  // Shared initialization
  cacheElements();
  loadEpisodeContent();

  // Responsive-specific setup
  setupResponsiveLayout();
  setupEventListeners();
}

function setupResponsiveLayout() {
  const mobile = isMobile();

  if (mobile) {
    // Mobile-specific DOM setup (dropdown vs sidebar)
    setupMobileUI();
  } else {
    // Desktop-specific DOM setup
    setupDesktopUI();
  }
}

function switchEpisode(season, episode) {
  // SHARED logic works for both mobile and desktop
  // No duplication
  updateEpisodeContent(season, episode);
  updateActiveButton(season, episode);
}
```

**Success:** Single episode switching logic, responsive UI

**Risk:** MEDIUM (complex section)

---

### Task 5.3: Unify Candidates Logic
**Objective:** Single codebase for candidati, responsive behavior

**Similar approach:**
- Shared card switching logic
- Shared form validation
- Different UI presentation (cards vs mobile forms)

**Success:** Duplication eliminated

**Risk:** MEDIUM

---

### Task 5.4: Handle Resize Events
**Objective:** Graceful layout transitions on resize

**Add to main.js:**
```javascript
import { debounce } from './utils.js';
import { setState, getState } from './state.js';
import { ANIMATION } from './config.js';
import { initEpisodes } from './episodes.js';
import { initCandidates } from './candidates.js';

window.addEventListener('resize', debounce(() => {
  const wasMobile = getState('flags.isMobile');
  const nowMobile = window.innerWidth <= 768;

  if (wasMobile !== nowMobile) {
    // Layout changed
    setState({ flags: { ...getState('flags'), isMobile: nowMobile } });

    // Reinitialize sections that need layout changes
    initEpisodes();
    initCandidates();
  }
}, 150));
```

**Success:** Smooth mobile/desktop transitions

**Risk:** LOW-MEDIUM

---

## PHASE 5 CHECKPOINT ✓

**Deliverable:**
- Unified mobile/desktop logic
- Responsive UI without code duplication
- Smooth resize handling
- ~200-400 lines reduced

---

## PHASE 6: CSS Cleanup (1-2 hours)

### Task 6.1: Extract CSS Utilities
**Objective:** Create utility classes for repeated patterns

**Find repeated CSS:**
```bash
# Find repeated rgba colors
grep -o "rgba([^)]*)" css/*.css | sort | uniq -c | sort -rn

# Find repeated box-shadows
grep -o "box-shadow: [^;]*" css/*.css | sort | uniq -c | sort -rn
```

**Add to `/css/base.css`:**
```css
/* ============================================
   UTILITY CLASSES
   ============================================ */

.glass-effect {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.25);
}

.shadow-depth {
  box-shadow: /* Copy exact 5-layer shadow from codebase */;
}

.fade-in {
  opacity: 0;
  transition: opacity 0.6s ease;
}

.fade-in.visible {
  opacity: 1;
}
```

**Update components in HTML** to use utility classes

**Success:** CSS duplication reduced

**Risk:** LOW

---

### Task 6.2: Consolidate Media Queries
**Objective:** Clean up responsive.css

**In `/css/responsive.css`:**

**Organize by breakpoint:**
```css
/* ============================================
   TABLET (768px and below)
   ============================================ */
@media (max-width: 768px) {
  /* Group all tablet overrides by component */

  /* Header */
  header { ... }

  /* Hero */
  #hero { ... }

  /* Episodi */
  #episodi { ... }

  /* etc */
}

/* ============================================
   MOBILE (480px and below)
   ============================================ */
@media (max-width: 480px) {
  /* All mobile overrides */
}
```

**Remove:**
- Duplicate property overrides
- Unnecessary !important flags
- Overrides that don't change anything

**Success:** Cleaner, more maintainable responsive CSS

**Risk:** MEDIUM (responsive is delicate)

---

## PHASE 6 CHECKPOINT ✓

**Deliverable:**
- DRY CSS with utilities
- Clean responsive stylesheet
- ~100-200 lines reduced

---

## PHASE 7: Final Polish & Verification (1-2 hours)

### Task 7.1: Add Minimal Documentation
**Objective:** Document key functions and modules

**For each module, add file header:**
```javascript
/**
 * @file hero.js
 * @description Hero section animations
 *
 * Handles:
 * - Logo fade in/out on scroll
 * - Title/subtitle animations
 * - Background video state
 * - Viewport-based opacity calculations
 */
```

**For complex functions:**
```javascript
/**
 * Update hero animations based on scroll position
 * @param {number} scrollY - Current scroll position in pixels
 */
export function updateHero(scrollY) {
  // ...
}
```

**Don't over-document** - code should be self-explanatory

**Success:** Key areas documented

**Risk:** LOW

---

### Task 7.2: Verify No Emojis Remain (**CRITICAL**)
**Objective:** Triple-check emoji removal

```bash
grep -r "🎯\|✅\|⏳\|⚠️\|🔍\|✓\|🚀\|💡\|📦\|🔥" js/ css/ *.js *.html *.md
```

**Should return:** NOTHING (except in this plan file)

**If found:** DELETE immediately

**Success:** Zero emojis in production code

**Risk:** NONE

---

### Task 7.3: Final Comprehensive Testing (**ENHANCED**)
**Objective:** Rigorous testing with objective verification

**Run complete TEST-SCRIPT.md:**
- [ ] Desktop (1920px, 1440px, 1024px): ALL tests pass
- [ ] Mobile (768px, 414px, 375px): ALL tests pass
- [ ] Tablet (1024px): ALL tests pass
- [ ] Browsers (Chrome, Firefox, Safari): ALL pass
- [ ] Console: ZERO errors, ZERO warnings, ZERO logs
- [ ] Performance: Within 10% of baseline

**Screenshot Comparison:**
```bash
# Compare new screenshots to baseline
# Use image diff tool or manual pixel-peeping
# ANY visual difference = failure
```

**Performance Comparison:**
```bash
# Run Lighthouse again
# Compare to baseline measurements

Performance score: baseline ±10 points acceptable
Load time: baseline ±10% acceptable
Animation FPS: must be 60fps (same as baseline)
```

**Screen Recording Comparison:**
- Play baseline recording and new recording side-by-side
- Verify animations have identical timing and feel
- Verify smooth scroll behavior identical

**Success:** Everything working perfectly, indistinguishable from baseline

---

### Task 7.4: Code Metrics & Comparison
**Objective:** Document improvement achieved

**Create:** `FINAL-METRICS.md`

```markdown
# Final Metrics - Dance Academy Restructuring

## Before (Baseline)
- dance-academy.js: 5,422 lines
- index.html: 2,195 lines (1,794 embedded CSS)
- form-handler.js: 473 lines
- Total: 8,090 lines
- Console logs: 110
- Emoji logs: 22
- Global state objects: 25+
- CSS files: 0

## After (Restructured)
- JS modules: _____ lines (across 13 files)
- CSS files: _____ lines (across 5 files)
- HTML: _____ lines
- form-handler.js: _____ lines (cleaned)
- Total: _____ lines
- Console logs: 0-3 (errors only)
- Emoji logs: 0
- Global state objects: 1 (centralized)
- CSS files: 5

## Reduction
- Total lines: _____ → _____ (_____% reduction)
- Main JS: 5,422 lines → split into 13 modules
- Embedded CSS: 1,794 lines → 0 (external files)
- Console logs: 110 → 0-3
- Emoji logs: 22 → 0

## Performance
- DOMContentLoaded: baseline _____ ms → new _____ ms
- Load event: baseline _____ ms → new _____ ms
- FCP: baseline _____ ms → new _____ ms
- Lighthouse Performance: baseline _____ → new _____

## Maintainability Improvements
- ✅ Clear module boundaries
- ✅ Reusable utility functions
- ✅ Centralized configuration
- ✅ Centralized state management
- ✅ Organized CSS files
- ✅ No code duplication
- ✅ Professional, production-ready code
```

**Success:** Comprehensive metrics showing improvement

---

### Task 7.5: Create Code Structure Guide
**Objective:** Document for future developers

**Create:** `CODE-STRUCTURE.md`

```markdown
# Code Structure - Dance Academy Website

## File Organization

### HTML
- `index.html` - Main HTML structure (links to external CSS/JS)

### CSS (/css/)
- `base.css` - Variables, typography, resets, utilities
- `layout.css` - Section layouts, grid, positioning
- `components.css` - Buttons, forms, cards, sidebar, etc.
- `animations.css` - Transitions, keyframes, scroll animations
- `responsive.css` - All media queries (768px, 480px, 320px)

### JavaScript (/js/)
- `main.js` - Entry point, initialization orchestration
- `config.js` - Configuration constants (breakpoints, z-index, etc.)
- `utils.js` - Reusable utilities (easing, math, DOM helpers)
- `state.js` - Centralized application state
- `scroll.js` - Smooth scroll system (Lenis integration)
- `content.js` - Content loading (content.json)
- `hero.js` - Hero section logic and animations
- `episodes.js` - Episodi section (desktop sidebar + mobile dropdown)
- `mission.js` - Missione section logic
- `candidates.js` - Candidati section (form and cards)
- `contacts.js` - Contatti section logic
- `carousel.js` - Mobile video carousel
- `navigation.js` - Header and progress bar

### Other
- `form-handler.js` - Form validation and submission (separate)
- `content.json` - Content data

## Key Patterns

### Adding a New Section
1. Create `/js/new-section.js`
2. Export `initNewSection()` and `updateNewSection(scrollY)`
3. Import in `main.js`
4. Call `initNewSection()` in init sequence
5. Call `updateNewSection(scrollY)` in scroll callback

### Modifying Section Animations
1. Find section file (e.g., `hero.js`)
2. Modify `updateHero(scrollY)` function
3. Use utilities from `utils.js` (clamp, lerp, easing)
4. Test thoroughly

### Changing Styles
- Design system variables: `css/base.css` (:root section)
- Section layout: `css/layout.css`
- Component styles: `css/components.css`
- Animations: `css/animations.css`
- Mobile overrides: `css/responsive.css`

### Accessing State
```javascript
import { getState, setState, updateState } from './state.js';

// Get value
const scrollY = getState('scroll.y');
const isMobile = getState('flags.isMobile');

// Set value
setState({ activeSection: 'hero' });

// Deep update
updateState('scroll.y', 1000);
```

### Scroll Callbacks
```javascript
import { onScroll } from './scroll.js';

// Register callback
const unsubscribe = onScroll((scrollY) => {
  // Called every frame
});

// Unsubscribe when done
unsubscribe();
```

## Initialization Order (CRITICAL)

Do NOT change initialization order without testing:

1. Load content (async)
2. Populate DOM
3. Initialize sections (calculates ranges)
4. Initialize scroll system
5. Register callbacks

See `main.js` for exact sequence.

## Testing

Run `TEST-SCRIPT.md` after any changes:
- Desktop test (10 min)
- Mobile test (10 min)
- Cross-browser check

## Performance

- Keep scroll callbacks lightweight
- Avoid DOM queries in RAF loop
- Use cached values from state
- Test with DevTools Performance tab
```

**Success:** Clear guide for future work

---

## PHASE 7 CHECKPOINT ✓

**Final Deliverable:**
- Documented code
- ZERO emojis
- Fully tested (30+ minutes of rigorous testing)
- Metrics documented
- Code structure guide created
- Ready for production

---

## File Structure (Target)

```
Dance-Academy-Website/
├── index.html                  (~400 lines, clean HTML)
├── content.json                (215 lines)
├── form-handler.js             (~400 lines, cleaned)
│
├── css/
│   ├── base.css                (~300 lines)
│   ├── layout.css              (~300 lines)
│   ├── components.css          (~400 lines)
│   ├── animations.css          (~200 lines)
│   └── responsive.css          (~300 lines)
│   TOTAL: ~1,500 lines
│
├── js/
│   ├── main.js                 (~150 lines)
│   ├── config.js               (~80 lines)
│   ├── utils.js                (~150 lines)
│   ├── state.js                (~100 lines)
│   ├── scroll.js               (~180 lines)
│   ├── content.js              (~200 lines)
│   ├── navigation.js           (~250 lines)
│   ├── hero.js                 (~250 lines)
│   ├── episodes.js             (~600 lines)
│   ├── mission.js              (~200 lines)
│   ├── candidates.js           (~400 lines)
│   ├── contacts.js             (~150 lines)
│   └── carousel.js             (~200 lines)
│   TOTAL: ~2,910 lines
│
├── Assets/
│   └── (images, videos, etc.)
│
├── docs/ (temporary, in .gitignore)
│   ├── CODE-STRUCTURE.md
│   ├── EXTRACTION-TRACKER.md
│   ├── GLOBAL-STATE-MAP.md
│   ├── FUNCTION-CALL-GRAPH.md
│   ├── INIT-ORDER.md
│   ├── CSS-EXTRACTION-LOG.md
│   ├── TEST-SCRIPT.md
│   ├── baseline-measurements.txt
│   ├── FINAL-METRICS.md
│   └── EXTRACTION-COMPLETENESS.md
```

**Total Production Code:** ~5,225 lines (vs 8,090 before)
**Reduction:** ~35%

---

## Testing Strategy

### After Each Task
- Quick visual check
- Quick functionality check
- Console check (no errors)

### After Each Phase
- Run relevant section of TEST-SCRIPT.md
- Screenshot comparison
- Console verification

### Final (Phase 7)
- Complete TEST-SCRIPT.md (30+ minutes)
- Pixel-perfect screenshot comparison
- Performance comparison to baseline
- Cross-browser testing
- 60fps animation verification

---

## Rollback & Safety

### Git Strategy
```bash
# Before starting
git checkout -b restructure-v2
git tag pre-restructure-v2

# After each phase
git add .
git commit -m "Phase N complete: [description]"

# Tag major milestones
git tag phase-1-css-complete
git tag phase-4-modules-complete

# If something breaks
git reset --hard HEAD~1  # Undo last commit
# OR
git reset --hard pre-restructure-v2  # Full rollback
# OR
git reset --hard phase-1-css-complete  # Rollback to specific phase
```

### Emergency Rollback Procedure
1. Don't panic
2. `git tag emergency-backup HEAD` (save current state)
3. `git reset --hard pre-restructure-v2` (rollback)
4. `git checkout emergency-backup` (review what broke)
5. Fix in new branch, re-apply carefully

---

## Success Metrics

### Quantitative
| Metric | Before | Target | Final |
|--------|--------|--------|-------|
| Total Lines | 8,090 | ~5,200 | _____ |
| Main JS File | 5,422 | 0 (split) | _____ |
| CSS in HTML | 1,794 | 0 | _____ |
| Console Logs | 110 | 0 | _____ |
| Emoji Logs | 22 | 0 | _____ |
| Global State | 25+ | 1 | _____ |
| JS Files | 1 | 13 | _____ |
| CSS Files | 0 | 5 | _____ |

### Qualitative
- [ ] Code is readable and self-explanatory
- [ ] New developer can understand in 30 min
- [ ] Can add new section in 1-2 hours
- [ ] No confusion about where code lives
- [ ] Consistent patterns
- [ ] Professional code

### Functional (CRITICAL)
- [ ] Pixel-perfect visual match to baseline
- [ ] Identical animation timing and behavior
- [ ] Identical interaction behavior
- [ ] Performance within 10% of baseline
- [ ] ZERO console errors

---

## Risk Management

### Highest Risk Tasks
1. **Task 4.5 (Section Modules)** - MEDIUM-HIGH
   - Mitigation: Use EXTRACTION-TRACKER.md, test each section
2. **Task 4.10 (Verify Complete)** - HIGH if rushed
   - Mitigation: Use EXTRACTION-COMPLETENESS.md, don't skip checks
3. **Task 1.6 (Responsive CSS)** - MEDIUM
   - Mitigation: Test all viewports, screenshot comparison
4. **Task 5.2-5.3 (Unify Logic)** - MEDIUM
   - Mitigation: Test both mobile and desktop thoroughly

### If You Get Stuck
1. Consult relevant tracking document
2. Test in isolation
3. Commit current progress
4. Take a break
5. Review with fresh eyes
6. Ask for help if needed

---

## Estimated Time Investment

| Phase | Time | Risk |
|-------|------|------|
| Phase 0: Prep | 1 hr | LOW |
| Phase 1: CSS | 2-3 hrs | LOW-MEDIUM |
| Phase 2: Clean | 1-2 hrs | LOW |
| Phase 3: Utils | 1-2 hrs | LOW |
| Phase 4: Modules | 4-6 hrs | MEDIUM-HIGH |
| Phase 5: Unify | 2-3 hrs | MEDIUM |
| Phase 6: CSS | 1-2 hrs | LOW-MEDIUM |
| Phase 7: Polish | 1-2 hrs | LOW |
| **TOTAL** | **13-21 hrs** | |

**Recommended:** 3-4 work sessions over 1 week

---

## Next Steps

**To Execute This Plan:**

1. Read entire plan thoroughly
2. Understand the verification strategy
3. Start with Phase 0 (safety first)
4. Execute phases sequentially
5. Don't skip verification steps
6. Test after each phase
7. Use tracking documents
8. Reference specific task numbers in prompts

**Example prompts for future AI:**
- "Execute Task 0.2: Baseline Measurements"
- "Let's do Task 1.2: Extract Base Styles"
- "I'm ready for Task 4.0.1: Create Extraction Tracker"
- "Execute Task 4.5.2: Create episodes.js module"
- "Run verification Task 4.10: Verify Extraction Complete"

---

## CRITICAL REMINDERS

### For Future AI Executing This Plan:

1. **FUNCTIONALITY MUST BE IDENTICAL**
   - Any visual change = failure
   - Any behavioral change = failure
   - Use objective measurements, not "looks good enough"

2. **TRACK EVERYTHING**
   - Use EXTRACTION-TRACKER.md for line accounting
   - Use GLOBAL-STATE-MAP.md for state variables
   - Use FUNCTION-CALL-GRAPH.md for dependencies
   - Don't assume - verify

3. **TEST AFTER EVERY CHANGE**
   - Quick test after each task
   - Full test after each phase
   - Screenshot comparison
   - Console verification

4. **DON'T DELETE UNTIL VERIFIED**
   - Task 4.10 has comprehensive verification
   - ALL checks must pass
   - No shortcuts

5. **FOLLOW INITIALIZATION ORDER**
   - INIT-ORDER.md is critical
   - Wrong order = broken site
   - Don't rearrange without testing

6. **WHEN IN DOUBT**
   - Commit current progress
   - Test more
   - Consult tracking documents
   - Be systematic

---

## Final Notes

**This plan addresses 17 critical failure points identified in risk analysis.**

- Systematic extraction tracking prevents lost code
- Dependency mapping prevents broken references
- Hierarchical state handles complex state properly
- CSS preservation prevents cascade issues
- Specific testing prevents visual regressions
- Comprehensive verification ensures completeness

**The goal:** Clean, maintainable code that is functionally identical to the original.

**Success criteria:** A future developer (or AI) looks at the code and thinks "this makes sense" instead of "what the hell?"

**Execute methodically. Test rigorously. Verify thoroughly.**

Good luck!
