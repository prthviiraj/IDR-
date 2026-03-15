document.addEventListener('DOMContentLoaded', () => {

    /* --- Preloader --- */
    setTimeout(() => {
        const preloader = document.getElementById('preloader');
        const progress = document.querySelector('.progress');
        
        progress.style.width = '100%';
        
        setTimeout(() => {
            preloader.style.opacity = '0';
            setTimeout(() => {
                preloader.style.display = 'none';
                document.body.classList.remove('loading');
                initHeroAnimations();
            }, 800);
        }, 500);
    }, 1000);

    /* --- Custom Magnetic Cursor --- */
    const cursor = document.querySelector('.cursor');
    const follower = document.querySelector('.cursor-follower');
    const magnetics = document.querySelectorAll('.magnetic');
    
    let mouseX = 0, mouseY = 0;
    let cursorX = 0, cursorY = 0;
    let followerX = 0, followerY = 0;
    
    // Check if device supports hover (not touch)
    const isTouchDevice = ('ontouchstart' in window) || navigator.maxTouchPoints > 0;
    
    if (!isTouchDevice) {
        document.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
        });
        
        const renderCursor = () => {
            // Cursor moves instantly
            cursorX = mouseX;
            cursorY = mouseY;
            
            // Follower uses internal lerp for smooth trailing
            followerX += (mouseX - followerX) * 0.15;
            followerY += (mouseY - followerY) * 0.15;
            
            cursor.style.transform = `translate(${cursorX}px, ${cursorY}px)`;
            follower.style.transform = `translate(${followerX}px, ${followerY}px)`;
            
            requestAnimationFrame(renderCursor);
        };
        requestAnimationFrame(renderCursor);
        
        // Magnetic Hover Effect
        magnetics.forEach(el => {
            el.addEventListener('mouseenter', () => follower.classList.add('hover-active'));
            el.addEventListener('mouseleave', () => {
                follower.classList.remove('hover-active');
                el.style.transform = 'translate(0px, 0px)';
            });
            
            el.addEventListener('mousemove', (e) => {
                const rect = el.getBoundingClientRect();
                const x = e.clientX - rect.left - rect.width / 2;
                const y = e.clientY - rect.top - rect.height / 2;
                
                // Only move actual element if it's not a text link in header (keep them stable)
                if (!el.classList.contains('nav-links') && !el.closest('header')) {
                     el.style.transform = `translate(${x * 0.2}px, ${y * 0.2}px)`;
                }
            });
        });
    }

    /* --- Canvas Node Network --- */
    const canvas = document.getElementById('bg-canvas');
    if (canvas && !isTouchDevice) {
        const ctx = canvas.getContext('2d');
        let width, height;
        let particles = [];
        
        const resize = () => {
            width = window.innerWidth;
            height = window.innerHeight;
            canvas.width = width;
            canvas.height = height;
        };
        
        window.addEventListener('resize', resize);
        resize();
        
        class Particle {
            constructor() {
                this.x = Math.random() * width;
                this.y = Math.random() * height;
                this.vx = (Math.random() - 0.5) * 0.5;
                this.vy = (Math.random() - 0.5) * 0.5;
                this.radius = Math.random() * 1.5;
            }
            
            update() {
                this.x += this.vx;
                this.y += this.vy;
                
                if (this.x < 0 || this.x > width) this.vx *= -1;
                if (this.y < 0 || this.y > height) this.vy *= -1;
            }
            
            draw() {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(0, 243, 255, 0.5)';
                ctx.fill();
            }
        }
        
        // Count based on screen size
        const particleCount = Math.min(Math.floor((width * height) / 15000), 100);
        
        for (let i = 0; i < particleCount; i++) {
            particles.push(new Particle());
        }
        
        const animateCanvas = () => {
            ctx.clearRect(0, 0, width, height);
            
            for (let i = 0; i < particles.length; i++) {
                particles[i].update();
                particles[i].draw();
                
                // Connect particles to each other
                for (let j = i + 1; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x;
                    const dy = particles[i].y - particles[j].y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    
                    if (dist < 120) {
                        ctx.beginPath();
                        ctx.strokeStyle = `rgba(0, 243, 255, ${0.15 - dist/800})`;
                        ctx.lineWidth = 0.5;
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.stroke();
                    }
                }
                
                // Connect to mouse
                const dxMouse = particles[i].x - mouseX;
                const dyMouse = particles[i].y - mouseY;
                const distMouse = Math.sqrt(dxMouse * dxMouse + dyMouse * dyMouse);
                
                if (distMouse < 150) {
                    ctx.beginPath();
                    ctx.strokeStyle = `rgba(0, 243, 255, ${0.3 - distMouse/500})`;
                    ctx.lineWidth = 1;
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(mouseX, mouseY);
                    ctx.stroke();
                    
                    // Slight magnetic pull to mouse
                    particles[i].vx -= (dxMouse / distMouse) * 0.02;
                    particles[i].vy -= (dyMouse / distMouse) * 0.02;
                }
            }
            
            requestAnimationFrame(animateCanvas);
        };
        
        animateCanvas();
    }

    /* --- Text Scramble Effect --- */
    const chars = '!<>-_\\\\/[]{}—=+*^?#________';
    
    const scrambleText = (element) => {
        const originalText = element.getAttribute('data-text');
        if (!originalText) return;
        
        let iteration = 0;
        let interval = setInterval(() => {
            element.innerText = originalText
                .split('')
                .map((letter, index) => {
                    if (index < iteration || letter === ' ') {
                        return originalText[index];
                    }
                    return chars[Math.floor(Math.random() * chars.length)];
                })
                .join('');
                
            if (iteration >= originalText.length) {
                clearInterval(interval);
                element.classList.add('revealed');
            }
            
            iteration += 1 / 3; // speed of scramble
        }, 30);
    };

    /* --- Intersection Observer for Animations --- */
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.15
    };

    const scrollObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Fade Ups
                if (entry.target.classList.contains('fade-up')) {
                    entry.target.classList.add('in-view');
                }
                // Lines
                if (entry.target.classList.contains('tech-line')) {
                    entry.target.classList.add('in-view');
                }
                // Scramble Text
                if (entry.target.classList.contains('scramble-text') && !entry.target.classList.contains('revealed')) {
                    entry.target.style.visibility = 'visible';
                    scrambleText(entry.target);
                    observer.unobserve(entry.target); // Only scramble once
                }
            }
        });
    }, observerOptions);

    const initHeroAnimations = () => {
        const heroScrambles = document.querySelectorAll('#hero .scramble-text');
        heroScrambles.forEach(el => {
            el.style.visibility = 'visible';
            scrambleText(el);
        });
        
        setTimeout(() => {
            document.querySelectorAll('#hero .fade-up').forEach(el => el.classList.add('in-view'));
        }, 800);
    };

    // Observe elements
    document.querySelectorAll('.fade-up, .tech-line, section:not(#hero) .scramble-text').forEach(el => {
        scrollObserver.observe(el);
    });

    /* --- Horizontal Scrollytelling --- */
    const serviceSection = document.getElementById('services');
    const pinWrap = document.querySelector('.pin-wrap-sticky');
    const horizontalTrack = document.getElementById('horizontal-track');
    
    const setScrollHeight = () => {
        if (window.innerWidth > 768 && horizontalTrack) {
            // Calculate total width of horizontal slides + viewport height for pacing
            const trackWidth = horizontalTrack.scrollWidth;
            // Set the container height so we have room to scroll
            serviceSection.style.height = `${trackWidth}px`; 
        } else if (serviceSection) {
            serviceSection.style.height = 'auto';
            if (horizontalTrack) horizontalTrack.style.transform = 'none';
        }
    };
    
    window.addEventListener('resize', setScrollHeight);
    setScrollHeight(); // init
    
    window.addEventListener('scroll', () => {
        if (window.innerWidth <= 768 || !horizontalTrack || !serviceSection) return;
        
        // Calculate scroll progress within the services section
        const sectionTop = serviceSection.offsetTop;
        const sectionHeight = serviceSection.offsetHeight;
        const scrollY = window.scrollY;
        
        // Determine how far user scrolled inside this section
        const scrollDistance = scrollY - sectionTop;
        const maxScroll = sectionHeight - window.innerHeight;
        
        // Progress between 0 and 1
        let progress = scrollDistance / maxScroll;
        progress = Math.max(0, Math.min(1, progress));
        
        // Translate track horizontally based on progress
        if (scrollDistance > 0 && scrollDistance < maxScroll) {
            const maxTranslate = horizontalTrack.scrollWidth - window.innerWidth;
            horizontalTrack.style.transform = `translateX(-${progress * maxTranslate}px)`;
        } else if (scrollDistance <= 0) {
            horizontalTrack.style.transform = `translateX(0px)`;
        } else {
            const maxTranslate = horizontalTrack.scrollWidth - window.innerWidth;
            horizontalTrack.style.transform = `translateX(-${maxTranslate}px)`;
        }
    });

    /* --- Terminal Form Submit (Visual Only) --- */
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const btnText = contactForm.querySelector('.btn-text');
            const originalText = btnText.textContent;
            
            btnText.innerHTML = '<span class="scramble-text" data-text="TRANSMITTING...">TRANSMITTING...</span>';
            const newSpan = btnText.querySelector('.scramble-text');
            newSpan.style.visibility = 'visible';
            scrambleText(newSpan);
            
            setTimeout(() => {
                btnText.innerHTML = '<span class="text-white" style="text-shadow: 0 0 10px #00f3ff;">PAYLOAD_DELIVERED [200]</span>';
                contactForm.reset();
                
                setTimeout(() => {
                    btnText.textContent = originalText;
                }, 4000);
            }, 2000);
        });
    }

    /* --- Mobile Menu --- */
    const mobileToggle = document.getElementById('mobile-toggle');
    const navLinks = document.querySelector('.nav-links');
    const siteNav = document.getElementById('site-nav');
    
    if (mobileToggle) {
        mobileToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            mobileToggle.classList.toggle('active');
            document.body.classList.toggle('nav-active');
            
            if (navLinks.classList.contains('active')) {
                if(siteNav) siteNav.style.setProperty('display', 'block', 'important');
                document.body.style.overflow = 'hidden';
            } else {
                if(siteNav) siteNav.style.setProperty('display', 'none', 'important');
                document.body.style.overflow = '';
            }
        });
        
        // Close menu on link click
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('active');
                mobileToggle.classList.remove('active');
                document.body.classList.remove('nav-active');
                document.body.style.overflow = '';
                if(window.innerWidth <= 768) {
                     if(siteNav) siteNav.style.setProperty('display', 'none', 'important');
                }
            });
        });
    }

    /* --- Strict Layout Enforcement for Mobile --- */
    function enforceMobileLayout() {
        const isMobile = window.innerWidth <= 768;
        const heroActionsArray = document.querySelectorAll('.hero-actions, .hero-btn-wrap');
        const siteNav = document.getElementById('site-nav');
        
        if (isMobile) {
            // Force Hero Buttons to Stack
            heroActionsArray.forEach(el => {
                el.style.setProperty('flex-direction', 'column', 'important');
                el.style.setProperty('width', '100%', 'important');
                
                const children = el.children;
                for(let i=0; i < children.length; i++) {
                    children[i].style.setProperty('width', '100%', 'important');
                    children[i].style.setProperty('box-sizing', 'border-box', 'important');
                    children[i].style.setProperty('text-align', 'center', 'important');
                }
            });
            
            // Ensure Nav links are hidden initially on mobile
            if(siteNav && (!navLinks || !navLinks.classList.contains('active'))) {
                siteNav.style.setProperty('display', 'none', 'important');
            }
        } else {
            // Reset for desktop
            heroActionsArray.forEach(el => {
                el.style.removeProperty('flex-direction');
                el.style.removeProperty('width');
                const children = el.children;
                for(let i=0; i < children.length; i++) {
                    children[i].style.removeProperty('width');
                    children[i].style.removeProperty('box-sizing');
                    children[i].style.removeProperty('text-align');
                }
            });
            
            if(siteNav) {
                siteNav.style.removeProperty('display');
                if(navLinks) navLinks.style.display = 'flex';
            }
        }
    }
    
    // Run exactly once on load, and on window resize
    enforceMobileLayout();
    window.addEventListener('resize', enforceMobileLayout);

});
