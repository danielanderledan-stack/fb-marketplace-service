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

// ===== AI Chat Bot =====
(function () {
    const messagesEl = document.getElementById('chat-messages');
    const inputEl = document.getElementById('chat-input');
    const sendBtn = document.getElementById('chat-send');
    if (!messagesEl || !inputEl || !sendBtn) return;

    const KB = [
        {
            keys: ['free', 'first sale', 'cost nothing', 'no cost'],
            a: "Your very first sale is 100% free — no strings attached, no card required. We want you to see how we work before committing. After that, it's just a 20% commission on each sale. \ud83c\udf89"
        },
        {
            keys: ['commission', '20%', 'percentage', 'fee', 'how much'],
            a: "We charge a 20% commission only on items we successfully sell. So if your item sells for $500, you keep $400. No upfront fees, no monthly subscriptions — you only pay when you get paid. \ud83d\udcb0"
        },
        {
            keys: ['flip', 'flipping', 'profit', 'invest'],
            a: "With our Flip for Profit service, we find undervalued items on Marketplace, buy them, refurbish or re-list them, and sell for a profit — which we split with you. Fill out the form on our Flip page to get started. \ud83d\udd04"
        },
        {
            keys: ['fast', 'quick', 'how long', 'speed', 'time', 'days', 'week'],
            a: "On average, 87% of items we list sell within 7 days. Our optimised titles, descriptions, and SEO keywords mean your items get 3x more views than a typical listing. Most items move fast! \u26a1"
        },
        {
            keys: ['photo', 'picture', 'image', 'camera'],
            a: "You don't need a professional camera! We send you a simple photo guide with tips on angles, lighting, and backgrounds. Snap a few pics with your phone and we handle the rest. \ud83d\udcf8"
        },
        {
            keys: ['how', 'work', 'process', 'steps', 'start'],
            a: "Super simple! 1\ufe0f\u20e3 Tell us what to sell. 2\ufe0f\u20e3 We send a photo guide. 3\ufe0f\u20e3 We create an optimised listing. 4\ufe0f\u20e3 We handle all messages. 5\ufe0f\u20e3 You get paid! First sale is free."
        },
        {
            keys: ['message', 'buyer', 'reply', 'negotiate', 'chat'],
            a: "We handle ALL buyer communication — enquiries, negotiations, time-wasters, and no-shows. Our fast replies mean 3.1x more buyer engagement compared to the average seller. \ud83d\udcac"
        },
        {
            keys: ['seo', 'keyword', 'title', 'description', 'listing', 'optimise', 'optimize'],
            a: "We write optimised titles, detailed descriptions, and add SEO-friendly tags to every listing. Your items rank higher in Marketplace search and get up to 3x more views. \ud83d\udd0d"
        },
        {
            keys: ['safe', 'trust', 'scam', 'secure', 'legit'],
            a: "We meet all buyers in safe, public locations and filter out scammers before arranging meetups. Your first sale is free so you can try us risk-free. \ud83d\udd12"
        },
        {
            keys: ['item', 'sell', 'what can', 'type', 'category', 'electronics', 'furniture'],
            a: "We sell almost anything — electronics, furniture, appliances, vehicles, sporting goods, fashion, and more. If it can go on Facebook Marketplace, we can sell it! \ud83d\udce6"
        },
        {
            keys: ['payment', 'pay', 'money', 'transfer', 'cash'],
            a: "Once your item sells, we transfer your share (80% after the free first sale) directly to you, typically within 24 hours. \ud83d\udcb3"
        },
        {
            keys: ['contact', 'email', 'reach', 'phone', 'talk'],
            a: "Reach us anytime at daniel.anderle.dan@gmail.com \ud83d\udce7 or click 'Get Started' and we'll get back to you within a few hours!"
        },
    ];

    function findAnswer(q) {
        var lower = q.toLowerCase();
        var best = null, bestScore = 0;
        for (var i = 0; i < KB.length; i++) {
            var score = 0;
            for (var j = 0; j < KB[i].keys.length; j++) {
                if (lower.includes(KB[i].keys[j])) score++;
            }
            if (score > bestScore) { bestScore = score; best = KB[i]; }
        }
        return best ? best.a : "Great question! I don't have a specific answer for that one, but Daniel would love to help \u2014 email daniel.anderle.dan@gmail.com and you'll hear back ASAP! \ud83d\udce7";
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

    function handleSend() {
        var q = inputEl.value.trim();
        if (!q) return;
        addMsg(q, 'user');
        inputEl.value = '';
        inputEl.disabled = true;
        showTyping();
        setTimeout(function () {
            var t = document.getElementById('typing-indicator');
            if (t) t.remove();
            addMsg(findAnswer(q), 'bot');
            inputEl.disabled = false;
            inputEl.focus();
        }, 800 + Math.random() * 1000);
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
