// Mathematical Space Allocation Animation System for Missione Section
// This is experimental code for viewport-driven mathematical positioning
// Saved for future reference - not currently in use

// Calculate available space for missione section
function calculateMissioneAvailableSpace() {
    const viewportHeight = window.innerHeight;

    // Find where episodi section ends
    const episodiBlock = document.querySelector('.episodi-block');
    let episodiEndY = 0;

    if (episodiBlock) {
        const episodiRect = episodiBlock.getBoundingClientRect();
        episodiEndY = episodiRect.bottom + window.scrollY;
    } else {
        // Fallback: assume episodi takes up first viewport
        episodiEndY = viewportHeight;
    }

    // Calculate available space
    const documentHeight = Math.max(
        document.body.scrollHeight,
        document.documentElement.scrollHeight
    );

    const bottomMargin = 25;
    const availableHeight = documentHeight - episodiEndY - bottomMargin;

    return {
        startY: episodiEndY,
        height: Math.max(availableHeight, viewportHeight * 0.5), // Minimum half viewport
        endY: documentHeight - bottomMargin
    };
}

// Calculate optimal font size for single-line text fitting
function calculateOptimalFontSize(elements, blockHeight) {
    const viewportWidth = window.innerWidth;
    const isMobile = viewportWidth <= 768;
    const maxLineCount = isMobile ? 2 : 1; // Allow 2 lines on mobile

    let optimalSize = 16; // Start with base size
    const minSize = isMobile ? 12 : 14;
    const maxSize = isMobile ? 24 : 48;

    // Test different font sizes to find optimal
    for (let fontSize = minSize; fontSize <= maxSize; fontSize += 2) {
        let allTextFits = true;

        for (const element of elements) {
            const h3 = element.querySelector('h3');
            const p = element.querySelector('p');

            if (h3 && p) {
                // Test if both h3 and p text fit in single line at this font size
                const h3Width = getTextWidth(h3.textContent, fontSize, 'bold');
                const pWidth = getTextWidth(p.textContent, fontSize, 'normal');

                const maxWidth = viewportWidth * 0.9; // 90% of viewport width
                const lineHeight = fontSize * 1.3;
                const requiredHeight = (lineHeight * maxLineCount) * 2; // h3 + p

                if (h3Width > maxWidth || pWidth > maxWidth || requiredHeight > blockHeight * 0.8) {
                    allTextFits = false;
                    break;
                }
            }
        }

        if (allTextFits) {
            optimalSize = fontSize;
        } else {
            break; // This size is too big, use previous size
        }
    }

    return Math.max(optimalSize, minSize);
}

// Measure text width for font sizing calculations
function getTextWidth(text, fontSize, fontWeight = 'normal') {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    context.font = `${fontWeight} ${fontSize}px Arial, sans-serif`;
    return context.measureText(text).width;
}

// Apply calculated font size to element's text
function applyOptimalFontSize(element, fontSize) {
    const h3 = element.querySelector('h3');
    const p = element.querySelector('p');

    if (h3) {
        h3.style.fontSize = fontSize + 'px';
        h3.style.lineHeight = '1.3';
        h3.style.margin = '0 0 10px 0';
    }

    if (p) {
        p.style.fontSize = (fontSize * 0.8) + 'px'; // P slightly smaller than h3
        p.style.lineHeight = '1.3';
        p.style.margin = '0';
    }
}

