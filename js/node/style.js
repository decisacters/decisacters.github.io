/* global fs, node */
node = require('./node.js');

const path = 'C:/GitHub/temp/temp.html';
let content = fs.readFileSync(path, 'utf8');
content = content.replace(/\/\*(.*?)\*\//g, '// $1');
content = content.replace(/(^|\n) *(.*) *{/g, (match, p1, selector) => {
  return `$('${selector.trim()}').css({`;
});

while (content.match(/-(\w)(.*):/)) {
  content = content.replace(/-(\w)(.*):/g, (match, firstChar, propName) => {
    return `${firstChar.toUpperCase()}${propName.trim()}:`;
  });
}

content = content.replace(/:(.*);/g, (match, propVal) => {
  return `: \`${propVal.trim()}\`,`;
});

content = content.replace(/}/g, '});');

fs.writeFileSync(path, content, 'utf8');
node.writeJS('C:/GitHub/temp/temp.js');
