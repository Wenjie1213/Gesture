class GestureDetector {
  constructor(callbacks) {
    this.onGesture        = callbacks.onGesture        || (() => {});
    this.onStatus         = callbacks.onStatus         || (() => {});
    this.onReadyToConfirm = callbacks.onReadyToConfirm || (() => {});
    this.onLandmarks      = callbacks.onLandmarks      || (() => {});

    this.hands    = null;
    this.camera   = null;
    this.videoEl  = null;
    this.canvasEl = null;
    this.ctx      = null;

    this.running  = false;
    this.currentCandidate = null;   // 当前正在尝试确认的手势
    this.holdStartTime = null;      // 这个手势开始保持的时间
    this.HOLD_MS = 3000;            // 需要保持 3 秒
    this.lastFired = null;
    this.COOLDOWN_MS = 2200;
    this.progress = 0;            // 0~1，给 UI 进度环用
    this.lastLandmarks = null;
  }

  async init(videoEl, canvasEl) {
    this.videoEl  = videoEl;
    this.canvasEl = canvasEl;
    this.ctx      = canvasEl.getContext('2d');

    this.hands = new Hands({
      locateFile: file => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
    });
    this.hands.setOptions({
      maxNumHands: 1,
      modelComplexity: 1,
      minDetectionConfidence: 0.70,
      minTrackingConfidence: 0.55,
    });
    this.hands.onResults(r => this._onResults(r));

    this.camera = new Camera(videoEl, {
      onFrame: async () => {
        if (this.running) await this.hands.send({ image: videoEl });
      },
      width: 640,
      height: 480,
    });
  }

  async start() {
    this.running   = true;
    this.currentCandidate = null;
    this.holdStartTime = null;
    this.lastFired = null;
    this.progress = 0;
    this.onStatus('starting');
    await this.camera.start();
    this.onStatus('ready');
  }

  stop() {
  this.running = false;
  this.camera?.stop();
}

  setAllowedGestures(list = []) {
    this.allowedGestures = new Set(list);
  }

  // ── Results from MediaPipe ────────────────────────────────────────────────
  _onResults(results) {
    const w = this.canvasEl.width  || 640;
    const h = this.canvasEl.height || 480;
    this.ctx.clearRect(0, 0, w, h);

    this.ctx.save();
    this.ctx.scale(-1, 1);
    this.ctx.translate(-w, 0);

    let detected = null; // null = no hand in frame

    if (results.multiHandLandmarks?.length > 0) {
      const lm = results.multiHandLandmarks[0];
      this.lastLandmarks = lm;
      this.onLandmarks(lm);

      let gesture = this._classify(lm);
      // 只允许当前场景的 3 个手势，其余一律 unknown
      if (
        gesture !== 'unknown' &&
        this.allowedGestures &&
        !this.allowedGestures.has(gesture)
      ) {
        gesture = 'unknown';
      }

      const isKnown = gesture !== 'unknown';
      this._drawHand(lm, isKnown);
      detected = gesture;
    }else{
      this.lastLandmarks = null;
      this.onLandmarks(null);
    }

    this.ctx.restore();
    this._updateHoldState(detected);
  }

  _angle(a, b, c) {
    const abx = a.x - b.x;
    const aby = a.y - b.y;
    const cbx = c.x - b.x;
    const cby = c.y - b.y;

    const dot = abx * cbx + aby * cby;
    const magAB = Math.hypot(abx, aby);
    const magCB = Math.hypot(cbx, cby);

    if (magAB === 0 || magCB === 0) return 0;

    const cos = Math.max(-1, Math.min(1, dot / (magAB * magCB)));
    return Math.acos(cos) * 180 / Math.PI;
  }
  _dist3(a, b) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  const dz = (a.z || 0) - (b.z || 0);
  return Math.hypot(dx, dy, dz);
}

  _pointSideOfLine(p, a, b) {
    return (b.x - a.x) * (p.y - a.y) - (b.y - a.y) * (p.x - a.x);
  }

  // ── Classify gesture ──────────────────────────────────────────────────────
  //
  // Landmarks used:
  //   0 = wrist
  //   2 = thumb CMC, 3 = thumb IP,  4 = thumb tip
  //   5 = index MCP, 6 = index PIP, 8 = index tip
  //   9 = mid MCP,  10 = mid PIP,  12 = mid tip
  //  13 = ring MCP, 14 = ring PIP, 16 = ring tip
  //  17 = pinky MCP,18 = pinky PIP,20 = pinky tip
  //
  // y-axis: 0 = top of frame, 1 = bottom  → smaller y = higher in frame
  // "extended" = finger tip higher than its PIP joint (tip.y < pip.y)
  // "folded"   = finger tip lower  than its PIP joint (tip.y > pip.y)
  _classify(lm) {
  // 手掌基准长度：用来做相对比例，避免手远近不同导致阈值失效
  const palmSize = Math.hypot(lm[0].x - lm[9].x, lm[0].y - lm[9].y);

  // =========================
  // 食指 index
  // =========================
  const indexAngle = this._angle(lm[5], lm[6], lm[8]);      // 整体角度
  const indexTipAngle = this._angle(lm[6], lm[7], lm[8]);   // 指尖末端角度
  const indexLength = Math.hypot(lm[8].x - lm[5].x, lm[8].y - lm[5].y);

  const ie =
    indexAngle > 160 &&
    indexTipAngle > 145 &&
    indexLength > palmSize * 0.52; // 食指伸直

  const indexFullyBent =
    indexLength < palmSize * 0.34; // 食指完全弯曲（更像握拳）

  // =========================
  // 中指 middle
  // =========================
  const middleAngle = this._angle(lm[9], lm[10], lm[12]);
  const middleTipAngle = this._angle(lm[10], lm[11], lm[12]);
  const middleLength = Math.hypot(lm[12].x - lm[9].x, lm[12].y - lm[9].y);

  const me =
    middleAngle > 160 &&
    middleTipAngle > 145 &&
    middleLength > palmSize * 0.58; // 中指伸直

  const middleFullyBent =
    middleLength < palmSize * 0.38; // 中指完全弯曲

  // =========================
  // 无名指 ring
  // =========================
  const ringAngle = this._angle(lm[13], lm[14], lm[16]);
  const ringTipAngle = this._angle(lm[14], lm[15], lm[16]);
  const ringLength = Math.hypot(lm[16].x - lm[13].x, lm[16].y - lm[13].y);

  const re =
    ringAngle > 155 &&
    ringTipAngle > 140 &&
    ringLength > palmSize * 0.56; // 无名指伸直

  const ringFullyBent =
    ringLength < palmSize * 0.36; // 无名指完全弯曲

  // =========================
  // 小指 pinky
  // =========================
  const pinkyAngle = this._angle(lm[17], lm[18], lm[20]);
  const pinkyTipAngle = this._angle(lm[18], lm[19], lm[20]);
  const pinkyLength = Math.hypot(lm[20].x - lm[17].x, lm[20].y - lm[17].y);

  const pe =
    pinkyAngle > 150 &&
    pinkyTipAngle > 135 &&
    pinkyLength > palmSize * 0.46; // 小指伸直

  const pinkyFullyBent =
    pinkyLength < palmSize * 0.30; // 小指完全弯曲

  // =========================
  // 拇指 thumb
  // =========================
  const thumbAngle = this._angle(lm[2], lm[3], lm[4]);
 
  //拇指和食指根部是否张开
  const thumbIndexAngle = this._angle(lm[4], lm[2], lm[5]);
  const te = thumbIndexAngle > 45 && thumbAngle >140;


  // =========================
  // 距离 / 辅助量
  // =========================

  // 1和2指尖距离
  const tid = Math.hypot(lm[4].x - lm[8].x, lm[4].y - lm[8].y);

  // 2和3指尖距离
  const imd = Math.hypot(lm[8].x - lm[12].x, lm[8].y - lm[12].y);

  // 3和4指尖距离
  const mrd = Math.hypot(lm[12].x - lm[16].x, lm[12].y - lm[16].y);

  // 4和5指尖距离
  const rpd =  Math.hypot(lm[16].x - lm[20].x, lm[16].y - lm[20].y);

  // 1和5距离
  const tpd = Math.hypot(lm[4].x - lm[20].x, lm[4].y - lm[20].y);

  // 拇指尖是否在手腕上方
  const thumbTipAboveWrist = lm[4].y < lm[0].y - 0.05;

   /* // =========================
  // 新增：侧着的拳头底座（先不看食指）
  // =========================

  // 中指 / 无名指 / 小指：指尖彼此靠近
  const middleRingClose = mrd < palmSize * 0.18;   // 12 和 16
  const ringPinkyClose  = rpd < palmSize * 0.16;   // 16 和 20

  // 三根手指各自“缩回去”了：指尖离指根不远
  const middleRetracted = middleLength < palmSize * 0.50;
  const ringRetracted   = ringLength   < palmSize * 0.46;
  const pinkyRetracted  = pinkyLength  < palmSize * 0.40;

  // 拇指不要张太开
  const thumbTucked =
    thumbIndexAngle < 60 &&
    tpd < palmSize * 0.95;

  // 整个“侧着拳头底座”
  const sideFistBase =
    middleRingClose &&
    ringPinkyClose &&
    middleRetracted &&
    ringRetracted &&
    pinkyRetracted &&
  //  middleCurled &&
    //ringCurled &&
 //   pinkyCurled &&
    thumbTucked;
*/
    // =========================
  // “10” 手势：更宽松的侧拳判断
  // =========================
  const palmSize3D = this._dist3(lm[0], lm[9]);

  const middleTipToMCP3D  = this._dist3(lm[12], lm[9]);
  const ringTipToMCP3D    = this._dist3(lm[16], lm[13]);
  const pinkyTipToMCP3D   = this._dist3(lm[20], lm[17]);

  const middleRingTip3D   = this._dist3(lm[12], lm[16]);
  const ringPinkyTip3D    = this._dist3(lm[16], lm[20]);

  const thumbToIndexMCP3D = this._dist3(lm[4], lm[5]);
  const thumbToMiddleMCP3D= this._dist3(lm[4], lm[9]);
  const thumbToRingMCP3D  = this._dist3(lm[4], lm[13]);

  // 三根手指只要明显不是伸直，就算“收拳”
  const middleCurled =
    middleAngle < 170 &&
    middleTipAngle < 150 &&
    middleTipToMCP3D < palmSize3D * 0.92;

  const ringCurled =
    ringAngle < 168 &&
    ringTipAngle < 148 &&
    ringTipToMCP3D < palmSize3D * 0.88;

  const pinkyCurled =
    pinkyAngle < 165 &&
    pinkyTipAngle < 145 &&
    pinkyTipToMCP3D < palmSize3D * 0.84;

  // 三根指尖彼此靠近，但放宽
  const fingersClustered =
    middleRingTip3D < palmSize3D * 0.46 &&
    ringPinkyTip3D  < palmSize3D * 0.42;

  // 拇指只要没有明显张开太远，就算 tucked
  const thumbTucked3D =
    thumbToIndexMCP3D  < palmSize3D * 1.12 &&
    thumbToMiddleMCP3D < palmSize3D * 1.26 &&
    thumbToRingMCP3D   < palmSize3D * 1.36;

  const sideFistBase =
    middleCurled &&
    ringCurled &&
    pinkyCurled &&
    fingersClustered &&
    thumbTucked3D;







  // 食指整体是弯的
  const indexCurled =
    indexAngle < 155 && indexAngle > 70;

    // 食指确实是从拳头里“伸出来了一点”
  // 用食指PIP(6) 到 中指PIP(10) 的距离
  const indexOutFromFist =
    Math.hypot(lm[6].x - lm[10].x, lm[6].y - lm[10].y) > palmSize * 0.22;




  // 0 -> 5 的方向向量
  const wristToIndexDx = lm[5].x - lm[0].x;
  const wristToIndexDy = lm[5].y - lm[0].y;

  // 把方向转成角度（单位：度）
  const wristToIndexAngle =
    Math.atan2(wristToIndexDy, wristToIndexDx) * 180 / Math.PI;

  // 例子：如果你图里的方向大约是“向右偏下一点”
  // 就只允许这个角度附近通过，比如 10° ~ 50°
  const wristToIndexAngleOK =
    wristToIndexAngle > -60 &&
    wristToIndexAngle < -30;

  // 点 6 和点 7 相对于 5->8 连线的位置
const side6 = this._pointSideOfLine(lm[6], lm[5], lm[8]);
const side7 = this._pointSideOfLine(lm[7], lm[5], lm[8]);

// 给一个小阈值，避免刚好贴线时抖动
const lineOffset = palmSize * 0.01;

// 约定：
// 如果 6、7 都在 5->8 连线“上面” -> curled_finger_down
// 如果 6、7 都在 5->8 连线“下面” -> curled_finger
const hookDown =
  side6 < -lineOffset &&
  side7 < -lineOffset;

const hookUp =
  side6 > lineOffset &&
  side7 > lineOffset;


  // open_palm 单独放宽一点，不然太难触发
  const thumbOpenPalm  = thumbAngle  > 150;
  const indexOpenPalm  = indexAngle  > 150 && indexLength  > palmSize * 0.48;
  const middleOpenPalm = middleAngle > 150 && middleLength > palmSize * 0.54;
  const ringOpenPalm   = ringAngle   > 145 && ringLength   > palmSize * 0.50;
  const pinkyOpenPalm  = pinkyAngle  > 140 && pinkyLength  > palmSize * 0.40;

  // ─────────────────────────────────────────────────────────────────────
  // OK: thumb touches index (circle), middle + ring + pinky extended
  // ─────────────────────────────────────────────────────────────────────
  if (tid < palmSize * 0.32 && me && re && pe) return 'ok';
 

  // ─────────────────────────────────────────────────────────────────────
  // THUMBS UP:
  // 拇指伸直并朝上，其他四指要更像“握紧”
  // ─────────────────────────────────────────────────────────────────────
  if (
    thumbTipAboveWrist &&
    te &&
    indexFullyBent &&
    middleFullyBent &&
    ringFullyBent &&
    pinkyFullyBent
  ) {
    return 'thumbs_up';
  }

  // ─────────────────────────────────────────────────────────────────────
  // shocker_alt:
  // 食指 + 中指 + 小指伸直，无名指弯曲
  // ─────────────────────────────────────────────────────────────────────
  if (
    !te &&
    ie &&
    me &&
    ringFullyBent &&
    pe
  ) {
    return 'shocker';
  }
  // ─────────────────────────────────────────────────────────────────────
  // ily:
  // 拇指 + 食指 + 中指？你原代码这里其实更像 te + ie + me
  // 我先按你的原逻辑保留
  // ─────────────────────────────────────────────────────────────────────
  if (te && ie && me && ringFullyBent && pinkyFullyBent) {
    return 'serbian_salute';
  }
  
  // ─────────────────────────────────────────────────────────────────────
  // V SIGN: index + middle extended, ring + pinky folded, thumb not touching index
  // ─────────────────────────────────────────────────────────────────────
  if (
    !te &&
    ie &&
    me &&
    ringFullyBent &&
    pinkyFullyBent
  ) {
    return 'v_sign';
  }

  // ─────────────────────────────────────────────────────────────────────
  // 3 together:
  // ─────────────────────────────────────────────────────────────────────
  if (
    !te &&
    ie &&
    me &&
    re &&
    pinkyFullyBent &&
    imd < palmSize * 0.23 &&
    mrd < palmSize * 0.23
  ) {
    return 'three_finger_salute';
  }

  // ─────────────────────────────────────────────────────────────────────
  // horns:
  // ─────────────────────────────────────────────────────────────────────
  if (!te && ie && middleFullyBent && ringFullyBent && pe) {
    return 'horns';
  }

   // ─────────────────────────────────────────────────────────────────────
  // 6:
  // 拇指 + 小指伸直，其余收起
  // ─────────────────────────────────────────────────────────────────────
  if (
    te &&
    indexFullyBent &&
    middleFullyBent &&
    ringFullyBent &&
    pe
  ) {
    return 'six_hand';
  }
  
  //if(sideFistBase&&indexCurled&&indexOutFromFist&&wristToIndexAngleOK){return '10';}
    
  if (
  sideFistBase &&

  indexCurled &&
  indexOutFromFist &&
  wristToIndexAngleOK &&
  hookUp
) {
  return 'curled_finger';
}

if (
  sideFistBase &&

  indexCurled &&
  indexOutFromFist &&
  wristToIndexAngleOK &&
  hookDown
) {
  return 'curled_finger_down';
}

  // ─────────────────────────────────────────────────────────────────────
  // middle finger:
  // ─────────────────────────────────────────────────────────────────────
  if (indexFullyBent && me && ringFullyBent && pinkyFullyBent) {
    return 'middle_finger';
  }
    // ─────────────────────────────────────────────────────────────────────
  // index finger:
  // 只有食指伸直
  // ─────────────────────────────────────────────────────────────────────
  if (
    !te &&
    ie &&
    middleFullyBent &&
    ringFullyBent &&
    pinkyFullyBent
  ) {
    return 'raise_index_finger';
  }
   
    // ─────────────────────────────────────────────────────────────────────
  // little finger:
  // 只有小指伸直
  // ─────────────────────────────────────────────────────────────────────
  if (
    !te &&
    indexFullyBent &&
    middleFullyBent &&
    ringFullyBent &&
    pe
  ) {
    return 'little_finger';
  }

  
  // ─────────────────────────────────────────────────────────────────────
  // 5:
  // 用单独宽松版，否则很难触发
  // ─────────────────────────────────────────────────────────────────────
  if (
    thumbOpenPalm &&
    indexOpenPalm &&
    middleOpenPalm &&
    ringOpenPalm &&
    pinkyOpenPalm
  ) {
    return 'open_palm_with_fingers_spread';
  }
  // ─────────────────────────────────────────────────────────────────────
  // UNKNOWN: hand visible but gesture not recognised
  // ─────────────────────────────────────────────────────────────────────
  return 'unknown';
}





  // ── Buffer-based confirmation ─────────────────────────────────────────────
