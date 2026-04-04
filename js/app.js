// ─── Type helpers ───────────────────────────────────────────────────────────
const normalizeType = (type) => {
  if (type === 'netrual') return 'neutral';
  if (type === 'danger') return 'negative';
  return type;
};

const resultTypeColor = (type) => {
  const t = normalizeType(type);
  if (t === 'positive') return '#4CAF50';
  if (t === 'neutral')  return '#D9A441';
  return '#D9534F';
};

const resultTypeLabel = (type) => {
  const t = normalizeType(type);
  if (t === 'positive') return 'Positive';
  if (t === 'neutral')  return 'Neutral';
  if (t === 'negative') return 'Negative';
  return t;
};

const findCountryByCode = (countries, code) => {
  if (!countries || !code) return null;
  const target = String(code).toUpperCase();
  return countries.find(c => String(c.code).toUpperCase() === target) || null;
};
const getFlag = (code) => {
  if (!code) return '';
  return `<img src="https://flagcdn.com/${String(code).toLowerCase()}.svg"
               alt="flag"
               style="width:100%;height:100%;object-fit:cover;display:block;">`;
};
class App {
  constructor() {
    this.currentGesture = null; 
    this.currentScene   = null;
    this.detector       = null;
    this.worldMap       = null;
    this.ringCircumference = 214; // 2π × 34

    this.timeoutTimer    = null;
    this.timeoutSeconds  = 15;
    this.timeoutRemaining = 15;

    this._unknownActive = false;

    this._gestureCycleTimer = null;
    this._gestureCycleIndex = 0;

    this.fallbackDetector = null;
    this._fbRingCirc = 150.8; // 2π × 24

    this._resultCountryIdx  = 0;
    this._resultKeyHandler  = null;
    this._resultHandsCamera = null;
    this._resultHandsObj    = null;
    this._scroll            = null;  // result-page auto-scroll state
    this._resultAutoplayTimer = null;
    this._timeoutMode       = null;
    this._timeoutHandsCamera = null;
    this._timeoutHandsObj    = null;
    this._cameraHoveredBtn = null;
    this._cameraFistLatched = false;

    this._cameraBackHovering = false;
    this._cameraBackFistLatched = false;
    this._cameraBackCooldownUntil = 0;
    this._cameraLastLandmarks = null;
    this._unknownGestureStoreKey = 'gestureworld_unknown_gestures';
    this._latestUnknownRecord = null;

    this.pages = {
      landing:  document.getElementById('page-landing'),
      group1:   document.getElementById('page-group1'),
      scenario: document.getElementById('page-scenario'),
      camera:   document.getElementById('page-camera'),
      result:   document.getElementById('page-result'),
      timeout:  document.getElementById('page-timeout'),
      fallback: document.getElementById('page-fallback'),
      database: document.getElementById('page-database'),
    };

    this._initScenarioPage();
    // Don't call _showPage here — landing page is already active in HTML
    
    //Add NEW
    this._serialPromptDone = false;
    this._serialSending = false;
    this._initSerialBootstrap();
    this._bindHashRouting();
  }
   //Add New
  async _initSerialBootstrap() {
  // 先尝试恢复之前已授权的串口
  try {
    await window.serialManager?.autoReconnectIfPossible();
  } catch (err) {
    console.warn('Auto reconnect skipped:', err);
  }

  // 首次任意点击，弹串口选择
  const handleFirstClick = async () => {
    if (this._serialPromptDone || window.serialManager?.isConnected) return;
    this._serialPromptDone = true;

    try {
      await window.serialManager?.requestAndConnect();
      this._toast('Serial connected');
    } catch (err) {
      console.warn('User cancelled or serial connect failed:', err);
      this._toast('Serial not connected');
      // 允许下次再点一次继续弹
      this._serialPromptDone = false;
    }
  };

  document.addEventListener('click', handleFirstClick, { passive: true });
}

async _sendGestureToArduino(gesture) {
  if (this._serialSending) return;
  if (!window.serialManager?.isConnected) return;

  this._serialSending = true;
  try {
    await window.serialManager.sendGesture(gesture);
  } catch (err) {
    console.error('Send gesture failed:', err);
  } finally {
    this._serialSending = false;
  }
}

async resetArduinoHand() {
  try {
    if (window.serialManager?.isConnected) {
      await window.serialManager.resetHand();
    }
  } catch (err) {
    console.error('Reset hand failed:', err);
  }
}

_getUnknownGestureRecords() {
  try {
    return JSON.parse(localStorage.getItem(this._unknownGestureStoreKey) || '[]');
  } catch (err) {
    console.warn('Failed to parse unknown gesture records:', err);
    return [];
  }
}

_setUnknownGestureRecords(records) {
  try {
    localStorage.setItem(this._unknownGestureStoreKey, JSON.stringify(records));
  } catch (err) {
    console.warn('Failed to save unknown gesture records:', err);
  }
}
/*
_generateUnknownGestureId() {
  const now = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  const timePart = [
    now.getFullYear(),
    pad(now.getMonth() + 1),
    pad(now.getDate()),
    pad(now.getHours()),
    pad(now.getMinutes()),
    pad(now.getSeconds())
  ].join('');
  const rand = Math.random().toString(36).slice(2, 7);
  return `UG-${timePart}-${rand}`;
}*/

_generateUnknownGestureId() {
  const records = this._getUnknownGestureRecords();
  const next = records.length + 1;
  return `#${String(next).padStart(3, '0')}`;
}

_formatArchiveTime(date = new Date()) {
  return date.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
}

_landmarksToSvgDataUrl(landmarks) {
  if (!Array.isArray(landmarks) || landmarks.length < 21) return null;

  const W = 300;
  const H = 300;

  const CONNECTIONS = [
    [0,1],[1,2],[2,3],[3,4],
    [0,5],[5,6],[6,7],[7,8],
    [5,9],[9,10],[10,11],[11,12],
    [9,13],[13,14],[14,15],[15,16],
    [13,17],[17,18],[18,19],[19,20],
    [0,17]
  ];

  const pts = landmarks.map(p => ({
    x: (1 - p.x) * W,   // 和界面镜像方向保持一致
    y: p.y * H
  }));

  const lines = CONNECTIONS.map(([a, b]) => {
    const p1 = pts[a];
    const p2 = pts[b];
    return `<line x1="${p1.x.toFixed(1)}" y1="${p1.y.toFixed(1)}" x2="${p2.x.toFixed(1)}" y2="${p2.y.toFixed(1)}" stroke="#ffffff" stroke-width="3" stroke-linecap="round" />`;
  }).join('');

  const dots = pts.map((p, i) => {
    const r = i === 0 ? 5 : 4;
    return `<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="${r}" fill="#4cc9f0" />`;
  }).join('');

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
      <rect width="100%" height="100%" fill="#0b1020"/>
      ${lines}
      ${dots}
    </svg>
  `.trim();

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

_saveUnknownGestureRecord() {
  try {
    const landmarks =
      this.detector?.lastLandmarks ||
      this._cameraLastLandmarks ||
      null;

    if (!Array.isArray(landmarks) || landmarks.length < 21) {
      console.warn('No valid landmarks to save for unknown gesture');
      return;
    }

    const scenario = this.currentScene || null;

    const record = {
      Entry: this._generateUnknownGestureId(),
      time: this._formatArchiveTime(new Date()),
      Scenario: scenario ? (scenario.text || scenario.id || null) : null,
      gestureImage: this._landmarksToSvgDataUrl(landmarks)
    };

    const records = this._getUnknownGestureRecords();
    records.push(record);
    this._setUnknownGestureRecords(records);

    // 缓存这一次最新记录，给 fallback 直接用
    this._latestUnknownRecord = record;

    if (this.pages.database?.classList.contains('active')) {
      this._renderUnknownGestureDatabase();
    }

    console.log('Unknown gesture record saved:', record);
  } catch (err) {
    console.error('Failed to save unknown gesture record:', err);
  }
}

getUnknownGestureRecords() {
  return this._getUnknownGestureRecords();
}

clearUnknownGestureRecords() {
  const ok = window.confirm('Clear all unknown gesture records?');
  if (!ok) return;

  try {
    localStorage.removeItem(this._unknownGestureStoreKey);
    console.log('Unknown gesture database cleared.');

    if (this.pages.database?.classList.contains('active')) {
      this._renderUnknownGestureDatabase();
    }
  } catch (err) {
    console.error('Failed to clear unknown gesture database:', err);
  }
}

_renderUnknownGestureDatabase() {
  const wrap = document.getElementById('db-record-list');
  if (!wrap) return;

  const records = this._getUnknownGestureRecords();

  if (!records.length) {
    wrap.innerHTML = `<p class="db-empty">No unknown gesture records yet.</p>`;
    return;
  }

  const latestFirst = [...records].reverse();

  wrap.innerHTML = latestFirst.map((record) => `
    <article class="db-record-card">
      <div class="db-record-image-wrap">
        <img class="db-record-image" src="${record.gestureImage}" alt="Gesture skeleton">
        <span class="db-record-badge">UNCLASSIFIED INPUT</span>
      </div>

      <div class="db-record-row">
        <div class="db-record-label">ENTRY</div>
        <div class="db-record-value">${record.Entry ?? ''}</div>
      </div>

      <div class="db-record-row">
        <div class="db-record-label">STATUS</div>
        <div class="db-record-value db-record-status">Unclassified</div>
      </div>

      <div class="db-record-row">
        <div class="db-record-label">SOURCE</div>
        <div class="db-record-value">Live input</div>
      </div>

      <div class="db-record-row">
        <div class="db-record-label">TIME</div>
        <div class="db-record-value">${record.time ?? ''}</div>
      </div>

      <div class="db-record-row">
        <div class="db-record-label">SCENARIO</div>
        <div class="db-record-value">${record.Scenario ?? ''}</div>
      </div>
    </article>
  `).join('');
}

async showDatabase() {
  // 进入 database 页前，先停掉所有可能残留的跨页状态
  this._stopTimeout();
  this._stopUnknownActive();
  this._stopTimeoutPageHandTracking();
  this._stopResultHandTracking();
  this._clearResultIdleTimer?.();
  this._stopFallbackPageHandTracking?.();

  if (this._resultTransitionTimer) {
    clearTimeout(this._resultTransitionTimer);
    this._resultTransitionTimer = null;
  }
  if (this._resultInitTimer) {
    clearTimeout(this._resultInitTimer);
    this._resultInitTimer = null;
  }

  this.detector?.stop();

  this._renderUnknownGestureDatabase();
  await this._showPage('database');
  location.hash = 'database';
}

_bindHashRouting() {
  window.addEventListener('hashchange', () => {
    this._handleHashRoute();
  });

  this._handleHashRoute();
}

async _handleHashRoute() {
  const hash = (window.location.hash || '').replace('#', '').trim().toLowerCase();

  if (hash === 'database') {
    this._stopTimeout();
    this._stopUnknownActive();
    this._stopTimeoutPageHandTracking();
    this._stopResultHandTracking();
    this._clearResultIdleTimer?.();
    this._stopFallbackPageHandTracking?.();

    if (this._resultTransitionTimer) {
      clearTimeout(this._resultTransitionTimer);
      this._resultTransitionTimer = null;
    }
    if (this._resultInitTimer) {
      clearTimeout(this._resultInitTimer);
      this._resultInitTimer = null;
    }

    this.detector?.stop();

    this._renderUnknownGestureDatabase();
    await this._showPage('database');
    return;
  }

  if (!hash || hash === 'landing') {
    await this._showPage('landing');
  }
}

  // ── Page routing ────────────────────────────────────────────────────────
async _showPage(name) {
  const prev = Object.entries(this.pages)
    .find(([, el]) => el?.classList.contains('active'))?.[0];

  if (this._resultTransitionTimer) {
    clearTimeout(this._resultTransitionTimer);
    this._resultTransitionTimer = null;
  }
  if (this._resultInitTimer) {
    clearTimeout(this._resultInitTimer);
    this._resultInitTimer = null;
  }

  // ── Leaving scenario: remove listeners + stop typewriter. NO currentTime reset.
  if (prev === 'scenario' && name !== 'scenario') {
    this._scenarioRemoveDrag?.();
    const sv = document.getElementById('scenario-video');
    if (sv) {
      if (this._scenarioTimeHandler) {
        sv.removeEventListener('timeupdate', this._scenarioTimeHandler);
        this._scenarioTimeHandler = null;
      }
      if (this._scenarioEndHandler) {
        sv.removeEventListener('ended', this._scenarioEndHandler);
        this._scenarioEndHandler = null;
      }
      sv.pause();
      // intentionally NOT resetting currentTime — last frame must stay visible
    }
    if (this._scenarioCancelTypewriter) {
      this._scenarioCancelTypewriter();
      this._scenarioCancelTypewriter = null;
    }
    if (typeof stopGesture === 'function') {
      try { await stopGesture(); } catch (_) {}
    }
  }

  if (prev === 'landing' && name !== 'landing' && typeof stopLandingConsent === 'function') {
    stopLandingConsent();
  }
  if (prev === 'result' && name !== 'result') {
    this._stopResultAutoplay();
    this._stopResultHandTracking();
    this._clearResultIdleTimer();
  }

  if (prev === 'timeout' && name !== 'timeout') {
    this._stopTimeoutPageHandTracking();
  }

  if (prev === 'fallback' && name !== 'fallback') {
    this.fallbackDetector?.stop();
    this._stopFallbackPageHandTracking();
  }

  // ── Unified hand/pointer cleanup before every page switch
  this.cleanupAllPageInteractions();

  Object.entries(this.pages).forEach(([k, el]) => {
    if (el) el.classList.toggle('active', k === name);
  });

  if (name !== 'camera') {
    this._stopTimeout();
    this._stopUnknownActive();
    this.detector?.stop();
    this._resetCameraBackHotzone();
    this._resetCameraHandCursor?.();
  }

  if (name === 'landing') {
    // Cancel any pending landing→group1 or group1→scenario timers
    clearTimeout(this._landingToGroupTimer);
    clearTimeout(this._group1ToScenarioTimer);
    this._landingToGroupTimer = null;
    this._group1ToScenarioTimer = null;

    // Restart robot background video from beginning every time we return to landing
    const bgVid = document.querySelector('.landing-bg-video');
    if (bgVid) {
      bgVid.pause();
      bgVid.currentTime = 0;
      bgVid.play().catch(() => {});
    }

    if (typeof initLandingIntro === 'function') {
      initLandingIntro(true);
    }
  }
}

_updateCameraBackHotzone(lm) {
  this._cameraLastLandmarks = lm;

  const backBtn = document.querySelector('#page-camera .btn-back');
  if (!backBtn || !this.pages.camera?.classList.contains('active')) return;

  const clearState = () => {
    this._cameraBackHovering = false;
    this._cameraBackFistLatched = false;
    backBtn.classList.remove('camera-hot-hover');
  };

  if (!lm) {
    clearState();
    return;
  }

  const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);

  const fingerExtended = (tip, pip, wrist = 0) => {
    return dist(lm[tip], lm[wrist]) > dist(lm[pip], lm[wrist]) * 1.10;
  };

  const countExtendedFingers = () => {
    let count = 0;
    if (fingerExtended(8, 6)) count++;
    if (fingerExtended(12, 10)) count++;
    if (fingerExtended(16, 14)) count++;
    if (fingerExtended(20, 18)) count++;
    if (dist(lm[4], lm[0]) > dist(lm[3], lm[0]) * 1.04) count++;
    return count;
  };

  const extendedCount = countExtendedFingers();
  const isFist = extendedCount <= 1;
  const isHoverPose = extendedCount >= 3; 
  // 也可以换成 >= 4，更严格一点

  const ids = [0, 5, 9, 13, 17];
  let x = 0, y = 0;
  ids.forEach(i => {
    x += lm[i].x;
    y += lm[i].y;
  });

  const rawX = 1 - x / ids.length;
  const rawY = y / ids.length;

  const clamp = (v, min, max) => Math.min(max, Math.max(min, v));

  const mappedX = clamp((rawX - 0.05) / 0.50, 0, 1);
  const mappedY = clamp((rawY - 0.02) / 0.46, 0, 1);

  const centerX = mappedX * window.innerWidth;
  const centerY = mappedY * window.innerHeight;

  const rect = backBtn.getBoundingClientRect();

  const expanded = {
  left: rect.left - 560,
  right: rect.right + 300,
  top: rect.top - 300,
  bottom: rect.bottom + 300,
};

  const hit =
    centerX >= expanded.left &&
    centerX <= expanded.right &&
    centerY >= expanded.top &&
    centerY <= expanded.bottom;

  if (!hit) {
    clearState();
    return;
  }

  // 第一步：只有“悬停姿态”进入时才高亮
  if (isHoverPose) {
    this._cameraBackHovering = true;
    this._cameraBackFistLatched = false;
    backBtn.classList.add('camera-hot-hover');
    return;
  }

  // 第二步：必须先 hover 过，再握拳才触发
  if (isFist) {
    if (
      this._cameraBackHovering &&
      !this._cameraBackFistLatched &&
      Date.now() >= this._cameraBackCooldownUntil
    ) {
      this._cameraBackFistLatched = true;
      this._cameraBackCooldownUntil = Date.now() + 1200;
      backBtn.click();
    }
    return;
  }

  // 其他姿态：保持当前 hover，不清掉也行；
  // 如果你想更严格，可以改成 clearState();
}

_resetCameraBackHotzone() {
  this._cameraBackHovering = false;
  this._cameraBackFistLatched = false;
  this._cameraBackCooldownUntil = 0;
  this._cameraLastLandmarks = null;

  const backBtn = document.querySelector('#page-camera .btn-back');
  if (backBtn) {
    backBtn.classList.remove('camera-hot-hover');
  }
}

_updateCameraHandCursor(lm) {
  const pointer = document.getElementById('camera-hand-pointer');
  const backBtn = document.querySelector('#page-camera .btn-back');

  if (!pointer || !backBtn || !this.pages.camera?.classList.contains('active')) {
    return;
  }

  const hidePointer = () => {
    pointer.style.display = 'none';
    pointer.classList.remove('hovering-target');
    backBtn.classList.remove('camera-gesture-hover');
    this._cameraHoveredBtn = null;
    this._cameraFistLatched = false;
  };

  if (!lm) {
    hidePointer();
    return;
  }

  const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
  const fingerExtended = (lm, tip, pip, wrist = 0) => dist(lm[tip], lm[wrist]) > dist(lm[pip], lm[wrist]) * 1.15;
  const countExtendedFingers = (lm) => {
    let count = 0;
    if (fingerExtended(lm, 8, 6)) count++;
    if (fingerExtended(lm, 12, 10)) count++;
    if (fingerExtended(lm, 16, 14)) count++;
    if (fingerExtended(lm, 20, 18)) count++;
    if (dist(lm[4], lm[0]) > dist(lm[3], lm[0]) * 1.08) count++;
    return count;
  };

  const extendedCount = countExtendedFingers(lm);
  const isOpenPalm = extendedCount >= 4;
  const isFist = extendedCount <= 2;

  const ids = [0, 5, 9, 13, 17];
  let x = 0, y = 0;
  ids.forEach(i => {
    x += lm[i].x;
    y += lm[i].y;
  });
  const center = { x: x / ids.length, y: y / ids.length };

  const clamp = (v, min, max) => Math.min(max, Math.max(min, v));

  const rawX = 1 - center.x;
  const rawY = center.y;

  // 直接沿用 page1 的映射思路，让左上角更容易到达
  const mappedX = clamp((rawX - 0.10) / 0.68, 0, 1);
  const mappedY = clamp((rawY - 0.05) / 0.62, 0, 1);

  const screenX = mappedX * window.innerWidth;
  const screenY = mappedY * window.innerHeight;


  pointer.style.display = 'block';
  pointer.style.left = `${screenX}px`;
  pointer.style.top = `${screenY}px`;

  const rect = backBtn.getBoundingClientRect();
  const expanded = {
    left: rect.left - 260,
    right: rect.right + 220,
    top: rect.top - 160,
    bottom: rect.bottom + 140,
  };

  const hit =
    screenX >= expanded.left &&
    screenX <= expanded.right &&
    screenY >= expanded.top &&
    screenY <= expanded.bottom;

  pointer.classList.toggle('hovering-target', hit);
  backBtn.classList.toggle('camera-gesture-hover', hit);

  if (isOpenPalm) {
    this._cameraHoveredBtn = hit ? backBtn : null;
    this._cameraFistLatched = false;
    return;
  }

  if (isFist) {
    if (!this._cameraFistLatched && this._cameraHoveredBtn) {
      this._cameraFistLatched = true;
      this._cameraHoveredBtn.click();
    }
    return;
  }

  this._cameraFistLatched = false;
}

_resetCameraHandCursor() {
  const pointer = document.getElementById('camera-hand-pointer');
  const backBtn = document.querySelector('#page-camera .btn-back');

  if (pointer) {
    pointer.style.display = 'none';
    pointer.classList.remove('hovering-target');
  }

  if (backBtn) {
    backBtn.classList.remove('camera-gesture-hover');
  }

  this._cameraHoveredBtn = null;
  this._cameraFistLatched = false;
}

// ── Unified cleanup: called before every page switch ───────────────────────
cleanupAllPageInteractions() {
  // Stop all per-page hand tracking
  this._stopResultHandTracking?.();
  this._stopTimeoutPageHandTracking?.();
  this._stopFallbackPageHandTracking?.();

  // Reset camera cursor state
  this._resetCameraHandCursor?.();

  // Hide every hand-pointer overlay
  ['camera-hand-pointer', 'result-hand-pointer', 'timeout-hand-pointer', 'fallback-hand-pointer'].forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.style.display = 'none';
      el.classList.remove('hovering-target', 'hovering-center');
    }
  });

  // Clear all hover / active classes left on buttons
  document.querySelectorAll('.timeout-gesture-hover').forEach(el => el.classList.remove('timeout-gesture-hover'));
  document.querySelectorAll('.arc-nav-btn-active').forEach(el => el.classList.remove('arc-nav-btn-active'));
  document.querySelectorAll('.camera-gesture-hover').forEach(el => el.classList.remove('camera-gesture-hover'));
  document.querySelectorAll('.camera-hot-hover').forEach(el => el.classList.remove('camera-hot-hover'));
}

  // ── Public nav methods ──────────────────────────────────────────────────
  async showHome() {
    await this.resetArduinoHand();

    if (typeof stopGesture === 'function') {
      await Promise.resolve(stopGesture()).catch(() => {});
    }

    await this._showPage('landing');
    this.currentScene = null;
    location.hash = 'landing';
  }

  // ── Single entry point called by landing on consent ────────────────────
  enterFromLanding() {
    // Cancel any stale in-flight timers from a previous landing visit
    clearTimeout(this._landingToGroupTimer);
    clearTimeout(this._group1ToScenarioTimer);
    this._landingToGroupTimer = null;
    this._group1ToScenarioTimer = null;

    // Go to group1 via the unified router (handles all cleanup)
    this._showPage('group1');

    // After 2 s, hand off to showScenario via the unified router
    this._group1ToScenarioTimer = setTimeout(() => {
      this._group1ToScenarioTimer = null;
      this.showScenario();
    }, 2000);
  }

  async showScenario() {
    await this.resetArduinoHand();

    // Stop all residual page state from other pages
    this._stopTimeout();
    this._stopUnknownActive();
    this._stopTimeoutPageHandTracking();
    this._stopResultHandTracking();
    this._clearResultIdleTimer?.();

    if (this._resultTransitionTimer) {
      clearTimeout(this._resultTransitionTimer);
      this._resultTransitionTimer = null;
    }
    if (this._resultInitTimer) {
      clearTimeout(this._resultInitTimer);
      this._resultInitTimer = null;
    }

    // Cancel any typewriter still running from a previous visit
    if (this._scenarioCancelTypewriter) {
      this._scenarioCancelTypewriter();
      this._scenarioCancelTypewriter = null;
    }

    // ── Step 1: choose one random scenario (weighted) ───────────────────────
    const totalWeight = SCENES.reduce((s, sc) => s + (sc.weight ?? 1), 0);
    let pick = Math.random() * totalWeight;
    this.currentScene = SCENES.find(sc => (pick -= (sc.weight ?? 1)) <= 0) ?? SCENES[0];
    const scene = this.currentScene;

    // ── Step 2: reset DOM state ──────────────────────────────────────────────
    const textEl = document.getElementById('scenario-random-text');
    if (textEl) textEl.textContent = '';

    const vid = document.getElementById('scenario-video');
    if (vid) {
      // Remove any stale event listeners before re-attaching
      if (this._scenarioTimeHandler) {
        vid.removeEventListener('timeupdate', this._scenarioTimeHandler);
        this._scenarioTimeHandler = null;
      }
      if (this._scenarioEndHandler) {
        vid.removeEventListener('ended', this._scenarioEndHandler);
        this._scenarioEndHandler = null;
      }
      vid.pause();
      vid.src = 'video/card_select.mp4';
      vid.currentTime = 0;
    }

    await this._showPage('scenario');

    if (!vid) return;

    // ── State flags for this entry (local, never shared across entries) ───────
    let typingStarted      = false;
    let scenarioVideoEnded = false;
    let scenarioTypingDone = false;
    let transitionDone     = false;

    // ── Helper: advance to camera only when BOTH conditions are met ──────────
    const maybeAdvanceToCamera = () => {
      if (scenarioVideoEnded && scenarioTypingDone && !transitionDone) {
        transitionDone = true;
        this.startCamera();
      }
    };

    // ── Helper: start typewriter, wired to maybeAdvanceToCamera on completion ─
    const beginTypewriter = () => {
      if (!textEl) return;
      this._scenarioCancelTypewriter = startScenarioTypewriter(
        textEl,
        scene.text,
        20,
        () => {
          scenarioTypingDone = true;
          maybeAdvanceToCamera();
        }
      );
    };

    // ── Step 3: start typewriter at 3 s via timeupdate ───────────────────────
    this._scenarioTimeHandler = () => {
      if (!typingStarted && vid.currentTime >= 3.0) {
        typingStarted = true;
        vid.removeEventListener('timeupdate', this._scenarioTimeHandler);
        this._scenarioTimeHandler = null;
        beginTypewriter();
      }
    };

    // ── Step 4: on video end — freeze last frame, do NOT jump to camera yet ──
    this._scenarioEndHandler = () => {
      vid.removeEventListener('timeupdate', this._scenarioTimeHandler);
      vid.removeEventListener('ended',      this._scenarioEndHandler);
      this._scenarioTimeHandler = null;
      this._scenarioEndHandler  = null;

      // Video is now paused on its last frame automatically.
      // If typing hadn't started yet (video shorter than 3 s), start it now.
      if (!typingStarted) {
        typingStarted = true;
        beginTypewriter();
      }

      scenarioVideoEnded = true;
      maybeAdvanceToCamera(); // only proceeds if typing is also done
    };

    vid.addEventListener('timeupdate', this._scenarioTimeHandler);
    vid.addEventListener('ended',      this._scenarioEndHandler);

    // Edge case: video position already past 3 s on re-entry
    if (vid.currentTime >= 3.0 && !typingStarted) {
      typingStarted = true;
      beginTypewriter();
    }

    // ── Step 5: play video ───────────────────────────────────────────────────
    try {
      await vid.play();
    } catch (e) {
      console.warn('Scenario video play failed:', e);
      // Video can't play — start typing immediately and treat as video-ended
      // so the flow doesn't hang.
      if (!typingStarted) {
        typingStarted = true;
        beginTypewriter();
      }
      scenarioVideoEnded = true;
      maybeAdvanceToCamera();
    }
  }

  setCurrentScene(scene) {
    this.currentScene = scene;
    console.log('currentScene =', this.currentScene);
  }

  //Add New
async goBack() {
  await this.resetArduinoHand();

  // page2 -> page1
  if (this.pages.camera.classList.contains('active')) {
    return this.showScenario();
  }

  // result -> page1
  if (this.pages.result.classList.contains('active')) {
    return this.showScenario();
  }

  // timeout -> page2
  if (this.pages.timeout?.classList.contains('active')) {
    return this.startCamera();
  }

  // fallback -> page2
  if (this.pages.fallback.classList.contains('active')) {
    return this.startCamera();
  }

  // page1 -> landing
  if (this.pages.scenario.classList.contains('active')) {
    return this.showHome();
  }

  this.showScenario();
}

  // ── Scenario page ────────────────────────────────────────────────────────
  _initScenarioPage() {
    // Scene is now assigned dynamically in showScenario(); nothing to init here.
  }

  // ── Camera ───────────────────────────────────────────────────────────────
  async startCamera() {
  if (!this.currentScene) {
    // Fallback: auto-assign a random scene (weighted) if somehow unset
    const totalWeight = SCENES.reduce((s, sc) => s + (sc.weight ?? 1), 0);
    let pick = Math.random() * totalWeight;
    this.currentScene = SCENES.find(sc => (pick -= (sc.weight ?? 1)) <= 0) ?? SCENES[0];
  }

  await this.resetArduinoHand();

  await this._showPage('camera');
  this._timeoutMode = null;
  this._resetDetectUI();
  this._setRing(0);

  const miniText = document.getElementById('mini-text');
  if (miniText) {
    miniText.textContent = this.currentScene?.text || '';
  }

  this.renderSceneGestures();

  if (!this.detector) {
    this.detector = new GestureDetector({
      onGesture:        ()        => {},
      onStatus:         (s, g, p) => this._onStatus(s, g, p),
      onReadyToConfirm: g         => this._onGestureConfirmed(g),
      onLandmarks: (lm) => {
        this._cameraLastLandmarks = lm;
        this._updateCameraHandCursor(lm);
      },
    });
    try {
      await this.detector.init(
        document.getElementById('webcam'),
        document.getElementById('overlay'),
      );
    } catch (e) {
      console.error('MediaPipe init failed', e);
      this._setCamError();
      return;
    }
  }

  const allowed = this.currentScene?.gestures || [];
  this.detector.setAllowedGestures(allowed);

  try {
    await this.detector.start();
  } catch (e) {
    console.error('Camera start failed', e);
    this._setCamError();
  }
}

  triggerManual(gesture) {
    this._onGestureConfirmed(gesture);
  }

  exploreGesture(gesture) {
  this.currentGesture = gesture;

  if (this._resultTransitionTimer) {
    clearTimeout(this._resultTransitionTimer);
    this._resultTransitionTimer = null;
  }
  if (this._resultInitTimer) {
    clearTimeout(this._resultInitTimer);
    this._resultInitTimer = null;
  }

  this._buildResultPage();
  this._showPage('result');

  this._resultInitTimer = setTimeout(() => {
    if (!this.pages.result?.classList.contains('active')) return;
    this._initResultMap();
    this._startResultAutoplay();
    this._resultInitTimer = null;
  }, 300);
}

  // ── Detection status ─────────────────────────────────────────────────────
  _onStatus(state, gesture, progress = 0) {
  const dot    = document.getElementById('cam-dot');
  const text   = document.getElementById('cam-text');
  const vp     = document.getElementById('cam-viewport');
  const ringEl = document.getElementById('ring-fill');

  vp.className  = 'cam-viewport';
  dot.className = 'cam-dot';

  if (state === 'starting') {
    text.textContent = 'Initializing camera…';
    ringEl?.classList.remove('unknown', 'recognized');
    this._setRing(0);
    this._highlightGestureItem(null);
    this._setTimeoutMode('paused');

  } else if (state === 'ready') {
    dot.classList.add('ready');
    text.textContent = 'Waiting for gesture…';
    ringEl?.classList.remove('unknown', 'recognized');
    this._setRing(0);
    this._highlightGestureItem(null);
    this._setDetectEmoji('image_newest/open palm.PNG', 'Waiting…', 'Show one of these gestures:', true);

    // 关闭 unknown 倒计时 UI
    this._stopUnknownActive();
    document.getElementById('unk-countdown')?.classList.remove('active');

    // 开启“没检测到手”的 timeout 倒计时
    this._setTimeoutMode('ready');

  } else if (state === 'detecting' && gesture) {
    dot.classList.add('detecting');
    vp.classList.add('state-detecting');
    text.textContent = 'Recognising…';

    const sceneKeys = this.currentScene?.gestures || [];
    const sceneNames = sceneKeys
      .map(k => GESTURE_META[k]?.name)
      .filter(Boolean)
      .join(' / ');

    if (gesture === 'unknown') {
      ringEl?.classList.remove('recognized');
      ringEl?.classList.add('unknown');
      this._setDetectEmoji('image/unknown-hand.png', 'Unknown gesture', 'New gestures are being recording', true);
      this._highlightGestureItem(null);

      // 开启 unknown 状态
      this._ensureUnknownActive();
      document.getElementById('unk-countdown')?.classList.add('active');

      // 暂停“没手”的 timeout 倒计时
      this._setTimeoutMode('paused');

      const UNKNOWN_HOLD_SECONDS = 25;
      const secsLeft = Math.max(0, Math.ceil(UNKNOWN_HOLD_SECONDS * (1 - progress)));

      const secsEl = document.getElementById('unk-secs-num');
      if (secsEl) secsEl.textContent = secsLeft;

      const barFill = document.getElementById('unk-bar-fill');
      if (barFill) barFill.style.width = `${progress * 100}%`;

      this._setRing(progress);
      return;
    }

    // Known gesture — stop unknown state
    this._stopUnknownActive();
    document.getElementById('unk-countdown')?.classList.remove('active'); 
    this._setTimeoutMode('paused');
    ringEl?.classList.remove('unknown');
    ringEl?.classList.add('recognized');

    const info = GESTURE_META[gesture];
    if (info) {
      const secsLeft = Math.max(0, Math.ceil(4 * (1 - progress)));
      const holdDesc = secsLeft > 0
        ? `Hold for ${secsLeft} more second${secsLeft !== 1 ? 's' : ''}…`
        : 'Confirming…';

      this._setDetectEmoji(info.image, `Detected: ${info.name}`, holdDesc, true);
      this._setRing(progress);
      this._highlightGestureItem(gesture);
    } else {
      this._setDetectEmoji('image/unknown-hand.png', 'Unknown gesture', 'New gestures are being recording', true);
      this._setRing(0);
      this._highlightGestureItem(null);
    }
  }
}

  // ── Gesture confirmed ────────────────────────────────────────────────────
async _onGestureConfirmed(gesture) {
  this._stopTimeout();
  this.detector?.stop();

  if (gesture === 'unknown') {
    try {
      if (window.serialManager?.isConnected) {
        await window.serialManager.writeText('u');
        console.log('Sent u to Arduino');
      } else {
        console.warn('Serial not connected');
      }
    } catch (err) {
      console.error('Failed to send u:', err);
    }

    this._saveUnknownGestureRecord();   // 新增：先存数据库
    this._showFallback();
    return;
  }

  if (!GESTURE_DATA[gesture]) {
    this._showFallback();
    return;
  }

  // Confirmed a supported gesture
  const vp  = document.getElementById('cam-viewport');
  const dot = document.getElementById('cam-dot');
  if (vp)  { vp.classList.remove('state-detecting'); vp.classList.add('state-confirmed'); }
  if (dot) dot.className = 'cam-dot confirmed';
  const camText = document.getElementById('cam-text');
  if (camText) camText.textContent = 'Gesture recognised!';

  const info = GESTURE_META[gesture];
  this._setDetectEmoji(info.image, `Recognised: ${info.name}`, 'Loading results…', true);
  this._setRing(1);
  this._fireConfetti();

  this.currentGesture = gesture;
  this._sendGestureToArduino(gesture);

  if (this._resultTransitionTimer) {
  clearTimeout(this._resultTransitionTimer);
  this._resultTransitionTimer = null;
}
if (this._resultInitTimer) {
  clearTimeout(this._resultInitTimer);
  this._resultInitTimer = null;
}

this._resultTransitionTimer = setTimeout(() => {
  // 如果这时已经不在 camera 状态链，就不要再跳 result
  if (!this.pages.camera?.classList.contains('active')) return;

  this._buildResultPage();

  const flash = document.getElementById('flash');
  flash?.classList.add('show');
  setTimeout(() => flash?.classList.remove('show'), 800);

  this._showPage('result');

  this._resultInitTimer = setTimeout(() => {
    if (!this.pages.result?.classList.contains('active')) return;
    this._initResultMap();
    this._startResultAutoplay();
    this._resultInitTimer = null;
  }, 360);

  this._resultTransitionTimer = null;
}, 900);
}

// ── Timeout page ───────────────────────────────────────────────────────────
_showTimeoutPage() {
  // 只有当前还在 camera 页，才允许真的切去 timeout
  if (!this.pages.camera?.classList.contains('active')) return;

  this.detector?.stop();
  this._stopTimeout();
  this._stopUnknownActive();
  this._stopTimeoutPageHandTracking();
  this._renderTimeoutPage();
  this._showPage('timeout');
  this._setupTimeoutPageInteraction();

  // 双保险：timeout 页停留 15s 无操作 → 返回首页
  this._timeoutPageIdleTimer = setTimeout(() => {
    if (this.pages.timeout?.classList.contains('active')) {
      this._stopTimeoutPageHandTracking();
      this.showHome();
    }
  }, 15000);
}

_renderTimeoutPage() {
  const wrap = document.getElementById('timeout-gesture-grid');
  const retryBtn = document.getElementById('timeout-try-again-btn');

  if (!wrap) return;

  // 重新绑定 Try Again
  if (retryBtn) {
    retryBtn.onclick = async () => {
      this._stopTimeoutPageHandTracking();
      await this.startCamera();
    };
  }

  wrap.innerHTML = '';
  const gestures = this.currentScene?.gestures || [];

  gestures.forEach((key, idx) => {
    const meta = GESTURE_META[key];
    if (!meta) return;

    const num = String(idx + 1).padStart(2, '0');
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'timeout-gesture-card';
    btn.dataset.gesture = key;
    btn.innerHTML = `
      <div class="timeout-card-num">${num}</div>
      <div class="timeout-card-icon-wrap">
        <img src="${meta.image}" class="timeout-card-icon" alt="${meta.name}">
      </div>
      <div class="timeout-card-name">${meta.name}</div>
      <div class="timeout-card-cta">Explore →</div>
    `;

    btn.onclick = () => {
      this._stopTimeoutPageHandTracking();
      this.exploreGesture(key);
    };

    wrap.appendChild(btn);
  });
}

_setupTimeoutPageInteraction() {
  this._stopTimeoutPageHandTracking();

  const video = document.getElementById('timeout-video');
  const pointer = document.getElementById('timeout-hand-pointer');
  const hint = document.getElementById('timeout-hand-hint');
  if (!video || !pointer || typeof Hands === 'undefined' || typeof Camera === 'undefined') {
    if (hint) hint.textContent = 'Hand tracking unavailable';
    return;
  }

  let hoveredTarget = null;
  let fistLatched = false;

  const setHint = (text) => {
    if (hint) hint.textContent = text;
  };

  const showPointer = (x, y, active = false) => {
    pointer.style.display = 'block';
    pointer.style.left = `${x}px`;
    pointer.style.top = `${y}px`;
    pointer.classList.toggle('hovering-target', active);
  };

  const hidePointer = () => {
    pointer.style.display = 'none';
    pointer.classList.remove('hovering-target');
  };

  const clearHoveredTarget = () => {
    if (hoveredTarget) hoveredTarget.classList.remove('timeout-gesture-hover');
    hoveredTarget = null;
  };

  const setHoveredTarget = (el) => {
    if (hoveredTarget === el) return;
    if (hoveredTarget) hoveredTarget.classList.remove('timeout-gesture-hover');
    hoveredTarget = el || null;
    if (hoveredTarget) hoveredTarget.classList.add('timeout-gesture-hover');
  };

  const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
  const fingerExtended = (lm, tip, pip, wrist = 0) => dist(lm[tip], lm[wrist]) > dist(lm[pip], lm[wrist]) * 1.15;
  const countExtendedFingers = (lm) => {
    let count = 0;
    if (fingerExtended(lm, 8, 6)) count++;
    if (fingerExtended(lm, 12, 10)) count++;
    if (fingerExtended(lm, 16, 14)) count++;
    if (fingerExtended(lm, 20, 18)) count++;
    if (dist(lm[4], lm[0]) > dist(lm[3], lm[0]) * 1.08) count++;
    return count;
  };
  const isOpenPalm = (lm) => countExtendedFingers(lm) >= 4;
  const isFist = (lm) => countExtendedFingers(lm) <= 2;
  const getPalmCenter = (lm) => {
    const ids = [0, 5, 9, 13, 17];
    let x = 0, y = 0;
    ids.forEach(i => { x += lm[i].x; y += lm[i].y; });
    return { x: x / ids.length, y: y / ids.length };
  };

  const findTarget = (x, y) => {
    const pointInRect = (x, y, rect) =>
      x >= rect.left && x <= rect.right &&
      y >= rect.top && y <= rect.bottom;

    const expandRect = (rect, padX, padY) => ({
      left: rect.left - padX,
      right: rect.right + padX,
      top: rect.top - padY,
      bottom: rect.bottom + padY,
    });

    const tryAgainBtn = document.getElementById('timeout-try-again-btn');
    if (tryAgainBtn) {
      const rect = expandRect(tryAgainBtn.getBoundingClientRect(), 320, 180);
      if (pointInRect(x, y, rect)) return tryAgainBtn;
    }

    const cards = Array.from(
      document.querySelectorAll('#timeout-gesture-grid .timeout-gesture-card')
    );

    for (const el of cards) {
      const rect = expandRect(el.getBoundingClientRect(), 24, 24);
      if (pointInRect(x, y, rect)) return el;
    }

    return null;
  };

  const hands = new Hands({
    locateFile: f => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${f}`,
  });
  hands.setOptions({
    maxNumHands: 1,
    modelComplexity: 0,
    minDetectionConfidence: 0.65,
    minTrackingConfidence: 0.55,
  });

  hands.onResults((results) => {
    if (!results.multiHandLandmarks?.length) {
      hidePointer();
      clearHoveredTarget();
      fistLatched = false;
      setHint('Open palm to move');
      return;
    }

    const lm = results.multiHandLandmarks[0];
    const center = getPalmCenter(lm);
    const screenX = (1 - center.x) * window.innerWidth;
    const screenY = center.y * window.innerHeight;
    const target = findTarget(screenX, screenY);
    showPointer(screenX, screenY, !!target);

    if (isOpenPalm(lm)) {
      setHoveredTarget(target);
      fistLatched = false;
      setHint('Close hand to select');
      return;
    }

    if (isFist(lm)) {
      if (!fistLatched && hoveredTarget) {
        fistLatched = true;
        hoveredTarget.click();
        setHint('Action confirmed');
      } else if (!hoveredTarget) {
        setHint('Move over a gesture first');
      }
      return;
    }

    fistLatched = false;
    setHint('Open palm to move');
  });

  this._timeoutHandsCamera = new Camera(video, {
    onFrame: async () => { await hands.send({ image: video }); },
    width: 320,
    height: 240,
  });

  this._timeoutHandsCamera.start()
    .then(() => setHint('Open palm to move'))
    .catch((e) => {
      console.warn('Timeout page hand detection unavailable:', e);
      setHint('Hand tracking unavailable');
    });

  this._timeoutHandsObj = hands;
}

