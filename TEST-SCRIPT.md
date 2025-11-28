# Test Script - Dance Academy Website

**Purpose**: Repeatable, objective testing protocol to verify functionality remains identical after restructuring changes.

**Usage**: Run this test after each phase to ensure no regressions.

---

## Pre-Test Setup

1. Clear browser cache
2. Open DevTools Console
3. Disable browser extensions
4. Set viewport to specified size
5. Have baseline screenshots ready for comparison

---

## DESKTOP TEST (1920px width) - 10 minutes

### Initial Load
- [ ] Page loads without console errors
- [ ] Hero section visible with logo
- [ ] Background video playing (if enabled)
- [ ] All images load correctly

### Scroll Test
- [ ] Scroll smoothly from 0 to bottom (15 seconds)
- [ ] Hero section fades out as you scroll down
- [ ] Episodi section appears
- [ ] Missione section appears
- [ ] Candidati section appears
- [ ] Contatti section appears
- [ ] No visual glitches or jumps
- [ ] Smooth 60fps throughout (check DevTools Performance)

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
- [ ] Progress bar stays fixed at top

### Episodi Section (Desktop)
- [ ] Sidebar visible on left
- [ ] Click "SEASON 1" accordion - expands
- [ ] Episode buttons 1, 2, 3 visible
- [ ] Click "Episode 1" - content changes to Episode 1
- [ ] Click "Episode 2" - content changes to Episode 2
- [ ] Click "Episode 3" - content changes to Episode 3
- [ ] Click "SEASON 2" accordion - expands, Season 1 collapses
- [ ] Episode buttons 4, 5, 6 visible
- [ ] Click each episode - content updates correctly
- [ ] Video players load correctly
- [ ] Choreography accordion expands/collapses
- [ ] Smooth transitions between episodes

### Missione Section
- [ ] Content visible and readable
- [ ] Fade-in animation on scroll into view
- [ ] Fade-out animation on continued scroll
- [ ] Text is properly formatted

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
- [ ] Progress indicator updates correctly

### Contatti Section
- [ ] Content displays correctly
- [ ] Links are clickable (if any)
- [ ] Section is properly visible

### Console Check (CRITICAL)
- [ ] ZERO console errors
- [ ] ZERO console warnings (acceptable after Phase 2)
- [ ] ZERO console logs (after Phase 2 cleanup)

---

## MOBILE TEST (768px width) - 10 minutes

### Initial Load
- [ ] Page loads without console errors
- [ ] Hero section visible, logo visible
- [ ] No horizontal overflow/scrolling
- [ ] All content fits within viewport width

### Scroll Test
- [ ] Touch scroll works smoothly
- [ ] All sections appear in order
- [ ] Animations work on mobile
- [ ] No janky or stuttering scroll

### Header Navigation (Mobile)
- [ ] Header is visible and properly sized
- [ ] Navigation links work (if visible)
- [ ] Progress bar updates on scroll

### Episodi Section (Mobile)
- [ ] Dropdown selector visible (NOT sidebar)
- [ ] Click dropdown - shows seasons/episodes
- [ ] Select different episodes - content changes
- [ ] Carousel displays correctly
- [ ] Can swipe/click through carousel
- [ ] Videos load in mobile view
- [ ] No layout breaking

### Candidati Section (Mobile)
- [ ] Form displays correctly
- [ ] All fields accessible and properly sized
- [ ] Buttons large enough to tap easily
- [ ] Phase navigation works
- [ ] No text overflow or layout issues

### Contatti Section (Mobile)
- [ ] Content readable on mobile
- [ ] No horizontal overflow

### Console Check
- [ ] ZERO console errors
- [ ] No mobile-specific errors

---

## TABLET TEST (1024px width) - 5 minutes

### Quick Checks
- [ ] Layout looks good between mobile and desktop
- [ ] Episodi section uses appropriate layout
- [ ] All interactions work
- [ ] Smooth scroll functions
- [ ] Form works properly
- [ ] Navigation works

---

## BROWSER COMPATIBILITY

Test in:
- [ ] Chrome (latest) - primary browser
- [ ] Firefox (latest)
- [ ] Safari (latest)

All tests above should pass in each browser.

---

## REGRESSION CHECK

After each phase, compare to baseline:
- [ ] Screenshots match baseline (pixel-perfect or visually identical)
- [ ] Performance within 10% of baseline
- [ ] All functionality identical
- [ ] No new console errors
- [ ] Scroll smoothness maintained

---

## CRITICAL FAILURES (Stop immediately if found)

- ❌ Console errors appear
- ❌ Layout completely breaks
- ❌ Scroll doesn't work
- ❌ Navigation doesn't function
- ❌ Animations missing or broken
- ❌ Form doesn't work
- ❌ Content doesn't load

If any critical failure occurs: STOP, rollback changes, investigate.

---

## NOTES

- Take screenshots during testing for comparison
- Note any unexpected behavior, even if minor
- Test on actual devices if possible (not just DevTools)
- Clear cache between tests to avoid false positives

---

## TEST LOG

Date: _____________
Tester: ___________
Phase tested: _____
Result: PASS / FAIL

Issues found:
_______________________________________
_______________________________________
_______________________________________

Actions taken:
_______________________________________
_______________________________________
_______________________________________

