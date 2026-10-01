const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');
const exStart = html.indexOf('id="buildSubViewExercise"');
const viewProtect = html.indexOf('id="view-protect"');
const sub = html.substring(exStart, viewProtect);
const tags = sub.match(/<\/?div[^>]*>/gi);
let depth = 0;
tags.forEach((t, i) => {
  const isClose = t.startsWith('</');
  if (isClose) depth--;
  console.log(i, 'depth:', depth, t.substring(0, 50));
  if (!isClose) depth++;
});
