/* global node, fs ,path, literals */

node = require('./node.js');

/**
 * Update links and notes path
 */
function updateLiterals() {
  /**
   * Update html path in dir
   * @param {string} dir dir that contains html
   * @param {array} array array of objects whose path need to be update
   */
  function updateLinks(dir, array) {
    node.traverseDir(dir).forEach((file) => {
      const $ = node.loadHTML(file);
      const tags = [$('h1').text()];
      let href = file.replace(/\\/g, '/').replace(dir, '');
      href = href.replace(/.html$/, '');
      const note = array.find((html) => html.href == href);
      if (note && $('h1').length == 1) {
        node.pushElement(
            note.tags,
            $('h1').text(),
            (tag) => tag == $('h1').text());
      }
      node.pushElement(
          array,
          (note ? note : {href: href, tags: tags}),
          (note) => note.href == href);
    });
    let index;
    while ((index = array.findIndex((html) => {
      return !fs.existsSync(`${path.join(dir, html.href)}.html`);
    })) > -1) {
      array.splice(index, 1);
    }
  }

  const jsonPath = 'c:/github/js/json/literals.json';
  literals = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  updateLinks('c:/github/notes/', literals.notes);
  updateLinks('c:/github/links/', literals.links);
  node.writeJS(jsonPath);
}

/* function getGitStatus(string, cwd) {
  if (!string) return;
  const status = [];
  string.trim().split('\n').forEach((s) => status.push({
    status: s.trim().split('')[0],
    path: `${cwd}/${s.trim().match(/(?<= ).+/)[0].replace(/"/g, '')}`,
  }));
  return status;
} */

/* function execGitPush(cwd) {
  console.log(cwd);
  if (!fs.existsSync(`${cwd}/.git`)) node.exec(['git init'], cwd);
  node.exec(['git add .'], cwd);
  if (node.exec(['git status -s'], cwd)) {
    node.exec(['git commit -m "update"'], cwd);
  }
  if (!node.exec(['git remote'], cwd)) {
    node.exec([`git remote add origin "https://github.com/decisacter/${cwd.split('/').pop()}.git"`], cwd);
  }
  if (node.exec(['git diff --stat origin/master'], cwd)) {
    node.exec(['git push -u origin master -f'], cwd);
  }
} */

/**
 * Update VSCode extenstions and settings
 */
/* function backupWindows() {
  const file = 'C:/GitHub/ps1/Initialize-Windows.ps1';
  const settingsPath = `${process.env.APPDATA}/Code/User/settings.json`;
  const settings = fs.readFileSync(settingsPath, 'utf8');
  const extensions = node.exec(['code --list-extensions']);
  const json = node.exec(['npm ls -g -json']);
  const packages = Object.keys(JSON.parse(json).dependencies);
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(
      /\$extensions = ".*"/,
      `$extensions = "${extensions.trim().replace(/\r?\n(?!$)/g, '", "')}"`);
  content = content.replace(/\$settings = '.*(\r\n.*?)*'/, (match) => {
    return `$settings = '${settings.replace(
        /\n( *)/g,
        `\n$1${match.match(/ +(?=})/)[0]}`)}'`;
  });
  content = content.replace(
      /\$packages = ".*"/,
      `$packages = "${packages.join(' ')}"`);
  fs.writeFileSync(file, content, 'utf8');
} */

updateLiterals();
// backupWindows();
