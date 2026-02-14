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

// ===== Live Counters (deterministic, time-based) =====
(function () {
    const EPOCH = new Date('2026-02-13T00:00:00+11:00').getTime(); // Launch date (AEST)
    const INTERVAL_MS = 45 * 60 * 1000; // 45 minutes
    const BASE_REVENUE = 95540;   // Starting revenue
    const BASE_SALES = 487;       // Starting sales count

    // Seeded pseudo-random (deterministic per interval)
    function seededRandom(seed) {
        let x = Math.sin(seed * 9301 + 49297) * 49152;
        return x - Math.floor(x);
    }

    // Australian time-of-day activity multiplier (AEST = UTC+11)
    function getAustralianMultiplier(timestamp) {
        const aestHour = new Date(timestamp + 11 * 3600000).getUTCHours();
        if (aestHour >= 9 && aestHour < 18) return 1.3;    // Business hours — peak
        if (aestHour >= 18 && aestHour < 22) return 1.0;    // Evening — still active
        if (aestHour >= 6 && aestHour < 9) return 0.7;      // Morning ramp-up
        if (aestHour >= 22 || aestHour < 1) return 0.3;     // Late night — winding down
        return 0.08;                                           // 1am–6am — barely anything
    }

    // Calculate totals up to a given timestamp
    function calculateTotals(now) {
        const elapsed = now - EPOCH;
        if (elapsed < 0) return { revenue: BASE_REVENUE, sales: BASE_SALES };

        const intervals = Math.floor(elapsed / INTERVAL_MS);
        let revenue = BASE_REVENUE;
        let sales = BASE_SALES;

        for (let i = 0; i < intervals; i++) {
            const intervalTime = EPOCH + i * INTERVAL_MS;
            const mult = getAustralianMultiplier(intervalTime);
            const rand = seededRandom(i);

            // Revenue: $50–$200 per interval, scaled by time-of-day
            const revenueAdd = Math.round((50 + rand * 150) * mult);
            revenue += revenueAdd;

            // Sales: roughly 1 sale per 2–4 intervals during active hours
            const salesRand = seededRandom(i + 99999);
            if (salesRand < 0.35 * mult) {
                sales += 1;
            }
        }

        return { revenue, sales };
    }

    // Format number with commas
    function formatNum(n) {
        return n.toLocaleString('en-US');
    }

    // Animated count-up
    function animateCounter(el, endVal, prefix, suffix, duration) {
        const startVal = 0;
        const startTime = performance.now();

        function tick(currentTime) {
            const progress = Math.min((currentTime - startTime) / duration, 1);
            // Ease-out cubic
            const eased = 1 - Math.pow(1 - progress, 3);
            const current = Math.round(startVal + (endVal - startVal) * eased);
            el.textContent = prefix + formatNum(current) + suffix;
            if (progress < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
    }

    // Run
    const salesEl = document.getElementById('counter-sales');
    const revenueEl = document.getElementById('counter-revenue');
    if (!salesEl || !revenueEl) return;

    const { revenue, sales } = calculateTotals(Date.now());

    // Animate on load
    animateCounter(salesEl, sales, '', '+', 2000);
    animateCounter(revenueEl, revenue, '$', '+', 2500);

    // Live tick — recalculate every 5 minutes (catches the 45-min jumps)
    setInterval(() => {
        const updated = calculateTotals(Date.now());
        salesEl.textContent = formatNum(updated.sales) + '+';
        revenueEl.textContent = '$' + formatNum(updated.revenue) + '+';
    }, 5 * 60 * 1000);
})();

// ===== AI Chat Bot (n8n webhook) =====
(function () {
    var WEBHOOK = 'https://sanctumpcs.app.n8n.cloud/webhook/2ce4aca0-6c46-4420-b117-6a78c68d4edb/chat';
    var messagesEl = document.getElementById('chat-messages');
    var inputEl = document.getElementById('chat-input');
    var sendBtn = document.getElementById('chat-send');
    if (!messagesEl || !inputEl || !sendBtn) return;

    // Persistent session so n8n remembers context
    var sessionId = sessionStorage.getItem('mf-chat-session');
    if (!sessionId) {
        sessionId = 'mf-' + Date.now() + '-' + Math.random().toString(36).slice(2, 8);
        sessionStorage.setItem('mf-chat-session', sessionId);
    }

    function addMsg(text, type) {
        var el = document.createElement('div');
        el.className = 'chat-msg ' + type;
        if (type === 'bot') {
            el.innerHTML = '<div class="chat-avatar"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 2a7 7 0 0 1 7 7c0 3-2 5.5-4 7l-1 1.5h-4L9 16c-2-1.5-4-4-4-7a7 7 0 0 1 7-7z"/><line x1="10" y1="22" x2="14" y2="22"/></svg></div><div class="chat-bubble">' + text + '</div>';
        } else {
            el.innerHTML = '<div class="chat-bubble">' + text + '</div>';
        }
        messagesEl.appendChild(el);
        messagesEl.scrollTop = messagesEl.scrollHeight;
    }

    function showTyping() {
        var el = document.createElement('div');
        el.className = 'chat-msg bot';
        el.id = 'typing-indicator';
        el.innerHTML = '<div class="chat-avatar"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 2a7 7 0 0 1 7 7c0 3-2 5.5-4 7l-1 1.5h-4L9 16c-2-1.5-4-4-4-7a7 7 0 0 1 7-7z"/><line x1="10" y1="22" x2="14" y2="22"/></svg></div><div class="typing-dots"><span></span><span></span><span></span></div>';
        messagesEl.appendChild(el);
        messagesEl.scrollTop = messagesEl.scrollHeight;
    }

    function hideTyping() {
        var t = document.getElementById('typing-indicator');
        if (t) t.remove();
    }

    async function askN8N(question) {
        try {
            var res = await fetch(WEBHOOK, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'sendMessage',
                    sessionId: sessionId,
                    chatInput: question
                })
            });
            if (!res.ok) throw new Error('HTTP ' + res.status);
            var data = await res.json();
            return data.output || data.text || data.response || 'Sorry, I couldn\'t process that. Email us at daniel.anderle.dan@gmail.com for help!';
        } catch (err) {
            console.error('Chat error:', err);
            return 'Oops, something went wrong. Please try again or email us at daniel.anderle.dan@gmail.com!';
        }
    }

    async function handleSend() {
        var q = inputEl.value.trim();
        if (!q) return;
        addMsg(q, 'user');
        inputEl.value = '';
        inputEl.disabled = true;
        sendBtn.disabled = true;
        showTyping();

        var answer = await askN8N(q);
        hideTyping();
        addMsg(answer, 'bot');
        inputEl.disabled = false;
        sendBtn.disabled = false;
        inputEl.focus();
    }

    sendBtn.addEventListener('click', handleSend);
    inputEl.addEventListener('keydown', function (e) { if (e.key === 'Enter') handleSend(); });

    document.querySelectorAll('.suggestion-pill').forEach(function (pill) {
        pill.addEventListener('click', function () {
            inputEl.value = pill.dataset.q;
            handleSend();
        });
    });
})();

