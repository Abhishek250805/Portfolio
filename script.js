document.addEventListener('DOMContentLoaded', () => {
    
    // --- 0. Cinematic Preloader Logic ---
    const preloader = document.getElementById('preloader');
    
    window.addEventListener('load', () => {
        setTimeout(() => {
            preloader.classList.add('fade-out');
            // Enable scrolling after preloader is gone
            document.body.style.overflowY = 'auto';
        }, 1500); // Minimum duration for cinematic effect
    });

    // Disable scroll while preloader is active
    document.body.style.overflowY = 'hidden';
    
    // --- 1. Enhanced Section Reveal (Intersection Observer) ---
    const revealOptions = {
        threshold: 0.15,
        rootMargin: "0px 0px -50px 0px"
    };

    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
            }
        });
    }, revealOptions);

    const revealElements = document.querySelectorAll('.reveal');
    revealElements.forEach(el => revealObserver.observe(el));


    // --- 2. Custom Luxury Cursor & Performance ---
    const dot = document.querySelector('.cursor-dot');
    const outline = document.querySelector('.cursor-outline');
    const blobs = document.querySelectorAll('.blob');
    
    let mouseX = 0;
    let mouseY = 0;
    let outlineX = 0;
    let outlineY = 0;
    let isInteracting = false;
    let isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

    if (isTouchDevice) {
        if (dot) dot.style.display = 'none';
        if (outline) outline.style.display = 'none';
    } else {
        window.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
            
            if (!isInteracting) {
                const target = e.target;
                const isHovering = target.closest('a, button, .skill-tag, .contact-link, .glass-card');
                
                if (isHovering) {
                    dot.style.transform = 'translate(-50%, -50%) scale(1.5)';
                    outline.style.transform = 'translate(-50%, -50%) scale(1.8)';
                    outline.style.borderColor = 'var(--gold-glow)';
                } else {
                    dot.style.transform = 'translate(-50%, -50%) scale(1)';
                    outline.style.transform = 'translate(-50%, -50%) scale(1)';
                    outline.style.borderColor = 'var(--gold)';
                }
            }
        }, { passive: true });

        const animate = () => {
            dot.style.left = `${mouseX}px`;
            dot.style.top = `${mouseY}px`;

            const distX = mouseX - outlineX;
            const distY = mouseY - outlineY;
            
            outlineX += distX * 0.15;
            outlineY += distY * 0.15;
            
            outline.style.left = `${outlineX}px`;
            outline.style.top = `${outlineY}px`;

            const normX = mouseX / window.innerWidth;
            const normY = mouseY / window.innerHeight;
            
            blobs.forEach((blob, index) => {
                const speed = (index + 1) * 20;
                blob.style.transform = `translate(${normX * speed}px, ${normY * speed}px)`;
            });
            
            requestAnimationFrame(animate);
        };
        animate();
    }


    // --- 3. Scroll Progress & Navbar Effect (Throttled) ---
    const progressBar = document.querySelector('.scroll-progress-bar');
    const navbar = document.querySelector('.navbar');
    const scrollTopBtn = document.getElementById('scroll-top');

    let lastScrollY = window.scrollY;
    let ticking = false;

    window.addEventListener('scroll', () => {
        lastScrollY = window.scrollY;
        if (!ticking) {
            window.requestAnimationFrame(() => {
                // Scroll Progress
                const winScroll = document.documentElement.scrollTop;
                const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
                const scrolled = (winScroll / height) * 100;
                if (progressBar) progressBar.style.width = scrolled + "%";

                // Navbar scrolled state
                if (lastScrollY > 50) {
                    navbar.classList.add('scrolled');
                } else {
                    navbar.classList.remove('scrolled');
                }

                // Scroll to top button visibility
                if (lastScrollY > 500) {
                    scrollTopBtn.classList.add('visible');
                } else {
                    scrollTopBtn.classList.remove('visible');
                }
                ticking = false;
            });
            ticking = true;
        }
    }, { passive: true });

    scrollTopBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });


    // --- 4. 3D Glass Tilt Effect (Disabled on Mobile) ---
    const glassCards = document.querySelectorAll('.glass-card');
    
    if (!isTouchDevice) {
        glassCards.forEach(card => {
            let rect;
            
            card.addEventListener('mouseenter', () => {
                rect = card.getBoundingClientRect();
            });

            card.addEventListener('mousemove', (e) => {
                if (!rect) rect = card.getBoundingClientRect();
                
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                
                const rotateX = ((y - centerY) / centerY) * -10;
                const rotateY = ((x - centerX) / centerX) * 10;
                
                card.style.transform = `translateY(-10px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
            }, { passive: true });
            
            card.addEventListener('mouseleave', () => {
                card.style.transform = `translateY(0) rotateX(0) rotateY(0)`;
            });
        });
    }


    // --- 5. Project Spotlight Effect ---
    const projectGrid = document.querySelector('.projects-grid');
    const projectCards = document.querySelectorAll('.project-card');

    projectCards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            projectGrid.classList.add('dimmed');
        });
        card.addEventListener('mouseleave', () => {
            projectGrid.classList.remove('dimmed');
        });
    });


    // --- 6. Mobile Menu Logic ---
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    
    if (menuToggle) {
        menuToggle.addEventListener('click', () => {
            navLinks.style.display = navLinks.style.display === 'flex' ? 'none' : 'flex';
            const bars = menuToggle.querySelectorAll('.bar');
            bars[0].style.transform = navLinks.style.display === 'flex' ? 'rotate(45deg) translate(5px, 5px)' : 'none';
            bars[1].style.transform = navLinks.style.display === 'flex' ? 'rotate(-45deg) translate(5px, -5px)' : 'none';
        });
    }

    // Smooth Scroll with Offset
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                const navHeight = 100;
                const targetPosition = targetElement.getBoundingClientRect().top + window.scrollY - navHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
                
                if (window.innerWidth <= 768) {
                    navLinks.style.display = 'none';
                    const bars = menuToggle.querySelectorAll('.bar');
                    bars.forEach(bar => bar.style.transform = 'none');
                }
            }
        });
    });


    // --- 7. Contact Form Submission (Web3Forms) ---
    const contactForm = document.getElementById('contact-form');
    const submitBtn = document.getElementById('submit-btn');
    const successMsg = document.getElementById('form-success');
    const errorMsg = document.getElementById('form-error');

    if (contactForm) {
        contactForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            // Validation logic
            let isValid = true;
            const name = document.getElementById('name');
            const email = document.getElementById('email');
            const message = document.getElementById('message');
            
            const nameError = document.getElementById('name-error');
            const emailError = document.getElementById('email-error');
            const messageError = document.getElementById('message-error');
            
            [nameError, emailError, messageError].forEach(el => el.textContent = '');
            [successMsg, errorMsg].forEach(el => el.classList.add('hidden'));
            
            if (name.value.trim().length < 2) {
                nameError.textContent = 'Please enter your full name.';
                isValid = false;
            }
            
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email.value.trim())) {
                emailError.textContent = 'Please enter a valid email address.';
                isValid = false;
            }
            
            if (message.value.trim().length < 10) {
                messageError.textContent = 'Message must be at least 10 characters.';
                isValid = false;
            }
            
            if (isValid) {
                // UI State: Sending
                submitBtn.disabled = true;
                submitBtn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Sending...';

                const formData = new FormData(contactForm);

                try {
                    const response = await fetch('https://api.web3forms.com/submit', {
                        method: 'POST',
                        body: formData
                    });

                    const result = await response.json();

                    if (result.success) {
                        successMsg.classList.remove('hidden');
                        contactForm.reset();
                    } else {
                        errorMsg.textContent = result.message || "Something went wrong.";
                        errorMsg.classList.remove('hidden');
                    }
                } catch (error) {
                    errorMsg.textContent = "Check your internet connection and try again.";
                    errorMsg.classList.remove('hidden');
                } finally {
                    submitBtn.disabled = false;
                    submitBtn.textContent = 'Send Inquiry';
                    setTimeout(() => {
                        [successMsg, errorMsg].forEach(el => el.classList.add('hidden'));
                    }, 5000);
                }
            }
        });
    }

    // Moved blob movement logic to the main animation loop in Section 2 for performance

    // --- 9. Interactive Neural Network Background (tsParticles) ---
    if (typeof tsParticles !== 'undefined') {
        const particleCount = isTouchDevice ? 40 : 100;
        
        tsParticles.load("tsparticles", {
            fpsLimit: 60,
            particles: {
                number: {
                    value: particleCount,
                    density: {
                        enable: true,
                        area: 800
                    }
                },
                color: {
                    value: "#D4AF37"
                },
                shape: {
                    type: "circle"
                },
                opacity: {
                    value: { min: 0.1, max: 0.4 },
                    animation: {
                        enable: !isTouchDevice, // Disable opacity animation on mobile
                        speed: 1,
                        sync: false
                    }
                },
                size: {
                    value: { min: 1, max: 2 },
                },
                links: {
                    enable: true,
                    distance: 150,
                    color: "#D4AF37",
                    opacity: 0.2,
                    width: 1
                },
                move: {
                    enable: true,
                    speed: isTouchDevice ? 0.8 : 1.5, // Slower on mobile
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
                        distance: 200,
                        links: {
                            opacity: 0.5
                        }
                    }
                }
            },
            detectRetina: !isTouchDevice,
            background: {
                color: "#0B0B0F"
            }
        });
    }

    // --- 10. Live GitHub Integration ---
    const githubUsername = "Abhishek250805";
    const profileCard = document.getElementById('github-profile-card');
    const reposGrid = document.getElementById('github-repos-grid');

    async function fetchGitHubData() {
        try {
            // Fetch User Profile
            const userResponse = await fetch(`https://api.github.com/users/${githubUsername}`);
            const userData = await userResponse.json();

            // Fetch Recent Repos
            const reposResponse = await fetch(`https://api.github.com/users/${githubUsername}/repos?sort=updated&per_page=6`);
            const reposData = await reposResponse.json();

            updateGitHubUI(userData, reposData);
        } catch (error) {
            console.error("Error fetching GitHub data:", error);
            profileCard.innerHTML = `<p>Failed to load GitHub data. <a href="https://github.com/${githubUsername}" target="_blank">View Profile</a></p>`;
        }
    }

    function updateGitHubUI(user, repos) {
        // Update Profile Card
        profileCard.innerHTML = `
            <img src="${user.avatar_url}" alt="${user.name}" class="github-avatar">
            <h3>${user.name || githubUsername}</h3>
            <p>${user.bio || 'Full Stack Developer'}</p>
            <div class="github-stats-grid">
                <div class="stat-item">
                    <h4>${user.public_repos}</h4>
                    <p>Repos</p>
                </div>
                <div class="stat-item">
                    <h4>${user.followers}</h4>
                    <p>Followers</p>
                </div>
            </div>
            <a href="${user.html_url}" target="_blank" class="btn btn-outline" style="margin-top: 2rem; width: 100%;">Visit Profile</a>
        `;

        // Update Repos Grid
        reposGrid.innerHTML = repos.map(repo => `
            <div class="repo-card reveal">
                <div class="repo-header">
                    <i class="fa-brands fa-github gold-text" style="font-size: 1.5rem;"></i>
                    <div class="repo-stats">
                        <span><i class="fa-regular fa-star"></i> ${repo.stargazers_count}</span>
                    </div>
                </div>
                <div class="repo-body">
                    <h3>${repo.name}</h3>
                    <p>${repo.description || 'No description available for this project.'}</p>
                </div>
                <div class="repo-footer">
                    <div class="repo-lang">
                        <span class="lang-dot" style="background: ${getLanguageColor(repo.language)}"></span>
                        <span>${repo.language || 'Mixed'}</span>
                    </div>
                    <a href="${repo.html_url}" target="_blank" class="link-btn">Repo <i class="fa-solid fa-arrow-up-right-from-square" style="font-size: 0.8rem;"></i></a>
                </div>
            </div>
        `).join('');
        
        // Re-observe new elements for reveal animation
        const newReveals = reposGrid.querySelectorAll('.reveal');
        newReveals.forEach(el => revealObserver.observe(el));
    }

    function getLanguageColor(lang) {
        const colors = {
            'JavaScript': '#f1e05a',
            'HTML': '#e34c26',
            'CSS': '#563d7c',
            'Python': '#3572A5',
            'Java': '#b07219',
            'C++': '#f34b7d',
            'TypeScript': '#3178c6'
        };
        return colors[lang] || '#8e8e8e';
    }

    if (profileCard) {
        fetchGitHubData();
    }
});
