/**
 * Checks every language file in js/i18n/ against tests/i18n-catalog.json
 * (all English UI strings; rebuild it with `node scratch/i18n_catalog.js`).
 *   node tests/i18n.test.js
 */
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const CODES = ['hi', 'bn', 'mr', 'te', 'ta', 'gu', 'kn', 'ml', 'pa', 'or', 'as'];
// Main Unicode block of each script, to catch text left in the wrong script.
const SCRIPT = { hi: /[ऀ-ॿ]/, mr: /[ऀ-ॿ]/, bn: /[ঀ-৿]/, pa: /[਀-੿]/, gu: /[઀-૿]/, or: /[଀-୿]/, ta: /[஀-௿]/, te: /[ఀ-౿]/, kn: /[ಀ-೿]/, ml: /[ഀ-ൿ]/, as: /[ঀ-৿]/ };
const catalog = JSON.parse(fs.readFileSync(path.join(__dirname, 'i18n-catalog.json'), 'utf8'));
const placeholders = s => (s.match(/\{\w+\}/g) || []).sort().join(',');

let pass = 0;
let fail = 0;
function assert(cond, name, details = '') {
  if (cond) { pass++; console.log(`  ✅ PASS: ${name}`); } else { fail++; console.error(`  ❌ FAIL: ${name}${details ? `\n       ${details}` : ''}`); }
}

const only = process.argv[2];
for (const code of CODES.filter(c => !only || c === only)) {
  const file = path.join(__dirname, '..', 'js', 'i18n', `${code}.js`);
  if (!fs.existsSync(file)) { assert(false, `${code}: js/i18n/${code}.js exists`); continue; }
  let dict = null;
  let registered = null;
  vm.runInNewContext(fs.readFileSync(file, 'utf8'), { BoneI18n: { register: (c, d) => { registered = c; dict = d; } } });
  assert(registered === code && dict, `${code}: file registers its own language`);
  if (!dict) continue;
  const missing = catalog.filter(k => !(k in dict));
  const extra = Object.keys(dict).filter(k => !catalog.includes(k));
  const empty = Object.keys(dict).filter(k => !String(dict[k]).trim());
  const badPh = Object.keys(dict).filter(k => placeholders(k) !== placeholders(dict[k]));
  const wrongScript = Object.keys(dict).filter(k => /[a-z]{4,}/i.test(k.replace(/BONE SIP|WhatsApp|OTP|DXA|FRAX|BMI|PDF|T-score|AI|IU|mcg|mg|English|SIP/gi, '')) && !SCRIPT[code].test(dict[k]));
  assert(!missing.length, `${code}: translates all ${catalog.length} strings`, missing.slice(0, 15).join(' | '));
  assert(!extra.length, `${code}: no unknown keys`, extra.slice(0, 15).join(' | '));
  assert(!empty.length, `${code}: no empty translations`, empty.join(' | '));
  assert(!badPh.length, `${code}: placeholders ({0}, {name}…) kept`, badPh.slice(0, 10).join(' | '));
  assert(!wrongScript.length, `${code}: every sentence is written in its own script`, wrongScript.slice(0, 10).join(' | '));
}
console.log(`\n🏁 I18N TESTS: ${pass} Passed, ${fail} Failed`);
process.exit(fail ? 1 : 0);
