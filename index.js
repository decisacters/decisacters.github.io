/* global $, color, head, header, body, nav, main, footer, link, bgColor, words
literals, transactions, showTest, toTable, removeModal, showWordModal
findWords, createModal*/

// #region basic
/**
 *  get
 * @param {number} max range from 0 to max
 * @return {number} random number
 */
function getRandom(max) {
  return Math.floor(Math.random() * Math.floor(max));
}

/**
 * add
 */
function addColor() {
  const colors = {
    w3: {
      2017: ['greenery', 'grenadine', 'tawny-port', 'butterum', 'navy-peony',
        'shaded-spruce', 'golden-lime', 'marina', 'autumn-maple', 'niagara',
        'lapis-blue', 'flame', 'pink-yarrow', 'kale'],
      2018: ['red-pear', 'valiant-poppy', 'nebulas-blue', 'russet-orange',
        'quetzal-green', 'cherry-tomato', 'chili-oil', 'arcadia', 'emperador',
        'ultra-violet', 'spring-crocus', 'sailor-blue'],
      2019: ['fiesta', 'jester-red', 'turmeric', 'living-coral',
        'pink-peacock', 'pepper-stem', 'princess-blue', 'eclipse'],
      flat: ['turquoise', 'emerald', 'peter-river', 'amethyst', 'wet-asphalt',
        'green-sea', 'nephritis', 'belize-hole', 'wisteria', 'midnight-blue',
        'carrot', 'alizarin', 'concrete', 'orange', 'pumpkin', 'pomegranate',
        'asbestos'],
      metro: ['light-green', 'green', 'dark-green', 'magenta', 'light-purple',
        'purple', 'dark-purple', 'teal', 'blue', 'dark-blue', 'orange',
        'dark-orange', 'red', 'dark-red'],
      win8: ['lime', 'green', 'emerald', 'teal', 'cyan', 'blue', 'cobalt',
        'indigo', 'violet', 'pink', 'magenta', 'crimson', 'red', 'orange',
        'amber', 'brown', 'steel', 'taupe', 'sienna'],
      food: ['aspargus', 'apricot', 'aubergine', 'avocado', 'blueberry',
        'carrot', 'cherry', 'chocolate', 'cranberry', 'coffee', 'grape',
        'mango', 'mushroom', 'olive', 'orange', 'pea', 'peach', 'plum',
        'pomegranate', 'pumpkin', 'raspberry', 'salmon', 'squash', 'strawberry',
        'tomato', 'wine'],
      vivid: ['red', 'orange', 'green', 'blue', 'black', 'purple', 'purple',
        'reddish-orange', 'orange-yellow', 'yellow-green', 'yellowish-green',
        'bluish-green', 'greenish-blue', 'purplish-blue', 'reddish-purple',
        'purplish-red'],
    },
  };
  const cssNumber = getRandom(Object.keys(colors).length);
  const css = colors[Object.keys(colors)[cssNumber]];
  const schemeNumber = getRandom(Object.keys(css).length);
  const scheme = css[Object.keys(css)[schemeNumber]];
  const colorNumber = getRandom(scheme.length);
  color = `${Object.keys(colors)[cssNumber]}-\
  ${Object.keys(css)[schemeNumber]}-\
  ${scheme[colorNumber]}`.replace(/ /g, '');
}

/**
 * add style to <head>
 * @param {string} href style path
 */
function addStyle(href) {
  $('<link>', {
    rel: 'stylesheet',
    href: href,
  }).appendTo(head);
}

/**
 * add tags to <head>
 */
function addHead() {
  $('html').attr({
    lang: 'en-US',
  });
  $('<meta>', {
    charset: 'utf-8',
  }).appendTo(head);

  // Mobile first
  $('<meta>', {
    name: 'viewport',
    content: 'width=device-width, initial-scale=1',
  }).appendTo(head);

  // CSS
  ['w3', 'colors', 'style'].forEach((style) => {
    addStyle(`${dir}/css/${style}.css`);
  });

  // Website Icon
  $('<link>', {
    rel: 'shortcut icon',
    href: `${icons8}/color/100/ffffff/external-link.png`,
  }).appendTo(head);
}

/**
 * add <header>
 * @return {object} header node
 */
function addHeader() {
  header = $('<header>', {
    class: `${color} w3-padding w3-center`,
  }).prependTo(body).hide();

  return header;
}

