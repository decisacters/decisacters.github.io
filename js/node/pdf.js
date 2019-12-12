const node = require('./node.js');
// gr example completion

let content = content.replace(
    /example \d+\n/g,
    '</div>\n<div class="question">');
content = content.replace(/ ?\n?\([A-I]\) /g, '</div>\n<div class="choice">');
content = content.replace(
    /explanatory answer/g,
    '</div>\n<div class="explanation">');
content = content.replace(/Blank \d/g, '');

content = content.replace(/\n\d+(?=\n)/g, '\n');
content = content.replace(/explanatory answer/g, '');
content = content.replace(/ ?\n?\([A-I]\) /g, '</div>\n<div class="choice">');
content = content.replace(
    /\n\d+\. (?=Choice)/g,
    '</div>\n<div class="explanation">');
content = content.replace(/example \d+\*?\n/g, '</div>\n<div class="passage">');
content = content.replace(/\n\d+\. /g, '</div>\n<div class="question">');
