# Episodi Restructuring Implementation Plan

## Goal
Enable glassmorphism blur on accordion headers by eliminating stacking context barriers.

## Strategy
1. **Phase 1**: Remove scroll-container wrapper (cleanup)
2. **Phase 2**: Restructure episodi section using candidati-style architecture + card-style dynamic sizing

---

## Phase 1: Remove Scroll-Container

### Rationale
- Scroll-container is unnecessary for Lenis (works on window by default)
- Only provides fade-in animation (can be removed)
- Creates stacking context barrier
- Simplifies architecture

### Changes Required

#### HTML (index.html)
- **Line 1250**: Remove `<main class="scroll-container">`
- **Line 1279**: Remove `</main>`
- All sections become direct body children

#### CSS (index.html)
- **Lines 268-274**: Delete `.scroll-container` and `.scroll-container.animate` styles

#### JavaScript (dance-academy.js)
- **Line 1563**: Remove `const scrollContainer = document.querySelector('.scroll-container');`
- **Line 1582**: Remove `scrollContainer.classList.add('animate');`
- **Line 1605**: Remove `const scrollContainer = document.querySelector('.scroll-container');`
- **Line 1612**: Remove `if (scrollContainer) scrollContainer.classList.add('animate');`

### Testing Phase 1
- [ ] Intro animation still works
- [ ] Sections appear correctly
- [ ] Progress bar works
- [ ] Header navigation works
- [ ] All section transitions smooth

---

## Phase 2: Episodi Restructuring

### Current Architecture (Problematic)
```
.scroll-container
  └─ .episodi-block (overflow: hidden)
     └─ .episodi-container (overflow: hidden)
        ├─ .sidebar (overflow-y: auto)
        │  └─ accordions
        └─ .content-area
           └─ episode content
```

**Problems:**
- Multiple overflow properties create stacking contexts
- Backdrop-filter can't "see through" to video background
- Shadows clipped by overflow

### Target Architecture (Candidati-Style)
```
body
├─ video-bg (fixed, z-index: -1)
├─ .hero-block
├─ .episodi-spacer (creates scroll range)
├─ .missione-block
├─ .candidati-spacer
├─ .contatti-block
├─ .episodi-sidebar-wrapper (fixed, z-index: 105)
│  └─ .sidebar (NO overflow)
│     └─ accordions (backdrop-filter works!)
├─ .episodi-content-wrapper (fixed, z-index: 106)
│  └─ .content-area
├─ .candidati-title-wrapper (fixed, z-index: 110)
└─ .candidati-card-wrapper × 5 (fixed, z-index: 100-104)
```

**Benefits:**
- All elements in root stacking context
- No overflow barriers
- Backdrop-filter works
- Shadows render correctly

---

## Implementation Details

### Step 1: HTML Restructuring

#### Create episodi-spacer
```html
<!-- Inside body, replace episodi-block content -->
<div class="episodi-spacer block" data-block="episodi"></div>
```

#### Move episodi elements to body level
```html
<!-- After contatti-block, before candidati elements -->
<div class="episodi-sidebar-wrapper">
  <aside class="sidebar" id="sidebar"></aside>
</div>

<div class="episodi-content-wrapper">
  <div class="content-area" id="contentArea"></div>
</div>
```

### Step 2: CSS Changes

#### A) Remove overflow properties
```css
/* REMOVE overflow from these */
.episodi-block {
  /* overflow: hidden; */ /* DELETE THIS LINE */
}

.episodi-container {
  /* overflow: hidden; */ /* DELETE THIS LINE */
}

.sidebar {
  /* overflow-y: auto; */ /* DELETE THIS LINE */
  /* height: 100%; */ /* DELETE THIS LINE */
  /* max-height: 100%; */ /* DELETE THIS LINE */
}
```

#### B) Add fixed positioning styles
```css
/* Episodi sidebar wrapper - fixed positioning */
.episodi-sidebar-wrapper {
  position: fixed;
  top: 80px; /* Below header */
  left: 40px;
  width: 250px;
  max-height: calc(100vh - 160px);
  z-index: 105;
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.3s, visibility 0.3s;
}

.episodi-sidebar-wrapper.visible {
  opacity: 1;
  visibility: visible;
}

/* Episodi content wrapper - fixed positioning */
.episodi-content-wrapper {
  position: fixed;
  top: 80px;
  left: 310px; /* 40px margin + 250px sidebar + 20px gap */
  right: 40px;
  max-height: calc(100vh - 160px);
  z-index: 106;
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.3s, visibility 0.3s;
}

.episodi-content-wrapper.visible {
  opacity: 1;
  visibility: visible;
}

/* Sidebar - no overflow, dynamic sizing */
.sidebar {
  display: flex;
  flex-direction: column;
  gap: 0; /* No gap, accordions sized to fit */
}

/* Spacer for scroll range */
.episodi-spacer {
  height: 100vh; /* Set dynamically by JS */
  width: 1px;
  visibility: hidden;
}
```

#### C) Update accordion sizing for dynamic fit
```css
.accordion-header {
  /* Height set dynamically by JS */
  display: flex;
  align-items: center;
  justify-content: center;
  /* padding will be adjusted dynamically */
}
```

### Step 3: JavaScript Implementation