// EXPERIMENTAL: Initialize missione animations system - MATHEMATICAL APPROACH
function initMissioneAnimationsMathematical() {
    console.log('Initializing experimental mathematical missione animations');

    const missioneContainer = document.getElementById('missioneContainer');
    const missioneBlock = document.querySelector('.missione-block');

    if (!missioneContainer || !missioneBlock) {
        console.log('Missione elements not found');
        return;
    }

    // Wait for content to be populated
    function attemptInitialization(attempts = 0) {
        const copyBlocks = missioneContainer.querySelectorAll('.copy-block');
        const ctaContainer = missioneContainer.querySelector('.cta-container');

        console.log(`Missione init attempt ${attempts + 1}: found ${copyBlocks.length} copy blocks, cta: ${!!ctaContainer}`);

        if ((copyBlocks.length === 0 && !ctaContainer) && attempts < 10) {
            setTimeout(() => attemptInitialization(attempts + 1), 200);
            return;
        }

        if (copyBlocks.length === 0 && !ctaContainer) {
            console.log('No missione content found after multiple attempts');
            return;
        }

        const elements = [];

        // Collect all animatable elements
        copyBlocks.forEach(block => {
            elements.push(block);
        });

        if (ctaContainer) {
            elements.push(ctaContainer);
        }

        // Calculate available space from episodi end to bottom
        const availableSpace = calculateMissioneAvailableSpace();
        const blockHeight = availableSpace.height / elements.length; // Equal space per block

        console.log('Space allocation:', {
            startY: availableSpace.startY,
            totalHeight: availableSpace.height,
            blockHeight: blockHeight,
            bottomMargin: 25
        });

        // Calculate optimal font size for single-line text
        const optimalFontSize = calculateOptimalFontSize(elements, blockHeight);
        console.log('Optimal font size calculated:', optimalFontSize);

        // FIXED CONTAINER APPROACH: Mathematical space allocation with fixed positioning
        const missioneContainer = document.getElementById('missioneContainer');

        // Position container fixed in viewport to represent the available space
        const containerHeightVh = Math.min(80, (availableSpace.height / window.innerHeight) * 100); // Max 80vh
        const containerTopVh = 10; // Start at 10vh from top

        missioneContainer.style.position = 'fixed';
        missioneContainer.style.top = containerTopVh + 'vh';
        missioneContainer.style.left = '50%';
        missioneContainer.style.transform = 'translateX(-50%)';
        missioneContainer.style.width = '90vw';
        missioneContainer.style.height = containerHeightVh + 'vh';
        missioneContainer.style.zIndex = '1000';

        console.log('Fixed container setup:', {
            topVh: containerTopVh,
            heightVh: containerHeightVh,
            totalElements: elements.length
        });

        const elementData = elements.map((element, index) => {
            // Calculate mathematical position within fixed container (equal distribution)
            const elementHeightPercent = 100 / elements.length; // Equal percentage of container
            const elementTopPercent = index * elementHeightPercent;
            const elementCenterPercent = elementTopPercent + (elementHeightPercent / 2);

            // Position element within container using absolute positioning
            element.style.position = 'absolute';
            element.style.top = elementCenterPercent + '%';
            element.style.left = '50%';
            element.style.transform = 'translateX(-50%) translateY(-50%)';
            element.style.width = 'auto';
            element.style.maxWidth = '100%';
            element.style.textAlign = 'center';
            element.style.height = elementHeightPercent + '%';
            element.style.display = 'flex';
            element.style.flexDirection = 'column';
            element.style.justifyContent = 'center';
            element.style.alignItems = 'center';

            // Calculate actual pixel height for font size calculation
            const actualPixelHeight = (window.innerHeight * containerHeightVh / 100) * (elementHeightPercent / 100);

            // Apply calculated font size to text elements
            applyOptimalFontSize(element, actualPixelHeight);

            // Initially hide - scroll triggers will control visibility
            element.style.opacity = '0';
            element.style.visibility = 'visible';

            // Add classes for tracking
            element.classList.add('missione-animated');
            element.classList.add('missione-positioned');
            element.dataset.animationIndex = index;

            console.log(`Block ${index}: positioned at ${elementCenterPercent}% within fixed container (height: ${elementHeightPercent}%)`);

            return {
                element,
                containerPosition: elementCenterPercent,
                elementHeightPercent,
                actualPixelHeight,
                index
            };
        });

        // Resize handler - recalculate container size and font sizes
        function recalculatePositions() {
            if (!missioneAnimationState || !missioneAnimationState.elements) return;

            console.log('Recalculating container layout for new window size');

            // Recalculate container size
            const newAvailableSpace = calculateMissioneAvailableSpace();
            const newContainerHeightVh = Math.min(80, (newAvailableSpace.height / window.innerHeight) * 100);

            // Update container size
            missioneContainer.style.height = newContainerHeightVh + 'vh';

            // Update each element's font size based on new container size
            missioneAnimationState.elements.forEach((elementData, index) => {
                const { element, elementHeightPercent } = elementData;

                // Recalculate actual pixel height
                const newActualPixelHeight = (window.innerHeight * newContainerHeightVh / 100) * (elementHeightPercent / 100);

                // Update font sizes
                applyOptimalFontSize(element, newActualPixelHeight);

                // Update stored data
                elementData.actualPixelHeight = newActualPixelHeight;
            });

            console.log('Container layout recalculated:', {
                newContainerHeightVh,
                newAvailableSpaceHeight: newAvailableSpace.height
            });
        }

        // Clean up previous resize handler
        if (window.missioneResizeHandler) {
            window.removeEventListener('resize', window.missioneResizeHandler);
        }

        // Add new resize handler
        window.missioneResizeHandler = recalculatePositions;
        window.addEventListener('resize', recalculatePositions);

        // Calculate scroll trigger positions
        const missioneTop = missioneBlock.offsetTop;
        const entranceStart = missioneTop - window.innerHeight * 0.2 - 200;
        const entranceEnd = entranceStart + 300;
        const deadzoneEnd = entranceEnd + 250;
        const exitEnd = deadzoneEnd + 1000;

        console.log('Missione scroll positions:', {
            sectionTop: missioneTop,
            entranceStart,
            entranceEnd,
            deadzoneEnd
        });

        // Store state for use in updateScrollElements
        missioneAnimationState = {
            elements: elementData,
            missioneBlock,
            availableSpace,
            optimalFontSize,
            entranceStart,
            entranceEnd,
            deadzoneEnd,
            exitEnd,
            simple: true,
            mathematical: true
        };

        console.log('Mathematical missione animations initialized successfully', {
            elementCount: elements.length
        });
    }

    // Start initialization attempts
    attemptInitialization();
}

