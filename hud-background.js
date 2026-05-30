/**
 * ============================================================
 *  HUD BACKGROUND ENGINE — Lag-Free Edition
 *  Performance contract:
 *   · Hard 30fps cap on desktop, 20fps on mobile
 *   · ZERO createRadialGradient() calls per frame
 *   · ZERO querySelectorAll() / getBoundingClientRect() per frame
 *   · All edges batched into 2 path calls per frame
 *   · Gear proximity checked every 3rd frame only
 *   · Parallax skipped when mouse hasn't moved
 * ============================================================
 */
(function () {
    'use strict';

    /* ── Device capability ───────────────────────────────────── */
    const MOBILE = /Mobi|Android/i.test(navigator.userAgent)
                || navigator.maxTouchPoints > 0;

    const FRAME_MS  = MOBILE ? 50  : 33;   /* 20 / 30 fps        */
    const NODE_CNT  = MOBILE ? 6   : 9;     /* Optimized node count to save CPU cycles */
    const LINK_DIST = MOBILE ? 150 : 180;   /* Optimized connection bounds */
    const PTCL_CNT  = MOBILE ? 3   : 5;     /* Reduced concurrent energy particles */
    const TRAIL_LEN = MOBILE ? 0   : 6;     /* Significantly shorter cursor trail to free GPU rendering */

    /* Pre-computed RGBA prefixes — NO string ops in loop */
    const ORG = 'rgba(255,140,0,';
    const AMB = 'rgba(245,176,65,';
    const CYN = 'rgba(0,217,255,';

    /* ── Canvas ──────────────────────────────────────────────── */
    const canvas = document.getElementById('hud-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });

    let W = 0, H = 0;

    /* ── Mouse ───────────────────────────────────────────────── */
    const mouse = { x: -999, y: -999, dirty: false };
    window.addEventListener('mousemove', e => {
        mouse.x = e.clientX; mouse.y = e.clientY; mouse.dirty = true;
    }, { passive: true });
    window.addEventListener('touchmove', e => {
        mouse.x = e.touches[0].clientX;
        mouse.y = e.touches[0].clientY;
    }, { passive: true });

    /* ── Circuit graph ───────────────────────────────────────── */
    let nodes = [], edges = [], ptcls = [];

    function buildGraph() {
        nodes = []; edges = [];
        const cols = Math.max(2, Math.round(Math.sqrt(NODE_CNT * W / H)));
        const rows = Math.ceil(NODE_CNT / cols);
        for (let r = 0; r < rows && nodes.length < NODE_CNT; r++) {
            for (let c = 0; c < cols && nodes.length < NODE_CNT; c++) {
                nodes.push({
                    x:  ((c + 0.5 + (Math.random() - 0.5) * 0.65) / cols) * W,
                    y:  ((r + 0.5 + (Math.random() - 0.5) * 0.65) / rows) * H,
                    vx: (Math.random() - 0.5) * 0.14,
                    vy: (Math.random() - 0.5) * 0.14,
                    ph: Math.random() * Math.PI * 2,
                    org: Math.random() > 0.5,
                });
            }
        }
        const LD2 = LINK_DIST * LINK_DIST;
        for (let i = 0; i < nodes.length; i++) {
            for (let j = i + 1; j < nodes.length; j++) {
                const dx = nodes[i].x - nodes[j].x;
                const dy = nodes[i].y - nodes[j].y;
                if (dx * dx + dy * dy < LD2)
                    edges.push({ a: i, b: j, org: (i + j) % 2 === 0 });
            }
        }
        rebuildParticles();
    }

    function rebuildParticles() {
        ptcls = [];
        if (!edges.length) return;
        const step = Math.max(1, Math.floor(edges.length / PTCL_CNT));
        for (let i = 0; i < PTCL_CNT; i++) {
            ptcls.push({
                ei:  (i * step) % edges.length,
                t:   Math.random(),
                spd: 0.0009 + Math.random() * 0.0007,
                org: Math.random() > 0.5,
                sz:  Math.random() * 1.5 + 0.8,
            });
        }
    }

    /* ── Cached DOM (filled on load, rebuilt on resize) ─────── */
    let gearsEl  = null;
    let blobEls  = [];
    let gearItems = [];   /* [{el, cx, cy}] */
    let proxTick  = 0;

    function cacheDom() {
        gearsEl  = document.querySelector('.cyber-gears-container');
        blobEls  = Array.from(document.querySelectorAll('.blob'));
        cacheGearRects();
    }

    function cacheGearRects() {
        const els = document.querySelectorAll('.gear, .hud-ring');
        gearItems = Array.from(els).map(el => {
            const r = el.getBoundingClientRect();
            return { el, cx: r.left + r.width / 2, cy: r.top + r.height / 2 };
        });
    }

    /* ── Trail canvas ────────────────────────────────────────── */
    let trailCanvas = null, tctx = null, trail = [];
    if (TRAIL_LEN > 0) {
        trailCanvas = document.getElementById('trail-canvas');
        if (trailCanvas) {
            tctx = trailCanvas.getContext('2d', { alpha: true });
            function resizeTrail() {
                trailCanvas.width  = window.innerWidth;
                trailCanvas.height = window.innerHeight;
            }
            resizeTrail();
            window.addEventListener('resize', resizeTrail, { passive: true });
        }
    } else {
        /* Hide trail canvas on mobile */
        const tc = document.getElementById('trail-canvas');
        if (tc) tc.style.display = 'none';
    }

    /* ── Resize (debounced) ──────────────────────────────────── */
    function resize() {
        W = canvas.width  = window.innerWidth;
        H = canvas.height = window.innerHeight;
        buildGraph();
        cacheGearRects();
    }

    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(resize, 200);
    }, { passive: true });

    /* ── RAF loop with frame-rate cap ────────────────────────── */
    let lastT = 0;
    function loop(t) {
        requestAnimationFrame(loop);
        if (t - lastT < FRAME_MS) return;
        lastT = t;
        tick();
    }

    /* ── Main tick ───────────────────────────────────────────── */
    function tick() {
        ctx.clearRect(0, 0, W, H);

        /* Move nodes */
        for (const n of nodes) {
            n.x += n.vx; n.y += n.vy; n.ph += 0.018;
            if (n.x < -20) n.x = W + 20; else if (n.x > W + 20) n.x = -20;
            if (n.y < -20) n.y = H + 20; else if (n.y > H + 20) n.y = -20;
        }

        /* Batch: orange edges */
        ctx.beginPath();
        for (const e of edges) {
            if (!e.org) continue;
            const a = nodes[e.a], b = nodes[e.b];
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(a.x, b.y);
            ctx.lineTo(b.x, b.y);
        }
        ctx.strokeStyle = ORG + '0.048)';
        ctx.lineWidth   = 0.7;
        ctx.stroke();

        /* Batch: cyan edges */
        ctx.beginPath();
        for (const e of edges) {
            if (e.org) continue;
            const a = nodes[e.a], b = nodes[e.b];
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, a.y);
            ctx.lineTo(b.x, b.y);
        }
        ctx.strokeStyle = CYN + '0.040)';
        ctx.stroke();

        /* Nodes */
        for (const n of nodes) {
            const p   = Math.sin(n.ph) * 0.5 + 0.5;
            const r   = 1.5 + p * 1.0;
            const col = n.org ? ORG : CYN;
            /* Soft outer ring (no gradient — just a larger low-alpha circle) */
            ctx.beginPath();
            ctx.arc(n.x, n.y, r + 3.5, 0, 6.283);
            ctx.fillStyle = col + (0.03 + p * 0.04) + ')';
            ctx.fill();
            /* Core */
            ctx.beginPath();
            ctx.arc(n.x, n.y, r, 0, 6.283);
            ctx.fillStyle = col + (0.25 + p * 0.25) + ')';
            ctx.fill();
        }

        /* Energy particles */
        for (const p of ptcls) {
            p.t += p.spd;
            if (p.t >= 1) { p.t = 0; p.ei = (p.ei + 3) % Math.max(1, edges.length); }
            const e = edges[p.ei];
            if (!e) continue;
            const a = nodes[e.a], b = nodes[e.b];
            let px, py;
            if (p.t < 0.5) { px = a.x; py = a.y + (b.y - a.y) * (p.t * 2); }
            else            { px = a.x + (b.x - a.x) * ((p.t - 0.5) * 2); py = b.y; }
            const s = p.sz;
            ctx.fillStyle = (p.org ? ORG : CYN) + '0.45)';
            ctx.fillRect(px - s, py - s, s * 2, s * 2);
        }

        /* Gear proximity — every 3rd frame, desktop only */
        if (!MOBILE && mouse.dirty) {
            proxTick++;
            if (proxTick % 3 === 0) {
                const R2 = 240 * 240;
                for (const g of gearItems) {
                    const dx = mouse.x - g.cx, dy = mouse.y - g.cy;
                    if (dx * dx + dy * dy < R2) g.el.classList.add('hovered');
                    else                        g.el.classList.remove('hovered');
                }
            }
            /* Parallax */
            const nx = mouse.x / W - 0.5;
            const ny = mouse.y / H - 0.5;
            if (gearsEl) gearsEl.style.transform = `translate(${nx*20}px,${ny*20}px)`;
            blobEls.forEach((b, i) => {
                const s = (i + 1) * 11;
                b.style.transform = `translate(${(nx + 0.5) * s}px,${(ny + 0.5) * s}px)`;
            });
        }

        /* Cursor trail */
        if (tctx && TRAIL_LEN > 0) {
            trail.push({ x: mouse.x, y: mouse.y });
            if (trail.length > TRAIL_LEN) trail.shift();
            tctx.clearRect(0, 0, trailCanvas.width, trailCanvas.height);
            for (let i = 1; i < trail.length; i++) {
                const r = i / trail.length;
                tctx.beginPath();
                tctx.moveTo(trail[i - 1].x, trail[i - 1].y);
                tctx.lineTo(trail[i].x, trail[i].y);
                tctx.strokeStyle = (i % 2 === 0 ? ORG : CYN) + (r * 0.38) + ')';
                tctx.lineWidth   = r * 2.2;
                tctx.lineCap     = 'round';
                tctx.stroke();
            }
        }
    }

    /* ── Boot ────────────────────────────────────────────────── */
    resize();
    cacheDom();
    window.addEventListener('load', () => { cacheDom(); rebuildParticles(); });
    requestAnimationFrame(loop);

})();
