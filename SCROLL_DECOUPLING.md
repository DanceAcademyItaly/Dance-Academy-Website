# Scroll Decoupling System Documentation

This system transforms raw scroll input into custom scroll values, allowing elements to move independently of the page scroll while still being driven by user scroll behavior.

## Core Concept

**Raw Scroll** → **Processing** → **Custom Scroll** → **Element Animations**

- User scrolls the page normally
- System processes scroll input (applying deadzones, multipliers, easing)
- Elements animate based on processed scroll values, not raw scroll
- Result: Elements move in ways completely independent of page scroll speed/direction

## Architecture

### 1. Scroll Processing Pipeline

```javascript
function processScrollInput(rawScroll) {
    // 1. Apply deadzones (freeze scroll in certain ranges)
    // 2. Apply global multiplier (speed up/slow down all animations)
    // 3. Apply easing (smooth out scroll transitions)
    return processedScroll;
}
```

### 2. Element Behavior System

```javascript
function addDecoupledElement(element, behavior, config) {
    // Register element with specific behavior and trigger ranges
    // Element will animate based on processed scroll within its range
}
```

## Configuration

### Scroll Decoupling Config
```javascript
let scrollDecouplingConfig = {
    enabled: true,                    // Master enable/disable
    deadzones: [                      // Ranges where scroll is frozen
        { start: 0, end: 50 },        // Pause at top for 50px
        { start: 500, end: 600 }      // Pause between sections
    ],
    globalMultiplier: 1.0,            // Global speed multiplier
    easing: {
        enabled: false,               // Smooth scroll transitions
        factor: 0.1                   // Easing strength (0-1)
    }
};
```

### Element Configuration
```javascript
addDecoupledElement(element, 'heroExit', {
    direction: 'left',                // Behavior-specific config
    distance: 400,
    startTrigger: 50,                 // When animation starts (processed scroll)
    endTrigger: 250                   // When animation completes
});
```

## Available Behaviors

### 1. Hero Exit (`heroExit`)
**Purpose**: Elements exit horizontally based on scroll progress

**Config**:
- `direction`: 'left' | 'right'
- `distance`: pixels to move
- `startTrigger`: processed scroll value to start
- `endTrigger`: processed scroll value to complete

### 2. Parallax (`parallax`)
**Purpose**: Elements move at different speeds than scroll

**Config**:
- `speed`: movement multiplier (0.5 = half speed)
- `distance`: total distance to cover
- `startTrigger`: when to start
- `endTrigger`: when to complete

### 3. Fade Move (`fadeMove`)
**Purpose**: Elements fade in/out while moving

**Config**:
- `direction`: 'up' | 'down' | 'left' | 'right'
- `distance`: pixels to move
- `startTrigger`: when to start
- `endTrigger`: when to complete

## Deadzone System

**Purpose**: Create scroll ranges where content doesn't move, allowing for pauses and transitions.

### How Deadzones Work:
1. **In Deadzone**: Processed scroll freezes at deadzone start value
2. **Past Deadzone**: Deadzone duration is subtracted from processed scroll
3. **Result**: Content pauses during deadzone, then continues seamlessly

### Example:
```javascript
deadzones: [
    { start: 0, end: 100 },      // Pause for first 100px of scroll
    { start: 500, end: 600 }     // Pause between sections
]

// Raw scroll 150px → Processed scroll 50px (deadzone subtracted)
// Raw scroll 700px → Processed scroll 500px (both deadzones subtracted)
```

## Current Implementation

### Hero Section
- **Logo**: Exits left when processed scroll 50-250
- **Subtitle**: Exits right when processed scroll 50-250
- **Behavior**: Smooth cubic easing, completely independent of scroll speed

### Benefits:
- ✅ **Scroll-independent movement**: Elements move on their own timeline
- ✅ **Deadzone support**: Can pause content at specific scroll ranges
- ✅ **Performance optimized**: Uses existing Lenis RAF loop
- ✅ **Highly configurable**: Easy to adjust timing, easing, deadzones
- ✅ **Reusable**: Same system works for all sections

## Usage Examples

### Adding Hero Animations
```javascript
function initHeroDecoupledAnimations() {
    const heroLogo = document.getElementById('heroLogo');

    addDecoupledElement(heroLogo, 'heroExit', {
        direction: 'left',
        distance: 400,
        startTrigger: 50,
        endTrigger: 250
    });
}
```

### Adding Deadzones
```javascript
// Add a deadzone at the start
scrollDecouplingConfig.deadzones.push({
    start: 0,
    end: 100
});
```

### Global Speed Control
```javascript
// Slow down all animations
scrollDecouplingConfig.globalMultiplier = 0.5;

// Speed up all animations
scrollDecouplingConfig.globalMultiplier = 1.5;
```

## Next Steps

Ready to implement:
1. **More behaviors**: Scale, rotate, complex paths
2. **Section-specific deadzones**: Different pause points per section
3. **Velocity-based effects**: Respond to scroll speed
4. **Sequential animations**: Chain multiple behaviors
5. **Advanced easing**: Custom easing curves per element

---

*This system provides the foundation for creating scroll-driven animations that move independently of page scroll, with full control over timing, deadzones, and behavior patterns.*