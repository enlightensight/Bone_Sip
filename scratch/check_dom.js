const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');

const dietStart = html.indexOf('id="buildSubViewDiet"');
const exStart = html.indexOf('id="buildSubViewExercise"');
console.log('dietStart index:', dietStart, 'exStart index:', exStart);

const between = html.substring(dietStart, exStart);
const opens = (between.match(/<div(\s|>)/gi) || []).length;
const closes = (between.match(/<\/div>/gi) || []).length;
console.log('Div opens between diet and exercise:', opens, 'closes:', closes);
console.log('Balance (opens - closes):', opens - closes);
