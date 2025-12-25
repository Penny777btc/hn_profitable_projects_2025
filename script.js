let currentLang = 'en';
let currentYear = '2025';

const grid = document.getElementById('projectGrid');
const yearNav = document.getElementById('yearNav');
const langToggle = document.getElementById('langToggle');

// Kinetic Elements references
const cursor = document.getElementById('cursor');
const follower = document.getElementById('cursor-follower');
const tensileGrid = document.getElementById('grid');
const elasticPath = document.getElementById('elastic-path');
const mainTitle = document.getElementById('mainTitle');
const mainSubtitle = document.getElementById('mainSubtitle');
const statYears = document.getElementById('statYears');
const statRevenue = document.getElementById('statRevenue');
const statTeam = document.getElementById('statTeam');

let mouseX = 0, mouseY = 0;
let followX = 0, followY = 0;

function init() {
    setupKineticBackground();
    renderNav();
    updateText();
    renderGrid();
    animate();

    langToggle.addEventListener('click', () => {
        currentLang = currentLang === 'en' ? 'cn' : 'en';
        document.body.setAttribute('data-lang', currentLang);
        updateText();
        renderGrid();
    });

    window.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;

        // Cursor movement
        if (cursor) cursor.style.transform = `translate3d(${mouseX - 5}px, ${mouseY - 5}px, 0)`;

        // Grid tension
        const lines = document.querySelectorAll('.line');
        lines.forEach(line => {
            const rect = line.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            const dist = Math.hypot(mouseX - centerX, mouseY - centerY);

            if (dist < 400) {
                const power = (400 - dist) / 400;
                if (line.classList.contains('line-h')) {
                    line.style.transform = `translateY(${(mouseY - centerY) * power * 0.4}px) scaleY(${1 + power})`;
                } else {
                    line.style.transform = `translateX(${(mouseX - centerX) * power * 0.4}px) scaleX(${1 + power})`;
                }
            } else {
                line.style.transform = `translate(0,0) scale(1)`;
            }
        });

        // Elastic path
        if (elasticPath) {
            elasticPath.setAttribute('d', `M 0 ${window.innerHeight / 2} Q ${mouseX} ${mouseY} ${window.innerWidth} ${window.innerHeight / 2}`);
        }

        // Parallax Recoil on title
        document.querySelectorAll('.glitch span').forEach(span => {
            const rect = span.getBoundingClientRect();
            const x = (mouseX - rect.left) / rect.width - 0.5;
            const y = (mouseY - rect.top) / rect.height - 0.5;
            const dist = Math.hypot(mouseX - (rect.left + rect.width / 2), mouseY - (rect.top + rect.height / 2));
            if (dist < 500) {
                const power = (500 - dist) / 500;
                span.style.transform = `translate3d(${x * 60 * power}px, ${y * 30 * power}px, 0) skewX(${x * 15 * power}deg)`;
            } else {
                span.style.transform = 'translate3d(0,0,0) skewX(0)';
            }
        });
    });
}

function setupKineticBackground() {
    tensileGrid.innerHTML = '';
    for (let i = 0; i < 20; i++) {
        const hLine = document.createElement('div');
        hLine.className = 'line line-h';
        hLine.style.top = `${(i + 1) * 5}%`;
        tensileGrid.appendChild(hLine);

        const vLine = document.createElement('div');
        vLine.className = 'line line-v';
        vLine.style.left = `${(i + 1) * 5}%`;
        tensileGrid.appendChild(vLine);
    }
}

function animate() {
    followX += (mouseX - followX) * 0.12;
    followY += (mouseY - followY) * 0.12;

    const dx = mouseX - followX;
    const dy = mouseY - followY;
    const rotation = Math.atan2(dy, dx) * 180 / Math.PI;
    const squeeze = Math.min(Math.hypot(dx, dy) / 40, 1.4);

    if (follower) {
        follower.style.transform = `translate3d(${followX - 20}px, ${followY - 20}px, 0) rotate(${rotation}deg) scale(${1 + squeeze}, ${1 - squeeze * 0.5})`;
    }
    requestAnimationFrame(animate);
}

function renderNav() {
    yearNav.innerHTML = '';
    const years = projectData[currentLang].years;
    years.forEach(year => {
        const btn = document.createElement('button');
        btn.className = `year-tab ${year === currentYear ? 'active' : ''}`;
        btn.innerText = year;
        btn.addEventListener('click', () => {
            currentYear = year;
            updateActiveNav();
            renderGrid();
            window.scrollTo({ top: window.innerHeight * 0.6, behavior: 'smooth' });
        });
        yearNav.appendChild(btn);
    });
}