/**
 * add top navigation bar
 * @param {array} links top navigation link array
 * @return {object}  top nav node
 */
function addNav(links = ['Notes', 'MDN', 'TOEFL', 'GRE', 'Others']) {
  nav = $('<nav>', {
    class: `${color} w3-bar`,
  }).prependTo(body).css({
    zIndex: 1,
  }); // show over aside

  const homeLink = $('<a>', {
    href: `${dir}/index.html`,
    class: 'w3-bar-item w3-button', // # fit in bar and hover gray
  }).appendTo(nav).click(() => {
    localStorage.removeItem('link');
  });
  createIcon('home', homeLink, 'ffffff');

  // Add Bar Item
  const span = $('<span>', {
    class: 'my-bar',
  }).appendTo(nav);
  links.forEach((link) => {
    $('<button>', {
      class: 'w3-button',
      html: link,
    }).appendTo(span).unbind().click(function() {
      if ($(this).text().match(/MDN/)) {
        location.href = `${dir}/notes/web/mdn.html`;
        window.link = '';
      } else {
        window.link = $(this).text();
        location.href = `${dir}/index.html`;
      }
    });
  });

  const searchBtn = createSearchBtn(nav).html('').click(() => {
    const input = $('input', nav).css({
      padding: `${mobileFlag ? '4px' : '8px'} 8px`,
    });
    if (input.val()) {
      searchContent(input.val().trim());
      input.val('');
    }
  });
  createIcon('search', searchBtn, 'ffffff');

  $('nav img').removeClass('my-margin').parent().css({
    padding: `${mobileFlag ? '2px' : '4px'} 8px`,
  });

  return nav;
}

/**
 * add <main>
 * @return {object} main node
 */
function addMain() {
  main = $('main');
  if (!main.length) {
    main = $('<main>').appendTo(body);
  }
  return main.addClass('w3-container');
}

/**
 * add <footer>
 * @return {object} footer node
 */
function addFooter() {
  footer = $('<footer>', {
    class: `${color} w3-padding w3-center`,
  }).appendTo(body);

  $('<p>', {
    html: 'This is my social media.',
  }).appendTo(footer).click(function() {
    $(this).html(color);
  });

  const div = $('<div>', {
    class: 'w3-section',
  }).appendTo(footer);
  ['stackoverflow', 'github', 'twitter',
    'facebook', 'instagram', 'linkedin', 'youtube',
  ].forEach((link) => {
    const siteLink = $('<a>', {
      href: `https://www.${link}.com/${user}`,
    }).appendTo(div);
    createIcon(link, siteLink, 'ffffff');
  });

  return footer;
}

/**
 * get json by url
 * @param {string} url url for json
 * @return {object} json request
 */
function requestJSON(url) {
  const request = new XMLHttpRequest();
  request.open('GET', url);
  request.responseType = 'json';
  request.send();
  return request;
}

/**
 * convert non-array object to array
 * @param {object} object object need to be convert
 * @return {array} converted array
 */
function toArray(object) {
  if (Array.isArray(object)) return object;
  else return Array(object);
}

/**
 * reduce scripts size and add script
 * @param {array} scripts script array
 * @param {function} func callback after script load
 * @param {boolean} async set whether script is async or not
 */
function shiftScripts(scripts, func, async) {
  scripts.shift();
  addScripts(scripts, func, async);
}

/**
 * select script tag based on its path
 * @param {string} path script path
 * @return {object} selected script node
 */
function selectScript(path) {
  return $(`script`).filter(function() {
    return this.src == path || this.src.match(RegExp(`${path}.js`));
  });
}

/**
 * add scripts to <head>
 * @param {array} scripts scripts array
 * @param {function} func callback function after loading script
 * @param {async} async load scripot async or not
 */
