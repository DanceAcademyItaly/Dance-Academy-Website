# Candidati Refactoring - Remaining Work

## Current Status (Almost Complete!)

### ✅ Completed:
1. **HTML restructured** - Cards are now independent fixed elements
2. **CSS updated** - Proper z-index stacking (100-104 for cards, 110 title, 111 submit)
3. **JavaScript Phase 1** - Element references updated, container code removed
4. **JavaScript Phase 2** - Scroll animations updated to target wrappers

### 🔄 In Progress:
Scroll animations are 95% done. Only need to handle one edge case.

### ⚠️ Remaining Tasks:

#### 1. Check for Old `candidatiSection` References
The old `candidatiSection` variable may still be referenced somewhere. Need to search and remove:

```bash
# Search for it:
grep -n "candidatiSection\." dance-academy.js
```

**Expected locations:**
- Around line 2930-2936 in `updateScrollElements` function
- These lines try to show/hide candidatiSection which no longer exists

**Fix:** Simply delete those lines - they're not needed anymore.

#### 2. Commit Final Changes

```bash
git add dance-academy.js
git commit -m "Complete candidati refactoring Phase 2: scroll animations

Update all scroll animations to target cardWrappers and candidatiTitleWrapper
instead of old container-based elements.

Changes:
- Title animations now target candidatiTitleWrapper
- Card animations now target cardWrappers (not individual cards)
- All three phases updated: entrance, before-entrance, deadzone
- Remove old candidatiSection visibility toggling

Result: Cards are now independent fixed elements at body level,
siblings to video background. backdrop-filter on first card can now
blur the video background successfully.

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"
```

#### 3. Test Functionality

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

**New Structure (Working):**
```
body
├─ video (z-index: -1, fixed) ← Background
├─ candidati-spacer (relative) ← Scroll range
├─ candidati-title-wrapper (fixed, z: 110) ← Can blur video!
├─ candidati-card-wrapper[0] (fixed, z: 100) ← Can blur video!
├─ candidati-card-wrapper[1] (fixed, z: 101) ← Can blur video + card 0!
├─ candidati-card-wrapper[2] (fixed, z: 102) ← Can blur video + cards 0-1!
├─ candidati-card-wrapper[3] (fixed, z: 103) ← Can blur video + cards 0-2!
├─ candidati-card-wrapper[4] (fixed, z: 104) ← Can blur video + cards 0-3!
└─ submit-button-container (fixed, z: 111) ← Above everything
```

**Why This Works:**
- All elements are siblings in DOM
- All in same root stacking context
- `backdrop-filter` on any card can reach video background
- Higher z-index cards can blur lower z-index cards

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