function updateActiveNav() {
    const tabs = document.querySelectorAll('.year-tab');
    tabs.forEach(tab => {
        tab.classList.toggle('active', tab.innerText === currentYear);
    });
}

function updateText() {
    const data = projectData[currentLang];
    // Title is hardcoded spans for kinetic effect, but we can update data labels
    langToggle.innerText = `SYS_LANG: ${currentLang.toUpperCase()}`;
    mainSubtitle.innerText = currentLang === 'en' ? 'PROJECTS_CHRONICLE_V1.0.8' : '盈利项目编年史_V1.0.8';
    statYears.innerText = data.stats.years.toUpperCase();
    statRevenue.innerText = data.stats.revenue.toUpperCase();
    statTeam.innerText = data.stats.team.toUpperCase();
}

// Category SVG icons and cyberpunk color palette
const svgIcons = {
    education: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 14l9-5-9-5-9 5 9 5z"/><path d="M12 14l6.16-3.42a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"/><path d="M12 14v7"/></svg>',
    saas: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z"/></svg>',
    devtools: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><circle cx="12" cy="12" r="3"/></svg>',
    data: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4"/><path d="M4 12c0 2.21 3.582 4 8 4s8-1.79 8-4"/></svg>',
    travel: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/></svg>',
    fintech: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/></svg>',
    gaming: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M15 7h1m4 0h1m-5 4h4m-3-4v4m-8 3l-2.5 5.5a2.121 2.121 0 01-3-3L6 13M21 13l2.5 5.5a2.121 2.121 0 01-3 3L18 13M9 7h.01M15 7h.01M9 13a3 3 0 106 0 3 3 0 00-6 0z"/></svg>',
    utility: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z"/></svg>',
    analytics: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>',
    productivity: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/></svg>',
    ios: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"/></svg>',
    design: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"/></svg>',
    api: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"/></svg>',
    devops: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/></svg>',
    jobs: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>',
    marketing: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"/></svg>',
    hardware: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"/></svg>',
    science: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"/></svg>',
    publishing: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"/></svg>',
    fitness: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/></svg>',
    shopify: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/></svg>',
    ecommerce: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/></svg>',
    privacy: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>',
    cloud: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z"/></svg>',
    finance: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>',
    b2b: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>',
    infra: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01"/></svg>',
    community: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/></svg>',
    media: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>',
    health: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/></svg>',
    affiliate: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>',
    physical: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>',
    default: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0012 18.469c-1.006 0-1.913.44-2.535 1.139l-.548-.547z"/></svg>'
};