function addScripts(scripts, func = () => { }, async) {
  // execute callback function after last script
  if (!scripts.length) {
    func();
    return;
  }
  scripts = toArray(scripts);
  const script = scripts[0];
  let src = '';
  const json = ['toefl', 'gre', 'words', 'transaction', 'tex',
    'literals', 'essays', 'transcripts'];

  if (!selectScript(script).length) {
    if (script.match(/http/)) { // cdn starts with https
      src = script;
    } else if (json.find((json) => json == script)) {
      if (dir) {
        src = `${dir}/temp/archive/js/json/${script}.js`;
      } else {
        src = `/js/json/${script}.json`;
      }
    } else if (script.match(/^\.\//)) {
      src = `${script}.js`;
    } else {
      src = `${dir}/js/${script}.js`;
    }
    if (!src.match(/json$/)) { // json file do not need to create script node
      createNode('<script>', {src: src});
    }
  }

  if ((!script.match(/http/) &&
    eval(`typeof ${script.split('/').pop()} == 'undefined'`)) ||
    script.match(/http/)) {
    if (async) {
      shiftScripts(scripts, func, async);
    } else {
      if (src.match(/json$/)) {
        const request = requestJSON(src);
        request.onload = () => {
          window[script.replace(/.*\//, '')] = request.response;
          shiftScripts(scripts, func, async);
        };
      } else {
        selectScript(script).on('load', () => {
          shiftScripts(scripts, func);
        });
      }
    }
  } else {
    func();
  }
}

/**
 * execute script
 * @param {string} link link store in sessuib strrage to load
 */
function execScripts(link) {
  header.hide();
  addScripts(
      ['toefl', 'words', 'gre', 'svg', 'utility', 'test',
        'note', 'template', 'tex', 'math'],
      () => { },
      'async');

  // create an observer instance
  new MutationObserver(setStyle).observe($('body')[0], {
    childList: true,
    subtree: true,
  });

  if (homeFlag && link) {
    window.link = link;
    document.title = renameTitle(link);
    addMain().html('');

    if (link.match(/GRE|TOEFL|Category|-[iavqrlsw]\d*$|^topic\d+$/)) {
      if (typeof showTest != 'undefined') showTest();
      else addScripts('test');
    } else if (link.match(/Others/)) {
      const div = $('<div>').appendTo(main);
      ['Transactions'].forEach((link) => {
        $('<button>').html(link).appendTo(div).unbind().click(function() {
          execScripts($(this).text());
        });
      });

      $(literals.links).each(function() {
        $('<a>', {
          class: 'my-btn',
          html: toCase(this.href.toString().split('/').pop()),
          href: `${dir}/links/${this.href}.html`,
        }).appendTo(div);
      });
    } else if (link.match(/Transactions/)) {
      /** @todo add transaction analytic function */
      addScripts(`transactions`, () => {
        const cateogries = ['Communication Logistics'];
        transactions.forEach((transaction) => {
          transaction.category = cateogries[transaction.category];
        });
        toTable(transactions, main);
      });
    }
  } else if (location.href.match(/mdn.html/)) {
    addScripts('mdn');
  }
  setStyle();
}

/**
 * wait script load and execute function
 * @param {string} types wait color or jquery load
 * @param {function} func execute function after color or jquery load
 */
function waitFunc(types, func) {
  /**
   * shift array and execute function
   * @param {array} array array need to be shift
   * @param {function} func execute function
   */
  function shiftArray(array, func) {
    array.shift();
    waitFunc(array, func);
  }
  types = toArray(types);
  if (!types.length) {
    func();
    return;
  }

  let conditional;
  if (types[0].match(/jquery/)) {
    conditional = () => {
      return typeof $ == 'undefined';
    };
    if (!func) {
      func = initialize;
    }
  } else if (types[0].match(/color/)) {
    conditional = () => {
      bgColor = getComputedStyle(nav[0]).backgroundColor;
      return bgColor.match('rgba');
    };
    if (!func) {
      func = () => {
        execScripts(link);
      };
    }
  }

  setTimeout(() => {
    if (conditional()) waitFunc(types, func);
    else shiftArray(types, func);
  }, 100);
}

/**
 * execute required code for initializing
 */
function initialize() {
  ['link', 'number', 'heading'].forEach((item) => {
    if (!navigator.appVersion.match(/Edge/)) {
      window[item] = localStorage.getItem(item);
    }
  });

  head = $('head');
  body = $('body');

  const cdn = 'https://cdnjs.cloudflare.com/ajax/libs';
  addStyle(`${cdn}/KaTeX/0.11.1/katex.min.css`);
  scripts = [
    `${cdn}/KaTeX/0.11.1/katex.min.js`,
    `${cdn}/mathjs/6.2.2/math.min.js`,
    `${cdn}/jsxgraph/1.3.5/jsxgraphcore.js`,
  ];
  addScripts(scripts, () => { }, 'async');

  addHead();
  addMain();
  addColor();
  addNav();
  addHeader();
  addFooter();

  addScripts('literals', () => {
    waitFunc('color');
  });
}

/**
 * convert string to pascal case or camel case
 * @param {string} str string
 * @param {string} type case style
 * @return {string} converted string
 */
function toCase(str, type = 'pascal') {
  if (str.match(/^[A-Z]+$/)) return str;
  str = str.replace(/([a-z])([A-Z])/g, '$1 $2');
  return str.replace(/(?:^|\s|-)\w/g, (match) => {
    return match.toUpperCase();
  }).trim().replace(/ +/g, (type == 'camel' ? '' : ' '));
}

/**
 * covert rgb to hex
 * @param {string} rgb rgb color
 * @return {string} hex color
 */
function rgb2hex(rgb) {
  if (!rgb) return;
  rgb = rgb.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+).*?\)$/);

  /**
   * convert decimal to hexadecimal
   * @param {string} dec decimal to hexadecimal
   * @return {string} hexadecimal
   */
  function hex(dec) {
    return `${('0' + (+dec).toString(16)).slice(-2)}`;
  }
  return hex(rgb[1]) + hex(rgb[2]) + hex(rgb[3]);
}

