// ===== Navbar scroll effect =====
const navbar = document.getElementById('navbar');

window.addEventListener('scroll', () => {
    if (window.scrollY > 60) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});
// ===== Showcase toggle =====
const toggleBtns = document.querySelectorAll('.toggle-btn');
const gridSales = document.getElementById('grid-sales');
const gridFlips = document.getElementById('grid-flips');

if (toggleBtns.length) {
    toggleBtns.forEach((btn) => {
        btn.addEventListener('click', () => {
            toggleBtns.forEach((b) => b.classList.remove('active'));
            btn.classList.add('active');

            const tab = btn.dataset.tab;
            if (tab === 'sales') {
                gridFlips.classList.add('hidden');
                gridSales.classList.remove('hidden');
                // Re-trigger animation
                gridSales.style.animation = 'none';
                gridSales.offsetHeight;
                gridSales.style.animation = '';
            } else {
                gridSales.classList.add('hidden');
                gridFlips.classList.remove('hidden');
                gridFlips.style.animation = 'none';
                gridFlips.offsetHeight;
                gridFlips.style.animation = '';
            }
        });
    });
}

// ===== Scroll reveal =====
const revealElements = document.querySelectorAll(
    '.showcase-card, .service-card, .step, .price-card, .compare-stat, .compare-col, .cta-section h2, .cta-section p, .cta-buttons'
);

revealElements.forEach((el) => el.classList.add('reveal'));

const revealObserver = new IntersectionObserver(
    (entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                revealObserver.unobserve(entry.target);
            }
        });
    },
    { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
);

revealElements.forEach((el) => revealObserver.observe(el));

// ===== Smooth scroll for anchor links =====
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
        const target = document.querySelector(anchor.getAttribute('href'));
        if (target) {
            e.preventDefault();
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });
});
