
// Global State
let zIndexCounter = 100;
let windows = [];
let activeYear = "全部年份";
let searchQuery = "";
let currentLang = 'cn';
let FLAT_DATA = [];

const UI = {
    en: {
        searchLabel: "Search:",
        searchPlaceholder: "Filter projects...",
        headers: ["Name", "Revenue", "Tag", "Year", "Description"],
        allYears: "All Years",
        visit: "Visit Website",
        detailsLabels: { name: "Name:", cat: "Category:", rev: "Revenue:", year: "Year:", fac: "Factors:", desc: "Description:" },
        toggleBtn: "中文",
        noData: "No projects found for",
        allTags: "All Categories"
    },
    cn: {
        searchLabel: "搜索:",
        searchPlaceholder: "筛选项目...",
        headers: ["项目名称", "收入", "分类", "年份", "项目描述"],
        allYears: "全部年份",
        visit: "访问网站",
        detailsLabels: { name: "名称:", cat: "分类:", rev: "收入:", year: "年份:", fac: "关键因素:", desc: "描述:" },
        toggleBtn: "English",
        noData: "该年份暂无项目:",
        allTags: "所有分类"
    }
};

// Audio Context for Beeps
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
function beep(freq = 440, duration = 0.05) {
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.frequency.value = freq;
    gain.gain.value = 0.1;
    osc.start();
    setTimeout(() => osc.stop(), duration * 1000);
}

// --- Window Management ---
function createWindow(config) {
    beep(600, 0.02);
    const winId = 'win-' + Math.random().toString(36).substr(2, 9);
    const win = document.createElement('div');
    win.id = winId;
    win.className = 'window outset';
    win.style.left = (50 + (windows.length * 25)) + 'px';
    win.style.top = (50 + (windows.length * 25)) + 'px';
    win.style.width = config.width || '400px';
    win.style.height = config.height || '300px';
    win.style.zIndex = ++zIndexCounter;

    win.innerHTML = `
        <div class="title-bar">
            <div class="win-btn outset control-menu" style="margin-right: 2px;"><svg viewBox="0 0 10 10"><rect y="4" width="10" height="2" fill="black"/></svg></div>
            <div class="title-text">${config.title}</div>
            <div class="title-controls">
                <div class="win-btn outset min-btn">▲</div>
                <div class="win-btn outset close-btn">■</div>
            </div>
        </div>
        ${config.menu ? `<div class="menu-bar">${config.menu.map(m => `<div class="menu-item"><span>${m}</span></div>`).join('')}</div>` : ''}
        <div class="window-content inset">
            ${config.content}
        </div>
    `;

    document.body.appendChild(win);

    const winObj = { id: winId, title: config.title, el: win, minimized: false };
    windows.push(winObj);

    // Events
    win.addEventListener('mousedown', () => focusWindow(winId));
    win.querySelector('.close-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        closeWindow(winId);
    });
    win.querySelector('.min-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        minimizeWindow(winId);
    });

    makeDraggable(win);
    updateTaskbar();
    focusWindow(winId);

    if (config.onRender) config.onRender(win);

    // Resize Logic
    const handle = document.createElement('div');
    handle.className = 'resize-handle';
    win.appendChild(handle);
    makeResizable(win, handle);

    return winId;
}

function makeResizable(win, handle) {
    handle.addEventListener('mousedown', (e) => {
        e.preventDefault();
        e.stopPropagation();

        const startX = e.clientX;
        const startY = e.clientY;
        const style = window.getComputedStyle(win);
        const startWidth = parseInt(style.width, 10);
        const startHeight = parseInt(style.height, 10);

        function doDrag(e) {
            win.style.width = (startWidth + e.clientX - startX) + 'px';
            win.style.height = (startHeight + e.clientY - startY) + 'px';
        }

        function stopDrag() {
            document.documentElement.removeEventListener('mousemove', doDrag);
            document.documentElement.removeEventListener('mouseup', stopDrag);
        }

        document.documentElement.addEventListener('mousemove', doDrag);
        document.documentElement.addEventListener('mouseup', stopDrag);
    });
}