// #endregion basic

/**
 * rename title based on test abbriviation link
 * @param {string} text link text
 * @return {string} text
 */
function renameTitle(text) {
  let title = text ? text : location.href.replace(/.*\/|\.\w+/g, '');
  title = title.replace(/-/g, ' ');

  // #region sectioin
  title = title.replace(/\be\b/, 'Example');
  title = title.replace(/\bi(\d+)?\b/, 'Issue$1');
  title = title.replace(/\ba(\d+)?\b/, 'Argument$1');
  title = title.replace(/\bv(\d+)?\b/, 'Verbal$1');
  title = title.replace(/\bq(\d+)?\b/, 'Quantitative$1');
  title = title.replace(/\br(\d+)?\b/, 'Reading$1');
  title = title.replace(/\bl(\d+)?\b/, 'Listening$1');
  title = title.replace(/\bs(\d+)?\b/, 'Speaking$1');
  title = title.replace(/\bw(\d+)?\b/, 'Writing$1');
  // #endregion

  // #region publisher name
  title = title.replace(/\btpo(\d+)?\b/, 'Practice Online $1');
  title = title.replace(/\bog(\d+)?\b/, 'Official Guide $1');
  title = title.replace(/\bka\b/, 'Kaplan');
  title = title.replace(/\bmh\b/, 'McGraw-Hill');
  title = title.replace(/\bpr\b/, 'Princeton Review');
  title = title.replace(/\bmp\b/, 'Manhattan Prep');
  title = title.replace(/\bbe\b/, `Barron's Edu`);
  title = title.replace(/\bdu\b/, 'Dummies');
  title = title.replace(/\bvp\b/, `Vibrant Publishers`);
  title = title.replace(/\bap\b/, `Argo Prep`);
  title = title.replace(/\bgr\b/, `Gruber's`);
  // #endregion

  title = title.replace(/\bpq(\d+)?\b/, 'Practice Questions $1');
  title = title.replace(/\bpa(\d+)?\b/, 'Practice Argument $1');
  title = title.replace(/\bpi(\d+)?\b/, 'Practice Issue $1');
  title = title.replace(/\bps(\d+)?\b/, 'Practice Sets $1');
  title = title.replace(/\bpt(\d+)?\b/, 'Practice Tests $1');
  title = title.replace(/([A-Za-z])(\d)/g, '$1 $2');

  if (!text) {
    if ($('h1').length) document.title = $('h1').text();
    if (!document.title) document.title = toCase(title);
  } else return title;
}

/**
 * create icon based on icons8 link
 * @param {string} icon icon name
 * @param {object} parent parent node
 * @param {string} hex hex color
 * @param {bumber} size icon size
 * @param {string} style icon style
 * @return {object} <img> node contains icon
 */
function createIcon(icon, parent, hex, size = 18, style = 'ios-filled') {
  icon = icon.toLowerCase().replace(/ /g, '-');
  return $('<img>', {
    class: 'my-margin',
    src: `${icons8}/${style}/100/${hex ? hex : rgb2hex(bgColor)}/${icon}.png`,
  }).width(size).prependTo(parent);
}

