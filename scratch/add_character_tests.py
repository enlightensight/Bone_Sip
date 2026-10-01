"""Precache js/character.js and add animation integrity tests."""
import pathlib
import re

sw = pathlib.Path('sw.js')
s = sw.read_text(encoding='utf-8')
if 'js/character.js' not in s:
    s = s.replace('"js/app.js?v=3.0",', '"js/app.js?v=3.0",\n  "js/character.js?v=3.1",', 1)
s = re.sub(r"const CACHE_VERSION = 'bonesip-v[\d.]+';", "const CACHE_VERSION = 'bonesip-v3.2.0';", s)
sw.write_text(s, encoding='utf-8')
print('sw.js updated')

t = pathlib.Path('tests/app.test.js')
src = t.read_bytes().decode('utf-8').replace('\r\n', '\n')
anchor = "// -----------------------------------------------------------------------------\n// STEP 2"
if src.count(anchor) != 1:
    raise SystemExit('anchor not found')
block = r"""// Animated coach characters for moves without a filmed video
console.log('\n--- 1c. Testing Animated Coach Characters ---');
global.window = global.window || globalThis;
require('../js/character.js');
const BC = globalThis.BoneCharacter;
const needAnim = WL.filter(e => !e.video).map(e => e.id);
assert(needAnim.every(id => BC.has(id)), `Every move without a video has an animation (${needAnim.length} moves)`);
let badFrames = 0;
let worstHand = 0;
let worstFoot = 0;
BC.ids().forEach(id => {
  const d = BC.duration(id);
  for (let i = 0; i <= 24; i++) {
    const t = (d * i) / 24;
    ['male', 'female'].forEach(g => { if (/NaN|undefined|Infinity/.test(BC.renderFrame(id, t, g))) badFrames++; });
    const { pose, fig } = BC.figureAt(id, t);
    [['nHand', 'nArm'], ['fHand', 'fArm'], ['rHand', 'rArm'], ['lHand', 'lArm']].forEach(([k, arm]) => {
      if (pose[k] && fig[arm]) worstHand = Math.max(worstHand, Math.hypot(fig[arm].hand[0] - pose[k][0], fig[arm].hand[1] - pose[k][1]));
    });
    const soles = fig.view === 'front' ? [fig.rLeg.bottom, fig.lLeg.bottom] : [fig.nLeg.heel[1], fig.nLeg.toe[1], fig.fLeg.heel[1], fig.fLeg.toe[1]];
    worstFoot = Math.max(worstFoot, Math.max(...soles) - 328);
  }
});
assert(badFrames === 0, 'Every animation frame renders valid SVG (male and female coach)');
assert(worstHand < 3, `Hands holding a chair, wall or counter stay on it (worst miss ${worstHand.toFixed(1)}px)`);
assert(worstFoot < 1, `Feet never sink through the floor (worst ${worstFoot.toFixed(1)}px)`);

"""
src = src.replace(anchor, block + anchor)
t.write_bytes(src.replace('\n', '\r\n').encode('utf-8'))
print('tests added')
