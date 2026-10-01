/* BONE SIP — animated coach characters.
 *
 * Exercises without a filmed coach video are described as data: props + keyframed
 * joint angles (or a small pose function). A 2-D rig turns each pose into SVG in the
 * same flat style as the coach videos (pink top, navy pants, pink trainers).
 *
 * Angle convention (side view, figure faces +x):
 *   0° = segment points straight down, positive angles swing towards the front.
 *   torso: 0 = upright, + = lean forward.   A/E: upper-arm angle / elbow bend.
 *   H/K/F: thigh angle / knee bend / foot (+ = toes pointing down, i.e. on tiptoe).
 * Prefixes: n = near limb (drawn in front), f = far limb (drawn behind, darker).
 */
(function (global) {
  'use strict';

  const VIEWBOX = '0 -24 300 364';
  const GROUND = 330;
  const COLORS = {
    skin: '#D98866', skinFar: '#C4744F', top: '#E01E58', topFar: '#C41A4C',
    pants: '#25075E', pantsFar: '#1A0447', hair: '#363636', shoe: '#E01E58', shoeFar: '#C41A4C',
    sole: '#707070', wall: '#E2E2E6', wallEdge: '#CFCFD6', wood: '#B98563', woodDark: '#99694B',
    counter: '#D9D5E3', counterTop: '#BDB6CF', floor: '#E3E3E3', shadow: 'rgba(37, 7, 94, 0.08)', glow: '#E01E58'
  };
  const LEN = { torso: 92, neck: 13, head: 20, upper: 54, fore: 48, thigh: 80, shin: 78 };
  const SOLE_DROP = 9;
  const SEAT_Y = 241;       // pelvis height when seated with thighs level
  const SEAT_TOP = 256;     // chair seat surface

  // ---------------------------------------------------------------- math helpers
  const rad = d => d * Math.PI / 180;
  const deg = r => r * 180 / Math.PI;
  const add = (a, b) => [a[0] + b[0], a[1] + b[1]];
  const sub = (a, b) => [a[0] - b[0], a[1] - b[1]];
  const mul = (a, k) => [a[0] * k, a[1] * k];
  const lerpP = (a, b, k) => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k];
  const dir = (a, len = 1) => [Math.sin(rad(a)) * len, Math.cos(rad(a)) * len];
  const angleOf = v => deg(Math.atan2(v[0], v[1]));
  const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
  const f1 = n => (Math.round(n * 10) / 10).toString();

  // Two-bone IK: returns absolute segment angles reaching from `root` towards `target`.
  function ik(root, target, a, b, bendSign) {
    const d0 = sub(target, root);
    const d = clamp(Math.hypot(d0[0], d0[1]), Math.abs(a - b) + 0.01, a + b - 0.01);
    const base = angleOf(d0);
    const off = deg(Math.acos(clamp((a * a + d * d - b * b) / (2 * a * d), -1, 1)));
    const first = base + bendSign * off;
    const joint = add(root, dir(first, a));
    const second = angleOf(sub(target, joint));
    return { first, second, joint, end: add(joint, dir(second, b)) };
  }

  // ---------------------------------------------------------------- side-view rig
  function sideLeg(p, side, hip) {
    let h = p[side + 'H'] || 0;
    let k = p[side + 'K'] || 0;
    const foot = p[side + 'Foot'];
    let knee;
    let ankle;
    if (foot) {
      // Ankle pinned to a world point (e.g. wall sit): knee bends forward.
      const r = ik(hip, foot, LEN.thigh, LEN.shin, 1);
      knee = r.joint;
      ankle = r.end;
    } else {
      knee = add(hip, dir(h, LEN.thigh));
      ankle = add(knee, dir(h - k, LEN.shin));
    }
    const f = p[side + 'F'] || 0;
    const u = dir(90 - f);           // heel → toe
    const n = dir(-f);               // towards the sole
    return {
      hip, knee, ankle, n,
      heel: add(ankle, add(mul(u, -9), mul(n, SOLE_DROP))),
      toe: add(ankle, add(mul(u, 27), mul(n, SOLE_DROP)))
    };
  }

  function sideFigure(p) {
    // 1) Legs + torso relative to a pelvis at the origin.
    const pelvis0 = [0, 0];
    let near = sideLeg(p, 'n', pelvis0);
    if (p.plantFar) {
      // Straight back leg whose foot lands at the same height as the near foot.
      const drop = near.ankle[1];
      p = Object.assign({}, p, { fH: -deg(Math.acos(clamp(drop / (LEN.thigh + LEN.shin), -1, 1))), fK: 0 });
    }
    const far0 = sideLeg(p, 'f', add(pelvis0, [-3, 0]));

    // 2) Place the figure in the world: on the ground, or at a fixed pelvis height.
    let px = p.x == null ? 150 : p.x;
    let py = p.y == null ? 161 : p.y;
    if (p.ground !== false && !p.nFoot) {
      const feet = p.support === 'near' ? [near] : p.support === 'far' ? [far0] : [near, far0];
      const lowest = Math.max(...feet.flatMap(l => [l.heel[1], l.toe[1]]));
      py = GROUND - 2 - lowest;
    }
    if (p.footX != null) {
      const ref = p.anchor === 'far' ? far0 : near;
      px = p.footX - ref.toe[0];
    }
    const off = [px, py];
    const pelvis = off;
    const shift = l => ({ hip: add(l.hip, off), knee: add(l.knee, off), ankle: add(l.ankle, off), heel: add(l.heel, off), toe: add(l.toe, off), n: l.n });
    near = p.nFoot ? sideLeg(p, 'n', pelvis) : shift(near);
    const far = p.fFoot ? sideLeg(p, 'f', add(pelvis, [-3, 0])) : shift(far0);

    // 3) Torso, head.
    const t = p.torso || 0;
    const shoulder = add(pelvis, dir(180 - t, LEN.torso));
    const waist = lerpP(pelvis, shoulder, 0.3);
    const na = t + (p.neck || 0);
    const neckTop = add(add(shoulder, dir(180 - na, LEN.neck)), [p.headX || 0, 0]);
    const head = add(neckTop, dir(180 - na, LEN.head * 0.9));

    // 4) Arms: either joint angles or hands pinned to a target.
    const arm = (side, sh) => {
      const target = p[side + 'Hand'];
      if (target) {
        const r = ik(sh, target, LEN.upper, LEN.fore, p[side + 'Bend'] == null ? -1 : p[side + 'Bend']);
        return { shoulder: sh, elbow: r.joint, hand: r.end };
      }
      const a = p[side + 'A'] || 0;
      const e = p[side + 'E'] || 0;
      const elbow = add(sh, dir(a, LEN.upper));
      return { shoulder: sh, elbow, hand: add(elbow, dir(a + e, LEN.fore)) };
    };
    return {
      view: 'side', pelvis, waist, shoulder, neckTop, head, torso: t,
      nLeg: near, fLeg: far,
      nArm: arm('n', shoulder), fArm: arm('f', add(shoulder, [-4, 1]))
    };
  }

  // ---------------------------------------------------------------- front-view rig
  function frontFigure(p) {
    const legFor = (s, a, hip) => {
      const d = [s * Math.sin(rad(a)), Math.cos(rad(a))];
      const knee = add(hip, mul(d, LEN.thigh));
      const ankle = add(knee, mul(d, LEN.shin));
      return { hip, knee, ankle, bottom: ankle[1] + 14 };
    };
    // Character's right side is on the viewer's left (s = -1).
    const rA = p.rLeg || 0;
    const lA = p.lLeg || 0;
    const tmpR = legFor(-1, rA, [-13, 0]);
    const tmpL = legFor(1, lA, [13, 0]);
    const lowest = Math.max(tmpR.bottom, tmpL.bottom);
    const pelvis = [p.x == null ? 150 : p.x, GROUND - 2 - lowest];
    const rLeg = legFor(-1, rA, add(pelvis, [-13, 0]));
    const lLeg = legFor(1, lA, add(pelvis, [13, 0]));
    const t = p.torso || 0;
    const chest = add(pelvis, [Math.sin(rad(t)) * LEN.torso, -Math.cos(rad(t)) * LEN.torso]);
    const neckTop = add(chest, [0, -LEN.neck]);
    const head = add(neckTop, [0, -LEN.head * 0.9]);
    const arm = (s, side) => {
      const sh = add(chest, [s * 21, 6]);
      const target = p[side + 'Hand'];
      if (target) {
        const r = ik(sh, target, LEN.upper, LEN.fore, p[side + 'Bend'] == null ? 1 : p[side + 'Bend']);
        return { shoulder: sh, elbow: r.joint, hand: r.end };
      }
      const a = p[side + 'A'] || 0;
      const e = p[side + 'E'] || 0;
      const elbow = add(sh, [s * Math.sin(rad(a)) * LEN.upper, Math.cos(rad(a)) * LEN.upper]);
      const fa = a + e;
      return { shoulder: sh, elbow, hand: add(elbow, [s * Math.sin(rad(fa)) * LEN.fore, Math.cos(rad(fa)) * LEN.fore]) };
    };
    return { view: 'front', pelvis, chest, neckTop, head, rLeg, lLeg, rArm: arm(-1, 'r'), lArm: arm(1, 'l') };
  }

  // ---------------------------------------------------------------- drawing
  const line = (a, b, w, c) => `<line x1="${f1(a[0])}" y1="${f1(a[1])}" x2="${f1(b[0])}" y2="${f1(b[1])}" stroke="${c}" stroke-width="${w}" stroke-linecap="round"/>`;
  const circle = (c, r, fill, extra = '') => `<circle cx="${f1(c[0])}" cy="${f1(c[1])}" r="${f1(r)}" fill="${fill}" ${extra}/>`;
  const rect = (x, y, w, h, fill, rx = 0) => `<rect x="${f1(x)}" y="${f1(y)}" width="${f1(w)}" height="${f1(h)}" rx="${rx}" fill="${fill}"/>`;

  function drawShoe(leg, far) {
    const lift = mul(leg.n, -6);
    return line(add(leg.heel, lift), add(leg.toe, lift), 12, far ? COLORS.shoeFar : COLORS.shoe) +
      line(leg.heel, leg.toe, 4, COLORS.sole);
  }

  function drawSideLeg(leg, far) {
    const pants = far ? COLORS.pantsFar : COLORS.pants;
    return line(leg.ankle, add(leg.ankle, mul(leg.n, 5)), 11, far ? COLORS.skinFar : COLORS.skin) +
      drawShoe(leg, far) +
      line(leg.hip, leg.knee, 29, pants) +
      line(leg.knee, leg.ankle, 23, pants);
  }

  function drawSideArm(arm, far, female) {
    const skin = far ? COLORS.skinFar : COLORS.skin;
    const top = far ? COLORS.topFar : COLORS.top;
    const upperColor = female ? top : skin;
    return line(arm.shoulder, arm.elbow, female ? 17 : 16, upperColor) +
      line(arm.elbow, arm.hand, 13, skin) +
      circle(arm.hand, 7.5, skin) +
      (female ? '' : circle(arm.shoulder, 11, top));
  }

  function drawHead(head, female, front) {
    if (front) {
      return circle(add(head, [0, -4]), 21, COLORS.hair) +
        (female ? circle(add(head, [0, -24]), 9, COLORS.hair) : '') +
        circle(add(head, [0, 3]), 18.5, COLORS.skin);
    }
    return circle(add(head, [-5, -4]), female ? 22 : 21, COLORS.hair) +
      (female ? circle(add(head, [-19, -12]), 9, COLORS.hair) : '') +
      circle(add(head, [3, 2]), 18.5, COLORS.skin);
  }

  function glowPoint(fig, spot) {
    if (fig.view === 'front') return spot === 'hip' ? fig.lLeg.hip : fig.chest;
    switch (spot) {
      case 'upperBack': return add(lerpP(fig.shoulder, fig.pelvis, 0.28), [-17, 0]);
      case 'neck': return add(fig.neckTop, [-7, 4]);
      case 'chest': return add(lerpP(fig.shoulder, fig.pelvis, 0.22), [14, 0]);
      case 'calf': return lerpP(fig.fLeg.knee, fig.fLeg.ankle, 0.4);
      case 'calfNear': return lerpP(fig.nLeg.knee, fig.nLeg.ankle, 0.4);
      case 'thigh': return lerpP(fig.nLeg.hip, fig.nLeg.knee, 0.55);
      case 'hamstring': return add(lerpP(fig.nLeg.hip, fig.nLeg.knee, 0.5), [0, 8]);
      default: return fig.shoulder;
    }
  }

  function drawSide(fig, female) {
    return drawSideArm(fig.fArm, true, female) +
      drawSideLeg(fig.fLeg, true) +
      circle(fig.pelvis, 19, COLORS.pants) +
      line(fig.pelvis, fig.waist, 37, COLORS.pants) +
      line(fig.shoulder, fig.neckTop, 13, COLORS.skin) +
      line(fig.waist, fig.shoulder, female ? 33 : 37, COLORS.top) +
      drawSideLeg(fig.nLeg, false) +
      drawHead(fig.head, female, false) +
      drawSideArm(fig.nArm, false, female);
  }

  function drawFront(fig, female) {
    const c = fig.chest;
    const p = fig.pelvis;
    const sw = female ? 21 : 24;
    const legs = [fig.rLeg, fig.lLeg].map((l, i) => {
      const s = i === 0 ? -1 : 1;
      const shoe = add(l.ankle, [s * 2, 7]);
      return line(l.hip, l.knee, 26, COLORS.pants) + line(l.knee, l.ankle, 22, COLORS.pants) +
        `<ellipse cx="${f1(shoe[0])}" cy="${f1(shoe[1])}" rx="12" ry="7" fill="${COLORS.shoe}"/>` +
        line(add(shoe, [-11, 6]), add(shoe, [11, 6]), 3, COLORS.sole);
    }).join('');
    const arms = [fig.rArm, fig.lArm].map(a =>
      line(a.shoulder, a.elbow, 15, female ? COLORS.top : COLORS.skin) + line(a.elbow, a.hand, 12, COLORS.skin) + circle(a.hand, 7, COLORS.skin)).join('');
    const shirt = `<path d="M ${f1(c[0] - sw)} ${f1(c[1] + 4)} Q ${f1(c[0])} ${f1(c[1] - 6)} ${f1(c[0] + sw)} ${f1(c[1] + 4)} L ${f1(p[0] + 18)} ${f1(p[1] - 22)} L ${f1(p[0] - 18)} ${f1(p[1] - 22)} Z" fill="${COLORS.top}" stroke="${COLORS.top}" stroke-width="8" stroke-linejoin="round"/>`;
    const shorts = `<path d="M ${f1(p[0] - 19)} ${f1(p[1] - 24)} L ${f1(p[0] + 19)} ${f1(p[1] - 24)} L ${f1(p[0] + 22)} ${f1(p[1] + 6)} L ${f1(p[0] - 22)} ${f1(p[1] + 6)} Z" fill="${COLORS.pants}" stroke="${COLORS.pants}" stroke-width="8" stroke-linejoin="round"/>`;
    return legs + shorts + line(c, fig.neckTop, 13, COLORS.skin) + shirt + drawHead(fig.head, female, true) + arms;
  }

  // ---------------------------------------------------------------- props
  function drawProp(pr, t, spec) {
    switch (pr.type) {
      case 'wall': {
        const x = pr.x;
        const w = 70;
        const left = pr.side === 'left';
        return rect(left ? x - w : x, -24, w, GROUND + 24, COLORS.wall) +
          line([x, -24], [x, GROUND], 3, COLORS.wallEdge) +
          rect(left ? x - w : x, GROUND - 12, w, 12, COLORS.wallEdge);
      }
      case 'chair': {
        // Side view, back-rest on the left; person sits facing right.
        const x = pr.x;
        return line([x + 4, SEAT_TOP], [x + 4, 150], 8, COLORS.woodDark) +
          rect(x - 2, 150, 14, 46, COLORS.wood, 4) +
          line([x + 8, SEAT_TOP + 6], [x + 8, GROUND], 7, COLORS.woodDark) +
          line([x + 56, SEAT_TOP + 6], [x + 56, GROUND], 7, COLORS.woodDark) +
          rect(x - 2, SEAT_TOP, 66, 10, COLORS.wood, 4);
      }
      case 'chairBack': {
        // Side view, person stands behind it holding the back-rest (post at x, seat to the right).
        const x = pr.x;
        const top = pr.top || 172;
        return line([x, top + 6], [x, GROUND], 8, COLORS.woodDark) +
          rect(x - 6, top, 14, 40, COLORS.wood, 4) +
          line([x + 54, SEAT_TOP + 6], [x + 54, GROUND], 7, COLORS.woodDark) +
          rect(x - 4, SEAT_TOP, 64, 10, COLORS.wood, 4);
      }
      case 'chairFront': {
        // Front view chair beside the person.
        const x = pr.x;
        const top = pr.top || 172;
        return line([x - 22, top + 6], [x - 22, GROUND], 7, COLORS.woodDark) +
          line([x + 22, top + 6], [x + 22, GROUND], 7, COLORS.woodDark) +
          rect(x - 28, top, 56, 16, COLORS.wood, 5) +
          rect(x - 28, SEAT_TOP, 56, 10, COLORS.wood, 4);
      }
      case 'counter': {
        const x = pr.x;
        const top = pr.top || GROUND - 142;
        return rect(x, top + 6, 90, GROUND - top - 6, COLORS.counter) + rect(x - 6, top, 96, 12, COLORS.counterTop, 4);
      }
      case 'door': {
        const x = pr.x;
        return rect(x - 9, -24, 18, GROUND + 24, COLORS.wood) + line([x + 9, -24], [x + 9, GROUND], 2, COLORS.woodDark);
      }
      case 'floorMarks': {
        // Scrolling floor dashes so walking-in-place reads as forward motion.
        const gap = pr.gap || 40;
        const shiftX = ((t / spec.duration) * (pr.speed || 80)) % gap;
        let out = '';
        for (let x = -gap; x < 340; x += gap) out += line([x - shiftX, GROUND + 7], [x - shiftX + 16, GROUND + 7], 4, '#CFCFD6');
        return out;
      }
      default:
        return '';
    }
  }

  // ---------------------------------------------------------------- keyframes
  const ease = k => 0.5 - 0.5 * Math.cos(Math.PI * k);

  function mix(a, b, k) {
    const out = Object.assign({}, a);
    Object.keys(b).forEach(key => {
      const va = a[key];
      const vb = b[key];
      if (typeof va === 'number' && typeof vb === 'number') out[key] = va + (vb - va) * k;
      else if (Array.isArray(va) && Array.isArray(vb)) out[key] = va.map((v, i) => v + (vb[i] - v) * k);
      else out[key] = k < 0.5 && va !== undefined ? va : vb;
    });
    return out;
  }

  function poseAt(spec, t) {
    const base = spec.base || {};
    if (typeof spec.pose === 'function') return Object.assign({}, base, spec.pose(t));
    const keys = spec.keys;
    const tt = ((t % spec.duration) + spec.duration) % spec.duration;
    for (let i = 0; i < keys.length; i++) {
      const a = keys[i];
      const b = keys[i + 1] || Object.assign({}, keys[0], { t: spec.duration });
      if (tt >= a.t && tt <= b.t) {
        const k = b.t === a.t ? 0 : ease((tt - a.t) / (b.t - a.t));
        return mix(Object.assign({}, base, a), Object.assign({}, base, b), k);
      }
    }
    return Object.assign({}, base, keys[0]);
  }

  function renderFrame(specOrId, t, gender) {
    const spec = typeof specOrId === 'string' ? SPECS[specOrId] : specOrId;
    if (!spec) return '';
    const p = poseAt(spec, t);
    const female = gender === 'female';
    const fig = spec.view === 'front' ? frontFigure(p) : sideFigure(p);
    const back = (spec.props || []).filter(pr => !pr.front).map(pr => drawProp(pr, t, spec)).join('');
    const front = (spec.props || []).filter(pr => pr.front).map(pr => drawProp(pr, t, spec)).join('');
    const shadowX = fig.pelvis[0];
    const glow = spec.glow && p.glow > 0.02
      ? circle(glowPoint(fig, spec.glow), 20 + 4 * p.glow, COLORS.glow, `opacity="${f1(0.28 * p.glow)}"`)
      : '';
    return rect(-40, GROUND, 380, 40, COLORS.floor) + back +
      `<ellipse cx="${f1(shadowX)}" cy="${GROUND + 2}" rx="52" ry="6" fill="${COLORS.shadow}"/>` +
      (spec.view === 'front' ? drawFront(fig, female) : drawSide(fig, female)) +
      glow + front;
  }

  // ---------------------------------------------------------------- exercise library
  const STAND = { x: 150, torso: 0, neck: 0, headX: 0, nA: 2, nE: 10, fA: -2, fE: 10, nH: 0, nK: 0, nF: 0, fH: 0, fK: 0, fF: 0, glow: 0 };
  const SEATED = Object.assign({}, STAND, { ground: false, x: 150, y: SEAT_Y, nH: 90, nK: 90, fH: 90, fK: 90, nHand: [204, 232], fHand: [200, 234] });

  const SPECS = {
    // ---------------- Strength ----------------
    ex_wall_sit: {
      label: 'Mini wall squat', duration: 5.6, glow: 'thigh',
      props: [{ type: 'wall', x: 96, side: 'left' }],
      base: Object.assign({}, STAND, { ground: false, x: 117, nFoot: [158, 319], fFoot: [154, 319], nA: 6, fA: 2 }),
      keys: [{ t: 0, y: 166, glow: 0 }, { t: 1.6, y: 198, glow: 1 }, { t: 3.6, y: 198, glow: 1 }, { t: 5.2, y: 166, glow: 0 }]
    },
    ex_wall_pushups: {
      label: 'Wall push-up', duration: 3.4, glow: 'chest',
      props: [{ type: 'wall', x: 238, side: 'right' }],
      base: Object.assign({}, STAND, { footX: 118, nHand: [234, 86], fHand: [233, 90] }),
      keys: [
        { t: 0, torso: 10, nH: -10, fH: -10, glow: 0 },
        { t: 1.4, torso: 22, nH: -22, fH: -22, glow: 1 },
        { t: 1.8, torso: 22, nH: -22, fH: -22, glow: 1 },
        { t: 3.2, torso: 10, nH: -10, fH: -10, glow: 0 }
      ]
    },
    ex_heel_drops: {
      label: 'Heel drops', duration: 2.4, glow: 'calfNear',
      props: [{ type: 'chairBack', x: 200, top: 146 }],
      base: Object.assign({}, STAND, { footX: 188, nHand: [200, 150], fHand: [198, 153] }),
      keys: [
        { t: 0, nF: 0, fF: 0, nK: 0, fK: 0, glow: 0 },
        { t: 0.9, nF: 30, fF: 30, glow: 1 },
        { t: 1.3, nF: 30, fF: 30, glow: 1 },
        { t: 1.5, nF: 0, fF: 0, nK: 8, fK: 8, glow: 0.3 },
        { t: 2.0, nF: 0, fF: 0, nK: 0, fK: 0, glow: 0 }
      ]
    },

    // ---------------- Balance ----------------
    ex_tandem_stand: {
      label: 'Heel-to-toe stand', duration: 4,
      props: [{ type: 'counter', x: 200, top: 152 }],
      base: Object.assign({}, STAND, { footX: 196, nHand: [204, 153], fA: -12, fE: 14 }),
      keys: [
        { t: 0, nH: 6, fH: -8, torso: -1.5 },
        { t: 2, nH: 8, fH: -6, torso: 1.5 }
      ]
    },
    ex_heel_toe_walk: {
      label: 'Heel-to-toe walk', duration: 2.4,
      props: [{ type: 'floorMarks', gap: 34, speed: 68 }],
      base: Object.assign({}, STAND, { x: 150, nE: 18, fE: 18 }),
      keys: [
        { t: 0, nH: 9, nK: 0, nF: -6, fH: -9, fK: 4, fF: 14, nA: -10, fA: 16 },
        { t: 0.6, nH: 2, nK: 0, nF: 0, fH: 18, fK: 36, fF: 6, nA: 0, fA: 4 },
        { t: 1.2, nH: -9, nK: 4, nF: 14, fH: 9, fK: 0, fF: -6, nA: 16, fA: -10 },
        { t: 1.8, nH: 18, nK: 36, nF: 6, fH: 2, fK: 0, fF: 0, nA: 4, fA: 0 }
      ]
    },
    ex_side_leg_raise: {
      label: 'Side leg raise', duration: 3.4, view: 'front', glow: 'hip',
      props: [{ type: 'chairFront', x: 92, top: 158 }],
      base: { x: 160, torso: 0, rLeg: 0, lLeg: 0, rHand: [106, 160], lA: 26, lE: -78, glow: 0 },
      keys: [
        { t: 0, lLeg: 0, torso: 0, glow: 0 },
        { t: 1.3, lLeg: 27, torso: -2, glow: 1 },
        { t: 2.1, lLeg: 27, torso: -2, glow: 1 },
        { t: 3.2, lLeg: 0, torso: 0, glow: 0 }
      ]
    },

    // ---------------- Flexibility ----------------
    ex_calf_stretch: {
      label: 'Wall calf stretch', duration: 5.2, glow: 'calf',
      props: [{ type: 'wall', x: 246, side: 'right' }],
      base: Object.assign({}, STAND, { footX: 214, plantFar: true, nHand: [242, 96], fHand: [241, 100] }),
      keys: [
        { t: 0, torso: 12, nH: 14, nK: 16, glow: 0 },
        { t: 1.6, torso: 22, nH: 28, nK: 38, glow: 1 },
        { t: 3.8, torso: 22, nH: 28, nK: 38, glow: 1 },
        { t: 5.0, torso: 12, nH: 14, nK: 16, glow: 0 }
      ]
    },
    ex_chest_stretch: {
      label: 'Doorway chest stretch', duration: 5.2, glow: 'chest',
      props: [{ type: 'door', x: 104 }],
      base: Object.assign({}, STAND, { footX: 150, anchor: 'far', nHand: [110, 34], fHand: [107, 37], nBend: 1, fBend: 1 }),
      keys: [
        { t: 0, nH: 0, nK: 0, fH: 0, torso: 2, glow: 0 },
        { t: 1.6, nH: 16, nK: 12, fH: -6, torso: 6, glow: 1 },
        { t: 3.8, nH: 16, nK: 12, fH: -6, torso: 6, glow: 1 },
        { t: 5.0, nH: 0, nK: 0, fH: 0, torso: 2, glow: 0 }
      ]
    },
    ex_ankle_circles: {
      label: 'Seated ankle circles', duration: 2.4,
      props: [{ type: 'chair', x: 124 }],
      base: Object.assign({}, SEATED, { nH: 96, nHand: [140, 250], fHand: [137, 252] }),
      pose: t => {
        const w = (2 * Math.PI * t) / 2.4;
        return { nK: 58 + 5 * Math.cos(w), nF: 24 * Math.sin(w) };
      }
    },
    ex_hamstring_stretch: {
      label: 'Seated hamstring stretch', duration: 5.2, glow: 'hamstring',
      props: [{ type: 'chair', x: 124 }],
      base: Object.assign({}, SEATED, { x: 164, nH: 61.8, nK: 0, nF: -30 }),
      keys: [
        { t: 0, torso: 0, neck: 0, nHand: [188, 244], fHand: [185, 242], glow: 0 },
        { t: 1.8, torso: 18, neck: -10, nHand: [203, 251], fHand: [200, 249], glow: 1 },
        { t: 3.8, torso: 18, neck: -10, nHand: [203, 251], fHand: [200, 249], glow: 1 },
        { t: 5.0, torso: 0, neck: 0, nHand: [188, 244], fHand: [185, 242], glow: 0 }
      ]
    },

    // ---------------- Posture ----------------
    ex_shoulder_squeeze: {
      label: 'Shoulder blade squeeze', duration: 3.6, glow: 'upperBack',
      base: Object.assign({}, STAND, { x: 150 }),
      keys: [
        { t: 0, nA: 0, nE: 92, fA: -2, fE: 92, torso: 0, glow: 0 },
        { t: 1.1, nA: -24, nE: 100, fA: -26, fE: 100, torso: -2, glow: 1 },
        { t: 2.4, nA: -24, nE: 100, fA: -26, fE: 100, torso: -2, glow: 1 },
        { t: 3.4, nA: 0, nE: 92, fA: -2, fE: 92, torso: 0, glow: 0 }
      ]
    },
    ex_chin_tuck: {
      label: 'Chin tuck', duration: 3.2, glow: 'neck',
      props: [{ type: 'chair', x: 124 }],
      base: Object.assign({}, SEATED),
      keys: [
        { t: 0, headX: 0, neck: 0, glow: 0 },
        { t: 0.9, headX: -8, neck: -4, glow: 1 },
        { t: 2.1, headX: -8, neck: -4, glow: 1 },
        { t: 3.0, headX: 0, neck: 0, glow: 0 }
      ]
    },
    ex_wall_extension: {
      label: 'Wall back stretch', duration: 4.6, glow: 'upperBack',
      props: [{ type: 'wall', x: 240, side: 'right' }],
      base: Object.assign({}, STAND, { footX: 222 }),
      keys: [
        { t: 0, nHand: [236, 82], fHand: [235, 86], torso: 0, neck: 0, glow: 0 },
        { t: 1.8, nHand: [236, 4], fHand: [235, 8], torso: -3, neck: -10, glow: 1 },
        { t: 2.8, nHand: [236, 4], fHand: [235, 8], torso: -3, neck: -10, glow: 1 },
        { t: 4.4, nHand: [236, 82], fHand: [235, 86], torso: 0, neck: 0, glow: 0 }
      ]
    }
  };

  // ---------------------------------------------------------------- live animation manager
  const live = new Set();
  let rafId = 0;
  let lastDraw = 0;
  let io = null;
  const reduced = typeof global.matchMedia === 'function' && global.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function draw(inst, t) {
    inst.svg.innerHTML = renderFrame(inst.spec, t, inst.gender);
  }

  function tick(now) {
    rafId = 0;
    if (lastDraw && now - lastDraw < 32) {
      rafId = global.requestAnimationFrame(tick);
      return;
    }
    const dt = lastDraw ? Math.min(0.1, (now - lastDraw) / 1000) : 0;
    lastDraw = now;
    live.forEach(inst => {
      if (!inst.el.isConnected) {
        live.delete(inst);
        if (io) io.unobserve(inst.el);
        return;
      }
      if (inst.paused || !inst.visible) return;
      inst.elapsed = (inst.elapsed + dt) % inst.spec.duration;
      draw(inst, inst.elapsed);
    });
    if (live.size) rafId = global.requestAnimationFrame(tick);
    else lastDraw = 0;
  }

  function start() {
    if (!rafId && !reduced && typeof global.requestAnimationFrame === 'function') {
      lastDraw = 0;
      rafId = global.requestAnimationFrame(tick);
    }
  }

  function mount(el, opts = {}) {
    const spec = SPECS[el.dataset.anim];
    if (!spec) return null;
    const gender = opts.gender === 'female' ? 'female' : 'male';
    const existing = el._boneChar;
    if (existing && existing.spec === spec && existing.gender === gender && el.contains(existing.svg)) {
      if ('paused' in opts) setPaused(el, opts.paused);
      return existing;
    }
    el.innerHTML = `<svg class="char-svg" viewBox="${VIEWBOX}" preserveAspectRatio="xMidYMid meet" role="img" aria-label="${spec.label} demonstration"></svg>`;
    const inst = { el, svg: el.firstElementChild, spec, gender, elapsed: 0, paused: !!opts.paused, visible: true };
    el._boneChar = inst;
    live.add(inst);
    draw(inst, reduced ? spec.duration * 0.35 : 0);
    if ('IntersectionObserver' in global) {
      io = io || new global.IntersectionObserver(entries => entries.forEach(e => {
        if (e.target._boneChar) e.target._boneChar.visible = e.isIntersecting;
      }), { rootMargin: '120px 0px' });
      io.observe(el);
    }
    start();
    return inst;
  }

  function mountAll(root, opts = {}) {
    if (!root || !root.querySelectorAll) return;
    if (root.dataset && root.dataset.anim) mount(root, opts);
    root.querySelectorAll('[data-anim]').forEach(el => mount(el, opts));
  }

  function setPaused(target, paused) {
    if (!target) return;
    const els = target._boneChar ? [target] : Array.from(target.querySelectorAll ? target.querySelectorAll('[data-anim]') : []);
    els.forEach(el => {
      if (el._boneChar) el._boneChar.paused = paused;
    });
    if (!paused) start();
  }

  function restart(target) {
    if (target && target._boneChar) {
      target._boneChar.elapsed = 0;
      draw(target._boneChar, 0);
    }
  }

  global.BoneCharacter = {
    has: id => Object.prototype.hasOwnProperty.call(SPECS, id),
    ids: () => Object.keys(SPECS),
    duration: id => (SPECS[id] ? SPECS[id].duration : 0),
    renderFrame,
    poseAt: (id, t) => poseAt(SPECS[id], t),
    figureAt: (id, t) => { const p = poseAt(SPECS[id], t); return { pose: p, fig: SPECS[id].view === 'front' ? frontFigure(p) : sideFigure(p) }; },
    mount,
    mountAll,
    setPaused,
    restart,
    VIEWBOX
  };
})(typeof window !== 'undefined' ? window : globalThis);