_stopTimeoutPageHandTracking() {
  clearTimeout(this._timeoutPageIdleTimer);
  this._timeoutPageIdleTimer = null;
  try { this._timeoutHandsCamera?.stop?.(); } catch (_) {}
  this._timeoutHandsCamera = null;
  this._timeoutHandsObj = null;

  const pointer = document.getElementById('timeout-hand-pointer');
  if (pointer) {
    pointer.style.display = 'none';
    pointer.classList.remove('hovering-target');
  }

  document.querySelectorAll('.timeout-gesture-hover').forEach((el) => {
    el.classList.remove('timeout-gesture-hover');
  });
}

_setupFallbackPageInteraction() {
  this._stopFallbackPageHandTracking();

  const video = document.getElementById('fallback-video');
  const pointer = document.getElementById('fallback-hand-pointer');
  const restartBtn = document.querySelector('#page-fallback .arc-nav-btn');

  if (!video || !pointer || !restartBtn || typeof Hands === 'undefined' || typeof Camera === 'undefined') {
    return;
  }

  let hoveredBtn = null;
  let fistLatched = false;

  const showPointer = (x, y, active = false) => {
    pointer.style.display = 'block';
    pointer.style.left = `${x}px`;
    pointer.style.top = `${y}px`;
    pointer.classList.toggle('hovering-target', active);
  };

  const hidePointer = () => {
    pointer.style.display = 'none';
    pointer.classList.remove('hovering-target');
  };

  const clearHoveredBtn = () => {
    if (hoveredBtn) hoveredBtn.classList.remove('arc-nav-btn-active');
    hoveredBtn = null;
  };

  const setHoveredBtn = (el) => {
    if (hoveredBtn === el) return;
    if (hoveredBtn) hoveredBtn.classList.remove('arc-nav-btn-active');
    hoveredBtn = el || null;
    if (hoveredBtn) hoveredBtn.classList.add('arc-nav-btn-active');
  };

  const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
  const fingerExtended = (lm, tip, pip, wrist = 0) =>
    dist(lm[tip], lm[wrist]) > dist(lm[pip], lm[wrist]) * 1.15;

  const countExtendedFingers = (lm) => {
    let count = 0;
    if (fingerExtended(lm, 8, 6)) count++;
    if (fingerExtended(lm, 12, 10)) count++;
    if (fingerExtended(lm, 16, 14)) count++;
    if (fingerExtended(lm, 20, 18)) count++;
    if (dist(lm[4], lm[0]) > dist(lm[3], lm[0]) * 1.08) count++;
    return count;
  };

  const isOpenPalm = (lm) => countExtendedFingers(lm) >= 4;
  const isFist = (lm) => countExtendedFingers(lm) <= 2;

  const getPalmCenter = (lm) => {
    const ids = [0, 5, 9, 13, 17];
    let x = 0, y = 0;
    ids.forEach(i => {
      x += lm[i].x;
      y += lm[i].y;
    });
    return { x: x / ids.length, y: y / ids.length };
  };

  const findTarget = (x, y) => {
    const rect = restartBtn.getBoundingClientRect();
    const expanded = {
      left: rect.left - 220,
      right: rect.right + 120,
      top: rect.top - 140,
      bottom: rect.bottom + 100,
    };

    const hit =
      x >= expanded.left &&
      x <= expanded.right &&
      y >= expanded.top &&
      y <= expanded.bottom;

    return hit ? restartBtn : null;
  };

  const hands = new Hands({
    locateFile: f => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${f}`,
  });

  hands.setOptions({
    maxNumHands: 1,
    modelComplexity: 0,
    minDetectionConfidence: 0.65,
    minTrackingConfidence: 0.55,
  });

  hands.onResults((results) => {
    if (!results.multiHandLandmarks?.length) {
      hidePointer();
      clearHoveredBtn();
      fistLatched = false;
      return;
    }

    const lm = results.multiHandLandmarks[0];
    const center = getPalmCenter(lm);
    const screenX = (1 - center.x) * window.innerWidth;
    const screenY = center.y * window.innerHeight;
    const target = findTarget(screenX, screenY);

    showPointer(screenX, screenY, !!target);

    if (isOpenPalm(lm)) {
      setHoveredBtn(target);
      fistLatched = false;
      return;
    }

    if (isFist(lm)) {
      if (!fistLatched && hoveredBtn) {
        fistLatched = true;
        hoveredBtn.click();
      }
      return;
    }

    fistLatched = false;
  });

  this._fallbackHandsCamera = new Camera(video, {
    onFrame: async () => { await hands.send({ image: video }); },
    width: 320,
    height: 240,
  });

  this._fallbackHandsCamera.start().catch((e) => {
    console.warn('Fallback page hand detection unavailable:', e);
  });

  this._fallbackHandsObj = hands;
}

_stopFallbackPageHandTracking() {
  try { this._fallbackHandsCamera?.stop?.(); } catch (_) {}
  this._fallbackHandsCamera = null;
  this._fallbackHandsObj = null;

  const pointer = document.getElementById('fallback-hand-pointer');
  if (pointer) {
    pointer.style.display = 'none';
    pointer.classList.remove('hovering-target');
  }

  document.querySelectorAll('.arc-nav-btn-active').forEach((el) => {
    el.classList.remove('arc-nav-btn-active');
  });
}


  // ── Unknown Gesture Archive (redesigned fallback) ─────────────────────────
  _showFallback() {
  // 只有当前还在 camera 页，才允许真的切去 fallback
  if (!this.pages.camera?.classList.contains('active')) return;

  window.lastUnknownLandmarks =
    this.detector?.lastLandmarks ||
    this._cameraLastLandmarks ||
    null;

  this._showPage('fallback');
  this._initArchivePage();
  this._setupFallbackPageInteraction();
}

  _initArchivePage() {
  const latest = this._latestUnknownRecord || null;

  const timeEl = document.getElementById('archive-meta-time');
  if (timeEl) {
    timeEl.textContent = latest?.time || '—';
  }

  const entryEl = document.getElementById('archive-meta-entry');
  if (entryEl) {
    entryEl.textContent = latest?.Entry || '#000';
  }

  requestAnimationFrame(() => {
    this._drawArchiveSkeleton(window.lastUnknownLandmarks);
  });

  this._revealArchiveLines();
}

  _drawArchiveSkeleton(landmarks) {
    const canvas = document.getElementById('archive-skeleton-canvas');
    if (!canvas) return;

    const w = canvas.offsetWidth  || 300;
    const h = canvas.offsetHeight || 200;
    canvas.width  = w;
    canvas.height = h;

    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, w, h);

    if (!landmarks || landmarks.length < 21) {
      ctx.font = `11px 'Space Grotesk', sans-serif`;
      ctx.fillStyle = '#c4c0b8';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('No landmark data captured', w / 2, h / 2);
      return;
    }

    // Standard MediaPipe hand connections
    const CONNECTIONS = [
      [0,1],[1,2],[2,3],[3,4],
      [0,5],[5,6],[6,7],[7,8],
      [5,9],[9,10],[10,11],[11,12],
      [9,13],[13,14],[14,15],[15,16],
      [13,17],[17,18],[18,19],[19,20],
      [0,17]
    ];

    // Compute bounding box for the hand
    let minX = 1, maxX = 0, minY = 1, maxY = 0;
    landmarks.forEach(pt => {
      if (pt.x < minX) minX = pt.x;
      if (pt.x > maxX) maxX = pt.x;
      if (pt.y < minY) minY = pt.y;
      if (pt.y > maxY) maxY = pt.y;
    });
    const rangeX = (maxX - minX) || 1;
    const rangeY = (maxY - minY) || 1;

    // Uniform "contain" scale — preserves the hand's natural aspect ratio,
    // no horizontal or vertical stretching, centred with padding on all sides.
    const pad   = 0.14;
    const drawW = w * (1 - 2 * pad);
    const drawH = h * (1 - 2 * pad);
    const scale = Math.min(drawW / rangeX, drawH / rangeY);
    const handW = rangeX * scale;
    const handH = rangeY * scale;
    const originX = (w - handW) / 2 - minX * scale;
    const originY = (h - handH) / 2 - minY * scale;
    const toX = x => originX + x * scale;
    const toY = y => originY + y * scale;

    // Draw connection lines
    ctx.strokeStyle = '#a09c94';
    ctx.lineWidth   = 1.4;
    ctx.lineCap     = 'round';
    ctx.lineJoin    = 'round';
    CONNECTIONS.forEach(([a, b]) => {
      ctx.beginPath();
      ctx.moveTo(toX(landmarks[a].x), toY(landmarks[a].y));
      ctx.lineTo(toX(landmarks[b].x), toY(landmarks[b].y));
      ctx.stroke();
    });

    // Draw landmark points
    const TIPS   = new Set([4, 8, 12, 16, 20]);
    landmarks.forEach((pt, i) => {
      const x = toX(pt.x);
      const y = toY(pt.y);
      const r = TIPS.has(i) ? 4 : i === 0 ? 3.5 : 2.2;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fillStyle = TIPS.has(i) ? '#5a5850' : '#8a8578';
      ctx.fill();
    });
  }

  _revealArchiveLines() {
    // Clear any running scroll timer from a previous visit to this page
    if (this._archiveScrollTimer) {
      clearTimeout(this._archiveScrollTimer);
      this._archiveScrollTimer = null;
    }

    const track = document.getElementById('archive-lines');
    if (!track) return;
    track.innerHTML = '';
    track.style.transform = '';

    // ── Text content ──────────────────────────────────────────────────
    // Each entry = one line. Keep sentences short so white-space:nowrap
    // keeps them on a single line at all font sizes.
    const LINES = [
      'I saw your gesture.',
      'I could not fully read it.',
      'I can recognise structure.',
      'I can compare it with data.',
      'But I cannot fully understand culture.',
      'Bodies carry meanings beyond my archive.',
      'Your gesture has been stored.',
      'I will continue learning.'
    ];

    // ── Constants (must match CSS values) ─────────────────────────────
    const SLOT_H     = 80;    // px  — height of each .archive-line slot
    const VIEWPORT_H = 480;   // px  — height of .arc-scroll-viewport (6 × 80px)
    const HOLD_MS    = 3000;  // ms  — pause on each line before advancing

    // ── Build line elements ───────────────────────────────────────────
    const lineEls = LINES.map(text => {
      const el = document.createElement('p');
      el.className = 'archive-line arc-far';
      el.textContent = text;
      track.appendChild(el);
      return el;
    });

    // ── Focus function: update classes + slide track ──────────────────
    const focusLine = (idx) => {
      lineEls.forEach((el, i) => {
        const d = Math.abs(i - idx);
        el.className = 'archive-line ' + (
          d === 0 ? 'arc-focus' :
          d === 1 ? 'arc-near'  :
                    'arc-far'
        );
      });
      // Translate the track so slot[idx] is centred in the viewport
      const slotCentre = idx * SLOT_H + SLOT_H / 2;
      track.style.transform = `translateY(${VIEWPORT_H / 2 - slotCentre}px)`;
    };

    // ── Sequential timer: advance one line at a time, then redirect home ─────
    let idx = 0;
    const step = () => {
      focusLine(idx);
      if (idx < LINES.length - 1) {
        idx++;
        this._archiveScrollTimer = setTimeout(step, HOLD_MS);
      } else {
        // Last line is now in focus — hold 2 s then return to landing
        this._archiveScrollTimer = setTimeout(() => this.showHome(), 2000);
      }
    };

    // Small initial delay so the page has finished painting before we start
    this._archiveScrollTimer = setTimeout(step, 480);
  }

  // ── Timeout logic ─────────────────────────────────────────────────────────
// ── Timeout logic ─────────────────────────────────────────────────────────
_startTimeout(reset = true) {
  // 关键：每次开启前先清掉旧的
  this._stopTimeout();

  if (reset) {
    this.timeoutRemaining = this.timeoutSeconds;
  }

  this._updateTimeoutUI();

  this.timeoutTimer = setInterval(() => {

  // ⭐第一层保护：一进来就检查页面
  if (!this.pages.camera?.classList.contains('active')) {
    this._stopTimeout();
    return;
  }

  this.timeoutRemaining--;
  this._updateTimeoutUI();

  if (this.timeoutRemaining <= 0) {

    // ⭐第二层保护（关键）：再次确认当前仍在 camera 页
    if (!this.pages.camera?.classList.contains('active')) {
      this._stopTimeout();
      return;
    }

    this._stopTimeout();
    this._showTimeoutPage();
  }

}, 1000);
}

_stopTimeout() {
  if (this.timeoutTimer) {
    clearInterval(this.timeoutTimer);
    this.timeoutTimer = null;
  }
}

_setTimeoutMode(mode) {
  if (this._timeoutMode === mode) return;
  this._timeoutMode = mode;

  if (mode === 'paused') {
    this._stopTimeout();
    return;
  }

  this._startTimeout();
}

  _ensureUnknownActive() {
    if (!this._unknownActive) {
      this._unknownActive = true;
      this._startGestureCycle();
    }
  }

  _stopUnknownActive() {
    if (this._unknownActive) {
      this._unknownActive = false;
      document.getElementById('unk-countdown')?.classList.remove('active');
      document.getElementById('ring-fill')?.classList.remove('unknown', 'recognized');
      this._setRing(0);
      this._stopGestureCycle();
    }
  }

  _startGestureCycle() {
    if (this._gestureCycleTimer) return;
    const keys = this.currentScene?.gestures || [];
    if (!keys.length) return;
    this._gestureCycleIndex = 0;

    const sceneNames = keys.map(k => GESTURE_META[k]?.name).filter(Boolean).join(' / ');
    const show = () => {
      const key  = keys[this._gestureCycleIndex % keys.length];
      const meta = GESTURE_META[key];
      if (meta) this._setDetectEmoji(meta.image, 'Unknown gesture', `Try: ${sceneNames}`, true);
      this._gestureCycleIndex++;
    };
    show();
    this._gestureCycleTimer = setInterval(show, 1200);
  }

  _stopGestureCycle() {
    if (this._gestureCycleTimer) {
      clearInterval(this._gestureCycleTimer);
      this._gestureCycleTimer = null;
    }
  }

  _updateUnknownUI() { /* now handled inline in _onStatus */ }

  async startFallbackDetection() {
    const scene = this.currentScene;
    if (!scene) return;

    const video  = document.getElementById('fallback-video');
    const canvas = document.getElementById('fallback-canvas');
    const dotEl  = document.getElementById('fallback-cam-dot');
    const textEl = document.getElementById('fallback-cam-text');
    if (!video || !canvas) return;

    if (textEl) textEl.textContent = 'Starting camera…';
    if (dotEl)  dotEl.className = 'fallback-cam-dot';

    if (!this.fallbackDetector) {
      this.fallbackDetector = new GestureDetector({
        onGesture: () => {},
        onStatus: (s, g, p = 0) => {
          const CIRC = 314.16; // 2π × 50

          // reset all card rings
          const resetRings = () => {
            document.querySelectorAll('.fb-card-ring-fill').forEach(el => {
              el.style.strokeDashoffset = CIRC;
              el.closest('.fb-gesture-card')?.classList.remove('fb-card-active');
            });
          };

          if (s === 'ready') {
            if (dotEl)  dotEl.className = 'fallback-cam-dot ready';
            if (textEl) textEl.textContent = 'Show one of these gestures…';
            resetRings();
          } else if (s === 'detecting' && g && g !== 'unknown') {
            if (dotEl)  dotEl.className = 'fallback-cam-dot detecting';
            if (textEl) textEl.textContent = 'Hold still…';
            resetRings();
            const fill = document.getElementById(`fb-card-ring-${g}`);
            if (fill) {
              fill.style.strokeDashoffset = CIRC * (1 - p);
              fill.closest('.fb-gesture-card')?.classList.add('fb-card-active');
            }
          } else if (s === 'detecting' && g === 'unknown') {
            if (dotEl)  dotEl.className = 'fallback-cam-dot';
            if (textEl) textEl.textContent = 'Show one of the gestures below…';
            resetRings();
          }
        },
        onReadyToConfirm: g => {
          this.fallbackDetector?.stop();
          this._onGestureConfirmed(g);
        },
      });
      try {
        await this.fallbackDetector.init(video, canvas);
      } catch (e) {
        console.error('Fallback detector init failed', e);
        if (textEl) textEl.textContent = 'Camera unavailable';
        return;
      }
    }

    this.fallbackDetector.setAllowedGestures(scene.gestures || []);
    try {
      await this.fallbackDetector.start();
    } catch (e) {
      console.error('Fallback camera start failed', e);
      if (textEl) textEl.textContent = 'Camera unavailable';
    }
  }

  _updateTimeoutUI() {
    const fill  = document.getElementById('timeout-fill');
    const count = document.getElementById('timeout-count');
    if (fill)  fill.style.width  = `${(this.timeoutRemaining / this.timeoutSeconds) * 100}%`;
    if (count) count.textContent = this.timeoutRemaining;
  }


  renderSceneGestures() {
    const scene = this.currentScene;
    if (!scene || !scene.gestures) return;

    const detectWrap = document.getElementById('detect-gestures');
    const fallbackWrap = document.getElementById('fallback-btns');
    const fallbackGrid = document.getElementById('fallback-gesture-grid');

    if (detectWrap) detectWrap.innerHTML = '';
    if (fallbackWrap) fallbackWrap.innerHTML = '';
    if (fallbackGrid) fallbackGrid.innerHTML = '';

    scene.gestures.forEach(key => {
      const meta = GESTURE_META[key];
      if (!meta) return;

      // page2：Detecting 下方 3 张图
      if (detectWrap) {
        const el = document.createElement('div');
        el.className = 'detect-gesture-item';
        el.dataset.key = key;
        el.innerHTML = `<img src="${meta.image}" alt="${meta.name}">`;
        detectWrap.appendChild(el);
      }

      // page2：Camera not working? 后面的按钮
      if (fallbackWrap) {
        const btn = document.createElement('button');
        btn.className = 'fallback-btn';
        btn.innerHTML = `
          <img src="${meta.image}" class="fallback-btn-icon" alt="${meta.name}">
          <span>${meta.name}</span>
        `;
        btn.onclick = () => this.triggerManual(key);
        fallbackWrap.appendChild(btn);
      }

      // page4：fallback 页 3 张卡（带倒计时环）
      if (fallbackGrid) {
        const card = document.createElement('div');
        card.className = 'fb-gesture-card';
        card.dataset.key = key;

        card.innerHTML = `
          <div class="fb-card-ring-wrap">
            <svg class="fb-card-ring" viewBox="0 0 120 120">
              <circle class="fb-card-ring-bg"   cx="60" cy="60" r="50"/>
              <circle class="fb-card-ring-fill"
                      id="fb-card-ring-${key}"
                      cx="60" cy="60" r="50"/>
            </svg>
            <div class="fb-card-img">
              <img src="${meta.image}" alt="${meta.name}">
            </div>
          </div>
          <div class="fb-name">${meta.name}</div>
        `;

        fallbackGrid.appendChild(card);
      }
    });
  }


  // ════════════════════════════════════════════════════════════════════════════
  //  RESULT PAGE
  //  Entry point: _buildResultPage() is called once when the page is shown.
  //  Navigation:  goToNextCountry() / goToPreviousCountry() update everything.
  // ════════════════════════════════════════════════════════════════════════════

  _buildResultPage() {
    const data = GESTURE_DATA[this.currentGesture];
    if (!data) return;

    this._resultCountryIdx = 0;

    // Gesture name + thumbnail in the top row
    const nameEl  = document.getElementById('result-gesture-name');
    if (nameEl) nameEl.textContent = `${data.name} Gesture`;

    const imgWrap = document.getElementById('result-gesture-img-wrap');
    const meta    = GESTURE_META[this.currentGesture];
    if (imgWrap && meta) {
      imgWrap.innerHTML = `<img src="${meta.image}" alt="${meta.name}">`;
    }

    this.updateResultCardStack();
  }

  // ── Public navigation API ─────────────────────────────────────────────────

  /** Stop scroll loop and reset carousel to centre (keyboard / click nav). */
  _resetCarouselOffset() {
    const carousel = document.getElementById('result-carousel');
    if (!carousel) return;
    if (this._scroll?.rafId) {
      cancelAnimationFrame(this._scroll.rafId);
      this._scroll.rafId = null;
    }
    carousel.classList.remove('no-card-transition');
    carousel.style.transition = 'none';
    carousel.style.transform  = 'translateX(0)';
    if (this._scroll) {
      this._scroll.autoScrollX = 0;
      this._scroll.state       = 'locked';
      this._scroll.snapping    = false;
    }
  }

  /** Advance to the next country in the list (swipe left / ArrowRight). */
  goToNextCountry() {
    const data = GESTURE_DATA[this.currentGesture];
    if (!data) return;
    this._resetCarouselOffset();
    this._resultCountryIdx = (this._resultCountryIdx + 1) % data.countries.length;
    this.updateResultCardStack();
    this.updateMapHighlight();
  }

  /** Go back to the previous country (swipe right / ArrowLeft). */
  goToPreviousCountry() {
    const data = GESTURE_DATA[this.currentGesture];
    if (!data) return;
    const len = data.countries.length;
    this._resetCarouselOffset();
    this._resultCountryIdx = (this._resultCountryIdx - 1 + len) % len;
    this.updateResultCardStack();
    this.updateMapHighlight();
  }

  /** Backward-compat wrapper used by onclick="app.resultNav(±1)" in the arrows. */
  resultNav(dir) {
    if (dir > 0) this.goToNextCountry();
    else         this.goToPreviousCountry();
  }

  // ── Card stack rendering ──────────────────────────────────────────────────

  /**
   * Re-render (or incrementally update) the five-card carousel.
   *
   * Cards are reused from the DOM when possible so the CSS
   * `transition: transform … opacity …` on .result-card can animate
   * the position change smoothly.  Only the center card's HTML is
   * rebuilt when a card transitions into / out of the center slot.
   */
  updateResultCardStack() {
    const data = GESTURE_DATA[this.currentGesture];
    if (!data) return;
    const countries = data.countries;
    const len       = countries.length;
    const idx       = this._resultCountryIdx;
    const carousel  = document.getElementById('result-carousel');
    if (!carousel) return;

    // Offset → CSS class map
    const POS = {
      '-2': 'result-card-far-left',
      '-1': 'result-card-left',
       '0': 'result-card-center',
       '1': 'result-card-right',
       '2': 'result-card-far-right',
    };

    // Build a map of countryIdx → offset for the five visible slots
    const needed = new Map(); // Map<countryIdx, offset>
    for (let off = -2; off <= 2; off++) {
      needed.set((idx + off + len) % len, off);
    }

    // Remove cards no longer in the visible window
    Array.from(carousel.querySelectorAll('[data-cidx]')).forEach(el => {
      if (!needed.has(+el.dataset.cidx)) el.remove();
    });

    // Update or create each visible card
    needed.forEach((off, cIdx) => {
      const country  = countries[cIdx];
      const isCenter = off === 0;
      let card = carousel.querySelector(`[data-cidx="${cIdx}"]`);

      if (!card) {
        // Brand-new card entering the visible window
        card = document.createElement('div');
        card.dataset.cidx = cIdx;
        card.innerHTML = isCenter
          ? this._buildCenterCard(country)
          : this._buildSideCard(country);
        carousel.appendChild(card);
      } else {
        // Card already exists — only rebuild HTML if role changed
        const wasCenter = card.dataset.center === '1';
        if (isCenter !== wasCenter) {
          card.innerHTML = isCenter
            ? this._buildCenterCard(country)
            : this._buildSideCard(country);
        }
      }

      // Persist the role so we can detect center↔side transitions next call
      card.dataset.center = isCenter ? '1' : '0';

      // Update position class — CSS transition fires automatically
      card.className = `result-card ${POS[String(off)]}`;

      // Click side cards to navigate (adjacent only; far cards are decorative)
      card.onclick = (off === -1) ? () => this.goToPreviousCountry()
                   : (off ===  1) ? () => this.goToNextCountry()
                   : null;
    });
  }

  /** HTML for the full-detail center card. */
  _buildCenterCard(country) {
    const type    = normalizeType(country.type);
    const color   = resultTypeColor(type);
    const label   = resultTypeLabel(type);
    const meta    = GESTURE_META[this.currentGesture];
    const imgHtml = meta
      ? `<img src="${meta.image}" alt="${meta.name}" class="rcard-gesture-img">`
      : '';
    return `
      <div class="rcard-inner">
        <div class="rcard-left-col">
          <div class="rcard-flag-circle">${getFlag(country.code)}</div>
          <div class="rcard-country-name">${country.name}</div>
          <div class="rcard-meaning-pill"
               style="background:${color}22;color:${color};border-color:${color}66">
            ${label}
          </div>
          <p class="rcard-detail">${country.detail}</p>
          <p class="rcard-meaning-text">"${country.meaning}"</p>
        </div>
        <div class="rcard-right-col">${imgHtml}</div>
      </div>`;
  }

  /** HTML for a minimal side card. */
  _buildSideCard(country) {
    const type  = normalizeType(country.type);
    const color = resultTypeColor(type);
    const label = resultTypeLabel(type);
    return `
      <div class="rcard-inner rcard-inner-side">
        <div class="rcard-flag-circle">${getFlag(country.code)}</div>
        <div class="rcard-country-name">${country.name}</div>
        <div class="rcard-meaning-pill"
             style="background:${color}22;color:${color};border-color:${color}66">
          ${label}
        </div>
      </div>`;
  }

  // ── Background map ────────────────────────────────────────────────────────

  _initResultMap() {
    const container = document.getElementById('result-map-bg');
    if (!container) return;

    if (this.worldMap) {
      try { this.worldMap.destroy?.(); } catch (_) {}
      this.worldMap = null;
    }
    container.innerHTML = '';

    try {
      this.worldMap = new jsVectorMap({
        selector: '#result-map-bg',
        map: 'world',
        backgroundColor: 'transparent',
        zoomOnScroll: false,
        draggable: false,
        regionStyle: {
          initial: { fill: '#E5E0D8', stroke: '#CEC8C0', strokeWidth: 0.4, fillOpacity: 1 },
          hover:   { fillOpacity: 1, cursor: 'default' },
        },
        onLoaded: () => { this.updateMapHighlight(); },
        onRegionTooltipShow: () => {},  // tooltips suppressed on background map
      });

      // Zoom buttons
      document.getElementById('result-zoom-in')?.addEventListener('click', () => {
        try { this.worldMap.setScale?.(Math.min(this.worldMap.scale * 1.3, 6), null, null, true); } catch (_) {}
      });
      document.getElementById('result-zoom-out')?.addEventListener('click', () => {
        try { this.worldMap.setScale?.(Math.max(this.worldMap.scale / 1.3, 1), null, null, true); } catch (_) {}
      });

      // Re-apply after render passes in case jsVectorMap overwrites inline styles
      [200, 600, 1500].forEach(t => setTimeout(() => this.updateMapHighlight(), t));
    } catch (e) {
      console.error('Result map init failed:', e);
    }
  }

  /**
   * Highlight only the current country on the background map.
   * All other regions revert to the default warm-grey fill.
   * Called after every country change.
   */
  updateMapHighlight() {
    const data = GESTURE_DATA[this.currentGesture];
    if (!data) return;
    const country = data.countries[this._resultCountryIdx];
    if (!country) return;
    const targetCode = String(country.code).toUpperCase();
    const color      = resultTypeColor(normalizeType(country.type));

    document.querySelectorAll('#result-map-bg .jvm-region').forEach(el => {
      const code = String(el.getAttribute('data-code') || '').toUpperCase();
      if (code === targetCode) {
        el.style.setProperty('fill', color, 'important');
      } else {
        el.style.removeProperty('fill');
      }
    });
  }

  // ── Result page: auto-scroll carousel + open-palm / fist state machine ──────

  /**
   * setupResultPageInteraction()
   *
   * State machine:
   *   browsing  — carousel auto-scrolls at a steady museum pace.
   *               Open palm detected → stay browsing (no-op).
   *               Fist detected      → lockCurrentCountry().
   *
   *   locked    — auto-scroll paused; current card stays centered.
   *               Open palm detected → resumeBrowsing().
   *               Fist detected      → no-op (already locked).
   *
   * Scroll model (single source of truth: s.autoScrollX)
   * ──────────────────────────────────────────────────────
   *  autoScrollX always lives in [-CARD_SPACING, 0].
   *  Every rAF frame: autoScrollX -= SCROLL_PX_PER_MS * dt.
   *  When autoScrollX crosses -CARD_SPACING:
   *    autoScrollX += CARD_SPACING   (keep fractional remainder)
   *    advanceCountry()              (freeze transitions, bump index,
   *                                   rebuild cards, reset carousel to 0)
   *  carousel.style.transform = translateX(autoScrollX)  every frame.
   *
   * On fist / lock:
   *  Stop rAF, CSS-animate carousel to nearest card slot (0 or -CARD_SPACING),
   *  then commitSnap — same freeze+rebuild+reset pattern, no visible jump.
   *
   * Keyboard fallback:
   *  Space  → lock   Enter → resume
   *  ←/→    → step (locked mode only)
   */
  /** Start the result-page autoplay: show each card for 3 s, then go to landing. */
  _startResultAutoplay() {
    this._stopResultAutoplay(); // clear any previous timer

    const data = GESTURE_DATA[this.currentGesture];
    if (!data) return;
    const total = data.countries.length;

    this._resultCountryIdx = 0;
    this.updateResultCardStack();
    this.updateMapHighlight();

    let shown = 0;

    const advance = () => {
      shown++;
      if (shown >= total) {
        // All cards shown — go back to landing
        this._resultAutoplayTimer = null;
        this._showPage('landing');
        location.hash = 'landing';
        return;
      }
      this._resultCountryIdx = shown;
      this.updateResultCardStack();
      this.updateMapHighlight();
      this._resultAutoplayTimer = setTimeout(advance, 3000);
    };

    this._resultAutoplayTimer = setTimeout(advance, 3000);
  }

  /** Stop autoplay timer if running. */
  _stopResultAutoplay() {
    if (this._resultAutoplayTimer) {
      clearTimeout(this._resultAutoplayTimer);
      this._resultAutoplayTimer = null;
    }
  }

  setupResultPageInteraction() {
    const carousel = document.getElementById('result-carousel');
    const video    = document.getElementById('result-video');
    if (!carousel) return;

    const pointer = document.getElementById('result-hand-pointer');

    let hoveredTarget = null;
    let fistLatched = false;

    const showPointer = (x, y, active = false) => {
      if (!pointer) return;
      pointer.style.display = 'block';
      pointer.style.left = `${x}px`;
      pointer.style.top = `${y}px`;
      pointer.classList.toggle('hovering-target', active);
    };

    const hidePointer = () => {
      if (!pointer) return;
      pointer.style.display = 'none';
      pointer.classList.remove('hovering-target');
    };

    const clearHoveredTarget = () => {
      if (hoveredTarget?.el) {
        hoveredTarget.el.classList.remove('result-gesture-hover');
      }
      hoveredTarget = null;
    };

    const setHoveredTarget = (target) => {
      if (hoveredTarget?.el === target?.el) return;

      if (hoveredTarget?.el) {
        hoveredTarget.el.classList.remove('result-gesture-hover');
      }

      hoveredTarget = target || null;

      if (hoveredTarget?.el) {
        hoveredTarget.el.classList.add('result-gesture-hover');
      }
    };

    const setHint = (text) => {
      const el = document.getElementById('result-swipe-hint');
      if (!el) return;
      el.className = 'result-swipe-hint ready';
      el.textContent = text || '';
    };

    const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);

    const fingerExtended = (lm, tip, pip, wrist = 0) => {
      return dist(lm[tip], lm[wrist]) > dist(lm[pip], lm[wrist]) * 1.15;
    };

    const countExtendedFingers = (lm) => {
      let count = 0;
      if (fingerExtended(lm, 8, 6)) count++;
      if (fingerExtended(lm, 12, 10)) count++;
      if (fingerExtended(lm, 16, 14)) count++;
      if (fingerExtended(lm, 20, 18)) count++;
      if (dist(lm[4], lm[0]) > dist(lm[3], lm[0]) * 1.08) count++;
      return count;
    };

    const isOpenPalm = (lm) => countExtendedFingers(lm) >= 4;
    const isFist = (lm) => countExtendedFingers(lm) <= 2;

    const getPalmCenter = (lm) => {
      const ids = [0, 5, 9, 13, 17];
      let x = 0, y = 0;
      ids.forEach(i => {
        x += lm[i].x;
        y += lm[i].y;
      });
      return { x: x / ids.length, y: y / ids.length };
    };

    const pointInRect = (x, y, rect) => {
      return x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
    };

    const expandRect = (rect, padX, padY) => ({
      left: rect.left - padX,
      right: rect.right + padX,
      top: rect.top - padY,
      bottom: rect.bottom + padY
    });

    const findGestureTarget = (x, y) => {
      const pointInRect = (x, y, rect) => (
        x >= rect.left && x <= rect.right &&
        y >= rect.top  && y <= rect.bottom
      );

      const expandRect = (rect, padX, padY) => ({
        left: rect.left - padX,
        right: rect.right + padX,
        top: rect.top - padY,
        bottom: rect.bottom + padY
      });

      // 先判断 3 个主要按钮，并扩大命中区
      const bigButtons = [
        document.getElementById('result-home-btn'),
        document.getElementById('result-btn-scenario'),
        document.getElementById('result-btn-gesture'),
      ].filter(Boolean);

      for (const btn of bigButtons) {
        const rect = expandRect(btn.getBoundingClientRect(), 36, 24);
        if (pointInRect(x, y, rect)) {
          return { type: 'button', el: btn };
        }
      }

      // 左箭头：比之前再大很多
      const leftArrow = document.getElementById('result-arrow-left');
      if (leftArrow) {
        const rect = expandRect(leftArrow.getBoundingClientRect(), 180, 150);
        if (pointInRect(x, y, rect)) {
          return { type: 'arrow-left', el: leftArrow };
        }
      }

      // 右箭头：比之前再大很多
      const rightArrow = document.getElementById('result-arrow-right');
      if (rightArrow) {
        const rect = expandRect(rightArrow.getBoundingClientRect(), 180, 150);
        if (pointInRect(x, y, rect)) {
          return { type: 'arrow-right', el: rightArrow };
        }
      }

      return null;
    };

    const activateHoveredTarget = () => {
      if (!hoveredTarget) return;

      if (hoveredTarget.type === 'arrow-left') {
        this.resultNav(-1);
        return;
      }

      if (hoveredTarget.type === 'arrow-right') {
        this.resultNav(1);
        return;
      }

      if (hoveredTarget.type === 'button' && hoveredTarget.el) {
        hoveredTarget.el.click();
      }
    };

    // 先停掉旧滚动逻辑，避免和新逻辑打架
    if (this._scroll?.rafId) {
      cancelAnimationFrame(this._scroll.rafId);
      this._scroll.rafId = null;
    }
    carousel.style.transition = 'none';
    carousel.style.transform = 'translateX(0)';
    this._scroll = null;

    if (video && typeof Hands !== 'undefined' && typeof Camera !== 'undefined') {
      const hands = new Hands({
        locateFile: f => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${f}`,
      });

      hands.setOptions({
        maxNumHands: 1,
        modelComplexity: 0,
        minDetectionConfidence: 0.65,
        minTrackingConfidence: 0.55,
      });

      hands.onResults((results) => {
        if (!results.multiHandLandmarks?.length) {
          hidePointer();
          clearHoveredTarget();
          fistLatched = false;
          setHint('Open palm to move cursor');
          return;
        }

        const lm = results.multiHandLandmarks[0];
        const center = getPalmCenter(lm);

        const screenX = (1 - center.x) * window.innerWidth;
        const screenY = center.y * window.innerHeight;

        const target = findGestureTarget(screenX, screenY);
        showPointer(screenX, screenY, !!target);

        if (isOpenPalm(lm)) {
          setHoveredTarget(target);
          fistLatched = false;

          if (!target) {
            setHint('Open palm to move cursor');
          } else if (target.type === 'arrow-left') {
            setHint('Left selected · Fist to go left');
          } else if (target.type === 'arrow-right') {
            setHint('Right selected · Fist to go right');
          } else {
            setHint('Button selected · Fist to click');
          }
          return;
        }

        if (isFist(lm)) {
          if (!fistLatched && hoveredTarget) {
            fistLatched = true;
            activateHoveredTarget();
            setHint('Action confirmed');
          } else if (!hoveredTarget) {
            setHint('Move over a button or arrow first');
          }
          return;
        }

        fistLatched = false;
        setHint('Open palm to move, fist to confirm');
      });

      this._resultHandsCamera = new Camera(video, {
        onFrame: async () => { await hands.send({ image: video }); },
        width: 320,
        height: 240,
      });

      this._resultHandsCamera.start()
        .then(() => setHint('Open palm to move cursor'))
        .catch(e => {
          console.warn('Result page hand detection unavailable:', e);
          setHint('Hand tracking unavailable');
        });

      this._resultHandsObj = hands;
    } else {
      setHint('Hand tracking unavailable');
    }
  }

  /** Stop auto-scroll loop and hand tracking when leaving the result page. */
  _stopResultHandTracking() {
    if (this._resultKeyHandler) {
      document.removeEventListener('keydown', this._resultKeyHandler);
      this._resultKeyHandler = null;
    }

    try { this._resultHandsCamera?.stop?.(); } catch (_) {}
    try { this._resultHandsObj?.close?.(); } catch (_) {}

    this._resultHandsCamera = null;
    this._resultHandsObj = null;

    if (this._scroll) {
      if (this._scroll.rafId) cancelAnimationFrame(this._scroll.rafId);
      this._scroll = null;
    }

    const carousel = document.getElementById('result-carousel');
    if (carousel) {
      carousel.style.transition = '';
      carousel.style.transform  = '';
      carousel.classList.remove('no-card-transition');
    }

    const pointer = document.getElementById('result-hand-pointer');
    if (pointer) {
      pointer.style.display = 'none';
      pointer.classList.remove('hovering-center');
    }
  }


  _clearResultIdleTimer() {
    clearTimeout(this._resultIdleTimer);
    this._resultIdleTimer = null;
    const page = this.pages.result;
    if (page && this._resultIdleReset) {
      ['mousemove', 'click', 'keydown', 'touchstart'].forEach(ev =>
        page.removeEventListener(ev, this._resultIdleReset)
      );
      this._resultIdleReset = null;
    }
  }

  // ── Gesture confirmation dialog ───────────────────────────────────────────
  _showConfirm(gesture) {
    this._stopTimeout();

    const info = GESTURE_META[gesture];
    const overlay = document.getElementById('confirm-overlay');
    const emojiEl = document.getElementById('confirm-emoji');
    const nameEl = document.getElementById('confirm-name');

    if (emojiEl) {
      if (info?.image) {
        emojiEl.innerHTML = `<img src="${info.image}" alt="${info.name}">`;
      } else {
        emojiEl.textContent = '?';
      }
    }

    if (nameEl) {
      nameEl.textContent = info ? info.name : gesture;
    }

    overlay.dataset.gesture = gesture;
    overlay.classList.add('open');
  }

  confirmGesture() {
    const overlay = document.getElementById('confirm-overlay');
    const gesture = overlay.dataset.gesture;
    overlay.classList.remove('open');
    this._onGestureConfirmed(gesture);
  }

  retryGesture() {
    const overlay = document.getElementById('confirm-overlay');
    overlay.classList.remove('open');
    // 重置检测状态，恢复摄像头
    this._resetDetectUI();
    document.getElementById('ring-fill')?.classList.remove('unknown', 'recognized');
    this._setRing(0);
    this.detector.currentCandidate = null;
    this.detector.holdStartTime    = null;
    this.detector.progress         = 0;
    this.detector.running          = true;
    this._startTimeout();
  }

  // ── UI helpers ────────────────────────────────────────────────────────────
  _setRing(ratio) {
    const ring = document.getElementById('ring-fill');
    if (ring) ring.style.strokeDashoffset = this.ringCircumference * (1 - ratio);
  }

  _highlightGestureItem(key) {
    document.querySelectorAll('#detect-gestures .detect-gesture-item').forEach(el => {
      el.classList.toggle('active', el.dataset.key === key);
    });
  }

  _setDetectEmoji(imageOrText, name, desc, isImage = false) {
    const el = document.getElementById('detect-emoji');
    if (!el) return;

    if (isImage) {
      el.innerHTML = `<img src="${imageOrText}" alt="${name}">`;
    } else {
      el.textContent = imageOrText;
    }

    el.classList.add('pop');
    el.addEventListener('animationend', () => el.classList.remove('pop'), { once: true });

    const nameEl = document.getElementById('detect-name');
    const descEl = document.getElementById('detect-desc');
    if (nameEl) nameEl.textContent = name;
    if (descEl) descEl.textContent = desc;
  }

  _resetDetectUI() {
    this._setDetectEmoji('image_newest/open palm.PNG', 'Waiting…', 'Show one of these gestures:', true);
    const vp  = document.getElementById('cam-viewport');
    const dot = document.getElementById('cam-dot');
    if (vp)  vp.className  = 'cam-viewport';
    if (dot) dot.className = 'cam-dot';
    const camText = document.getElementById('cam-text');
    if (camText) camText.textContent = 'Initializing…';
  }

  _setCamError() {
    const dot     = document.getElementById('cam-dot');
    const camText = document.getElementById('cam-text');
    if (dot)     dot.className      = 'cam-dot';
    if (camText) camText.textContent = 'Camera unavailable — use buttons below';
  }

  // ── Confetti ──────────────────────────────────────────────────────────────
  _fireConfetti() {
    if (typeof confetti === 'undefined') return;
    const opts = {
      particleCount: 70, spread: 65,
      colors: ['#f59e0b','#f97316','#22c55e','#60a5fa','#c084fc'],
    };
    confetti({ ...opts, angle: 60,  origin: { x: 0.1, y: 0.55 } });
    confetti({ ...opts, angle: 120, origin: { x: 0.9, y: 0.55 } });
  }

  // ── Toast ─────────────────────────────────────────────────────────────────
  _toast(msg) {
    const el = document.getElementById('toast');
    el.textContent = msg;
    el.classList.add('show');
    setTimeout(() => el.classList.remove('show'), 2800);
  }

  // ── Particle background ───────────────────────────────────────────────────
  startParticles() {
    const canvas = document.getElementById('particle-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let W = canvas.width  = window.innerWidth;
    let H = canvas.height = window.innerHeight;

    const dots = Array.from({ length: 55 }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      r:  Math.random() * 1.2 + 0.3,
      vx: (Math.random() - 0.5) * 0.14,
      vy: (Math.random() - 0.5) * 0.14,
      a:  Math.random() * 0.35 + 0.07,
    }));

    window.addEventListener('resize', () => {
      W = canvas.width  = window.innerWidth;
      H = canvas.height = window.innerHeight;
    });

    const tick = () => {
      ctx.clearRect(0, 0, W, H);
      dots.forEach(d => {
        d.x += d.vx; d.y += d.vy;
        if (d.x < 0) d.x = W; if (d.x > W) d.x = 0;
        if (d.y < 0) d.y = H; if (d.y > H) d.y = 0;
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(59,130,246,${d.a})`;
        ctx.fill();
      });
      requestAnimationFrame(tick);
    };
    tick();
  }
}

// ── Boot ───────────────────────────────────────────────────────────────────
let landingIntroTimers = [];
let landingConsentCleanup = null;
let app;

function clearLandingIntroTimers() {
  landingIntroTimers.forEach(clearTimeout);
  landingIntroTimers = [];
}

function resetLandingIntro() {
  clearLandingIntroTimers();

  if (typeof landingConsentCleanup === 'function') {
    landingConsentCleanup();
    landingConsentCleanup = null;
  }

  const landingPage = document.getElementById('page-landing');
  if (landingPage) {
    landingPage.classList.remove('fade-out');
  }
}


document.addEventListener('DOMContentLoaded', () => {
  app = new App();
  app.startParticles();
  initLandingIntro();
});

// ── Landing intro + camera consent (hand 2s = agree) ──────────────────────
function initLandingIntro(forceReset = false) {
  if (forceReset) {
    resetLandingIntro();
  }

  clearLandingIntroTimers();

  // No text intro — immediately start hand detection
  startConsentDetector(function(callback) { callback(); });
}

function startConsentDetector(dismissIntro) {
  const video = document.getElementById('landing-video');
  const fill = document.getElementById('li-consent-fill');
  const text = document.getElementById('li-hand-text');
  const landingPage = document.getElementById('page-landing');

  const HOLD_MS = 2000;
  let hands = null;
  let mpCamera = null;
  let holdStart = null;
  let done = false;
  let fallbackClickHandler = null;

  if (typeof landingConsentCleanup === 'function') {
    landingConsentCleanup();
    landingConsentCleanup = null;
  }

  function cleanup() {
    done = true;

    try {
      mpCamera?.stop();
    } catch (_) {}

    const stream = video?.srcObject;
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }

    if (video) {
      video.srcObject = null;
    }

    if (landingPage && fallbackClickHandler) {
      landingPage.removeEventListener('click', fallbackClickHandler);
    }
  }

  function transition() {
    if (done) return;

    cleanup();

    const flash = document.getElementById('flash');
    if (flash) {
      flash.classList.add('show');
      setTimeout(() => flash.classList.remove('show'), 700);
    }

    // Delegate everything to the unified state machine — no manual DOM surgery here
    if (window.app) {
      app.enterFromLanding();
    }
  }

  // Detect open palm using the same angle/length logic as gesture.js
  function isOpenPalm(lm) {
    function ang(a, b, c) {
      const abx = a.x-b.x, aby = a.y-b.y, cbx = c.x-b.x, cby = c.y-b.y;
      const dot = abx*cbx + aby*cby;
      const mag = Math.hypot(abx, aby) * Math.hypot(cbx, cby);
      if (!mag) return 0;
      return Math.acos(Math.max(-1, Math.min(1, dot/mag))) * 180/Math.PI;
    }
    const ps = Math.hypot(lm[0].x-lm[9].x, lm[0].y-lm[9].y);
    return ang(lm[2],lm[3],lm[4]) > 150 &&
      ang(lm[5],lm[6],lm[8])   > 150 && Math.hypot(lm[8].x-lm[5].x,   lm[8].y-lm[5].y)   > ps*0.48 &&
      ang(lm[9],lm[10],lm[12]) > 150 && Math.hypot(lm[12].x-lm[9].x,  lm[12].y-lm[9].y)  > ps*0.54 &&
      ang(lm[13],lm[14],lm[16])> 145 && Math.hypot(lm[16].x-lm[13].x, lm[16].y-lm[13].y) > ps*0.50 &&
      ang(lm[17],lm[18],lm[20])> 140 && Math.hypot(lm[20].x-lm[17].x, lm[20].y-lm[17].y) > ps*0.40;
  }

  function onResults(results) {
    if (done) return;

    const lm = results.multiHandLandmarks?.[0];
    const now = Date.now();

    // No hand → reset, video keeps looping
    if (!lm) {
      holdStart = null;
      if (fill) fill.style.width = '0%';
      if (text) text.textContent = 'Waiting for your hand…';
      return;
    }

    // Hand present but not open palm → reset timer
    if (!isOpenPalm(lm)) {
      holdStart = null;
      if (fill) fill.style.width = '0%';
      if (text) text.textContent = 'Open your palm…';
      return;
    }

    // Open palm detected — count 2 seconds
    if (!holdStart) holdStart = now;

    const elapsed = now - holdStart;
    const ratio = Math.min(elapsed / HOLD_MS, 1);

    if (fill) fill.style.width = `${ratio * 100}%`;

    const secsLeft = Math.max(0, Math.ceil((HOLD_MS - elapsed) / 1000));
    if (text) text.textContent = secsLeft > 0 ? `Hold still… ${secsLeft}s` : 'Great!';

    if (ratio >= 1) transition();
  }

  try {
    hands = new Hands({
      locateFile: file => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
    });

    hands.setOptions({
      maxNumHands: 1,
      modelComplexity: 0,
      minDetectionConfidence: 0.6,
      minTrackingConfidence: 0.5
    });

    hands.onResults(onResults);

    mpCamera = new Camera(video, {
      onFrame: async () => {
        if (!done) await hands.send({ image: video });
      },
      width: 320,
      height: 240,
    });

    mpCamera.start().catch(() => _fallback());
  } catch (e) {
    _fallback();
  }

  function _fallback() {
    if (text) text.textContent = 'Tap anywhere to continue';

    fallbackClickHandler = () => {
      if (!done) transition();
    };

    landingPage?.addEventListener('click', fallbackClickHandler, { once: true });
  }

  landingConsentCleanup = cleanup;
}


function stopLandingConsent() {
  if (typeof landingConsentCleanup === 'function') {
    landingConsentCleanup();
    landingConsentCleanup = null;
  }
  clearLandingIntroTimers();
}