function focusWindow(id) {
    windows.forEach(w => {
        w.el.classList.add('inactive');
        if (w.id === id) {
            w.el.classList.remove('inactive');
            w.el.style.zIndex = ++zIndexCounter;
            w.el.style.display = 'flex';
            w.minimized = false;
        }
    });
    updateTaskbar();
}

function closeWindow(id) {
    beep(300, 0.05);
    const winObj = windows.find(w => w.id === id);
    if (winObj) {
        winObj.el.remove();
        windows = windows.filter(w => w.id !== id);
    }
    updateTaskbar();
}

function minimizeWindow(id) {
    const winObj = windows.find(w => w.id === id);
    if (winObj) {
        winObj.minimized = true;
        winObj.el.style.display = 'none';
    }
    updateTaskbar();
}

function makeDraggable(el) {
    const titleBar = el.querySelector('.title-bar');
    let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;

    titleBar.onmousedown = dragMouseDown;

    function dragMouseDown(e) {
        if (e.target.classList.contains('win-btn')) return;
        e.preventDefault();
        pos3 = e.clientX;
        pos4 = e.clientY;
        document.onmouseup = closeDragElement;
        document.onmousemove = elementDrag;
    }

    function elementDrag(e) {
        e.preventDefault();
        pos1 = pos3 - e.clientX;
        pos2 = pos4 - e.clientY;
        pos3 = e.clientX;
        pos4 = e.clientY;

        let newTop = el.offsetTop - pos2;
        let newLeft = el.offsetLeft - pos1;

        // Boundary check
        if (newTop < 0) newTop = 0;
        if (newTop > window.innerHeight - 50) newTop = window.innerHeight - 50;

        el.style.top = newTop + "px";
        el.style.left = newLeft + "px";
    }

    function closeDragElement() {
        document.onmouseup = null;
        document.onmousemove = null;
    }
}

function updateTaskbar() {
    const bar = document.getElementById('taskbar');
    bar.innerHTML = '';
    windows.forEach(w => {
        const btn = document.createElement('div');
        btn.className = 'task-item outset' + (w.el.style.display !== 'none' && !w.el.classList.contains('inactive') ? ' active' : '');
        btn.innerText = w.title;
        btn.onclick = () => focusWindow(w.id);
        bar.appendChild(btn);
    });
}

// --- App Logic ---

function flattenProjectData() {
    FLAT_DATA = [];
    if (typeof projectData === 'undefined') return;
    const currentData = projectData[currentLang];
    const years = currentData.years;

    years.forEach(year => {
        if (currentData.projects[year]) {
            currentData.projects[year].forEach(p => {
                // Assign a simplified ID based on random or index, for now random string
                const pid = Math.random().toString(36).substr(2, 9);
                FLAT_DATA.push({
                    ...p,
                    id: pid,
                    year: year
                });
            });
        }
    });
}

let sortState = { key: null, asc: true };

function parseRev(s) {
    if (!s) return 0;
    s = s.toString();
    // Prioritize values
    if (s.match(/profit/i)) return 0.1;
    if (s.match(/growing/i)) return 0.2;
    // Extract number
    let num = parseFloat(s.replace(/[^0-9.]/g, ''));
    if (isNaN(num)) return 0;
    if (s.toLowerCase().includes('k')) num *= 1000;
    if (s.toLowerCase().includes('m')) num *= 1000000;
    return num;
}

function formatRev(rev) {
    if (!rev) return "$500+";
    rev = rev.toString();
    // If specific money format, keep it
    if (rev.includes('$') || rev.includes('£') || rev.includes('€')) return rev;
    // If contains numbers but not B2B/B2C, keep it (e.g. "5-6 Figures")
    if (/\d/.test(rev) && !/B2B|B2C/i.test(rev)) return rev;
    // Otherwise fallback
    return "$500+";
}

