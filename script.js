/**
 * ================================================================
 *  PORTFOLIO — MAIN INTERACTION SCRIPT
 *  Handles: cursor · scroll · 3D tilt · mobile menu
 *           project spotlight · contact form · GitHub API
 *  Background / HUD engine is in hud-background.js
 * ================================================================
 */

document.addEventListener('DOMContentLoaded', () => {

    // ── 0. Cinematic Preloader ────────────────────────────────
    const preloader = document.getElementById('preloader');
    document.body.style.overflowY = 'hidden';

    window.addEventListener('load', () => {
        setTimeout(() => {
            preloader.classList.add('fade-out');
            document.body.style.overflowY = 'auto';
        }, 1500);
    });


    // ── 1. Section Reveal (IntersectionObserver) ──────────────
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) entry.target.classList.add('active');
        });
    }, { threshold: 0.14, rootMargin: '0px 0px -50px 0px' });

    document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));


    // ── 2. Custom Luxury Cursor ───────────────────────────────
    const dot      = document.querySelector('.cursor-dot');
    const outline  = document.querySelector('.cursor-outline');
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

    let mouseX = window.innerWidth  / 2;
    let mouseY = window.innerHeight / 2;
    let outX   = mouseX;
    let outY   = mouseY;

    if (!isTouchDevice && dot && outline) {
        window.addEventListener('mousemove', e => {
            mouseX = e.clientX;
            mouseY = e.clientY;

            const hovering = e.target.closest('a, button, .skill-tag, .contact-link, .glass-card');
            if (hovering) {
                dot.style.transform    = 'translate(-50%,-50%) scale(1.6)';
                outline.style.transform = 'translate(-50%,-50%) scale(2.0)';
                outline.style.borderColor = '#00D9FF';
            } else {
                dot.style.transform    = 'translate(-50%,-50%) scale(1)';
                outline.style.transform = 'translate(-50%,-50%) scale(1)';
                outline.style.borderColor = '#FF8C00';
            }
        }, { passive: true });

        const animateCursor = () => {
            dot.style.left = `${mouseX}px`;
            dot.style.top  = `${mouseY}px`;
            outX += (mouseX - outX) * 0.14;
            outY += (mouseY - outY) * 0.14;
            outline.style.left = `${outX}px`;
            outline.style.top  = `${outY}px`;
            requestAnimationFrame(animateCursor);
        };
        animateCursor();
    } else {
        if (dot)     dot.style.display    = 'none';
        if (outline) outline.style.display = 'none';
    }


    // ── 3. Scroll Progress & Navbar ───────────────────────────
    const progressBar = document.querySelector('.scroll-progress-bar');
    const navbar      = document.querySelector('.navbar');
    const scrollTopBtn = document.getElementById('scroll-top');
    let lastY   = window.scrollY;
    let ticking = false;

    window.addEventListener('scroll', () => {
        lastY = window.scrollY;
        if (!ticking) {
            requestAnimationFrame(() => {
                // Progress bar
                const docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
                if (progressBar) progressBar.style.width = `${(lastY / docHeight) * 100}%`;

                // Navbar glass intensifies on scroll
                if (lastY > 50) navbar.classList.add('scrolled');
                else            navbar.classList.remove('scrolled');

                // Scroll-to-top button
                if (lastY > 500) scrollTopBtn.classList.add('visible');
                else             scrollTopBtn.classList.remove('visible');

                // Logo watermark parallax
                const wm = document.querySelector('.logo-watermark');
                if (wm) wm.style.transform = `translate(-50%, calc(-50% + ${lastY * 0.15}px))`;

                ticking = false;
            });
            ticking = true;
        }
    }, { passive: true });

    if (scrollTopBtn) {
        scrollTopBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
    }


    // ── 4. 3D Glass Tilt (desktop only) ──────────────────────
    if (!isTouchDevice) {
        document.querySelectorAll('.glass-card').forEach(card => {
            let rect;
            card.addEventListener('mouseenter', () => { rect = card.getBoundingClientRect(); });
            card.addEventListener('mousemove', e => {
                if (!rect) rect = card.getBoundingClientRect();
                const x  = e.clientX - rect.left;
                const y  = e.clientY - rect.top;
                const rX = ((y - rect.height / 2) / rect.height) * -10;
                const rY = ((x - rect.width  / 2) / rect.width)  *  10;
                card.style.transform = `translateY(-10px) rotateX(${rX}deg) rotateY(${rY}deg)`;
            }, { passive: true });
            card.addEventListener('mouseleave', () => {
                card.style.transform = 'translateY(0) rotateX(0) rotateY(0)';
            });
        });
    }


    // ── 5. Project Spotlight Dimming ──────────────────────────
    const projectGrid  = document.querySelector('.projects-grid');
    const projectCards = document.querySelectorAll('.project-card');

    projectCards.forEach(card => {
        card.addEventListener('mouseenter', () => projectGrid && projectGrid.classList.add('dimmed'));
        card.addEventListener('mouseleave', () => projectGrid && projectGrid.classList.remove('dimmed'));
    });


    // ── 6. Mobile Menu ────────────────────────────────────────
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks   = document.querySelector('.nav-links');

    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', () => {
            const open = navLinks.style.display === 'flex';
            navLinks.style.display = open ? 'none' : 'flex';
            const bars = menuToggle.querySelectorAll('.bar');
            bars[0].style.transform = open ? 'none' : 'rotate(45deg) translate(5px, 5px)';
            bars[1].style.transform = open ? 'none' : 'rotate(-45deg) translate(5px, -5px)';
        });
    }

    // Smooth anchor scroll (with navbar offset)
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const id  = this.getAttribute('href');
            if (id === '#') return;
            const el  = document.querySelector(id);
            if (el) {
                window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 100, behavior: 'smooth' });
                if (navLinks && window.innerWidth <= 768) {
                    navLinks.style.display = 'none';
                    menuToggle.querySelectorAll('.bar').forEach(b => b.style.transform = 'none');
                }
            }
        });
    });


    // ── 7. Contact Form (Web3Forms) ───────────────────────────
    const contactForm = document.getElementById('contact-form');
    const submitBtn   = document.getElementById('submit-btn');
    const successMsg  = document.getElementById('form-success');
    const errorMsgEl  = document.getElementById('form-error');

    if (contactForm) {
        contactForm.addEventListener('submit', async function (e) {
            e.preventDefault();
            let valid = true;

            const name    = document.getElementById('name');
            const email   = document.getElementById('email');
            const message = document.getElementById('message');
            const nameErr = document.getElementById('name-error');
            const mailErr = document.getElementById('email-error');
            const msgErr  = document.getElementById('message-error');

            [nameErr, mailErr, msgErr].forEach(el => el.textContent = '');
            [successMsg, errorMsgEl].forEach(el => el.classList.add('hidden'));

            if (name.value.trim().length < 2)                       { nameErr.textContent = 'Please enter your full name.'; valid = false; }
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value))   { mailErr.textContent = 'Please enter a valid email.'; valid = false; }
            if (message.value.trim().length < 10)                   { msgErr.textContent  = 'Message must be at least 10 characters.'; valid = false; }

            if (!valid) return;

            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Sending...';

            try {
                const res  = await fetch('https://api.web3forms.com/submit', { method: 'POST', body: new FormData(contactForm) });
                const data = await res.json();
                if (data.success) {
                    successMsg.classList.remove('hidden');
                    contactForm.reset();
                } else {
                    errorMsgEl.textContent = data.message || 'Something went wrong.';
                    errorMsgEl.classList.remove('hidden');
                }
            } catch {
                errorMsgEl.textContent = 'Check your internet connection and try again.';
                errorMsgEl.classList.remove('hidden');
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Send Inquiry';
                setTimeout(() => [successMsg, errorMsgEl].forEach(el => el.classList.add('hidden')), 5000);
            }
        });
    }


    // ── 8. Live GitHub Integration ────────────────────────────
    // (Particles now handled directly by hud-background.js canvas for performance)
    const GH_USER    = 'Abhishek250805';
    const profileCard = document.getElementById('github-profile-card');
    const reposGrid   = document.getElementById('github-repos-grid');

    async function fetchGitHub() {
        try {
            const [userRes, reposRes] = await Promise.all([
                fetch(`https://api.github.com/users/${GH_USER}`),
                fetch(`https://api.github.com/users/${GH_USER}/repos?sort=updated&per_page=6`)
            ]);
            const [user, repos] = await Promise.all([userRes.json(), reposRes.json()]);
            renderGitHub(user, repos);
        } catch {
            if (profileCard) profileCard.innerHTML = `<p>Failed to load GitHub data. <a href="https://github.com/${GH_USER}" target="_blank">View Profile</a></p>`;
        }
    }

    function renderGitHub(user, repos) {
        if (profileCard) {
            profileCard.innerHTML = `
                <img src="${user.avatar_url}" alt="${user.name || GH_USER}" class="github-avatar">
                <h3>${user.name || GH_USER}</h3>
                <p>${user.bio || 'Full Stack Developer'}</p>
                <div class="github-stats-grid">
                    <div class="stat-item"><h4>${user.public_repos}</h4><p>Repos</p></div>
                    <div class="stat-item"><h4>${user.followers}</h4><p>Followers</p></div>
                </div>
                <a href="${user.html_url}" target="_blank" class="btn btn-outline" style="margin-top:2rem;width:100%;">Visit Profile</a>
            `;
        }
        if (reposGrid) {
            reposGrid.innerHTML = repos.map(repo => `
                <div class="repo-card reveal">
                    <div class="repo-header">
                        <i class="fa-brands fa-github gold-text" style="font-size:1.5rem;"></i>
                        <div class="repo-stats"><span><i class="fa-regular fa-star"></i> ${repo.stargazers_count}</span></div>
                    </div>
                    <div class="repo-body">
                        <h3>${repo.name}</h3>
                        <p>${repo.description || 'No description available.'}</p>
                    </div>
                    <div class="repo-footer">
                        <div class="repo-lang">
                            <span class="lang-dot" style="background:${langColor(repo.language)}"></span>
                            <span>${repo.language || 'Mixed'}</span>
                        </div>
                        <a href="${repo.html_url}" target="_blank" class="link-btn">Repo <i class="fa-solid fa-arrow-up-right-from-square" style="font-size:0.8rem;"></i></a>
                    </div>
                </div>
            `).join('');
            reposGrid.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));
        }
    }

    function langColor(lang) {
        return ({
            JavaScript: '#f1e05a', HTML: '#e34c26', CSS: '#563d7c',
            Python: '#3572A5', Java: '#b07219', 'C++': '#f34b7d', TypeScript: '#3178c6'
        })[lang] || '#8e8e8e';
    }

    if (profileCard) fetchGitHub();

    // ── 9. tsParticles — Floating Interactive Neural Network ────
    if (typeof tsParticles !== 'undefined') {
        const particleCount = isTouchDevice ? 35 : 85;
        tsParticles.load('tsparticles', {
            fpsLimit: 40, // Cap tsParticles FPS for buttery smooth performance!
            particles: {
                number: {
                    value: particleCount,
                    density: {
                        enable: true,
                        area: 800
                    }
                },
                color: {
                    value: ["#FF8C00", "#00D9FF"] // Gold and Cyan alternating nodes
                },
                shape: {
                    type: "circle"
                },
                opacity: {
                    value: { min: 0.15, max: 0.45 },
                    animation: {
                        enable: !isTouchDevice,
                        speed: 1,
                        sync: false
                    }
                },
                size: {
                    value: { min: 1, max: 2.5 },
                },
                links: {
                    enable: true,
                    distance: 140,
                    color: "#FF8C00", // Gold circuit connections
                    opacity: 0.22,
                    width: 1
                },
                move: {
                    enable: true,
                    speed: isTouchDevice ? 0.7 : 1.2, // Balanced lag-free speed
                    direction: "none",
                    random: false,
                    straight: false,
                    outModes: {
                        default: "out"
                    }
                }
            },
            interactivity: {
                detectsOn: "window",
                events: {
                    onHover: {
                        enable: !isTouchDevice,
                        mode: "grab"
                    },
                    resize: true
                },
                modes: {
                    grab: {
                        distance: 180,
                        links: {
                            opacity: 0.48
                        }
                    }
                }
            },
            detectRetina: !isTouchDevice
        });
    }

}); // end DOMContentLoaded
