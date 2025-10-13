# Candidati Refactoring - Remaining Work

## Current Status (Almost Complete!)

### ✅ Completed:
1. **HTML restructured** - Cards are now independent fixed elements
2. **CSS updated** - Proper z-index stacking (100-104 for cards, 110 title, 111 submit)
3. **JavaScript Phase 1** - Element references updated, container code removed
4. **JavaScript Phase 2** - Scroll animations updated to target wrappers, destructuring fixed
5. **Navigation fixed** - Uses visibility:hidden during deadzone, all visible during scroll animations
6. **Backdrop-filter fixed** - Moved to wrapper level to blur video background correctly
7. **CRITICAL: DOM restructuring** - Moved candidati elements outside scroll-container to body level

### ⚠️ Remaining Tasks:

#### ✅ 1. Check for Old `candidatiSection` References - COMPLETED
No remaining references found.

#### ✅ 2. Commit Phase 2 - COMPLETED
Committed as 55085f8.

#### ✅ 3. Fix Navigation and Backdrop-filter - COMPLETED
Committed as d450149.

#### ✅ 4. Fix DOM Structure - COMPLETED
Committed as 234ac6b - Moved candidati outside scroll-container.

#### 5. Test Functionality - IN PROGRESS

Open index.html and verify:
1. ✅ Scroll to candidati section
2. ✅ Title animates in from below
3. ✅ Cards slide in from right with stagger
4. ✅ Submit button fades in
5. ✅ Card navigation buttons work
6. ✅ **MOST IMPORTANT: First card has visible blur effect on video background**

#### 4. If Blur Still Doesn't Work

The architecture is now correct. If blur still invisible, check:

**Browser DevTools:**
```javascript
// In console:
document.querySelector('.candidati-card-wrapper[data-card="0"]')
// Should show z-index: 100

document.querySelector('video')
// Should show z-index: -1

// Check stacking contexts:
// Card wrapper and video should both be children of body
```

**Possible fixes:**
- Increase blur amount: `backdrop-filter: blur(20px)`
- Add background for testing: `background: rgba(0, 0, 0, 0.5)`
- Check if video is actually rendering

## Architecture Summary

**New Structure (Working) - FINAL:**
```
body
├─ header
├─ intro-overlay
├─ video (z-index: -1, fixed) ← Background, direct child of body
├─ main.scroll-container
│   ├─ hero-block
│   ├─ episodi-block
│   ├─ missione-block
│   ├─ candidati-spacer (relative, .block, data-block="candidati") ← Scroll range for candidati
│   └─ contatti-block
├─ </main>
├─ candidati-title-wrapper (fixed, z: 110) ← Can blur video!
├─ candidati-card-wrapper[0] (fixed, z: 100) ← Can blur video!
├─ candidati-card-wrapper[1] (fixed, z: 101) ← Can blur video + card 0!
├─ candidati-card-wrapper[2] (fixed, z: 102) ← Can blur video + cards 0-1!
├─ candidati-card-wrapper[3] (fixed, z: 103) ← Can blur video + cards 0-2!
├─ candidati-card-wrapper[4] (fixed, z: 104) ← Can blur video + cards 0-3!
└─ submit-button-container (fixed, z: 111) ← Above everything
```

**Key Architecture Points:**
- candidati-spacer is INSIDE scroll-container (creates scroll range in correct position)
- candidati-spacer has `.block data-block="candidati"` for scroll tracking
- Fixed candidati elements (title, cards, button) are OUTSIDE scroll-container (for backdrop-filter)
- This hybrid structure allows scroll tracking AND backdrop-filter to work

**Why This Works:**
- Video and candidati elements are TRUE siblings (direct children of body)
- All in same root stacking context (not nested in scroll-container)
- `backdrop-filter` on wrapper can blur video background across same stacking context
- Higher z-index cards can blur lower z-index cards + video

## Key Code Locations

**HTML:** lines 1268-1465
- Independent fixed elements
- Each card wrapper has `data-card` attribute
- All form inputs use `form="candidatiForm"`

**CSS:** lines 587-670
- `.candidati-spacer`: scroll range
- `.candidati-title-wrapper`: title positioning
- `.candidati-card-wrapper`: card positioning with z-indexes
- `.form-card`: glassmorphism with backdrop-filter

**JavaScript:**
- Initialization: lines 2376-2700
- Scroll animations: lines 2900-3050
- State object: lines 2663-2685

## Next Session Commands

```bash
# 1. Find and remove old candidatiSection references:
grep -n "candidatiSection\." dance-academy.js

# 2. Commit when done:
git add dance-academy.js
git commit -m "[commit message from section 2 above]"

# 3. Open and test:
open index.html

# 4. If blur doesn't work, test in console:
document.querySelector('.candidati-card-wrapper[data-card="0"]').style.backdropFilter
# Should return: "blur(12px) saturate(180%)"
```

## Success Criteria

✅ Candidati section animates correctly
✅ Card navigation works
✅ **First card shows blur effect on video background**
✅ Cards stack properly with incrementing z-indexes
✅ All functionality from before refactoring still works

## Critical Bug Fixed - Variable Scope Mismatch

**Root Cause:** Two separate `currentCardIndex` variables were out of sync:
- Local variable (used by `updateNavigationButtons()` via closure) - never updated during scroll
- State property `cardState.currentCardIndex` - updated during scroll, never read

**Result:** Card 4 would disappear at end of animation because `updateNavigationButtons()` always saw `currentCardIndex = 0`

**Proper Fix:**
1. Update LOCAL variable during Phase 2 entrance animation (not state property)
2. Don't call `updateNavigationButtons()` during Phase 2 - it's not needed and causes performance issues
3. Only call `updateNavigationButtons(true)` during Phase 3 (deadzone) and manual navigation

**Changes:**
- Line 3014: `currentCardIndex = index` - update local variable silently during entrance
- Line 3014: Removed `updateNavigationButtons()` call - not needed during Phase 2
- Line 3059: `updateNavigationButtons(true)` - only called when entering deadzone to hide non-current cards

**Why This Works:**
- During Phase 2: currentCardIndex tracks progress (0→4), but UI doesn't change (all cards visible)
- Entering Phase 3: currentCardIndex = 4, so card 4 stays visible
- Manual navigation: Updates currentCardIndex and calls updateNavigationButtons(true) to switch cards