/**
 * create search button
 * @param {object} parent parent node for button
 * @param {function} func function executed when the button is clicked
 * @param {array} nodes nodes to filter
 * @return {object} search button
 */
function createSearchBtn(parent, func, nodes) {
  /**
   * Filter Tag enter by Search Input
   * @param {object} searchBtn search button
   * @param {functioni} func click function
   * @param {array} nodes nodes
   * @param {STRING} input query string enter at input
   */
  function filterSearch(searchBtn, func, nodes, input) {
    const tagsDiv = searchBtn.parent().next('#tagsDiv');

    if (searchBtn.is('.my-border')) {
      $('.my-tag', tagsDiv).show();
    } else {
      input.css({
        border: `2px solid ${bgColor}`,
      });
    }

    searchBtn.toggleClass('my-border my-round');

    // Filter tags while inputting
    if (nodes || tagsDiv.length) {
      input.on('input', () => {
        func(input.val(), nodes);
      });
    }
  }

  const searchBtn = $('<button>', {
    class: `${color} w3-bar-item w3-button w3-right\
    my-border my-padding my-round`.replace(/ +/g, ' '),
    html: 'Search',
  }).appendTo(parent);

  // Create Search Input
  $('<input>', {
    class: `w3-bar-item w3-right my-padding my-border`,
  }).css({
    maxWidth: parent.width() - searchBtn.outerWidth() - 10,
  }).appendTo(parent).hide();
  return searchBtn.click(function() {
    if ($(this).parent().is('nav')) {
      $(this).next().prop({
        autofocus: 'autofocus',
      });
    }
    $(this).parent().children().toggle();
    $(this).toggle();
    filterSearch($(this), func, nodes, $(this).next('input'));
  });
}

/**
 * add font color and font weight to element
 * @param {object} nodes node need to be add highlight
 * @return {object} nodes
 */
function addHighlight(nodes) {
  if (!bgColor) return;
  return nodes.css({
    color: bgColor,
    fontWeight: 'bold',
  });
}

/**
 * remove font color and font weight to element
 * @param {object} nodes node need to be remove highlight
 * @return {object} nodes
 */
function removeHighlight(nodes) {
  return nodes.css({
    color: 'black',
    fontWeight: 'normal',
  });
}

/**
 * set <ul> or <ol> style
 */
function setListStyle() {
  let selector = 'ul>li';
  const icons = ['filled-circle', 'circled', 'unchecked-checkbox', 'circled'];

  icons.forEach((icon) => {
    const url = `${icons8}/material/100/${rgb2hex(bgColor)}/${icon}`;
    $(selector).css({
      listStyle: 'none',
      backgroundImage: `url(${url})`,
    });
    selector += '>ul>li';
  });

  $('ol>ol').css({
    listStyle: 'lower-alpha',
  });
  $('ol>li').each(function() {
    if ($(this).html().match(/^<b>/)) {
      $(this).html(`<span>${$(this).html()}</span>`);

      addHighlight($(this).parent());
      removeHighlight($('span', $(this)));
    }
  });
}

/**
 * set style for element
 */