// Cyberpunk color palette - dark backgrounds with neon accents
const categoryStyles = {
    // English categories
    'Education': { bg: 'rgba(0, 242, 255, 0.08)', iconType: 'education', accent: '#00f2ff', glow: 'rgba(0, 242, 255, 0.4)' },
    'SaaS': { bg: 'rgba(147, 51, 234, 0.08)', iconType: 'saas', accent: '#9333ea', glow: 'rgba(147, 51, 234, 0.4)' },
    'DevTools': { bg: 'rgba(249, 115, 22, 0.08)', iconType: 'devtools', accent: '#f97316', glow: 'rgba(249, 115, 22, 0.4)' },
    'Data': { bg: 'rgba(16, 185, 129, 0.08)', iconType: 'data', accent: '#10b981', glow: 'rgba(16, 185, 129, 0.4)' },
    'Travel': { bg: 'rgba(59, 130, 246, 0.08)', iconType: 'travel', accent: '#3b82f6', glow: 'rgba(59, 130, 246, 0.4)' },
    'Fintech': { bg: 'rgba(236, 72, 153, 0.08)', iconType: 'fintech', accent: '#ec4899', glow: 'rgba(236, 72, 153, 0.4)' },
    'Gaming': { bg: 'rgba(168, 85, 247, 0.08)', iconType: 'gaming', accent: '#a855f7', glow: 'rgba(168, 85, 247, 0.4)' },
    'Utility': { bg: 'rgba(100, 116, 139, 0.08)', iconType: 'utility', accent: '#64748b', glow: 'rgba(100, 116, 139, 0.4)' },
    'Analytics': { bg: 'rgba(234, 179, 8, 0.08)', iconType: 'analytics', accent: '#eab308', glow: 'rgba(234, 179, 8, 0.4)' },
    'Productivity': { bg: 'rgba(34, 197, 94, 0.08)', iconType: 'productivity', accent: '#22c55e', glow: 'rgba(34, 197, 94, 0.4)' },
    'iOS App': { bg: 'rgba(148, 163, 184, 0.08)', iconType: 'ios', accent: '#94a3b8', glow: 'rgba(148, 163, 184, 0.4)' },
    'Design': { bg: 'rgba(244, 114, 182, 0.08)', iconType: 'design', accent: '#f472b6', glow: 'rgba(244, 114, 182, 0.4)' },
    'API': { bg: 'rgba(6, 182, 212, 0.08)', iconType: 'api', accent: '#06b6d4', glow: 'rgba(6, 182, 212, 0.4)' },
    'DevOps': { bg: 'rgba(239, 68, 68, 0.08)', iconType: 'devops', accent: '#ef4444', glow: 'rgba(239, 68, 68, 0.4)' },
    'Jobs': { bg: 'rgba(251, 146, 60, 0.08)', iconType: 'jobs', accent: '#fb923c', glow: 'rgba(251, 146, 60, 0.4)' },
    'Marketing': { bg: 'rgba(253, 224, 71, 0.08)', iconType: 'marketing', accent: '#fde047', glow: 'rgba(253, 224, 71, 0.4)' },
    'Hardware': { bg: 'rgba(161, 161, 170, 0.08)', iconType: 'hardware', accent: '#a1a1aa', glow: 'rgba(161, 161, 170, 0.4)' },
    'Science': { bg: 'rgba(45, 212, 191, 0.08)', iconType: 'science', accent: '#2dd4bf', glow: 'rgba(45, 212, 191, 0.4)' },
    'Publishing': { bg: 'rgba(163, 230, 53, 0.08)', iconType: 'publishing', accent: '#a3e635', glow: 'rgba(163, 230, 53, 0.4)' },
    'Fitness': { bg: 'rgba(248, 113, 113, 0.08)', iconType: 'fitness', accent: '#f87171', glow: 'rgba(248, 113, 113, 0.4)' },
    'Shopify': { bg: 'rgba(132, 204, 22, 0.08)', iconType: 'shopify', accent: '#84cc16', glow: 'rgba(132, 204, 22, 0.4)' },
    'Ecommerce': { bg: 'rgba(192, 132, 252, 0.08)', iconType: 'ecommerce', accent: '#c084fc', glow: 'rgba(192, 132, 252, 0.4)' },
    'Privacy': { bg: 'rgba(96, 165, 250, 0.08)', iconType: 'privacy', accent: '#60a5fa', glow: 'rgba(96, 165, 250, 0.4)' },
    'Cloud': { bg: 'rgba(147, 51, 234, 0.08)', iconType: 'cloud', accent: '#9333ea', glow: 'rgba(147, 51, 234, 0.4)' },
    'Finance': { bg: 'rgba(74, 222, 128, 0.08)', iconType: 'finance', accent: '#4ade80', glow: 'rgba(74, 222, 128, 0.4)' },
    'B2B': { bg: 'rgba(129, 140, 248, 0.08)', iconType: 'b2b', accent: '#818cf8', glow: 'rgba(129, 140, 248, 0.4)' },
    'Infrastructure': { bg: 'rgba(113, 113, 122, 0.08)', iconType: 'infra', accent: '#71717a', glow: 'rgba(113, 113, 122, 0.4)' },
    'Community': { bg: 'rgba(251, 191, 36, 0.08)', iconType: 'community', accent: '#fbbf24', glow: 'rgba(251, 191, 36, 0.4)' },
    'Media': { bg: 'rgba(217, 70, 239, 0.08)', iconType: 'media', accent: '#d946ef', glow: 'rgba(217, 70, 239, 0.4)' },
    'Health': { bg: 'rgba(248, 113, 113, 0.08)', iconType: 'health', accent: '#f87171', glow: 'rgba(248, 113, 113, 0.4)' },
    'Affiliate': { bg: 'rgba(251, 146, 60, 0.08)', iconType: 'affiliate', accent: '#fb923c', glow: 'rgba(251, 146, 60, 0.4)' },
    'Physical': { bg: 'rgba(251, 191, 36, 0.08)', iconType: 'physical', accent: '#fbbf24', glow: 'rgba(251, 191, 36, 0.4)' },
    // Chinese categories
    '教育': { bg: 'rgba(0, 242, 255, 0.08)', iconType: 'education', accent: '#00f2ff', glow: 'rgba(0, 242, 255, 0.4)' },
    '开发者工具': { bg: 'rgba(249, 115, 22, 0.08)', iconType: 'devtools', accent: '#f97316', glow: 'rgba(249, 115, 22, 0.4)' },
    '数据': { bg: 'rgba(16, 185, 129, 0.08)', iconType: 'data', accent: '#10b981', glow: 'rgba(16, 185, 129, 0.4)' },
    '旅行': { bg: 'rgba(59, 130, 246, 0.08)', iconType: 'travel', accent: '#3b82f6', glow: 'rgba(59, 130, 246, 0.4)' },
    '金融科技': { bg: 'rgba(236, 72, 153, 0.08)', iconType: 'fintech', accent: '#ec4899', glow: 'rgba(236, 72, 153, 0.4)' },
    '游戏': { bg: 'rgba(168, 85, 247, 0.08)', iconType: 'gaming', accent: '#a855f7', glow: 'rgba(168, 85, 247, 0.4)' },
    '工具': { bg: 'rgba(100, 116, 139, 0.08)', iconType: 'utility', accent: '#64748b', glow: 'rgba(100, 116, 139, 0.4)' },
    '分析': { bg: 'rgba(234, 179, 8, 0.08)', iconType: 'analytics', accent: '#eab308', glow: 'rgba(234, 179, 8, 0.4)' },
    '效率': { bg: 'rgba(34, 197, 94, 0.08)', iconType: 'productivity', accent: '#22c55e', glow: 'rgba(34, 197, 94, 0.4)' },
    'iOS 应用': { bg: 'rgba(148, 163, 184, 0.08)', iconType: 'ios', accent: '#94a3b8', glow: 'rgba(148, 163, 184, 0.4)' },
    '设计': { bg: 'rgba(244, 114, 182, 0.08)', iconType: 'design', accent: '#f472b6', glow: 'rgba(244, 114, 182, 0.4)' },
    '接口': { bg: 'rgba(6, 182, 212, 0.08)', iconType: 'api', accent: '#06b6d4', glow: 'rgba(6, 182, 212, 0.4)' },
    '招聘': { bg: 'rgba(251, 146, 60, 0.08)', iconType: 'jobs', accent: '#fb923c', glow: 'rgba(251, 146, 60, 0.4)' },
    '营销': { bg: 'rgba(253, 224, 71, 0.08)', iconType: 'marketing', accent: '#fde047', glow: 'rgba(253, 224, 71, 0.4)' },
    '硬件': { bg: 'rgba(161, 161, 170, 0.08)', iconType: 'hardware', accent: '#a1a1aa', glow: 'rgba(161, 161, 170, 0.4)' },
    '科学': { bg: 'rgba(45, 212, 191, 0.08)', iconType: 'science', accent: '#2dd4bf', glow: 'rgba(45, 212, 191, 0.4)' },
    '出版': { bg: 'rgba(163, 230, 53, 0.08)', iconType: 'publishing', accent: '#a3e635', glow: 'rgba(163, 230, 53, 0.4)' },
    '健身': { bg: 'rgba(248, 113, 113, 0.08)', iconType: 'fitness', accent: '#f87171', glow: 'rgba(248, 113, 113, 0.4)' },
    '运动': { bg: 'rgba(248, 113, 113, 0.08)', iconType: 'fitness', accent: '#f87171', glow: 'rgba(248, 113, 113, 0.4)' },
    '电商': { bg: 'rgba(192, 132, 252, 0.08)', iconType: 'ecommerce', accent: '#c084fc', glow: 'rgba(192, 132, 252, 0.4)' },
    '社区': { bg: 'rgba(251, 191, 36, 0.08)', iconType: 'community', accent: '#fbbf24', glow: 'rgba(251, 191, 36, 0.4)' },
    '媒体': { bg: 'rgba(217, 70, 239, 0.08)', iconType: 'media', accent: '#d946ef', glow: 'rgba(217, 70, 239, 0.4)' },
    'AI': { bg: 'rgba(6, 182, 212, 0.08)', iconType: 'api', accent: '#06b6d4', glow: 'rgba(6, 182, 212, 0.4)' },
    '隐私': { bg: 'rgba(96, 165, 250, 0.08)', iconType: 'privacy', accent: '#60a5fa', glow: 'rgba(96, 165, 250, 0.4)' },
    '云服务': { bg: 'rgba(147, 51, 234, 0.08)', iconType: 'cloud', accent: '#9333ea', glow: 'rgba(147, 51, 234, 0.4)' },
    '金融': { bg: 'rgba(74, 222, 128, 0.08)', iconType: 'finance', accent: '#4ade80', glow: 'rgba(74, 222, 128, 0.4)' },
    '基础架构': { bg: 'rgba(113, 113, 122, 0.08)', iconType: 'infra', accent: '#71717a', glow: 'rgba(113, 113, 122, 0.4)' },
    '社区': { bg: 'rgba(251, 191, 36, 0.08)', iconType: 'community', accent: '#fbbf24', glow: 'rgba(251, 191, 36, 0.4)' },
    '媒体': { bg: 'rgba(217, 70, 239, 0.08)', iconType: 'media', accent: '#d946ef', glow: 'rgba(217, 70, 239, 0.4)' },
    '健康': { bg: 'rgba(248, 113, 113, 0.08)', iconType: 'health', accent: '#f87171', glow: 'rgba(248, 113, 113, 0.4)' },
    '返利': { bg: 'rgba(251, 146, 60, 0.08)', iconType: 'affiliate', accent: '#fb923c', glow: 'rgba(251, 146, 60, 0.4)' },
    '物理': { bg: 'rgba(251, 191, 36, 0.08)', iconType: 'physical', accent: '#fbbf24', glow: 'rgba(251, 191, 36, 0.4)' },
    '开发工具': { bg: 'rgba(249, 115, 22, 0.08)', iconType: 'devtools', accent: '#f97316', glow: 'rgba(249, 115, 22, 0.4)' },
};

