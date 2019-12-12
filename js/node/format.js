/* global fs */
const node = require('./node.js');
const links = node.traverseDir(`c:/github/links/`);
const notes = node.traverseDir(`c:/github/notes/`);
notes.concat(links).forEach((file) => {
  if (!file.match(/html/)) return;
  let content = fs.readFileSync(file, 'utf8');
  const script = content.match(/<script>(.*\r?\n.*)*script>/);
  content = node.updateContent(content);
  content = content.replace(
      /src=".*?.mozillademos.org\/\w+\/(.*)" \w+=".*?"/g,
      'class="mdn-img" src="$1"');

  // #region mdn link
  content = content.replace(
      /href="\/en-US\/docs\/(Web|Glossary)\//g,
      (match, type) => {
        return `class="mdn-${type.toLowerCase()}" href="`;
      });
  content = content.replace(
      /glossary" href="(\w+(\/\w+)?)"/g,
      (match, glossary, suffix) => {
        return suffix ? match : `glossary"`;
      });
  content = content.replace(
      /web" href="(SVG|HTML)\/\w+\/\w+(-\w+)?"/g,
      (match, markup, suffix) => {
        return `${markup}" ${suffix ? 'href="' : ''}`;
      });
  content = content.replace(/web" href="API\//g, `api" href="`);
  content = content.replace(/web" href="CSS\/[:@]*\w+(-\w+)*"/g, `css"`);
  content = content.replace(/ class="glossaryLink"/g, ``);
  content = content.replace(
      /web" href="JavaScript\/\w+\/Global_Objects\/(\w+)/g,
      'objects" href="$1');
  // #endregion mdn link

  // #region mdn code
  while (content.match(/<span class="token.*?>(.*?)<\/span>/)) {
    content = content.replace(/<span class="token.*?>(.*?)<\/span>/g, '$1');
  }
  content = content.replace(/ (title|alt|rel)=".*?"|<span><\/span>/g, '');
  content = content.replace(/ \w+="external"/g, '');
  content = content.replace(/ *language-/g, 'my-');
  content = content.replace(/<pre.*?>/g, '<pre>');
  content = content.replace(/<(span) \w+(-\w+)+="\w+" \w+=".*?"><\/\1>/g, '');
  content = content.replace(/( *\r?\n)+/g, '\n');
  // #endregion mdn code

  // #region vscode
  content = content.replace(
      /src=".assets.*\/(.*.gif)"/g,
      'class="vsc-img" src="$1"');
  content = content.replace(
      /<span class="key.*?>(.*?)<\/span>/g,
      '<code>$1</code>');
  content = content.replace(/ class="dynamic-key.*?">/g, '>');

  // #endregion vscode

  // code
  content = content.replace(
      /( *)(<pre><code class=".*?">)(?!\n)/g,
      '$1$2\n$1  ');
  content = content.replace(
      /( *)(.*)(?<![\n ])<\/code><\/pre>/g,
      (match, space, p2) => {
        return `${space}${p2}\n${space.replace(/ {2}/, '')}</code></pre>`;
      });

  if (script) {
    content = content.replace(/<script>(.*\r?\n.*)*script>/, script[0]);
  }
  fs.writeFileSync(file, content, 'utf8');
});
