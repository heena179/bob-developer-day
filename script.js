// Initialize registrations from localStorage
function getRegistrations() {
    const registrations = localStorage.getItem('eventRegistrations');
    return registrations ? JSON.parse(registrations) : [];
}

// Save registrations to localStorage
function saveRegistrations(registrations) {
    localStorage.setItem('eventRegistrations', JSON.stringify(registrations));
}

// Check if email already exists
function emailExists(email) {
    const registrations = getRegistrations();
    return registrations.some(reg => reg.email.toLowerCase() === email.toLowerCase());
}

// Countdown Timer
function initCountdown() {
    const eventDate = new Date('2026-06-15T08:30:00').getTime();
    
    function updateCountdown() {
        const now = new Date().getTime();
        const distance = eventDate - now;
        
        if (distance < 0) {
            document.getElementById('countdown').innerHTML = '<div class="countdown-item"><span class="countdown-value">Event Started!</span></div>';
            return;
        }
        
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);
        
        document.getElementById('days').textContent = String(days).padStart(2, '0');
        document.getElementById('hours').textContent = String(hours).padStart(2, '0');
        document.getElementById('minutes').textContent = String(minutes).padStart(2, '0');
        document.getElementById('seconds').textContent = String(seconds).padStart(2, '0');
    }
    
    updateCountdown();
    setInterval(updateCountdown, 1000);
}

// Sticky Register Button
function initStickyButton() {
    const stickyButton = document.getElementById('stickyRegister');
    const heroSection = document.querySelector('.hero');
    
    window.addEventListener('scroll', function() {
        const heroBottom = heroSection.offsetTop + heroSection.offsetHeight;
        
        if (window.pageYOffset > heroBottom) {
            stickyButton.classList.add('visible');
        } else {
            stickyButton.classList.remove('visible');
        }
    });
}

// Smooth scroll for anchor links
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// Handle form submission
document.addEventListener('DOMContentLoaded', function() {
    // Initialize countdown timer
    initCountdown();
    
    // Initialize sticky button
    initStickyButton();
    
    // Initialize smooth scroll
    initSmoothScroll();
    
    const form = document.getElementById('registrationForm');
    const successMessage = document.getElementById('successMessage');
    const errorMessage = document.getElementById('errorMessage');

    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();

            // Get form values
            const name = document.getElementById('name').value.trim();
            const email = document.getElementById('email').value.trim();
            const company = document.getElementById('company').value.trim();
            const title = document.getElementById('title').value.trim();

            // Check if email already exists
            if (emailExists(email)) {
                errorMessage.style.display = 'block';
                successMessage.style.display = 'none';
                
                // Hide error message after 5 seconds
                setTimeout(() => {
                    errorMessage.style.display = 'none';
                }, 5000);
                
                return;
            }

            // Create registration object
            const registration = {
                id: Date.now(),
                name: name,
                email: email,
                company: company,
                title: title,
                registeredAt: new Date().toISOString()
            };

            // Get existing registrations and add new one
            const registrations = getRegistrations();
            registrations.push(registration);
            saveRegistrations(registrations);

            // Show success message
            successMessage.style.display = 'block';
            errorMessage.style.display = 'none';

            // Reset form
            form.reset();

            // Hide success message after 5 seconds
            setTimeout(() => {
                successMessage.style.display = 'none';
            }, 5000);

            // Scroll to success message
            successMessage.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        });
    }
});

// Made with Bob