const defaultStyle = { bg: 'rgba(100, 116, 139, 0.08)', iconType: 'default', accent: '#64748b', glow: 'rgba(100, 116, 139, 0.4)' };

function getPlaceholderHtml(tag, name) {
    const style = categoryStyles[tag] || defaultStyle;
    return `
        <div class="card-image placeholder" style="
            background: ${style.gradient};
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            position: relative;
            overflow: hidden;
        ">
            <div style="
                font-size: 3.5rem;
                margin-bottom: 0.5rem;
                filter: drop-shadow(0 4px 8px rgba(0,0,0,0.1));
                animation: floatIcon 3s ease-in-out infinite;
            ">${style.icon}</div>
            <div style="
                font-family: 'Inter', sans-serif;
                font-weight: 600;
                font-size: 0.9rem;
                color: ${style.accent};
                letter-spacing: 0.05em;
                text-transform: uppercase;
                opacity: 0.7;
            ">${tag}</div>
            <div style="
                position: absolute;
                top: 50%;
                left: 50%;
                width: 200px;
                height: 200px;
                background: radial-gradient(circle, rgba(255,255,255,0.3) 0%, transparent 70%);
                transform: translate(-50%, -50%);
                pointer-events: none;
            "></div>
        </div>
    `;
}

function renderGrid() {
    grid.innerHTML = '';
    const projects = projectData[currentLang].projects[currentYear];

    projects.forEach((p, index) => {
        const style = categoryStyles[p.tag] || defaultStyle;
        const iconSvg = svgIcons[style.iconType] || svgIcons.default;
        const item = document.createElement('div');
        item.className = 'list-item';
        item.style.animationDelay = `${index * 0.05}s`;

        item.innerHTML = `
            <div class="list-item-header">
                <div class="list-item-icon" style="
                    background: ${style.bg};
                    border: 1px solid ${style.accent}22;
                    box-shadow: 0 0 12px ${style.glow}, inset 0 0 8px ${style.glow};
                    color: ${style.accent};
                ">
                    ${iconSvg}
                </div>
                <div class="list-item-main">
                    <div class="list-item-title-row">
                        <a href="${p.url}" target="_blank" class="list-item-name">${p.name}</a>
                        <span class="list-item-rev">${p.rev}</span>
                    </div>
                    <div class="list-item-meta">
                        <span class="list-item-tag" style="color: ${style.accent};">${p.tag}</span>
                        <span class="list-item-desc">${p.desc}</span>
                    </div>
                </div>
                <a href="${p.url}" target="_blank" class="list-item-arrow" title="${projectData[currentLang].visBtn}">
                    <svg width="16" height="16" viewBox="0 0 15 15" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 12L12 3M12 3H5M12 3V10"/></svg>
                </a>
            </div>
            <div class="list-item-factors">
                ${p.factors.map(f => `<span class="factor-chip">${f}</span>`).join('')}
            </div>
        `;
        grid.appendChild(item);
    });
}

init();
