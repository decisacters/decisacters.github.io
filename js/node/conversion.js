node = require('./node.js');

function toJavaScript(content) {
  // string
  content = content.replace(/`/g, '\\'); // escape
  content = content.replace(/\.ps1/g, '.js'); // script file
  content = content.replace(/\. (['"])?([a-zA-Z]:.*)\1/g, (match, p1, p2) => {
    return `const modules = require('${p2.replace(/\\/g, '/')}')`;
  }); // require module
  content = content.replace(/"?[a-zA-Z]:\\[\\\S|*\S]?(.*?)[ \n]/g, (match) => {
    result = match.match('"') ? match : `'${match.trimEnd(' ')}' `;
    return `${result.replace(/\\/g, '/')}`;
  });

  // comment
  content = content.replace(/<#/g, '/*'); // comment block start tag
  content = content.replace(/#>/g, '*/'); // comment block end tag
  content = content.replace(/(\n\s*)#/g, '$1//'); // comment line tag

  // pipelines
  function convertPipeline(match) {
    const matches = match.split(' | ');
    let result = matches[0];
    for (let i = 0; i < matches.length - 1; i++) {
      result = `${matches[i+1]} (${result})`;
    }
    return result.replace(/ -\w+/, '');
  }
  let regexp = RegExp('\\(??(.*?) \\| (.*?)(?=\\))', 'g');
  content = content.replace(regexp, (match) => {
    return convertPipeline(match);
  });
  content = content.replace(/(\s*)(.*) \| ForEach-Object(.*\r\n)(.*?\1})/, `$1$2.each(function ()$3$4)`);
  regexp = RegExp('(.*= )?(.*?) \\| (.*)', 'g');
  content = content.replace(regexp, (match, s1) => {
    s1 = s1 == undefined ? '' : s1;
    return `${s1}${convertPipeline(match.replace(s1, ''))}`;
  });

  // operator
  content = content.replace(/ -replace (['"])(.*?)(?<!\\)\1(, \1(.*?)(?<!\\)\1)?/g, (match, p1, p2, p3, p4) => {
    p4 = p4 == undefined ? '' : p4;
    return `.replace(/${p2.replace(/\//g, '\\/')}/, '${p4.replace(/\\/g, '\\\\')}')`;
  }); // replace
  content = content.replace(/ -(not)?(match) (['"])(.*?)\3/g, '.$1$2(/$4/)'); // match or join
  content = content.replace(/ -(join) (['"])(.*?)\2/g, '.$1($2$3$2)'); // match or join
  content = content.replace(/ -and /g, ' && '); // and
  content = content.replace(/ -or /g, ' || '); // or
  content = content.replace(/ -eq /g, ' == '); // equal

  // blocks
  content = content.replace(/foreach/g, 'for');

  // function
  content = content.replace(/(\w+)-(\w+) (.*)/g, (match, p1, p2, p3) => {
    let parameters = `${p3.replace(/ -\w+/g, '').replace(/ (\w+) (\w+)/g, ' $1, $2')}`;
    parameters = parameters.replace(/"/g, '`');
    parameters = parameters.match(/`/) ? parameters.replace(/\$(\w+)/g, '${$1}') : parameters;
    parameters = parameters.match(/\(.*\)/) ? parameters : `(${parameters})`;
    result = `${p1.toLowerCase()}${p2}${parameters}`;
    return result;
  });
  content = content.replace(/(\w+)-(\w+) (.*)/g );
  content = content.replace(/(\s*)function(.*\r\n)*?\1}/g, (match) => {
    return match;
  });
  content = content.replace(/ -\w+/g, '');

  // Object
  content = content.replace(/(\s*)(.*) @{(.*\r\n)(.*?\1})/, (match, s1, s2, s3, s4) => {
    return `${s1}${s2} {${s3}${s4})`.replace(/=/g, ':').replace(/;/, ',');
  });
  content = content.replace(/\$_/g, 'this');
  content = content.replace(/\$(\w+)/g, '$1');

  // html
  content = content.replace(/\$(html|document).querySelector\((['"])(.*?)\2\)/g, '$(\'$3\')'); // selector
  content = content.replace(/\$(html|document).getElementsByClassName\((['"])(.*?)\2\)/g, '$(\'.$3\')'); // class
  content = content.replace(/\$(html|document).getElementsByTagName\((['"])(.*?)\2\)/g, '$(\'$3\')'); // tag
  content = content.replace(/.getAttribute\((['"])(.*?)\1\)/g, '.attr(\'$2\')'); // attribute

  // array
  content = content.replace(/@\(\)/g, '[]'); // create
  content = content.replace(/ \+= , (.*)/g, '.push($1)'); // push
  return content;
}

function toPowershell(content) {
  const keywords = ['class', 'static'];

  // line breaker
  content = content.replace(/,\s*\n\s*/g, ', '); // remove void return

  // string
  content = content.replace(/@"/g, '"'); // remove void return

  // comment
  content = content.replace(/\/\//g, '#'); // comment line tag

  // statement
  content = content.replace(/((?<=\n)|^)using /g, 'Add-Type -AssemblyName '); // comment line tag
  content = content.replace(/((?<=\n))(\s*)foreach( \(.*in.*\)(\s*\r\n)(.*\r\n)*)/g, (match, p1, p2, p3, p4, p5) => {
    return match;
  });

  // function
  content = content.replace(/((?<=\n\s*))public /g, ''); // remove public keyword
  content = content.replace(/ void /g, ' '); // remove void return

  // variable

  content = content.replace(/(?<=(\n\s*|\())(\w+)(\[\])? (\w+)/g, (match, p1, p2, p3, p4) => {
    const flag = keywords.includes(p2);
    if (!flag) {
      const regexp = RegExp(`${p4}`, 'g');

      function replaceVaraible(regexp, result) {
        content = content.replace(regexp, `$${result}`);
      }
      replaceVaraible(regexp, p4);
    }
    p3 = p3 == undefined ? '' : p3;
    return flag ? match : `[${p2}${p3}] $${p4}`;
  }); // remove void return

  // method
  content = content.replace(/(?<=[^Name] )([A-Z]\w+)\./g, '[$1]::'); // remove void return
  return content;
}

// var dirent = fs.readdirSync("C:/GitHub/temp", {withFileTypes: true});

path = 'C:/GitHub/powershell/New-WordSet.ps1';
path = 'C:/GitHub/temp/temp.ps1';
let content = fs.readFileSync(path, 'utf8');
content = toJavaScript(content);
path = 'C:/GitHub/temp/temp.js';
fs.writeFileSync(path, content, 'utf8');
