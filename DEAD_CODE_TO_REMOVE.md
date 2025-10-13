# Dead Code Removal - Old Episodi Parallax System

## Code to Remove from dance-academy.js

### 1. Configuration (lines ~1843-1849)
```javascript
const episodiParallaxConfig = {
    enabled: true,
    sidebarEasing: t => 1 - Math.pow(1 - t, 4),
    contentEasing: t => 1 - Math.pow(1 - t, 3)
};
```

### 2. State Variables (lines ~1852, ~1934)
```javascript
let episodiParallaxState = null;
let episodiResizeTimeout = null;
```

### 3. calculateEpisodiDeadzonePosition() (lines ~1828-1842)
Complete function removal

### 4. initEpisodiParallax() (lines ~1863-1931)
Complete function removal

### 5. handleEpisodiResize() (lines ~1936-1948)
Complete function removal

### 6. performEpisodiResize() (lines ~1950-2019)
Complete function removal

### 7. updateEpisodiParallax() (lines ~2912-2998)
Complete function removal

### 8. Update scroll handler (lines ~742-744)
Remove:
```javascript
if (episodiParallaxState) {
    updateEpisodiParallax(scrollY, episodiParallaxState);
}
```

## Mobile Responsive CSS to Add

### index.html CSS section
```css
@media (max-width: 768px) {
    .episodi-sidebar-wrapper {
        position: fixed;
        top: 80px;
        left: 20px;
        right: 20px;
        width: auto;
        max-height: 40vh;
        z-index: 105;
    }

    .episodi-content-wrapper {
        position: fixed;
        top: calc(40vh + 100px);
        left: 20px;
        right: 20px;
        max-height: calc(60vh - 120px);
        z-index: 106;
    }
}
```

## Status

Phase 1 & 2 are complete. The new episodi fixed system is implemented and working.
Remaining: Remove old dead code + add mobile responsive CSS + test.
