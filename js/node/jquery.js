/* global fs, node */
node = require('./node.js');

const path = 'C:/GitHub/temp/temp.html';
let content = fs.readFileSync(path, 'utf8');
content = content.replace(/document\.querySelector(All)?/g, '$');
content = content.replace(/\.style.(\w+) = '(.*?)'/g, '.css({ $1: `$2` })');
content = content.replace(/\.(\w+) = (true|false)/g, '.attr({ $1: $2 })');
content = content.replace(/(\w+).parentNode.removeChild\(\1\)/g, '$1.remove()');
content = content.replace(/(?<=\.)offset(\w+)/g, (match, func) => {
  return `${func.toLowerCase()}()`;
});

// prop to function
content = content.replace(
    /(\w+)\.(textContent|value|inner(HTML|Text))( \+?= .*?;(?=\r\n))?/g,
    (match, variable, prop, p2, setValue) => {
      let func;
      if (prop.match(/value/i)) func = 'val';
      else if (prop.match(/text/i)) func = 'text';
      else if (prop.match(/html/i)) func = 'html';
      let replacement;
      if (setValue) {
        const param = setValue.match(/(?<== ).*?(?=;$)/)[0];
        replacement = `${variable}.${func}(${param});`;
      } else {
        replacement = `${variable}.${func}()`;
      }
      if (setValue && setValue.match(/\+=/)) {
        replacement = replacement.replace(
            `${func}(`,
            `${func}(${variable}.${func}() + `);
      }
      return replacement;
    });

// attribute

content = content.replace(
    /setAttribute\('(\w+)', (.*?)\)/g,
    (match, attrName, attrVal) => {
      if (attrName.match(/class/)) {
        return `addClass(${attrVal})`;
      } else {
        return `attr({${attrName}: ${attrVal}})`;
      }
    });

// event

content = content.replace(
    /( *)(.*)\.(addEventListener\('|on)(\w+)(', | = )(\w+)((.*\r\n)*?\1})?/g,
    (match, space, variable, p1, event, p2, listener, func) => {
      if (listener.match(/function/)) {
        listener += func;
      }
      if (event.match(/click/)) {
        return `${space}${variable}.${event}(${listener})`;
      } else {
        return `${space}${variable}.on('${event}', ${listener})`;
      }
    });

// create element

let regExp = `(\\w+) = \\w+.createElement\\('(\\w+)'\\);`;
regExp += `\\r\\n(.*?\\r\\n)*`;
regExp += ` +(\\w+(.\\w+)*).appendChild\\(\\1\\);`;
content = content.replace(
    RegExp(regExp, 'g'),
    (match, variable, tag, attr, parent) => {
      parent = parent.replace(/document\./g, '');
      return `${variable} = $('<${tag}>').appendTo(${parent});\n${attr}`;
    });

// combine chain function
while (content.match(/(?<=\n *)(\w+)(\.\w+\(.*?\))*;\r\n *\1(.\w+\(.*?\))*;/)) {
  content = content.replace(
      /(?<=\n *)(\w+)(\.\w+\(.*?\))*;\r\n *\1(.\w+\(.*?\))*;/g,
      (match, variable, func1, func2) => {
        return `${variable}${func1}${func2};`;
      });
}

// combine assignment with chain function
content = content.replace(
    /(\w+) = \w+.(.\w+\(.*?\))*;\r\n *\1(.\w+\(.*?\))*;/g,
    (match, variable, func1, func2) => {
      return `${variable}${func1}${func2};`;
    });

fs.writeFileSync(path, content, 'utf8');
node.writeJS('C:/GitHub/temp/temp.js');