function setStyle() {
  /**
   * set top nav with based on its content
   */
  function setNavSpanWidth() {
    let width = 0;
    const span = $('span', nav);
    span.siblings().each(function() {
      width += this.offsetWidth;
    });
    span.width(body.width() - width - 16);
  }

  if (location.href.match(/mdn.html/) && $('header:visible').length) return;
  if (!link || $('section>:header').length) {
    // page which is not a note or not in mdn
    main.removeClass('w3-container');
  } else {
    nav.addClass('w3-margin-bottom');
    footer.addClass('w3-margin-top');
  }

  body.addClass('my-scrollbar'); // add pesudo class and element

  $('code').each(function() {
    if ($(this).parent('pre').length) {
      $(this).addClass('w3-code w3-panel w3-card').css({
        borderLeft: `3px solid ${bgColor}`,
        display: 'block',
        whiteSpace: 'pre',
        wordWrap: 'unset',
        overflow: 'auto',
      });
    } else if (!$(this).is('[class]')) {
      $(this).addClass('my-highlight').css({
        background: 'whitesmoke',
      });
    }
  });

  // #region table
  $('table').wrap(function() {
    if ($(this).parent().css('overflow') != 'auto' &&
      !$(this).parent().is('.w3-modal-content')) {
      return $('<div>').css({
        overflow: 'auto',
      });
    }
  }).addClass('w3-table-all w3-section w3-card my-table');
  $('th').addClass(color);
  $('caption').addClass('w3-large');
  $('th[rowspan]').attr({
    scope: 'rowgroup',
  });
  $('th[colspan]').attr({
    scope: 'colgroup',
  });
  $('tbody th:not([scope])').attr({
    scope: 'row',
  });
  $('thead th:not([scope])').attr({
    scope: 'col',
  });
  // #endregion

  $('img').addClass('w3-image').each(function() {
    if (!this.src) return;

    if (this.title) {
      $(this).wrap($('<figure>', {
        class: 'my-margin-small',
      }));
      $('<figcaption>', {
        html: this.title,
      }).appendTo($(this).parent());
    }
    const name = this.src.split('/').pop().replace(/\..*$/, '');
    if (this.alt) return;
    $(this).attr({
      alt: `${name}\${this.src.match(/icons8/) ? 'icon' : ''}`,
    });
  });
  // remove padding for the parent of icon img
  $('nav').children().removeClass('my-padding');
  $('dt').addClass('my-highlight my-margin-small');
  $('[title]').each(function() {
    $(this).wrap($('<span>', {
      class: 'my-tooltip w3-display-container',
    }));
    $('<span>', {
      class: 'my-tooltip-text w3-display-middle my-middle',
      html: $(this).attr('title'),
    }).appendTo($(this).parent()).hide();
    $(this).removeAttr('title');
  });

  $('.my-tooltip').css({
    position: 'relative',
  }).on('mouseenter', function() {
    if (!$('.my-tooltip-text:visible', $(this)).length) {
      addHighlight($(this)).addClass('my-link').children().show();
    }
  }).on('mouseleave', function() {
    const node = removeHighlight($(this)).removeClass('my-link');
    node.children('.my-tooltip-text').hide();
  });
  $('.my-tooltip-text').addClass('my-tag').css({
    background: 'white',
    position: 'absolute',
  }).each(function() {
    if ($(this).is('.my-middle')) {
      $(this).css({
        left: '50%',
        top: ' ',
      });
    }
  });
  $('.my-bar').addClass('w3-bar').children().addClass('my-bar-item my-padding');
  // $('.my-bar-item').addClass('w3-bar-item');
  const btn = $('.my-btn, button').addClass(`w3-button my-padding ${color}`);
  btn.filter(`:not('[class*=bar-item]')`).addClass('my-margin');
  $('.my-btn-small').addClass(`w3-button w3-card w3-padding-small w3-small\
  my-margin-small my-round ${color}`.replace(/ +/g, ' '));
  $(`a:not('.${color}')`).addClass('my-link').prop({
    target: '_blank',
  });
  $('.my-link').addClass('my-click').filter(function() {
    return !$(this).parents('.w3-modal').length;
  }).addClass('my-highlight');
  $('.my-paging').addClass(`w3-button my-bar-item ${color}`);
  $(`nav .${color}`).removeClass(`${color}`);
  $(`nav>a.w3-button`).removeClass(`w3-button`);
  $(`nav>button`).css({background: 'unset'});
  $(`.${color}`).css({
    backgroundImage: `linear-gradient(to bottom, rgba(255,255,255,0.1), \
    rgba(0,0,0,0.05))`.replace(/ +/g, ' '),
  });
  $('.my-search').addClass('w3-button w3-section w3-large w3-right');
  $('.my-tag').addClass(`w3-btn w3-padding-small my-margin-small\
  my-highlight my-border`.replace(/ +/g, ' ')).filter(function() {
    return !$(this).parents('code').length;
  }).click(function() {
    if (!location.href.match(/index/) && $('title').text() != 'Bookmark') {
      sessionStorage.setItem('tag', $(this).text());
      execScripts('Bookmark');
    }
  });
  $('.my-input, textarea, input').addClass('my-border my-padding-left');
  $('.my-border, hr, fieldset').css({
    border: `2px solid ${bgColor}`,
  }).addClass('my-round');
  $('fieldset').addClass('w3-margin-bottom');

  $(`[class*='bar-item']`).each(function() {
    if ($(this).is('.my-round')) return;
    if (!$(this).is('.w3-margin-right') &&
      !$(this).prev().length && !$(this).parent().is('.w3-dropdown-click') ||
      $(this).prev().is('.w3-margin-right')) {
      $(this).addClass('my-round-left');
    } else {
      $(this).removeClass('my-round-left');
    }

    if (!$(this).next().length ||
      ($(this).parent().is('.w3-dropdown-click') &&
        !$(this).parent().next().length)) {
      if ($(this).is('.my-round-left')) $(this).addClass('my-round');
      else $(this).addClass('my-round-right');
    } else $(this).removeClass('my-round-right my-round');
  });
  $(`.w3-button:not('[class*="bar-item"]'), \
  .w3-btn, div.w3-margin-right, .w3-bar.${color}`).addClass('w3-card');

  $(`.w3-card, .my-card, .my-checkbox`).
      filter(`:not('[class*="bar"]')`).addClass('my-round');
  $(`.w3-modal`).removeClass('w3-section');

  setListStyle();

  addHighlight($(`.my-highlight, :header, \
    b, u, em, strong, legend, caption, figcaption`.replace(/ +/g, ' ')));
  setNavSpanWidth();
}

