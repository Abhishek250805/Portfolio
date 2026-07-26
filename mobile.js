/**
 * MOBILE PORTFOLIO CORE SCRIPT — Native App Behaviors
 * Abhishek Pandey Portfolio Mobile UI
 */

document.addEventListener('DOMContentLoaded', () => {
    // Reset desktop preference since user is explicitly loading the mobile site
    localStorage.removeItem('prefer-desktop');
    
    // ── 1. Preloader Fade-out ────────────────────────────────
    window.addEventListener('load', () => {
        const preloader = document.getElementById('m-preloader');
        if (preloader) {
            preloader.classList.add('fade-out');
            setTimeout(() => {
                preloader.style.display = 'none';
            }, 500);
        }
    });

    // Fallback if load event takes too long
    setTimeout(() => {
        const preloader = document.getElementById('m-preloader');
        if (preloader && !preloader.classList.contains('fade-out')) {
            preloader.classList.add('fade-out');
            setTimeout(() => preloader.style.display = 'none', 500);
        }
    }, 2500);

    // ── 2. SPA Tab Navigation ────────────────────────────────
    const navTabs = document.querySelectorAll('.nav-tab');
    const tabSections = document.querySelectorAll('.tab-section');
    const fab = document.getElementById('contact-fab');
    const heroCtaBtn = document.getElementById('hero-cta-btn');

    function switchTab(targetId) {
        if (!targetId) return;

        tabSections.forEach(section => {
            if (section.id === `tab-${targetId}`) {
                section.classList.add('active');
            } else {
                section.classList.remove('active');
            }
        });

        navTabs.forEach(tab => {
            if (tab.getAttribute('data-target') === targetId) {
                tab.classList.add('active');
            } else {
                tab.classList.remove('active');
            }
        });

        // Hide FAB on contact tab
        if (targetId === 'contact') {
            if (fab) fab.classList.add('hidden');
        } else {
            if (fab) fab.classList.remove('hidden');
        }

        // Scroll active view to top instantly
        window.scrollTo({ top: 0, behavior: 'instant' });

        // Update URL hash without jumping page
        history.replaceState(null, null, `#${targetId}`);
    }

    navTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const target = tab.getAttribute('data-target');
            switchTab(target);
        });
    });

    if (fab) {
        fab.addEventListener('click', () => {
            switchTab('contact');
        });
    }

    if (heroCtaBtn) {
        heroCtaBtn.addEventListener('click', () => {
            switchTab('contact');
        });
    }

    // Check hash on startup
    const initialHash = window.location.hash.substring(1);
    if (initialHash && ['home', 'projects', 'resume', 'contact'].includes(initialHash)) {
        switchTab(initialHash);
    } else {
        switchTab('home');
    }

    // ── 3. Stats Swipe Carousel Indicator Sync ───────────────
    const statsCarousel = document.querySelector('.stats-carousel');
    const dots = document.querySelectorAll('.carousel-dots .dot');

    if (statsCarousel && dots.length > 0) {
        let scrollTimeout;
        statsCarousel.addEventListener('scroll', () => {
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(() => {
                const scrollLeft = statsCarousel.scrollLeft;
                const clientWidth = statsCarousel.clientWidth;
                const scrollWidth = statsCarousel.scrollWidth;
                
                // Estimate current index by scroll percentage
                const maxScroll = scrollWidth - clientWidth;
                if (maxScroll <= 0) return;
                
                const percentage = scrollLeft / maxScroll;
                let activeIndex = Math.round(percentage * (dots.length - 1));
                
                // Fallback direct math check
                const firstCard = statsCarousel.querySelector('.stat-card');
                if (firstCard) {
                    const cardWidth = firstCard.offsetWidth;
                    activeIndex = Math.round(scrollLeft / (cardWidth + 14)); // card width + flex gap
                }
                
                // Clamp index
                activeIndex = Math.max(0, Math.min(dots.length - 1, activeIndex));

                dots.forEach((dot, idx) => {
                    if (idx === activeIndex) {
                        dot.classList.add('active');
                    } else {
                        dot.classList.remove('active');
                    }
                });
            }, 60);
        });
        
        // Tap dots to navigate
        dots.forEach(dot => {
            dot.addEventListener('click', () => {
                const targetIndex = parseInt(dot.getAttribute('data-index'), 10);
                const firstCard = statsCarousel.querySelector('.stat-card');
                if (firstCard) {
                    const cardWidth = firstCard.offsetWidth;
                    statsCarousel.scrollTo({
                        left: targetIndex * (cardWidth + 14),
                        behavior: 'smooth'
                    });
                }
            });
        });
    }

    // ── 4. Tech Stack "Show More" Collapsible Toggle ─────────
    const techToggleBtn = document.getElementById('tech-toggle-btn');
    const techCollapsible = document.getElementById('tech-more-content');

    if (techToggleBtn && techCollapsible) {
        techToggleBtn.addEventListener('click', () => {
            const isExpanded = techCollapsible.classList.toggle('expanded');
            if (isExpanded) {
                techToggleBtn.innerHTML = 'Show Less <i class="fa-solid fa-chevron-up" style="margin-left: 6px;"></i>';
            } else {
                techToggleBtn.innerHTML = 'Show More <i class="fa-solid fa-chevron-down" style="margin-left: 6px;"></i>';
            }
        });
    }

    // ── 5. Project Details Bottom Sheet Data and Swipe ────────
    const projectsData = {
        learn2ride: {
            tag: 'Full-Stack Platform',
            title: 'Learn2Ride Platform',
            tech: ['Next.js', 'Tailwind CSS', 'Node.js', 'Express.js', 'MongoDB'],
            challenge: 'Traditional driving school systems suffer from high friction booking, zero real-time trainer verification, and offline coordination vulnerabilities.',
            solution: 'Engineered a highly responsive frontend connecting verified trainers using REST API endpoints. Added reactive calendar management for seamless session coordination.',
            wins: 'Reduced schedule matching times by 65%. Zero external SQL calls per session list render. Clean UI with fully accessible layouts.',
            cta: `
                <a href="https://github.com/Abhishek250805" target="_blank" rel="noopener noreferrer" class="btn btn-gold w-100"><i class="fa-brands fa-github"></i> Repository</a>
            `
        },
        auracalc: {
            tag: 'Advanced UI',
            title: 'AURA-Calc',
            tech: ['HTML', 'CSS', 'JavaScript'],
            challenge: 'Standard calculators lack customizable visual profiles, have poor touch accessibility, and lack modern responsive feedback.',
            solution: 'Built a high-performance web-based calculator utilizing custom CSS grids, modern glassmorphic theme styling, and immediate floating-point evaluation logic.',
            wins: 'Sub-millisecond computation response, fluid layout responsive down to 320px, and custom accessibility tags for screen readers.',
            cta: `
                <a href="https://abhishek250805.github.io/calculator/" target="_blank" rel="noopener noreferrer" class="btn btn-gold w-100"><i class="fa-solid fa-play"></i> Launch Calculator</a>
                <a href="https://github.com/Abhishek250805" target="_blank" rel="noopener noreferrer" class="btn btn-outline w-100" style="margin-top:8px;"><i class="fa-brands fa-github"></i> Repository</a>
            `
        },
        portfolio: {
            tag: 'Professional UI',
            title: 'Personal Portfolio',
            tech: ['HTML', 'CSS', 'JavaScript'],
            challenge: 'Standard portfolios lack immersive, high-performance interactions and fail to convey clean architecture and native-like experiences.',
            solution: 'Crafted a multi-layered cyberpunk HUD themed responsive desktop site and a separate native-feeling mobile app-style site using pure HTML, CSS, and JS.',
            wins: '100% PageSpeed performance score, hardware-accelerated animations, and native bottom sheet modals with zero dependency footprint.',
            cta: `
                <button class="btn btn-gold w-100 btn-close-sheet-action">Continue Exploring</button>
                <a href="https://github.com/Abhishek250805" target="_blank" rel="noopener noreferrer" class="btn btn-outline w-100" style="margin-top:8px;"><i class="fa-brands fa-github"></i> Repository</a>
            `
        }
    };

    const backdrop = document.getElementById('project-sheet-backdrop');
    const sheet = document.getElementById('project-sheet');
    const closeBtn = document.querySelector('.close-sheet-btn');

    function openBottomSheet(projectId) {
        const data = projectsData[projectId];
        if (!data) return;

        document.getElementById('sheet-project-tag').textContent = data.tag;
        document.getElementById('sheet-project-title').textContent = data.title;
        
        const techContainer = document.getElementById('sheet-project-tech');
        techContainer.innerHTML = '';
        data.tech.forEach(t => {
            const span = document.createElement('span');
            span.textContent = t;
            techContainer.appendChild(span);
        });

        document.getElementById('sheet-project-challenge').textContent = data.challenge;
        document.getElementById('sheet-project-solution').textContent = data.solution;
        document.getElementById('sheet-project-wins').textContent = data.wins;
        
        const actionsContainer = document.getElementById('sheet-project-actions');
        actionsContainer.innerHTML = data.cta;

        // Wire dynamic action buttons
        const inlineClose = actionsContainer.querySelector('.btn-close-sheet-action');
        if (inlineClose) {
            inlineClose.addEventListener('click', closeBottomSheet);
        }

        if (backdrop && sheet) {
            backdrop.classList.add('open');
            backdrop.setAttribute('aria-hidden', 'false');
            sheet.style.transform = 'translate3d(0, 0, 0)';
            document.body.style.overflow = 'hidden'; // Lock background scrolling
        }
    }

    function closeBottomSheet() {
        if (backdrop && sheet) {
            sheet.style.transform = '';
            backdrop.classList.remove('open');
            backdrop.setAttribute('aria-hidden', 'true');
            document.body.style.overflow = ''; // Restore background scrolling
        }
    }

    // Bind cards clicks to open sheet
    document.querySelectorAll('.project-card').forEach(card => {
        const btn = card.querySelector('.expand-project-btn');
        const projId = card.getAttribute('data-project');
        
        if (btn) {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                openBottomSheet(projId);
            });
        }
        card.addEventListener('click', () => {
            openBottomSheet(projId);
        });
    });

    if (closeBtn) closeBtn.addEventListener('click', closeBottomSheet);
    if (backdrop) {
        backdrop.addEventListener('click', (e) => {
            if (e.target === backdrop) closeBottomSheet();
        });
    }

    // ── 6. Bottom Sheet Drag-to-Dismiss Gesture ──────────────
    if (sheet) {
        let startY = 0;
        let currentY = 0;
        let isDragging = false;

        sheet.addEventListener('touchstart', (e) => {
            // Initiate drag only when touching grab handle, header, or when sheet is scrolled to top
            const scrollArea = sheet.querySelector('.sheet-content');
            const touchHeader = e.target.closest('.sheet-header');
            
            if (touchHeader || (scrollArea && scrollArea.scrollTop <= 0)) {
                startY = e.touches[0].clientY;
                isDragging = true;
                sheet.style.transition = 'none';
            }
        }, { passive: true });

        sheet.addEventListener('touchmove', (e) => {
            if (!isDragging) return;
            currentY = e.touches[0].clientY;
            const deltaY = currentY - startY;
            
            if (deltaY > 0) {
                // Dragging down: move sheet down
                sheet.style.transform = `translate3d(0, ${deltaY}px, 0)`;
                // Dim backdrop slightly based on drag progress
                const opacityPercent = Math.max(0, 1 - (deltaY / 300));
                backdrop.style.background = `rgba(0, 0, 0, ${0.75 * opacityPercent})`;
            } else {
                // Dragging up: prevent dragging higher than top
                sheet.style.transform = 'translate3d(0, 0, 0)';
            }
        }, { passive: true });

        sheet.addEventListener('touchend', () => {
            if (!isDragging) return;
            isDragging = false;
            sheet.style.transition = '';
            backdrop.style.background = '';
            
            const deltaY = currentY - startY;
            if (deltaY > 110) {
                closeBottomSheet();
            } else {
                // Bounce back
                sheet.style.transform = 'translate3d(0, 0, 0)';
            }
            startY = 0;
            currentY = 0;
        });
    }

    // ── 7. Accordion Control (Resume View) ───────────────────
    const accordionHeaders = document.querySelectorAll('.accordion-header');
    accordionHeaders.forEach(header => {
        header.addEventListener('click', () => {
            const item = header.parentElement;
            const content = item.querySelector('.accordion-content');
            const isOpen = item.classList.contains('open');

            // Collapse other items (single accordion behavior)
            document.querySelectorAll('.accordion-item').forEach(otherItem => {
                otherItem.classList.remove('open');
                const otherContent = otherItem.querySelector('.accordion-content');
                if (otherContent) otherContent.style.maxHeight = null;
                otherItem.querySelector('.accordion-header').setAttribute('aria-expanded', 'false');
            });

            if (!isOpen) {
                item.classList.add('open');
                content.style.maxHeight = content.scrollHeight + 'px';
                header.setAttribute('aria-expanded', 'true');
            }
        });
    });

    // ── 8. Switch to Desktop Site ────────────────────────────
    const desktopLinks = document.querySelectorAll('.desktop-switch-link');
    desktopLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.setItem('prefer-desktop', 'true');
            window.location.href = 'index.html';
        });
    });

    const portfolioCardDesktopBtn = document.querySelector('.btn-desktop-view');
    if (portfolioCardDesktopBtn) {
        portfolioCardDesktopBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            localStorage.setItem('prefer-desktop', 'true');
            window.location.href = 'index.html';
        });
    }

    // ── 9. Contact Form Web3Forms Submission ─────────────────
    const mContactForm = document.getElementById('m-contact-form');
    const mSubmitBtn = document.getElementById('m-submit-btn');
    const mSuccessMsg = document.getElementById('m-form-success');
    const mErrorMsg = document.getElementById('m-form-error');

    if (mContactForm) {
        mContactForm.addEventListener('submit', async function (e) {
            e.preventDefault();
            let valid = true;

            const name = document.getElementById('m-name');
            const email = document.getElementById('m-email');
            const message = document.getElementById('m-message');
            
            const nameErr = document.getElementById('m-name-error');
            const mailErr = document.getElementById('m-email-error');
            const msgErr = document.getElementById('m-message-error');

            // Reset errors & status
            [nameErr, mailErr, msgErr].forEach(el => { if(el) el.textContent = ''; });
            [mSuccessMsg, mErrorMsg].forEach(el => { if(el) el.classList.add('hidden'); });

            // Validate
            if (name.value.trim().length < 2) {
                if(nameErr) nameErr.textContent = 'Please enter your name.';
                valid = false;
            }
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
                if(mailErr) mailErr.textContent = 'Please enter a valid email.';
                valid = false;
            }
            if (message.value.trim().length < 10) {
                if(msgErr) msgErr.textContent = 'Message must be at least 10 characters.';
                valid = false;
            }

            if (!valid) return;

            // Start sending state
            mSubmitBtn.disabled = true;
            mSubmitBtn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Sending...';

            try {
                const res = await fetch('https://api.web3forms.com/submit', {
                    method: 'POST',
                    body: new FormData(mContactForm)
                });
                const data = await res.json();
                if (data.success) {
                    mSuccessMsg.classList.remove('hidden');
                    mContactForm.reset();
                } else {
                    mErrorMsg.textContent = data.message || 'Something went wrong.';
                    mErrorMsg.classList.remove('hidden');
                }
            } catch (error) {
                mErrorMsg.textContent = 'Check your connection and try again.';
                mErrorMsg.classList.remove('hidden');
            } finally {
                mSubmitBtn.disabled = false;
                mSubmitBtn.textContent = 'Send Inquiry';
                setTimeout(() => {
                    [mSuccessMsg, mErrorMsg].forEach(el => { if(el) el.classList.add('hidden'); });
                }, 5000);
            }
        });
    }
});
