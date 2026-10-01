"""Add guided-workout data checks to tests/app.test.js."""
import pathlib

p = pathlib.Path('tests/app.test.js')
s = p.read_bytes().decode('utf-8').replace('\r\n', '\n')
anchor = "// -----------------------------------------------------------------------------\n// STEP 2"
if s.count(anchor) != 1:
    raise SystemExit('anchor not found')
block = r"""// Guided workouts (Exercise tab)
console.log('\n--- 1b. Testing Guided Workout Library ---');
const WL = BONE_DATA.workoutLibrary || [];
const WG = (BONE_DATA.exerciseGroups || []).map(g => g.id);
assert(['strength', 'balance', 'flexibility', 'posture'].every(g => WG.includes(g)), 'Exercise groups are Strength, Balance, Flexibility and Posture');
assert(WG.every(g => WL.some(e => e.group === g)), 'Every exercise group has at least one move');
assert(new Set(WL.map(e => e.id)).size === WL.length, 'Workout move IDs are unique');
assert(WL.every(e => Array.isArray(e.how) && e.how.length >= 3 && e.safety && (e.benefits || []).length && e.durationSec >= 15),
  'Every move has 3+ steps, a safety note, benefits and a duration');
const videoFiles = WL.filter(e => e.video).flatMap(e => [e.video.male, e.video.female]);
assert(videoFiles.every(f => fs.existsSync(path.join(__dirname, '..', f))), 'Every referenced coach video exists on disk');
// Each real clip may only illustrate one move, so no exercise ever plays a different movement's video.
const clipOwners = {};
WL.filter(e => e.video).forEach(e => [e.video.male, e.video.female].forEach(f => { clipOwners[f] = (clipOwners[f] || 0) + 1; }));
assert(Object.values(clipOwners).every(n => n === 1), 'No coach video is reused for a different exercise');
assert(WL.every(e => fs.existsSync(path.join(__dirname, '..', 'assets', 'icons3d', `${e.img}.webp`))), 'Every move has an illustration icon');

"""
s = s.replace(anchor, block + anchor)
p.write_bytes(s.replace('\n', '\r\n').encode('utf-8'))
print('tests added')
