# Scroll Container Removal - Comprehensive Analysis

## Current State

### What is `.scroll-container`?
- A `<main>` wrapper around all section blocks
- Starts with `opacity: 0`
- Gets `.animate` class added after intro animation (4.5s delay)
- Fades in with `animation: fadeIn 0.5s ease-in forwards`

### Current DOM Structure
```
body
├─ video-bg (fixed, z-index: -1)
├─ main.scroll-container
│  ├─ .hero-block.block
│  ├─ .episodi-block.block
│  ├─ .missione-block.block
│  ├─ .candidati-spacer.block (spacer only)
│  └─ .contatti-block.block
├─ .candidati-title-wrapper (fixed, outside scroll-container)
├─ .candidati-card-wrapper × 5 (fixed, outside scroll-container)
└─ .submit-button-container (fixed, outside scroll-container)
```

## JavaScript Dependencies Analysis

### 1. **Intro Animation Sequence** (lines 1563-1613)
```javascript
const scrollContainer = document.querySelector('.scroll-container');
// ...
scrollContainer.classList.add('animate');
```

**Impact**: Need to handle fade-in differently
**Solution**: Apply fade-in to individual blocks OR remove fade-in entirely (video background already fades in)

---

### 2. **Block Tracking System** (line 773)
```javascript
cachedBlocks = document.querySelectorAll('.block');
```

**Impact**: NONE - `.block` selector still works, blocks just become body children
**Solution**: No changes needed

---

### 3. **Scroll Position Calculations** (lines 807-808, 1051-1052, 1119)
```javascript
const sectionTop = block.offsetTop;
const sectionHeight = block.offsetHeight;
```

**Impact**: NONE - `offsetTop` measures from offsetParent (body when no positioned ancestor)
**Solution**: No changes needed - measurements will work identically

---

### 4. **Progress Bar Logic** (lines 802-830)
Uses `block.offsetTop` and `block.offsetHeight` to calculate progress

**Impact**: NONE - calculations are relative to document, not container
**Solution**: No changes needed

---

### 5. **Header Navigation** (lines 1046-1070)
Uses `block.offsetTop` and `block.offsetHeight` to determine active section

**Impact**: NONE - works the same with or without container
**Solution**: No changes needed

---

### 6. **Smooth Scroll to Section** (lines 1117-1150)
```javascript
const targetY = target.offsetTop;
```

**Impact**: NONE - offsetTop works the same
**Solution**: No changes needed

---

## CSS Dependencies Analysis

### 1. **Fade-in Animation**
```css
.scroll-container {
    opacity: 0;
}
.scroll-container.animate {
    animation: fadeIn 0.5s ease-in forwards;
}
```

**Impact**: Need alternative fade-in approach
**Solution Options**:
- A) Remove fade-in entirely (video already provides smooth entrance)
- B) Apply to body element
- C) Apply to individual blocks

---

### 2. **Stacking Context Issues**

**Current Problem**: `.scroll-container` with overflow properties creates containing blocks that prevent `backdrop-filter` on accordions from seeing video background

**After Removal**:
- All sections at body level
- Direct stacking context with video background
- `backdrop-filter` will work on ALL elements (accordions, any glassmorphism)

---

## Proposed New Structure

```
body
├─ video-bg (fixed, z-index: -1)
├─ .hero-block.block
├─ .episodi-block.block
├─ .missione-block.block
├─ .candidati-spacer.block
├─ .contatti-block.block
├─ .candidati-title-wrapper (fixed)
├─ .candidati-card-wrapper × 5 (fixed)
└─ .submit-button-container (fixed)
```

All blocks are siblings at body level, no wrapper container.

---

## Required Changes

### HTML (index.html)
1. Remove `<main class="scroll-container">` opening tag (line 1250)
2. Remove `</main>` closing tag (line 1279)
3. Keep all sections as they are (just become body children)

### CSS (index.html)
1. **OPTION A - Remove fade-in** (RECOMMENDED):
   - Delete `.scroll-container` styles (lines 268-274)
   - Sections just appear when video fades in

2. **OPTION B - Fade body**:
   - Change `.scroll-container` to `body` in CSS
   - Add animate class to body instead

3. **OPTION C - Fade blocks individually**:
   - Apply opacity: 0 to `.block`
   - Stagger fade-in for each block

