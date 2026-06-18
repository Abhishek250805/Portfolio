/**
 * ================================================================
 *  PORTFOLIO — MAIN INTERACTION SCRIPT
 *  Handles: cursor · scroll · 3D tilt · mobile menu
 *           project spotlight · contact form · GitHub API
 *  Background / HUD engine is in hud-background.js
 * ================================================================
 */

const initPortfolio = () => {

    // ── 0. Cinematic Preloader ────────────────────────────────
    const preloader = document.getElementById('preloader');
    if (preloader) {
        document.body.style.overflowY = 'hidden';
        const hidePreloader = () => {
            preloader.classList.add('fade-out');
            document.body.style.overflowY = 'auto';
        };
        // Cinematic timeout (1.5s) guarantees preloader resolution
        // independent of slow CDNs, offline modes, or missing local assets.
        setTimeout(hidePreloader, 1500);
    }


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
                outline.style.borderColor = '#FFD700';
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
    const logoWatermark = document.querySelector('.logo-watermark'); // Cached query to prevent layout thrashing
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

                // Logo watermark parallax (desktop viewport only for smooth scroll performance)
                if (logoWatermark && window.innerWidth > 768) {
                    logoWatermark.style.transform = `translate(-50%, calc(-50% + ${lastY * 0.15}px))`;
                }

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
            const active = menuToggle.classList.toggle('active');
            navLinks.classList.toggle('active', active);
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
                    navLinks.classList.remove('active');
                    menuToggle.classList.remove('active');
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

    // tsParticles section removed for performance optimization

    // ── 10. Web Audio API HUD Sound Synthesizer ────────────────
    let audioCtx = null;
    let soundEnabled = false;
    const soundToggle = document.getElementById('sound-toggle');

    function initAudio() {
        if (!audioCtx) {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
    }

    function playSound(type) {
        if (!soundEnabled) return;
        initAudio();
        if (audioCtx.state === 'suspended') {
            audioCtx.resume();
        }

        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);

        const now = audioCtx.currentTime;

        if (type === 'chirp') {
            osc.type = 'sine';
            osc.frequency.setValueAtTime(880, now);
            osc.frequency.exponentialRampToValueAtTime(110, now + 0.08);
            gain.gain.setValueAtTime(0.05, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
            osc.start(now);
            osc.stop(now + 0.08);
        } else if (type === 'click') {
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(150, now);
            osc.frequency.exponentialRampToValueAtTime(40, now + 0.04);
            gain.gain.setValueAtTime(0.10, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
            osc.start(now);
            osc.stop(now + 0.04);
        }
    }

    if (soundToggle) {
        soundToggle.addEventListener('click', () => {
            soundEnabled = !soundEnabled;
            initAudio();
            if (soundEnabled) {
                soundToggle.classList.add('active');
                soundToggle.innerHTML = '<i class="fa-solid fa-volume-high"></i> SOUND: ON';
                setTimeout(() => playSound('click'), 100);
            } else {
                soundToggle.classList.remove('active');
                soundToggle.innerHTML = '<i class="fa-solid fa-volume-xmark"></i> SOUND: OFF';
            }
        });
    }

    function attachSoundListeners() {
        const targets = document.querySelectorAll('a, button, .skill-tag, .contact-link, .filter-btn, .btn-diag');
        targets.forEach(el => {
            el.addEventListener('mouseenter', () => playSound('chirp'), { passive: true });
            el.addEventListener('click', () => playSound('click'), { passive: true });
        });
    }
    attachSoundListeners();


    // ── 11. Projects Tech Filter ────────────────────────────────
    const filterButtons = document.querySelectorAll('.filter-btn');

    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const filterValue = btn.getAttribute('data-filter');
            filterButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            projectCards.forEach(card => {
                const cardCategory = card.getAttribute('data-category');
                if (filterValue === 'all' || cardCategory === filterValue) {
                    card.classList.remove('hidden-card');
                } else {
                    card.classList.add('hidden-card');
                }
            });

            setTimeout(() => {
                document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));
            }, 300);
        });
    });


    // ── 12. Learn2Ride Expandable System Diagnostics Panel ──────
    const btnDiag = document.getElementById('btn-diagnostics');
    const diagPanel = document.getElementById('diagnostics-panel');

    if (btnDiag && diagPanel) {
        btnDiag.addEventListener('click', () => {
            const active = diagPanel.classList.toggle('active');
            btnDiag.setAttribute('aria-expanded', active ? 'true' : 'false');
            diagPanel.setAttribute('aria-hidden', active ? 'false' : 'true');
            btnDiag.innerHTML = active 
                ? '<i class="fa-solid fa-square-minus" style="color: var(--gold);"></i> HIDE_METRICS' 
                : '<i class="fa-solid fa-chart-line" style="color: var(--gold);"></i> SYS_ANALYSIS';
        });
    }


    // ── 13. Interactive Cyber Terminal Console ──────────────────
    const termInput  = document.getElementById('terminal-input');
    const termOutput = document.getElementById('terminal-output');
    const termBody   = document.querySelector('.terminal-body');

    if (termInput && termOutput) {
        termInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                const inputVal = termInput.value.trim();
                termInput.value = '';
                
                if (inputVal.length > 0) {
                    processTermCommand(inputVal);
                }
            }
        });

        function appendTermLine(text, isInput = false, color = '') {
            const line = document.createElement('p');
            line.className = 'term-msg';
            if (color) line.style.color = color;
            
            if (isInput) {
                line.innerHTML = `<span style="color: var(--gold-glow); font-weight: bold;">guest@ap-net:~$</span> ${escapeHTML(text)}`;
            } else {
                line.innerHTML = text;
            }
            termOutput.appendChild(line);
            
            if (termBody) {
                termBody.scrollTop = termBody.scrollHeight;
            }
        }

        function escapeHTML(str) {
            return str.replace(/[&<>'"]/g, 
                tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
            );
        }

        function processTermCommand(cmd) {
            const lowerCmd = cmd.toLowerCase().split(' ')[0];
            appendTermLine(cmd, true);

            setTimeout(() => {
                switch (lowerCmd) {
                    case 'help':
                        appendTermLine('Available AP-NET Database commands:');
                        appendTermLine('&nbsp;&nbsp;<span class="gold-text">bio</span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;- Output developers system biography.');
                        appendTermLine('&nbsp;&nbsp;<span class="gold-text">skills</span>&nbsp;&nbsp;&nbsp;- Diagnostic report on core technical stack.');
                        appendTermLine('&nbsp;&nbsp;<span class="gold-text">projects</span>&nbsp;- Retrieve system links to FLAGSHIP works.');
                        appendTermLine('&nbsp;&nbsp;<span class="gold-text">sound</span>&nbsp;&nbsp;&nbsp;&nbsp;- Toggle HUD synthesizer feedback audio.');
                        appendTermLine('&nbsp;&nbsp;<span class="gold-text">clear</span>&nbsp;&nbsp;&nbsp;&nbsp;- Purge console output buffers.');
                        break;
                    case 'clear':
                        termOutput.innerHTML = '';
                        break;
                    case 'bio':
                        appendTermLine('--- SYSTEM BIOGRAPHY REGISTER ---', false, 'var(--gold)');
                        appendTermLine('Name&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;: Abhishek Pandey');
                        appendTermLine('Status&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;: BCA Scholar / Frontend Architect');
                        appendTermLine('Core Focus&nbsp;: Premium responsive layouts & verified APIs.');
                        appendTermLine('Description: Specialized in creating clean layouts, scalable UI frames, and turning high-stakes concepts into functional code.');
                        break;
                    case 'skills':
                        appendTermLine('--- STACK DIAGNOSTIC REPORT ---', false, 'var(--gold)');
                        appendTermLine('<span style="color:#00D9FF;">[FRONTEND]</span>: HTML5 | CSS3 | JS (ES6+) | React.js | Next.js');
                        appendTermLine('<span style="color:#FF8C00;">[LANGUAGES]</span>: C | C++ | Java | Python | SQL | R');
                        appendTermLine('<span style="color:#4ade80;">[SYSTEMS]</span> : Git | GitHub | Firebase | Gemini Pro API | VS Code');
                        break;
                    case 'projects':
                        appendTermLine('--- RETRIEVING FLAGSHIP ARCHIVES ---', false, 'var(--gold)');
                        appendTermLine('1. <span class="gold-text">Learn2Ride</span> (Currently Building driving school verified platform)');
                        appendTermLine('2. <span class="gold-text">Amazon Premium UI</span> (E-Commerce visual optimization)');
                        appendTermLine('3. <span class="gold-text">Weather Precision</span> (Real-time external API parser)');
                        appendTermLine('4. <span class="gold-text">Kashi Explored</span> (Interactive Varanasi storytelling database)');
                        break;
                    case 'sound':
                        if (soundToggle) soundToggle.click();
                        appendTermLine(`System audio toggled. HUD feedback: ${soundEnabled ? 'ONLINE' : 'OFFLINE'}`, false, soundEnabled ? '#4ade80' : 'var(--text-muted)');
                        break;
                    default:
                        appendTermLine(`AP-NET command parser error: "${escapeHTML(cmd)}" command not recognized. Type <span class="gold-text">help</span> to list query system registers.`, false, '#FF4D4D');
                }
                
                if (termBody) {
                    termBody.scrollTop = termBody.scrollHeight;
                }
            }, 100);
        }
    }

}; // end initPortfolio

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPortfolio);
} else {
    initPortfolio();
}
