/* global fs, os, cp, path, cheerio, modulesPath */
/* exported os */
/* exported path */
/* exported cp */
/* exported fs */
/* exported modulesPath */
/* global node */

fs = require('fs');
os = require('os');
path = require('path');
cp = require('child_process');

modulesPath = `${os.homedir}/AppData/Roaming/npm/node_modules`;
cheerio = require(`${modulesPath}/cheerio`);

exports.updateContent = function(content) {
  content = content.replace(/[\u2012-\u2015]|-/g, '-');
  content = content.replace(/&apos;|\u2018|\u2019/g, `'`);
  content = content.replace(/[\u201C-\u201F]/g, '"');
  content = content.replace(/\u2026/g, '...');
  content = content.replace(/\u2192/g, '-->');
  content = content.replace(/\u2190/g, '<--');
  content = content.replace(/\u0009/g, '');
  content = content.replace(/&nbsp;|\u00A0/g, ' ');
  content = content.replace(/\ufb01/g, 'fi');
  content = content.replace(/\ufb02/g, 'fl');
  content = content.replace(/\uff08/g, '(');
  content = content.replace(/\uff09/g, ')');
  content = content.replace(/\uff0c/g, ',');
  content = content.replace(/\uff1a/g, ':');
  content = content.replace(/\uff1f/g, '?');
  content = content.replace(/strong>/g, 'b>');
  content = content.replace(/em>/g, 'i>');
  content = content.replace(/<([^/]\w+)> +/g, '<$1>');
  content = content.replace(/(?<=\w) +<(\/\w+)>/g, '<$1>');
  content = content.replace(/(\/([ib]|sup)>)([a-zA-Z])/g, '$1 $3');
  content = content.replace(/([a-zA-Z,])(<[ib]>)/g, '$1 $2');
  content = content.replace(/<\/p> <p>/g, '</p><p>');
  content = content.replace(/[\u0080-\uffff]/g, (match) => {
    return `&#${match.charCodeAt(0)};`;
  });
  return content;
};

exports.readJS = function(path) {
  let content = fs.readFileSync(path, 'utf8');
  content = content.replace(/\r?\n */g, ' ').replace(/^.*? = /, '');
  content = content.replace(/([,{]) *([a-z0-9-]+?):/g, '$1"$2":');
  fs.writeFileSync(
      'C:/GitHub/temp/temp.json',
      content,
      'utf8');
  return JSON.parse(content);
};

exports.writeJS = function(path) {
  const name = global['path'].basename(path, global['path'].extname(path));
  const object = global[name];
  let content = `${name} = ${JSON.stringify(object)}`;

  content = content.replace(/(<\/?p>)\n*\s*\1/g, '$1');
  content = content.replace(/&#x(\w{4});/g, (match, p1) => {
    return String.fromCharCode(parseInt(`${p1.padStart(4, '0')}`, 16));
  });
  content = content.replace(/&quot;|[\u201c-\u201f]/g, `\\"`);
  content = node.updateContent(content);
  content = content.replace(/"(\w+?)":/g, '$1:');
  content = content.replace(/(\\n)?\s{2,}/g, ' ');
  content = content.replace(/&#x(\w+?);/g, (match, p1) => {
    return `\\u${p1.padStart(4, '0')}`;
  });
  content = content.replace(/[\u0080-\uffff]/g, (match) => {
    return `\\u${match.charCodeAt(0).toString(16).padStart(4, '0')}`;
  });

  fs.writeFileSync(path, JSON.stringify(object), 'utf8');
  path = path.replace(/json$/, 'js');
  path = path.replace(/github/, 'github/temp/archive/');
  fs.writeFileSync(path, content, 'utf8');
  content;
};

exports.loadHTML = function(path) {
  return cheerio.load(fs.readFileSync(path, 'utf8'));
};

exports.getHTML = function(uri, name) {
  /**
   * request content based on url
   * @param {string} uri the url will be request
   */
  function requestURI(uri) {
    request(uri, function(error, response) {
      if (error) {
        console.log('error:', error);
        return;
      }
      content = response.body.replace(/\n(\s+\n)*/, '');
      const $ = cheerio.load(content);
      $('svg').remove();
      content = selector ? $(selector).html() : $.html();
      fs.writeFileSync(path, content, 'utf8');
    });
  }

  const request = require(`${modulesPath}/request`);
  let content;
  let selector;

  if (uri.match(/lexico/)) {
    selector = `.entryWrapper`;
  } else if (uri.match(/thefreedictionary/)) {
    selector = `#MainTxt`;
  } else if (uri.match(/vocabulary/)) {
    selector = `.centeredContent`;
  } else if (uri.match(/thesaurus/)) {
    selector = `.MainContentContainer`;
  }

  if (uri.match(/^http/)) {
    const directory = `c:/github/temp/html/${uri.split('/')[2]}`;
    if (!fs.existsSync(directory)) fs.mkdirSync(directory);
    const file = `${directory}/${name ? name : uri.split('/').pop()}.html`;
    if (fs.existsSync(file)) {
      content = fs.readFileSync(file, 'utf8');
      if (content == 'null') {
        requestURI(uri);
      }
    } else {
      requestURI(uri);
    }
  } else {
    content = fs.readFileSync(uri, 'utf8');
  }

  /* if (!content) return cheerio.load('')
  else return cheerio.load(node.updateContent(content)); */
  if (content && content != 'null') {
    return cheerio.load(node.updateContent(content));
  }
};

exports.fromCSV = function(csv, start = 0, end) {
  const objects = [];
  const lines = csv.split(/\r?\n/);
  let headers = [];
  lines.forEach((line, index) => {
    const object = {};
    if (index) {
      line.replace(/, *$/, '').split(/ *, */).forEach((cell, i) => {
        if (i < start || i >= end) return;
        object[headers[i - start]] = cell;
      });
      objects.push(object);
    } else {
      headers = line.replace(/, *$/, '').split(/ *, */);
      if (end) headers = headers.slice(start, end - start);
    }
  });
  return objects;
};

exports.pushElement = function(array, element, func, type = 'update') {
  if (array.find((value, index, obj) => func(value, index, obj))) {
    if (type == 'update') {
      const index = array.findIndex((value, index, obj) => {
        func(value, index, obj);
      });
      array[index] = element;
    }
  } else if (element) array.push(element);
};

exports.exec = function(commands, cwd = null) {
  let stdout;
  commands.forEach((command, index) => {
    stdout = cp.execSync(command, {cwd: cwd, encoding: 'utf8'});
    console.log(stdout);
    if (index == commands.length - 1) return;
  });
  return stdout;
};

exports.traverseDir = function(dir, files = []) {
  fs.readdirSync(dir).forEach((file) => {
    const fullPath = path.join(dir, file);
    if (fs.lstatSync(fullPath).isDirectory()) {
      files = exports.traverseDir(fullPath, files);
    } else {
      files.push(fullPath);
    }
  });
  return files;
};