/**
 * create <tag> with attributes
 * @param {string} tag tag name with bracket
 * @param {object} attributes attribute object
 * @return {object} node
 */
function createNode(tag, attributes) {
  const node = document.createElement(tag.match(/\w+/)[0]);

  for (let i = 0; i < Object.keys(attributes).length; i++) {
    node.setAttribute(Object.keys(attributes)[i], Object.values(attributes)[i]);
  }

  document.head.appendChild(node);
  return node;
}

/**
 * search content in test set
 * @param {string} val match value
 */
function searchContent(val) {
  /**
   * search links in literals
   * @param {boolean} flag
   */
  function searchLinks(flag) {
    $(literals.links.concat(literals.notes)).each(function() {
      if (this.href &&
        this.href.split('/').pop().replace(/\W/g, ' ').match(regExp)) {
        if (!flag) return;
        $(`button:contains('Link')`).click();
        const href = this.href.match(/\//) ? 'notes' : 'html';
        $('<a>', {
          class: 'my-btn',
          html: this.href.split('/').pop(),
          href: `${dir}/${href}/${this.href}.html`,
          target: '_blank',
        }).appendTo(div).click(() => {
          removeModal(modal);
        });
      }
    });
  }

  if (!val) return;
  const modal = createModal();
  const bar = $('<div>', {
    class: `${color} w3-bar`,
  }).appendTo(modal).css({
    top: mobileFlag ? -52 : '',
  }).addClass(mobileFlag ? 'my-sticky' : '');

  const div = $('<div>', {}).appendTo(modal);

  const regExp = RegExp(val, 'i');
  ['Question', 'Synonym', 'Link', 'X'].forEach((btn, i) => {
    const button = $('<button>', {
      class: 'w3-button my-padding w3-bar-item',
    }).html(btn).appendTo(bar).unbind().click(function() {
      div.html('');
      if ($(this).text().match(/Question/)) {
        findWords(regExp, div);
      } else if ($(this).text().match(/Link/)) {
        searchLinks();
      } else if ($(this).text().match(/Synonym/)) {
        const synonyms = RegExp(`\\b${val}\\b`, 'i');
        $(words.filter((word) => word.synonyms.match(synonyms) ||
        word.word.match(regExp))).each(function() {
          const word = this;
          $('<button>', {
            html: this.word,
          }).appendTo(div).click(function() {
            showWordModal(word);
          });
        });
      } else if ($(this).text().match(/X/)) {
        removeModal(modal);
      }
    });
    if (!i) button.click();
    if (btn.match(/X/)) button.addClass('w3-right');
  });
  searchLinks(true);
}

let dir = '';
if (location.protocol.match('file')) dir = '/github';

let scripts = [
  `cdn/jquery.js`,
];

scripts.forEach((script) => {
  createNode('<script>', {
    src: `${dir}/js/${script}`,
    async: false,
  });
});

link = ''; // store in localStorage to show HTML in index.html

// site prefix
const user = 'decisacter';
const icons8 = 'https://img.icons8.com';

// flag
const mobileFlag = screen.width < 420 ? true : false;
const homeFlag = location.href.match(/\/index.html|github.io\/$/);

waitFunc('jquery');

window.onunload = () => {
  ['link', 'number', 'heading'].forEach((item) => {
    eval(`if (${item}) localStorage.setItem('${item}', ${item});`);
  });
};
