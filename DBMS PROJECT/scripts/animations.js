// Corrected Animations and interactive elements

document.addEventListener('DOMContentLoaded', function() {
    // Fixed Animated Counter for Stats
    const animateCounters = () => {
        const counters = document.querySelectorAll('.stat-number');
        
        // Check if counters exist
        if (counters.length === 0) return;
        
        const observerOptions = {
            threshold: 0.5,
            rootMargin: '0px 0px -100px 0px'
        };
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const counter = entry.target;
                    const target = +counter.getAttribute('data-target');
                    const duration = 2000; // 2 seconds
                    const increment = target / (duration / 16); // 60fps
                    
                    let current = 0;
                    
                    const updateCounter = () => {
                        current += increment;
                        if (current < target) {
                            // Add + for percentage values
                            if (counter.parentElement.querySelector('.stat-label').textContent.includes('%')) {
                                counter.textContent = Math.ceil(current) + '+';
                            } else {
                                counter.textContent = Math.ceil(current).toLocaleString();
                            }
                            setTimeout(updateCounter, 16);
                        } else {
                            // Final value
                            if (counter.parentElement.querySelector('.stat-label').textContent.includes('%')) {
                                counter.textContent = target + '%';
                            } else {
                                counter.textContent = target.toLocaleString();
                            }
                        }
                    };
                    
                    updateCounter();
                    observer.unobserve(counter);
                }
            });
        }, observerOptions);
        
        counters.forEach(counter => {
            // Initialize with 0
            if (counter.parentElement.querySelector('.stat-label').textContent.includes('%')) {
                counter.textContent = '0%';
            } else {
                counter.textContent = '0';
            }
            observer.observe(counter);
        });
        
        // Fallback: If IntersectionObserver isn't supported or doesn't trigger
        setTimeout(() => {
            counters.forEach(counter => {
                if (counter.textContent === '0' || counter.textContent === '0%') {
                    const target = +counter.getAttribute('data-target');
                    if (counter.parentElement.querySelector('.stat-label').textContent.includes('%')) {
                        counter.textContent = target + '%';
                    } else {
                        counter.textContent = target.toLocaleString();
                    }
                }
            });
        }, 3000);
    };

    // Testimonial Slider - SIMPLIFIED & WORKING VERSION
    const initTestimonialSlider = () => {
        const testimonialCards = document.querySelectorAll('.testimonial-card');
        const navButtons = document.querySelectorAll('.nav-btn');
        
        if (testimonialCards.length === 0 || navButtons.length === 0) return;
        
        let currentSlide = 0;
        let autoSlideInterval;

        const showSlide = (slideIndex) => {
            testimonialCards.forEach(card => card.classList.remove('active'));
            navButtons.forEach(btn => btn.classList.remove('active'));
            
            testimonialCards[slideIndex].classList.add('active');
            navButtons[slideIndex].classList.add('active');
            
            currentSlide = slideIndex;
        };

        navButtons.forEach((button, index) => {
            button.addEventListener('click', () => {
                clearInterval(autoSlideInterval);
                showSlide(index);
                startAutoSlide();
            });
        });

        const startAutoSlide = () => {
            autoSlideInterval = setInterval(() => {
                let nextSlide = currentSlide + 1;
                if (nextSlide >= testimonialCards.length) nextSlide = 0;
                showSlide(nextSlide);
            }, 5000);
        };

        showSlide(0);
        startAutoSlide();
    };

    // Scroll animations for feature cards
    const initScrollAnimations = () => {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, observerOptions);

        // Animate feature cards
        document.querySelectorAll('.feature-card').forEach(card => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(30px)';
            card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            observer.observe(card);
        });

        // Animate stat cards
        document.querySelectorAll('.stat-card').forEach(card => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(30px)';
            card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            observer.observe(card);
        });

        // Animate steps
        document.querySelectorAll('.step').forEach(step => {
            step.style.opacity = '0';
            step.style.transform = 'translateX(-30px)';
            step.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            observer.observe(step);
        });
    };

    // Enhanced hover effects
    const initHoverEffects = () => {
        // Feature cards hover effect
        document.querySelectorAll('.feature-card').forEach(card => {
            card.addEventListener('mouseenter', function() {
                this.style.transform = 'translateY(-10px) scale(1.02)';
            });
            
            card.addEventListener('mouseleave', function() {
                this.style.transform = 'translateY(0) scale(1)';
            });
        });

        // Stat cards hover effect
        document.querySelectorAll('.stat-card').forEach(card => {
            card.addEventListener('mouseenter', function() {
                this.style.transform = 'translateY(-5px)';
            });
            
            card.addEventListener('mouseleave', function() {
                this.style.transform = 'translateY(0)';
            });
        });
    };

    // Initialize all animations
    animateCounters();
    initTestimonialSlider();
    initScrollAnimations();
    initHoverEffects();

    // Add some console logging for debugging
    console.log('AgriSmart animations initialized successfully');
    console.log('Found stat counters:', document.querySelectorAll('.stat-number').length);
});