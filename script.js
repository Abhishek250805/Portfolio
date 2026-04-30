document.addEventListener('DOMContentLoaded', () => {
    
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


    // --- 2. Custom Luxury Cursor ---
    const dot = document.querySelector('.cursor-dot');
    const outline = document.querySelector('.cursor-outline');
    
    let mouseX = 0;
    let mouseY = 0;
    let outlineX = 0;
    let outlineY = 0;

    window.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        
        dot.style.left = `${mouseX}px`;
        dot.style.top = `${mouseY}px`;
        
        // Check for interactive elements
        const target = e.target;
        const isInteractive = target.closest('a, button, .skill-tag, .contact-link, .glass-card');
        
        if (isInteractive) {
            dot.style.transform = 'translate(-50%, -50%) scale(1.5)';
            outline.style.transform = 'translate(-50%, -50%) scale(1.8)';
            outline.style.borderColor = 'var(--gold-glow)';
        } else {
            dot.style.transform = 'translate(-50%, -50%) scale(1)';
            outline.style.transform = 'translate(-50%, -50%) scale(1)';
            outline.style.borderColor = 'var(--gold)';
        }
    });

    // Smooth outline follow
    const animateCursor = () => {
        const distX = mouseX - outlineX;
        const distY = mouseY - outlineY;
        
        outlineX += distX * 0.15;
        outlineY += distY * 0.15;
        
        outline.style.left = `${outlineX}px`;
        outline.style.top = `${outlineY}px`;
        
        requestAnimationFrame(animateCursor);
    };
    animateCursor();


    // --- 3. Scroll Progress & Navbar Effect ---
    const progressBar = document.querySelector('.scroll-progress-bar');
    const navbar = document.querySelector('.navbar');
    const scrollTopBtn = document.getElementById('scroll-top');

    window.addEventListener('scroll', () => {
        // Scroll Progress
        const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
        const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrolled = (winScroll / height) * 100;
        progressBar.style.width = scrolled + "%";

        // Navbar scrolled state
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }

        // Scroll to top button visibility
        if (window.scrollY > 500) {
            scrollTopBtn.classList.add('visible');
        } else {
            scrollTopBtn.classList.remove('visible');
        }
    });

    scrollTopBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });


    // --- 4. 3D Glass Tilt Effect ---
    const glassCards = document.querySelectorAll('.glass-card');
    
    glassCards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            const rotateX = ((y - centerY) / centerY) * -10; // Max 10deg rotation
            const rotateY = ((x - centerX) / centerX) * 10;
            
            card.style.transform = `translateY(-10px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = `translateY(0) rotateX(0) rotateY(0)`;
        });
    });


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


    // --- 7. Contact Form Validation ---
    const contactForm = document.getElementById('contact-form');
    
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            let isValid = true;
            const name = document.getElementById('name');
            const email = document.getElementById('email');
            const message = document.getElementById('message');
            
            const nameError = document.getElementById('name-error');
            const emailError = document.getElementById('email-error');
            const messageError = document.getElementById('message-error');
            
            [nameError, emailError, messageError].forEach(el => el.textContent = '');
            
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
                const successMsg = document.getElementById('form-success');
                successMsg.classList.remove('hidden');
                contactForm.reset();
                setTimeout(() => successMsg.classList.add('hidden'), 5000);
            }
        });
    }

    // --- 8. Subtle Blob Movement (Enhanced) ---
    const blobs = document.querySelectorAll('.blob');
    window.addEventListener('mousemove', (e) => {
        const x = e.clientX / window.innerWidth;
        const y = e.clientY / window.innerHeight;
        
        blobs.forEach((blob, index) => {
            const speed = (index + 1) * 30;
            blob.style.transform = `translate(${x * speed}px, ${y * speed}px)`;
        });
    });
});