// EXPERIMENTAL: Update missione animations - MATHEMATICAL VERSION
function updateMissioneAnimationsMathematical(scrollY, animationState) {
    if (!animationState) return;

    const { elements, entranceStart, entranceEnd, deadzoneEnd, exitEnd, simple } = animationState;

    if (!elements || elements.length === 0) return;

    // Use simple approach with reverse stagger and fixed positioning
    if (simple) {
        elements.forEach((elementData, index) => {
            const { element } = elementData;

            // REVERSE STAGGER: last elements animate first (bottom to top)
            const totalElements = elements.length;
            const reverseIndex = totalElements - 1 - index;

            // Entrance stagger: reverse order (button first)
            const elementTrigger = entranceStart + (reverseIndex * 60);
            const animationDuration = 200;
            const elementAnimationEnd = elementTrigger + animationDuration;

            // Exit stagger: SAME order as entrance (button first)
            const elementExitStart = deadzoneEnd + (reverseIndex * 60);
            const elementExitEnd = elementExitStart + animationDuration;

            // Maintain fixed viewport positioning (positions never change)
            // Elements are always at their fixed viewport positions

            if (scrollY < elementTrigger) {
                // Phase 1: Before entrance - hidden beneath floor with mathematical centering
                element.style.transform = 'translateX(-50%) translateY(calc(-50% + 30px))';
                element.style.opacity = '0';
                element.classList.remove('animated');

            } else if (scrollY >= elementTrigger && scrollY <= elementAnimationEnd) {
                // Phase 2: Entrance animation - emerge from floor
                const progress = (scrollY - elementTrigger) / animationDuration;
                const easedProgress = 1 - Math.pow(1 - progress, 1.3); // Ease-out with exponent 1.3

                const translateY = 30 * (1 - easedProgress); // 30px → 0px
                const opacity = easedProgress; // 0 → 1

                element.style.transform = `translateX(-50%) translateY(calc(-50% + ${translateY}px))`;
                element.style.opacity = opacity;

                if (!element.classList.contains('animated')) {
                    element.classList.add('animated');
                    console.log(`Element ${index} (reverse order ${reverseIndex}) emerged at scroll ${scrollY}`);
                }

            } else if (scrollY > elementAnimationEnd && scrollY <= elementExitStart) {
                // Phase 3: Extended deadzone - stay visible with perfect centering
                element.style.transform = 'translateX(-50%) translateY(-50%)';
                element.style.opacity = '1';
                element.classList.add('animated');

            } else if (scrollY > elementExitStart && scrollY <= elementExitEnd) {
                // Phase 4: Exit animation - submerge into ceiling (REVERSE OF ENTRANCE)
                const progress = (scrollY - elementExitStart) / animationDuration;
                const easedProgress = Math.pow(progress, 1.3); // Ease-in with exponent 1.3

                const translateY = -30 * easedProgress; // 0px → -30px (submerge into ceiling)
                const opacity = 1 - easedProgress; // 1 → 0

                element.style.transform = `translateX(-50%) translateY(calc(-50% + ${translateY}px))`;
                element.style.opacity = opacity;

                if (!element.classList.contains('exiting')) {
                    element.classList.add('exiting');
                    console.log(`Element ${index} (same order ${reverseIndex}) submerging at scroll ${scrollY}`);
                }

            } else if (scrollY > elementExitEnd) {
                // Phase 5: After exit - hidden above ceiling with mathematical centering
                element.style.transform = 'translateX(-50%) translateY(calc(-50% - 30px))';
                element.style.opacity = '0';
                element.classList.remove('animated');
                element.classList.add('exiting');
            }
        });

        return;
    }
}

// Export functions if using modules (uncomment if needed)
// export {
//     calculateMissioneAvailableSpace,
//     calculateOptimalFontSize,
//     getTextWidth,
//     applyOptimalFontSize,
//     initMissioneAnimationsMathematical,
//     updateMissioneAnimationsMathematical
// };

console.log('Mathematical animation system loaded (experimental - not in use)');