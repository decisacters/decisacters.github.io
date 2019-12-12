/* global $, head, main, toefl, gre,
toCase, execScripts*/

// #region style

/**
 * remove modal
 * @param {object} modal modal
 */
function removeModal(modal) {
  modal.remove();
  $('.w3-modal').show();
}

/**
 * add id to objects
 * @param {array} objects objects
 */
function addID(objects) {
  objects.each(function(i) {
    $(this).attr({
      id: `${$(this).attr('class')}${i}`,
    });
  });
}

// #endregion

// #region code

/**
 * show code
 */
function showCode() {
  addID($('.my-playground'));
  if (!$('style').length) $('<style>').appendTo(head);
  $('.my-playground').each(function() {
    if ($('.my-preview', $(this)).length) return;
    $('<div>', {
      class: 'my-preview',
    }).prependTo($(this));
    // #region html
    let html = $('.my-html', $(this)).html();
    html = html.replace(/<span.*?>|<\/span>/g, '');
    html = html.replace(/&lt;/g, '<');
    html = html.replace(/&gt;/g, '>');
    $('>div', $(this)).html(html);

    // #endregion

    // #region style
    let style = $('.my-css', $(this)).html();
    style = style.replace(/<span.*?>|<\/span>/g, '');
    style = style.replace(
        /((^|\n) *)(.*)( *{)/g,
        (match, p1, prefix, selectors, suffix) => {
          selectors = selectors.replace(/, */g, `, #${$(this).attr('id')} `);
          return `${prefix}#${$(this).attr('id')} ${selectors}${suffix}`;
        });
    $('style').text(`${$('style').text()}\n\n${style}`);

    // #endregion

    /* $('.my-html, .my-css').
    attr({ contenteditable: true }).on('change', showCode); */
  });
}

/**
 * highlight code
 */
function highlightCode() {
  /**
   * wrap token with <span class="my-*"></span>
   * @param {RegExp} regExp regular expression for wrap programming language
   * @param {string} type token type
   */
  function replaceCode(regExp, type) {
    let lookbehind;
    if (regExp.match(/\(\?<=/)) {
      lookbehind = regExp.match(/\(\?<=.*?\)\?/)[0].replace(/\(\?<=|\)\?/g, '');
      regExp = regExp.replace(/\?<=/, '');
    } else lookbehind = '';
    regExp = RegExp(regExp.replace(/\)\?/, ')'), 'g'); // escape character
    regExp = code.html().match(/my-tooltip/) &&
    code.text().match(regExp) ? code.text().match(regExp)[0] : regExp;
    $(code.html().match(regExp)).each(function() {
      const text = this.replace(RegExp(lookbehind), '');
      if (text.match(/".*?my-css.*?"/)) return;
      const prefix = regExp.toString().match(/\(\?<[=!].*?\)/);
      const suffix = regExp.toString().match(/\(\?[=!].*\)/);
      regExp = this.replace(/([$[\]().])/g, '\\$1');
      regExp = (prefix ? prefix : '') + regExp + (suffix ? suffix : '');
      regExp = RegExp(regExp, 'g');
      code.html(code.html().replace(regExp, (match) => {
        match = lookbehind ? match.match(RegExp(lookbehind))[0] : '';
        return `${match}<span class='my-${type}'>${text}</span>`;
      }));
    });
  }

  /**
   * update code string
   * @param {RegExp} regExp regular expression for wrap markup language
   * @param {string} token token type
   * @param {string} prefix token prefix
   */
  function updateString(regExp, token, prefix) {
    if (!string.match(regExp)) return;
    if (prefix) {
      if (!html.match(prefix)) return;
    }
    let end = 0;
    regExp = string.match(regExp)[0];
    // escape special character
    regExp = regExp.replace(/([()[\]|?*^$+])/g, '\\$1');
    const match = string.substring(0).match(regExp)[0];
    end = string.indexOf(match) + match.toString().length;
    html += token ? `<span class="my-${token}">\
    ${string.substring(0, end)}</span>`.replace(/ {2,}/g, ' ') :
    string.substring(0, end);
    string = string.substring(end);
  }

  let keywords = 'if|else|for|function|const|class';
  const prefix = '(^|[ \\.\\n\\[\\(])';
  let html = '';
  let string = '';
  let code = '';
  // since the previous selected nested code node
  // will not exist in DOM after update the html
  // add ID for each code node, so it can be selected
  // by ID even it is not in the DOM
  addID($('code[class]').css({
    background: 'gainsboro',
  }));

  $('code[class]').each(function() {
    if ($(this).html().match(/span class="my-/)) return;
    code = $(this);
    html = '';
    string = code.html();
    let tokens;
    const ignore = [
      // skip single character
      `^([!= \\.\\n\\/;\\[\\]\\(\\){}\\*\\$\\^\\|~\\+]+|: )`,
      `^(["'])<(\\w+).+?\\4>\\3`, // skip inline sting node
      // charaters surrounded by "" are string
      `^(["'])(<(\\w+))?.+?(\\n.*?)*\\1\\3>`,
      `^<\\/?\\w+.*?>`, // letters between < and > are reserved html, skip it
      // characters between > and < are text content, skip text content
      `^>.*(?=<)`,
    ];
    const nameRegExp = `\\w+(-\\w+)*`;
    const attributesRegExp = `( ${nameRegExp}=".*?")*`;
    const tagRegExp = `(<\\w+${attributesRegExp}>)*`;

    // ignore part go first, then prefix part
    if (code.is('.my-html')) {
      tokens = {
        'ignore': ignore.concat([
          `<code.*?code>`, // skip style attribute because it is css
          // characters between &gt; and &lt; are text content, skip it
          `^&gt;.*?(\\n.*?)*(&lt;|$)`,
          `^&.*?;`, // skip entity
        ]),
        'tag-name': [`\\w+`, `(&lt;|\\/|!)`],
        'attribute-name': `\\w+`,
        'attribute-value': `"[^<].+?(\\n.*?)*?"`,
      };
    } else if (code.is('.my-css')) {
      tokens = {
        'ignore': ignore.concat(['^&gt;']),
        'property-name': [`-?${nameRegExp}(?=: )`, `(^|[{;]).*?\\n? *`],
        'property-value': [`.*?(\\n.*?)*?;`, `: `],
        'attribute-name': [nameRegExp, `\\[`],
        'attribute-value': `"[^<].+?(\\n.*?)*?"`,
        'class-selector': `\\.${nameRegExp}`,
        'id-selector': `#${nameRegExp}`,
        'pseudo-element': `::${nameRegExp}`,
        'pseudo-class': `:${nameRegExp}`,
        'at-rule': `@${nameRegExp}`,
        'type-selector': `\\w+(?=.*?(&gt;|,|{))`,
      };
    } else {
      html = string;
      string = '';
    }

    while (string.length) {
      // if no token argument pass to updateString,
      // it means the part needs to be skip
      const length = string.length;
      for (let i = 0; i < Object.entries(tokens).length; i++) {
        const entry = Object.entries(tokens)[i];
        const tokenName = entry[0];
        const tokenRegExp = entry[1];
        if (tokenName.match(/ignore/)) {
          updateString(RegExp(`(${tokenRegExp.join('|')})`));
        } else if (typeof tokenRegExp == 'string') {
          updateString(RegExp(`^${entry[1]}`), tokenName);
        } else {
          updateString(
              RegExp(`^${entry[1][0]}`),
              tokenName,
              `${entry[1][1]}${tagRegExp}$`);
        }
      }
      if (string.length == length) string = '';
    }

    code.html(html);

    if (code[0].className.match(/(js|ps|git)/)) {
      replaceCode(`(["']).*?(\\n.*?)*?\\1`, 'string');
      let comment = '';
      let objects = '';
      if (code.is('.my-js')) {
        keywords += '|let|var|new';
        comment = '\\/\\/';
        objects = 'document|Object|URL|this';
      } else if (code.is('.my-ps')) {
        comment = '#';
        objects = 'System';

        replaceCode(`${prefix}\\w+-\\w+(?= )`, 'function');
        replaceCode(`(?<= )?-\\w+`, 'option');
        replaceCode(`\\$\\w+`, 'variable');
        replaceCode(`\\[.*?\\]`, 'keyword');
      } else if (code.is('.my-git')) {
        keywords = '';
        if (code.text().match(/^git\s+\w+$/)) {
          $('a', code).href = `https://git-scm.com/docs/${code.text().replace(' ', '-')}`
          ;
        }
        replaceCode(`(?<=git +)?\\w+`, 'command');
        replaceCode(` *git +`, 'variable');
        replaceCode(`--\\w+`, 'option');
      }

      replaceCode(`${prefix}${objects}(?=[\\.|\\)])`, 'object');
      replaceCode(`${prefix}${keywords}(?=[ \\(])`, 'keyword');
      replaceCode(`${comment}.*(?=(\\n|$))`, 'comment');

      replaceCode(`\\w+(?=\\(.*?\\))`, 'function');
      replaceCode(`(?<=\\.)?\\w+(?=[ \\);\\.])`, 'variable');

      const varRegExp = '(var|let|const|class)<\\/span> ';
      const matches = code.html().match(RegExp(
          `${varRegExp}\\w+(?=[ \\);])`,
          'g'));
      $(matches).each(function() {
        replaceCode(
            `(?<=\\b)?${this.replace(RegExp(varRegExp), '')}(?=\\b)`,
            'variable');
      });

      $(`.my-comment span, .my-keyword span, .my-string span, \
      .my-function span`.replace(/ +/g, ' '))
          .removeClass('my-variable my-object my-keyword');
    }

    // if this code is nested in a code,
    // you need to use ID to select it and set its html
    // since $(this) is no longer in the DOM tree
    $(`#${this.id}`).html(code.html().trim());
  });

  // #region highlight color
  const colors = [{
    class: /(property|attribute)-value|string/,
    color: 'green',
  }, {
    class: /(property|attribute)-(name|selector)|object/,
    color: 'darkorange',
  }, {
    class: /tag-name|type-selector|variable/,
    color: 'red',
  }, {
    class: /class-selector|keyword/,
    color: 'indigo',
  }, {
    class: /id-selector/,
    color: 'hotpink',
  }, {
    class: /pseudo-element/,
    color: 'olive',
  }, {
    class: /pseudo-class/,
    color: 'teal',
  }, {
    class: /at-rule/,
    color: 'plum',
  }, {
    class: /function|command/,
    color: 'dodgerblue',
  }, {
    class: /comment/,
    color: 'darkgray',
  }];

  $('span[class]').each(function() {
    const color = colors.find((color) => {
      return $(this).attr('class').match(color.class);
    });
    if (color) {
      $(this).css({
        color: color.color,
      });
    }
  });
  // #endregion
}

/**
 * format code
 * @param {string} code code string
 * @return {string}
 */
function formatCode(code) {
  const lines = code.split('\n');
  let length = 0;
  if (lines[1]) {
    length = lines[1].length - lines[1].trimLeft(' ').length;
  } // The Greatest WhiteSpace Length to be removed
  let html = '';
  $(lines).each(function() {
    const regexp = RegExp(` {${length}}`);
    html += this.replace(regexp, '') + (this.match(/code/) ? '' : '\n');
  });

  return html.replace(/\s+</, '<');
}

/**
 * parse code
 */
function parseCode() {
  $('pre code').each(function() {
    $(this).html($(this).html().replace(/(\n *)?<hr.*?>/g, (match, p1) => {
      return match.match(/\n/) ? `${p1}` : '\n';
    }));
    $(this).html($(this).html().replace(/<br>/g, ' '.repeat(2)));
  });
  $('pre').each(function() {
    $(this).html(formatCode($(this).html()));
  });

  highlightCode();
}

// #endregion

// #region table
/**
 * sort array by property
 * @param {array} array array need to be sort
 * @param {string} prop property
 * @param {string} order ascend or descend
 * @return {array} sorted array
 */
function sortArray(array, prop, order = 'ascend') {
  if (order == 'ascend') {
    return array.sort((a, b) => a[prop] > b[prop] ? 1 : -1);
  } else return array.sort((a, b) => a[prop] > b[prop] ? -1 : 1);
}

/**
 * convert array of objects to table
 * @param {array} array array of objects need to be converto be table
 * @param {object} parent parent node
 * @return {object} table node
 */
function toTable(array, parent) {
  if (!parent) {
    parent = $('<main>').appendTo('body');
  }

  const table = $('<table>', {
    class: 'my-sheet',
  }).appendTo(parent);
  let tr = $('<tr>').appendTo($('<thead>').appendTo(table));

  $(Object.keys(array[0])).each(function() {
    $('<th>').appendTo(tr).html(toCase(this));
  });
  const tbody = $('<tbody>').appendTo(table);
  $(array).each(function() {
    tr = $('<tr>').appendTo(tbody);
    $(Object.values(this)).each(function() {
      let text = this;
      if (Array.isArray(this)) {
        text = '';
        $(this).each(function() {
          text += `${this.name}<br>`;
        });
      }
      $('<td>').appendTo(tr).html(text);
    });
  });
  return table;
}

/**
 * convert table to array of objects
 * @param {object} table table node
 * @return {array} array of objects
 */
function fromTable(table) {
  const objects = [];
  $('tbody tr', table).each(function() {
    const object = {};
    $('td', $(this)).each(function(i) {
      object[$('th', table).eq(i).text()] = $(this).html();
    });
    objects.push(object);
  });
  return objects;
}

/**
 * transpose table node and append to parent node
 * @param {object} table table node
 * @param {object} parent parent node
 * @return {object} transposed table node
 */
function transposeTable(table, parent = main) {
  const objects = fromTable(table);
  table.remove();
  table = $('<table>').appendTo(parent);
  const tbody = $('<tbody>').appendTo(table);

  Object.keys(objects[0]).forEach((row, i) => {
    const tr = $('<tr>').appendTo(tbody);
    $('<th>').appendTo(tr).html(row);
    objects.forEach((object) => {
      $('<td>').appendTo(tr).html(Object.values(object)[i]);
    });
  });
  return table;
}

/**
 * add sheet functioin
 */
function addSheetFunc() {
  $('.my-sheet th').unbind().click(function() {
    const table = fromTable($(this).parents('table'));
    const parent = $(this).parents('div').last();
    let order = $(this).parents('table').data('order');
    if (order == 'ascend') order = 'descend';
    else if (!order) order = 'ascend';
    else order = '';

    $('table', $(this).parents('div')).eq(1).remove();
    if (order) {
      toTable(sortArray(table, $(this).text(), order), parent).data({
        order: order,
        prop: $(this).text(),
      });
      $('.my-table', parent).hide();
    } else {
      $('.my-table', parent).show();
    }
  });

  $('.my-sheet td').unbind().click(function() {
    const index = $(this).index();
    const text = $(this).text();
    $('tr', $(this).parents('table')).each(function(i) {
      if (i && $(this).children().eq(index).text() != text) $(this).toggle();
    });
  });
}

// #endregion

/**
 * add keyboard shortcut
 */
function addKeyboardShortcut() {
  let keyString = '';
  let lastKeyTime = Date.now();
  $(document).keydown((e) => {
    const currentTime = Date.now();
    if (currentTime - lastKeyTime > 1000) keyString = '';
    lastKeyTime = currentTime;

    if (e.altKey && e.key == 'c') { // Alt+C Close Modal
      removeModal($('.w3-modal:visible'));
    } else if (e.key.match('Arrow')) { // Arrow to navigate
      if (!$('.w3-modal-content:visible').length &&
      $(`.w3-${e.key.replace(/Arrow/, '').toLowerCase()}.my-click`).length) {
        $(`.w3-${e.key.replace(/Arrow/, '').toLowerCase()}.my-click`)[0].click()
        ;
      }
    } else if (e.altKey && e.key == 't') {
      // Alt+T Toggle textarea in Word Details
      $('textarea').toggle();
    } else if (e.ctrlKey && e.shiftKey && e.key == 'F') {
      // Ctrl+Shift+F Toggle search'
      $('nav button.w3-right').click();
    } else if (e.altlKey && e.shiftKey && e.key == 'F') {
      // Alt+Shift+F Toggle search'
      keyString = '';
    } else if (e.key == 'Enter') {
      if ($('input:visible').length) {
        $('nav button.w3-right').click();
        if ($('.w3-modal:visible a').length &&
            !$('.w3-modal a').attr('href').match('index.html')) {
          $('.w3-modal a')[0].click();
        }
      } else if (keyString) {
        $(`b:contains('${keyString}')`).click();
        const set = toefl.find((set) => set.name == keyString) ||
        gre.find((set) => set.name == keyString);
        if (set) execScripts(keyString);
        keyString = '';
      }
    } else if (e.key.match(/^[a-z0-9-]$/)) {
      keyString += e.key;
    }
  });
}

addKeyboardShortcut();

if (!$('code[id]').length) parseCode();
showCode();

addSheetFunc();

$('.my-transpose').each(function() {
  transposeTable($(this), $(this).parent());
});