_updateHoldState(gesture) {
  const now = Date.now();

  // 1) 完全没检测到手：回到 ready
  if (gesture === null) {
    this.currentCandidate = null;
    this.holdStartTime = null;
    this.progress = 0;
    this.onStatus('ready', null, 0);
    return;
  }

  // 2) 新候选（包括 unknown）
  if (this.currentCandidate !== gesture) {
    this.currentCandidate = gesture;
    this.holdStartTime = now;
    this.progress = 0;
    this.onStatus('detecting', gesture, 0);
    return;
  }

  // 3) 同一个候选持续中
  const holdMs = gesture === 'unknown' ? 15000 : this.HOLD_MS;
  const elapsed = now - this.holdStartTime;
  const ratio = Math.min(elapsed / holdMs, 1);
  this.progress = ratio;

  this.onStatus('detecting', gesture, ratio);

  // 4) 到时确认
  if (ratio >= 1) {
    this.running = false;
    this.onReadyToConfirm(gesture);
  }
}

  // ── Draw hand skeleton ────────────────────────────────────────────────────
  _drawHand(lm, active) {
    const gold = 'rgba(245,158,11,';
    const blue = 'rgba(100,160,255,';

    const lineColor = active ? `${gold}0.55)` : `${blue}0.35)`;
    const dotColor  = active ? `${gold}0.9)`  : `${blue}0.75)`;

    drawConnectors(this.ctx, lm, HAND_CONNECTIONS, { color: lineColor, lineWidth: active ? 3 : 2 });
    drawLandmarks(this.ctx,  lm, { color: dotColor, radius: active ? 5 : 3, lineWidth: 1 });

    if (active) {
      const w = this.canvasEl.width, h = this.canvasEl.height;
      [4, 8, 12, 16, 20].forEach(i => {
        const x = lm[i].x * w, y = lm[i].y * h;
        const g = this.ctx.createRadialGradient(x, y, 0, x, y, 16);
        g.addColorStop(0, `${gold}0.45)`);
        g.addColorStop(1, 'transparent');
        this.ctx.beginPath();
        this.ctx.arc(x, y, 16, 0, Math.PI * 2);
        this.ctx.fillStyle = g;
        this.ctx.fill();
      });
    }
  }
}
