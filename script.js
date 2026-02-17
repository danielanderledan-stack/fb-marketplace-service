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

// ===== PROFIT CALCULATOR =====
(function () {
    var slider = document.getElementById('calc-slider');
    var sliderLabel = document.getElementById('calc-slider-value');
    var flipsSelect = document.getElementById('calc-flips');
    var worstEl = document.getElementById('calc-worst');
    var avgEl = document.getElementById('calc-avg');
    var bestEl = document.getElementById('calc-best');
    var canvas = document.getElementById('calc-chart');
    if (!slider || !canvas) return;

    var ctx = canvas.getContext('2d');

    function updateSliderFill() {
        var pct = ((slider.value - slider.min) / (slider.max - slider.min)) * 100;
        slider.style.background = 'linear-gradient(to right, #4267B2 ' + pct + '%, #e0e0e0 ' + pct + '%)';
    }

    function calcGrowth(start, flipsPerMonth, returnRate, months) {
        var MAX_ITEM_VALUE = 1500;
        var data = [start];
        var current = start;
        for (var m = 1; m <= months; m++) {
            for (var f = 0; f < flipsPerMonth; f++) {
                var itemCost = Math.min(current, MAX_ITEM_VALUE);
                var profit = itemCost * returnRate;
                current = current + profit;
            }
            data.push(Math.round(current));
        }
        return data;
    }

    function drawChart(worstData, avgData, bestData) {
        var dpr = window.devicePixelRatio || 1;
        // Reset to CSS-controlled width first to avoid feedback loop
        canvas.style.width = '100%';
        var totalW = canvas.clientWidth;
        var h = 320;
        canvas.width = totalW * dpr;
        canvas.height = (h + 50) * dpr;
        canvas.style.height = (h + 50) + 'px';
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

        var padLeft = 20;
        var padRight = 20;
        var padTop = 20;
        var chartH = h - padTop;
        var chartW = totalW - padLeft - padRight;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        var maxVal = Math.max.apply(null, bestData) * 1.1;
        var minVal = 0;

        // Horizontal gridlines only (no labels)
        var gridCount = 5;
        for (var i = 0; i <= gridCount; i++) {
            var y = padTop + (chartH * i) / gridCount;
            ctx.strokeStyle = 'rgba(0,0,0,0.05)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(padLeft, y);
            ctx.lineTo(padLeft + chartW, y);
            ctx.stroke();
        }

        // X labels (months)
        ctx.font = '11px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillStyle = '#999';
        for (var i = 0; i < worstData.length; i++) {
            var x = padLeft + (chartW * i) / (worstData.length - 1);
            ctx.fillText(i === 0 ? 'Now' : 'M' + i, x, padTop + chartH + 18);
        }

        function getXY(data, idx) {
            return {
                x: padLeft + (chartW * idx) / (data.length - 1),
                y: padTop + chartH - ((data[idx] - minVal) / (maxVal - minVal)) * chartH
            };
        }

        function drawLine(data, color, fillColor) {
            var p, prev, curr, cpx, grad, last, pt;
            // Fill
            ctx.beginPath();
            p = getXY(data, 0);
            ctx.moveTo(p.x, p.y);
            for (var i = 1; i < data.length; i++) {
                prev = getXY(data, i - 1);
                curr = getXY(data, i);
                cpx = (prev.x + curr.x) / 2;
                ctx.bezierCurveTo(cpx, prev.y, cpx, curr.y, curr.x, curr.y);
            }
            last = getXY(data, data.length - 1);
            ctx.lineTo(last.x, padTop + chartH);
            ctx.lineTo(padLeft, padTop + chartH);
            ctx.closePath();
            grad = ctx.createLinearGradient(0, padTop, 0, padTop + chartH);
            grad.addColorStop(0, fillColor);
            grad.addColorStop(1, 'rgba(255,255,255,0)');
            ctx.fillStyle = grad;
            ctx.fill();

            // Line
            ctx.beginPath();
            p = getXY(data, 0);
            ctx.moveTo(p.x, p.y);
            for (var i = 1; i < data.length; i++) {
                prev = getXY(data, i - 1);
                curr = getXY(data, i);
                cpx = (prev.x + curr.x) / 2;
                ctx.bezierCurveTo(cpx, prev.y, cpx, curr.y, curr.x, curr.y);
            }
            ctx.strokeStyle = color;
            ctx.lineWidth = 2.5;
            ctx.stroke();

            // Dots
            for (var i = 0; i < data.length; i++) {
                pt = getXY(data, i);
                ctx.beginPath();
                ctx.arc(pt.x, pt.y, 4, 0, Math.PI * 2);
                ctx.fillStyle = color;
                ctx.fill();
                ctx.strokeStyle = 'white';
                ctx.lineWidth = 2;
                ctx.stroke();
            }

            // End value label
            var endPt = getXY(data, data.length - 1);
            var label = '$' + data[data.length - 1].toLocaleString();
            ctx.font = 'bold 11px Inter, sans-serif';
            ctx.fillStyle = color;
            ctx.textAlign = 'right';
            ctx.fillText(label, endPt.x - 8, endPt.y - 10);
        }

        // Draw best first (back), then avg, then worst (front) — so all visible
        drawLine(bestData, '#27ae60', 'rgba(39, 174, 96, 0.10)');
        drawLine(avgData, '#4267B2', 'rgba(66, 103, 178, 0.10)');
        drawLine(worstData, '#e67e22', 'rgba(230, 126, 34, 0.10)');
    }

    function update() {
        var start = parseInt(slider.value);
        var flips = parseFloat(flipsSelect.value);
        sliderLabel.textContent = '$' + start.toLocaleString();
        updateSliderFill();

        var worstData = calcGrowth(start, flips, 0.10, 12);
        var avgData = calcGrowth(start, flips, 0.25, 12);
        var bestData = calcGrowth(start, flips, 0.40, 12);

        worstEl.textContent = '$' + worstData[12].toLocaleString();
        avgEl.textContent = '$' + avgData[12].toLocaleString();
        bestEl.textContent = '$' + bestData[12].toLocaleString();

        drawChart(worstData, avgData, bestData);
    }

    slider.addEventListener('input', update);
    flipsSelect.addEventListener('change', update);
    window.addEventListener('resize', update);

    update();
})();