function escapeHtml(text) {
    if (!text) return "";
    return String(text)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function escapeJsStr(text) {
    if (!text) return "";
    return String(text).replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}

function populateTags(win) {
    const select = win.querySelector('#tag-filter');
    if (!select) return;
    const currentVal = select.value;
    const tags = [...new Set(FLAT_DATA.map(p => p.tag))].sort();

    select.innerHTML = `<option value="">${UI[currentLang].allTags}</option>` +
        tags.map(t => `<option value="${t}">${t}</option>`).join('');

    // Restore value if possible
    if (tags.includes(currentVal)) {
        select.value = currentVal;
    }
}

function openProjectsShowcase() {
    const existing = windows.find(w => w.title === "HN Projects Showcase");
    if (existing) return focusWindow(existing.id);

    // Initial Active Year Logic
    if (activeYear === "All Years" && currentLang === 'cn') activeYear = "全部年份";
    if (activeYear === "全部年份" && currentLang === 'en') activeYear = "All Years";

    createWindow({
        title: "HN Projects Showcase",
        width: '850px',
        height: '500px',
        menu: ["File", "View", "Help"],
        content: `
            <div class="biz-container">
                <div class="tree-view inset" id="tree-container"></div>
                <div class="list-view-container">
                    <div class="search-box">
                        <label>${UI[currentLang].searchLabel}</label>
                        <input type="text" id="project-search" placeholder="${UI[currentLang].searchPlaceholder}" style="flex:1; min-width: 100px;">
                        <select id="tag-filter" class="inset" style="height:22px; margin-left:5px; border: 2px solid #808080; min-width: 120px;">
                            <!-- Populated dynamically -->
                        </select>
                        <button id="lang-toggle" class="outset" onclick="toggleLanguage()" style="margin-left:5px; padding:0 8px; cursor:pointer;">${UI[currentLang].toggleBtn}</button>
                    </div>
                    <div class="list-view inset">
                        <table id="project-table">
                            <thead>
                                <tr>
                                    <!-- Headers populated by updateHeaderIcons -->
                                    <th></th><th></th><th></th><th></th><th></th>
                                </tr>
                            </thead>
                            <tbody id="project-body"></tbody>
                        </table>
                    </div>
                </div>
            </div>
        `,
        onRender: (win) => {
            renderTree(win);
            updateHeaderIcons(win);
            populateTags(win);
            renderList(win);

            const searchInput = win.querySelector('#project-search');
            searchInput.addEventListener('input', (e) => {
                searchQuery = e.target.value.toLowerCase();
                renderList(win);
            });

            const tagSelect = win.querySelector('#tag-filter');
            tagSelect.addEventListener('change', () => {
                renderList(win);
            });
        }
    });
}

function renderTree(win) {
    const container = win.querySelector('#tree-container');
    const allYearsText = UI[currentLang].allYears;
    const years = [allYearsText, ...projectData[currentLang].years];

    container.innerHTML = years.map(y => `
        <div class="tree-item ${activeYear === y ? 'selected' : ''}" onclick="filterYear('${y}')">
            <span style="font-size: 14px;">${y === allYearsText ? '📁' : '📄'}</span>
            ${y}
        </div>
    `).join('');
}

window.filterYear = (year) => {
    activeYear = year;
    const winObj = windows.find(w => w.title === "HN Projects Showcase");
    if (winObj) {
        renderTree(winObj.el);
        renderList(winObj.el);
    }
}

window.sortBy = (key) => {
    if (sortState.key === key) {
        sortState.asc = !sortState.asc;
    } else {
        sortState.key = key;
        sortState.asc = true;
    }
    const winObj = windows.find(w => w.title === "HN Projects Showcase");
    if (winObj) {
        updateHeaderIcons(winObj.el);
        renderList(winObj.el);
    }
}

function updateHeaderIcons(win) {
    const ths = win.querySelectorAll('thead th');
    const keys = ['name', 'rev', 'tag', 'year', 'desc'];
    ths.forEach((th, i) => {
        const key = keys[i];
        let txt = UI[currentLang].headers[i];
        if (sortState.key === key) {
            txt += sortState.asc ? ' ▲' : ' ▼';
        }
        th.innerText = txt;
        th.onclick = () => sortBy(key);
        th.style.cursor = 'pointer';
        th.style.userSelect = 'none';
    });
}

window.filterByTag = (tag) => {
    const winObj = windows.find(w => w.title === "HN Projects Showcase");
    if (winObj) {
        const input = winObj.el.querySelector('#project-search');
        input.value = tag;
        searchQuery = tag.toLowerCase();
        renderList(winObj.el);
    }
};

function renderList(win) {
    const body = win.querySelector('#project-body');
    const allYearsText = UI[currentLang].allYears;
    const tagFilter = win.querySelector('#tag-filter') ? win.querySelector('#tag-filter').value : '';

    let filtered = FLAT_DATA.filter(p => {
        const matchesYear = activeYear === allYearsText || p.year === activeYear;
        const matchesSearch = p.name.toLowerCase().includes(searchQuery) ||
            p.desc.toLowerCase().includes(searchQuery) ||
            p.tag.toLowerCase().includes(searchQuery);
        const matchesTag = tagFilter === "" || p.tag === tagFilter;

        return matchesYear && matchesSearch && matchesTag;
    });

    // Sort Logic
    if (sortState.key) {
        filtered.sort((a, b) => {
            let valA = a[sortState.key];
            let valB = b[sortState.key];

            if (sortState.key === 'rev') {
                // Normalize first for consistent sorting
                valA = parseRev(formatRev(valA));
                valB = parseRev(formatRev(valB));
                return sortState.asc ? valA - valB : valB - valA;
            } else {
                // String sort
                valA = (valA || '').toString().toLowerCase();
                valB = (valB || '').toString().toLowerCase();
                if (valA < valB) return sortState.asc ? -1 : 1;
                if (valA > valB) return sortState.asc ? 1 : -1;
                return 0;
            }
        });
    }

    if (filtered.length === 0) {
        body.innerHTML = `<tr><td colspan="5" style="text-align:center; padding:20px; color:gray;">${UI[currentLang].noData} ${activeYear}</td></tr>`;
        return;
    }

    body.innerHTML = filtered.map(p => {
        let domain = '';
        try { domain = new URL(p.url).hostname; } catch (e) { }
        const icon = domain ? `https://www.google.com/s2/favicons?domain=${domain}&sz=32` : '';

        return `
        <tr onclick="openDetails('${escapeJsStr(p.id)}')">
            <td>
                ${icon ? `<img src="${icon}" style="width:16px; height:16px; vertical-align:middle; margin-right:6px; border-radius:2px;" loading="lazy">` : ''}
                <strong>${escapeHtml(p.name)}</strong>
            </td>
            <td>${formatRev(p.rev)}</td>
            <td>${escapeHtml(p.tag)}</td>
            <td>${escapeHtml(p.year)}</td>
            <td style="color: #444;">${escapeHtml(p.desc)}</td>
        </tr>
    `}).join('');
}

window.openDetails = (id) => {
    const project = FLAT_DATA.find(p => p.id === id);
    if (!project) return;

    const labels = UI[currentLang].detailsLabels;

    createWindow({
        title: `Details - ${escapeHtml(project.name)}`,
        width: '400px',
        height: '320px',
        content: `
            <div class="details-grid">
                <div class="label">${labels.name}</div><div>${escapeHtml(project.name)}</div>
                <div class="label">${labels.cat}</div><div>${escapeHtml(project.tag)}</div>
                <div class="label">${labels.rev}</div><div>${formatRev(project.rev)}</div>
                <div class="label">${labels.year}</div><div>${escapeHtml(project.year)}</div>
                <div class="label">${labels.fac}</div><div>${project.factors.map(f => escapeHtml(f)).join(', ')}</div>
            </div>
            <div style="margin-top: 15px; padding-top: 10px; border-top: 1px solid var(--win-gray);">
                <strong>${labels.desc}</strong><br>
                ${escapeHtml(project.desc)}
            </div>
            <div style="margin-top: 20px; text-align: center;">
                <button class="outset" style="padding: 6px 12px; cursor: pointer; font-weight: bold; background: #c0c0c0;" onclick="openBrowser('${escapeJsStr(project.url)}', '${escapeJsStr(project.name)}')">${UI[currentLang].visit}</button>
            </div>
        `
    });
};

function openBrowser(url, title) {
    createWindow({
        title: (title || "Web") + " - Netscape Navigator",
        width: '900px',
        height: '650px',
        content: `
            <div style="display:flex; flex-direction:column; height:100%;">
                <div class="outset" style="padding:4px; display:flex; gap:5px; background:#c0c0c0; align-items:center; border-bottom:1px solid gray;">
                    <div style="color:gray; font-size:12px;">Back</div>
                    <div style="color:gray; font-size:12px;">Fwd</div>
                    <button class="outset" style="padding:0 5px;" onclick="this.closest('.window-content').querySelector('iframe').src = '${url}'">Reload</button>
                    <div style="font-size:12px; margin-left:5px;">Location:</div>
                    <input type="text" class="inset" value="${url}" style="flex:1; padding:2px 4px; font-family: 'Courier New', monospace; background:white; border:1px solid #808080;" readonly>
                    <button class="outset" style="padding:0 5px;" onclick="window.open('${url}', '_blank')">External</button>
                </div>
                <div style="background:#ffffe1; color:#333; font-size:12px; padding:4px 8px; border-bottom:1px solid #888;">
                    ℹ️ <b>Note:</b> Most modern websites block embedded viewing due to security policies (X-Frame-Options). If the page fails to load, please use the <b>External</b> button.
                </div>
                <div class="inset" style="flex:1; background:white; position:relative; overflow:hidden;">
                    <iframe src="${url}" style="width:100%; height:100%; border:none; display:block; background: white;" sandbox="allow-scripts allow-same-origin allow-forms allow-popups"></iframe>
                </div>
            </div>
        `
    });
}

window.toggleLanguage = () => {
    const oldAllYears = UI[currentLang].allYears;
    currentLang = currentLang === 'en' ? 'cn' : 'en';
    const newAllYears = UI[currentLang].allYears;

    flattenProjectData();

    // Preserve "All Years" selection across languages
    if (activeYear === oldAllYears) {
        activeYear = newAllYears;
    }

    const winObj = windows.find(w => w.title === "HN Projects Showcase");
    if (winObj) {
        // Init UI update
        const cols = winObj.el.querySelectorAll('thead th');
        const texts = UI[currentLang].headers;
        cols.forEach((col, i) => col.innerText = texts[i]);

        winObj.el.querySelector('.search-box label').innerText = UI[currentLang].searchLabel;
        winObj.el.querySelector('#project-search').placeholder = UI[currentLang].searchPlaceholder;
        winObj.el.querySelector('#lang-toggle').innerText = UI[currentLang].toggleBtn;

        renderTree(winObj.el);
        populateTags(winObj.el);
        updateHeaderIcons(winObj.el);
        renderList(winObj.el);
    }
};

function createDialog(title, text, type = 'info') {
    const width = 350;
    const height = 160;
    const left = (window.innerWidth - width) / 2;
    const top = (window.innerHeight - height) / 2;

    let iconSvg = '';
    if (type === 'error') {
        iconSvg = `<svg viewBox="0 0 32 32" style="width:32px;height:32px; flex-shrink:0;"><path d="M10 2L2 10V22L10 30H22L30 22V10L22 2H10Z" fill="red" stroke="black"/><path d="M10 10L22 22M22 10L10 22" stroke="white" stroke-width="3"/></svg>`;
    } else {
        iconSvg = `<svg viewBox="0 0 32 32" style="width:32px;height:32px; flex-shrink:0;"><circle cx="16" cy="16" r="14" fill="#000080" stroke="black"/><text x="16" y="22" font-size="18" text-anchor="middle" fill="white" font-weight="bold" font-family="serif">i</text></svg>`;
    }

    createWindow({
        title: title,
        width: width + 'px',
        height: height + 'px',
        content: `
            <div style="display: flex; gap: 15px; padding: 20px; align-items: center; justify-content: flex-start;">
                ${iconSvg}
                <div style="font-size: 13px; line-height: 1.4;">${text}</div>
            </div>
            <div style="text-align: center; margin-top: 0px;">
                <button class="outset" style="padding: 4px 25px; font-weight: bold; background: #c0c0c0; border: 2px solid black; cursor: pointer;" onclick="closeWindow(this.closest('.window').id)">OK</button>
            </div>
        `,
        onRender: (win) => {
            win.style.left = left + 'px';
            win.style.top = top + 'px';
            win.querySelector('.title-controls').innerHTML = '<div class="win-btn outset close-btn">■</div>';
            win.querySelector('.close-btn').addEventListener('click', (e) => {
                e.stopPropagation();
                closeWindow(win.id);
            });
        }
    });
}

function openProgramManager() {
    const existing = windows.find(w => w.title === "Program Manager");
    if (existing) return focusWindow(existing.id);

    createWindow({
        title: "Program Manager",
        width: '400px',
        height: '280px',
        menu: ["File", "Options", "Window", "Help"],
        content: `
            <div style="display: flex; flex-wrap: wrap; gap: 20px; padding: 10px;">
                <div class="desktop-icon" onclick="openProjectsShowcase()" style="color: black; text-shadow: none;">
                    <div class="icon-graphic">
                        <svg viewBox="0 0 32 32"><path d="M2 6h28v20H2z" fill="#fff"/><path d="M2 6h28v2H2zm0 0h2v20H2z" fill="#808080"/><path d="M4 10h24v2H4zm0 4h24v2H4zm0 4h24v2H4z" fill="#000080"/></svg>
                    </div>
                    <div class="icon-label">HN Projects</div>
                </div>
                <!-- Read Me Mockup -->
                <div class="desktop-icon" onclick="createDialog('ReadMe.txt', 'This project showcases profitable side projects from Hacker News threads (2017-2025).<br><br>Built with Vanilla JS.', 'info')" style="color: black; text-shadow: none;">
                    <div class="icon-graphic">
                        <svg viewBox="0 0 32 32"><path d="M6 4h16l6 6v18H6z" fill="#fff"/><path d="M6 4h16v6h6" fill="none" stroke="#000" stroke-width="1"/><path d="M10 14h12M10 18h12M10 22h8" stroke="#000" stroke-width="1"/></svg>
                    </div>
                    <div class="icon-label">Read Me</div>
                </div>
                <!-- Minesweeper Mockup -->
                <div class="desktop-icon" onclick="triggerBSOD()" style="color: black; text-shadow: none;">
                    <div class="icon-graphic">
                        <svg viewBox="0 0 32 32"><rect x="4" y="4" width="24" height="24" fill="#C0C0C0"/><path d="M8 8h16v16H8z" fill="#000"/><circle cx="16" cy="16" r="4" fill="red"/></svg>
                    </div>
                    <div class="icon-label">Minesweeper</div>
                </div>
            </div>
        `
    });
}

function triggerBSOD() {
    const bsod = document.createElement('div');
    bsod.style.cssText = `
        position: fixed;
        top: 0; left: 0; width: 100vw; height: 100vh;
        background-color: #0000AA;
        color: white;
        font-family: 'Courier New', monospace;
        font-weight: bold;
        font-size: 18px;
        padding: 50px;
        z-index: 99999;
        white-space: pre;
        line-height: 1.5;
        cursor: none;
        user-select: none;
    `;
    bsod.innerText = `
      WINDOWS

      A fatal exception 0E has occurred at 0028:C0011E36 in VXD VMM(01) +
      00010E36. The current application will be terminated.

      *  Press any key to terminate the current application.
      *  Press CTRL+ALT+DEL again to restart your computer. You will
         lose any unsaved information in all applications.

      Press any key to continue_`;

    document.body.appendChild(bsod);

    const removeBSOD = () => {
        bsod.remove();
        window.removeEventListener('keydown', removeBSOD);
        window.removeEventListener('click', removeBSOD);
    };

    setTimeout(() => {
        window.addEventListener('keydown', removeBSOD);
        window.addEventListener('click', removeBSOD);
    }, 500);
}

function addProfileIcon() {
    const icon = document.createElement('div');
    icon.className = 'desktop-icon-widget';
    icon.title = "Click for Profile";
    icon.innerHTML = `
        <div class="outset" style="padding: 2px; background: #c0c0c0; display: inline-block;">
            <div class="inset" style="background: white; padding: 2px;">
                <img src="assets/img/avatar_pixel.png" 
                     style="width:64px; height:64px; display:block; image-rendering: pixelated;">
            </div>
        </div>
        <div style="background:white; color:black; font-family:'Courier New', monospace; 
                    font-weight:bold; font-size:12px; margin-top:5px; padding:2px 4px; border:1px solid black; box-shadow: 2px 2px 0 gray;">
            Me.bmp
        </div>
    `;
    icon.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        display: flex;
        flex-direction: column;
        align-items: center;
        cursor: pointer;
        z-index: 50;
    `;

    icon.onclick = () => {
        const w = 340;
        const h = 420;
        const left = (window.innerWidth - w) / 2;
        const top = (window.innerHeight - h) / 2;

        createWindow({
            title: "About Creator",
            width: w + 'px',
            height: h + 'px',
            content: `
                <div style="display:flex; flex-direction:column; align-items:center; padding:25px; text-align:center; height:100%; box-sizing:border-box;">
                    <div class="outset" style="padding:2px; background:#c0c0c0; display:inline-block; margin-bottom:20px;">
                        <div class="inset" style="padding:2px; background:white;">
                            <img src="assets/img/avatar_pixel.png" style="width:128px; height:128px; image-rendering:pixelated; display:block;">
                        </div>
                    </div>
                    <p style="margin:0 0 10px 0; font-weight:bold; font-size:18px; font-family:'Times New Roman', serif;">Website Creator</p>
                    <p style="margin:0 0 25px 0; line-height:1.5; font-size:14px;">Retro interface designed<br>for Windows 3.1 Aesthetic.</p>
                    
                    <button class="outset" style="padding:6px 20px; font-weight:bold; cursor:pointer; margin-bottom:15px;" onclick="window.open('https://x.com/penny777', '_blank')">Twitter Profile</button>
                    
                    <button class="outset" style="padding:4px 30px; cursor:pointer;" onclick="closeWindow(this.closest('.window').id)">OK</button>
                </div>
            `,
            onRender: (win) => {
                win.style.left = left + 'px';
                win.style.top = top + 'px';
            }
        });
    };
    document.body.appendChild(icon);
}

// Initial Start
window.onload = () => {
    if (typeof projectData !== 'undefined') {
        flattenProjectData();
        console.log("Projects loaded:", FLAT_DATA.length);
        if (FLAT_DATA.length === 0) {
            alert("Warning: No project data loaded. content might be missing.");
        }
        openProgramManager();
        addProfileIcon();
        setTimeout(openProjectsShowcase, 200);
    } else {
        alert("Error: data.js not loaded!");
    }
};