#### A) Initialize episodi fixed positioning system
```javascript
function initEpisodiFixedSystem() {
  const episodiSpacer = document.querySelector('.episodi-spacer');
  const sidebarWrapper = document.querySelector('.episodi-sidebar-wrapper');
  const contentWrapper = document.querySelector('.episodi-content-wrapper');

  if (!episodiSpacer || !sidebarWrapper || !contentWrapper) {
    console.error('Episodi elements not found');
    return;
  }

  // Set spacer height (episodi visible for 100vh of scroll)
  const spacerHeight = window.innerHeight;
  episodiSpacer.style.height = spacerHeight + 'px';

  // Track scroll position for visibility
  function updateEpisodiVisibility() {
    const spacerTop = episodiSpacer.offsetTop;
    const spacerBottom = spacerTop + spacerHeight;
    const scrollY = window.scrollY;

    const isVisible = scrollY >= spacerTop && scrollY < spacerBottom;

    sidebarWrapper.classList.toggle('visible', isVisible);
    contentWrapper.classList.toggle('visible', isVisible);
  }

  // Update on scroll (through Lenis)
  lenis.on('scroll', updateEpisodiVisibility);

  // Initial check
  updateEpisodiVisibility();

  // Dynamic accordion sizing
  resizeAccordionsToFit();
  window.addEventListener('resize', resizeAccordionsToFit);
}
```

#### B) Dynamic accordion sizing
```javascript
function resizeAccordionsToFit() {
  const sidebar = document.querySelector('.episodi-sidebar-wrapper .sidebar');
  if (!sidebar) return;

  const accordions = sidebar.querySelectorAll('.accordion-header');
  if (accordions.length === 0) return;

  // Calculate available height
  const sidebarWrapper = document.querySelector('.episodi-sidebar-wrapper');
  const availableHeight = sidebarWrapper.offsetHeight;

  // Divide equally among accordions
  const itemHeight = availableHeight / accordions.length;

  // Apply sizing
  accordions.forEach(accordion => {
    accordion.style.height = itemHeight + 'px';
    accordion.style.minHeight = itemHeight + 'px';

    // Scale padding based on height
    const padding = Math.max(8, Math.min(20, itemHeight * 0.1));
    accordion.style.padding = padding + 'px';
  });

  console.log('Accordions resized:', {
    count: accordions.length,
    availableHeight,
    itemHeight
  });
}
```

#### C) Update episodi population
```javascript
// After populating accordions in populateContent()
if (hasEpisodes) {
  initEpisodiFixedSystem();
}
```

#### D) Cleanup episodi-block references
- Remove any old episodi-block positioning logic
- Remove overflow-based scroll handling
- Update any offsetTop calculations if needed

### Step 4: Mobile Responsive

```css
@media (max-width: 768px) {
  .episodi-sidebar-wrapper {
    position: fixed;
    top: 80px;
    left: 20px;
    right: 20px;
    width: auto;
    max-height: 40vh;
  }

  .episodi-content-wrapper {
    position: fixed;
    top: calc(40vh + 100px);
    left: 20px;
    right: 20px;
    max-height: calc(60vh - 120px);
  }
}
```

---

## Testing Checklist

### Phase 1 Testing
- [ ] Page loads without errors
- [ ] Intro animation plays
- [ ] Sections visible after intro
- [ ] Progress bar updates correctly
- [ ] Header navigation highlights correct section
- [ ] Smooth scroll between sections works
- [ ] Candidati section still works

### Phase 2 Testing
- [ ] Episodi section appears at correct scroll position
- [ ] Episodi section disappears when scrolling past
- [ ] Accordions visible and sized correctly
- [ ] Clicking accordion switches episode content
- [ ] Episode videos load and play
- [ ] Coreografie cards display correctly
- [ ] Glassmorphism blur visible on accordions
- [ ] Accordion shadows render correctly
- [ ] Mobile responsive layout works
- [ ] Window resize updates accordion sizing
- [ ] No scroll conflicts or glitches

---

## Dead Code Removal

### After Phase 1
- [ ] `.scroll-container` CSS (lines 268-274)
- [ ] `scrollContainer` JS variables (4 locations)
- [ ] `scrollContainer.classList` operations

### After Phase 2
- [ ] Old `.episodi-block` positioning logic
- [ ] Old `.episodi-container` grid layout
- [ ] Sidebar overflow handling
- [ ] Any episodi scroll state management

---

## Potential Issues & Solutions

### Issue: Accordion content (episode list) won't fit
**Solution**: Keep episode lists collapsed by default, or limit visible episodes

### Issue: Content area too small for videos
**Solution**: Allow content area to overflow if needed, or scale video size

### Issue: Z-index conflicts with candidati
**Solution**: Use z-index hierarchy:
- Candidati cards: 100-104
- Episodi sidebar: 105
- Episodi content: 106
- Candidati title: 110
- Candidati submit: 111

### Issue: Mobile layout cramped
**Solution**: Stack vertically with dynamic height split

---

## Rollback Plan

If issues arise:
1. Git revert to commit before changes
2. Restore scroll-container structure
3. Revert to solid accordion backgrounds

---

## Success Criteria

✅ All sections scroll smoothly
✅ Episodi accordions have working glassmorphism blur
✅ No shadows clipped
✅ No overflow scrollbars
✅ Responsive on all viewports
✅ No JavaScript errors
✅ Performance unchanged
✅ All existing functionality preserved
