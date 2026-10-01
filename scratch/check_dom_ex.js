const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');

const exStart = html.indexOf('id="buildSubViewExercise"');
const viewProtect = html.indexOf('id="view-protect"');
console.log('exStart index:', exStart, 'viewProtect index:', viewProtect);

const betweenEx = html.substring(exStart, viewProtect);
const opens = (betweenEx.match(/<div(\s|>)/gi) || []).length;
const closes = (betweenEx.match(/<\/div>/gi) || []).length;
console.log('Div opens inside exercise:', opens, 'closes:', closes);
console.log('Balance (opens - closes):', opens - closes);