### JavaScript (dance-academy.js)
1. **Intro animation** (lines 1563, 1605, 1582, 1612):
   - OPTION A: Remove scrollContainer references entirely
   - OPTION B: Change to body element
   - OPTION C: Add animate class to each block

2. **No other changes needed** - all other code works identically

---

## Benefits

✅ **Simpler DOM structure** - fewer nested elements
✅ **Same scroll behavior** - Lenis works on window by default
✅ **Same tracking logic** - offsetTop/offsetHeight unchanged
✅ **Better stacking context** - all elements in root context
⚠️ **Partial blur fix** - Removes one stacking context layer, but accordions still nested in overflow containers

---

## IMPORTANT: Episodi Glassmorphism Limitation

### Issue
Even after removing `.scroll-container`, accordions STILL won't have working blur because:

```
body
├─ video-bg (fixed, z-index: -1)
└─ .episodi-block (overflow: hidden)          ← Stacking context barrier
   └─ .episodi-container (overflow: hidden)   ← Stacking context barrier
      └─ .sidebar (overflow-y: auto)          ← Stacking context barrier
         └─ .accordion-header (backdrop-filter) ← Can't "see" video!
```

The nested overflow properties create containing blocks that prevent `backdrop-filter` from accessing the video background.

### Solution Options

**A) Accept no blur on accordions**
- Keep current episodi structure
- Use solid background color instead
- Simplest approach

**B) Restructure episodi like candidati** (complex)
- Create `.episodi-spacer` in document flow
- Make sidebar + content area fixed positioned at body level
- Show/hide based on scroll position
- Handle sidebar internal scrolling separately
- This would enable blur on accordions

**C) Hybrid approach**
- Remove scroll-container (benefits all sections)
- Keep accordions with solid background (accept limitation)
- Consider episodi restructuring as separate future enhancement

---

## Risks

⚠️ **Minimal Risk**: Only the fade-in animation needs adjustment
⚠️ **Testing Required**: Verify all scroll-triggered animations work identically
⚠️ **Accordion blur**: Will NOT work after this change alone - needs episodi restructuring

---

## Recommendation

**PROCEED WITH SCROLL-CONTAINER REMOVAL + DECIDE ON EPISODI**

### Phase 1: Remove scroll-container (SAFE, RECOMMENDED)
Use **OPTION A** (remove fade-in entirely):
- Simplest approach
- Video background already provides smooth entrance
- Eliminates unnecessary animation complexity
- All other functionality remains 100% identical
- Improves stacking context for future enhancements

The scroll-container serves no functional purpose for Lenis or scroll tracking.

### Phase 2: Episodi Glassmorphism (USER DECISION REQUIRED)

After scroll-container removal, accordion blur still won't work. Options:

1. **Keep current episodi structure** (RECOMMENDED FOR NOW)
   - Accept solid background on accordions
   - Simple, no risk
   - Everything works as-is

2. **Restructure episodi section** (COMPLEX, SEPARATE TASK)
   - Would require candidati-style architecture
   - Fixed positioning + spacer
   - Complex JS for scroll visibility and internal sidebar scrolling
   - Should be planned as separate enhancement

**Suggested approach**: Complete Phase 1 now, decide on Phase 2 separately.

---

## Implementation Plan

1. ✅ Test in browser to confirm blur is currently broken
2. Remove `<main class="scroll-container">` wrapper from HTML
3. Remove `.scroll-container` CSS
4. Remove scrollContainer JavaScript references (4 locations)
5. Test all functionality:
   - Intro animation sequence
   - Progress bar
   - Header navigation
   - Section scrolling
   - Candidati card stack
   - Episodi accordions (verify blur works!)
6. Remove dead code
7. Commit changes

---

## Dead Code to Remove

### CSS (index.html)
- Lines 268-274: `.scroll-container` and `.scroll-container.animate` styles

### JavaScript (dance-academy.js)
- Line 1563: `const scrollContainer = document.querySelector('.scroll-container');`
- Line 1582: `scrollContainer.classList.add('animate');`
- Line 1605: `const scrollContainer = document.querySelector('.scroll-container');`
- Line 1612: `if (scrollContainer) scrollContainer.classList.add('animate');`
