/* global $, dir, color, literals, link, main, mobileFlag, renameTitle
execScripts, createIcon, createSearchBtn, toCase */

/**
 *  add table of content forcely or not
 * @param {boolean} forceFlag
 */
function addTOC(forceFlag) {
  /**
   * add heading recursively
   * @param {number} level heading level
   * @param {object} section section node
   * @param {object} parent node
   */
  function addHeading(level, section, parent) {
    if (level > 6 || !$(`h${level}`, section).length) return;

    let parentID = '';

    if (level > initial) {
      parentID = parent.children().last().children().last();
      parentID = parentID.attr('id').replace('#h', '');
    } // get anchor id

    const div = $('<div>').appendTo(parent);
    if (level > initial) {
      div.attr({
        id: `s${parentID}`,
      });
    }
    if (level == initial) div.show();

    $(`h${level}`, section).each(function(i) {
      // set id of the heading in the main
      $(this).attr({
        id: `h${(level > initial ? parentID : '')}${i + 1}`,
      });

      const headingDiv = $('<div>', {
        class: 'w3-padding-small',
      }).appendTo(div).css({
        textIndent: (level - initial) * 10,
      });

      // level indicator
      $('<span>', {
        class: 'my-click',
        html: '\u23F7',
      }).appendTo(headingDiv).click(function() {
        if ($(this).html() == '\u23F5') {
          $(this).html('\u23F7');
        } else if ($(this).html() == '\u23F7') {
          $(this).html('\u23F5');
        }
        $(`#s${$(this).next().attr('id').match(/\d+/)}`).each(function() {
          $(this).toggle();
        });
      });

      // anchor links to the heading in main
      $('<span>', {
        class: 'w3-padding-small my-click',
        id: `#${this.id}`,
        html: $(this).text().replace(/</g, '&lt;').replace(/>/g, '&gt;'),
      }).appendTo(headingDiv).click(function() {
        if (mobileFlag) {
          sideTOC.toggle();
          noteContent.toggle();
        }

        $(this.id)[0].scrollIntoView();
        window.scrollBy(0, -40);
      }).css({
        whiteSpace: 'nowrap',
      });
      /*
            headingDiv.children().each(function () {
              addHighlight($(this))
            }); */
      addHeading(level + 1, this.parentNode, div);
    });
  }

  if (!forceFlag &&
    (!location.href.match(/notes/) ||
      typeof sideTOC != 'undefined') ||
    !$('section>:header').length) {
    return;
  }

  sideTOC = $('#sideTOC').length ? $('#sideTOC').html('') : $('<aside>', {
    class: 'w3-card w3-light-gray w3-small',
    id: 'sideTOC',
  }).prependTo(main).css({
    overflow: 'auto',
  });

  $('<div>', {
    class: 'w3-margin',
  }).appendTo(sideTOC);

  // Create Search Input

  const div = $('<div>', {
    class: 'w3-padding-small w3-bar',
  }).appendTo(sideTOC);
  const initial = 2;
  addHeading(initial, main, sideTOC);

  // hide level indicator if no lower level and keep the space
  $('span[id]', sideTOC).each(function() {
    if (!$(`#s${this.id.replace('#h', '')}`, sideTOC).length) {
      $(this).prev().css({
        color: getComputedStyle($(this).parents('aside')[0]).backgroundColor,
      })
      ;
    }
  });

  createSearchBtn(div, filterNodes, $('.my-link', sideTOC)).click(() => {
    $('.my-click', sideTOC).toggle();
    $('div', sideTOC).removeClass('w3-padding-small');
  }).parent().children().removeClass('my-padding').addClass('w3-padding-small');

  // $('section').children(':not(:header)').hide();
  $('section:has(h1)').show();
  $(':header').addClass('my-click').css({
    textIndent: function() {
      return Math.pow((this.tagName.slice(1, 2) - 1), 2) * 2;
    },
    overflow: 'auto',
    whiteSpace: 'nowrap',
  }).click(function() {
    $(this).parent().children(':not(:header)').toggle();
    $(this).show();
    if ($(this).is(':visible')) window.heading = this.id;
  }).each(function() {
    // $(this).html(`${$(this).attr('id').slice(1,12)
    // .replace(/(\d)/g, '.$1')} ${$(this).html()}`);
  });

  $('nav img').parent().css({
    padding: `${mobileFlag ? '6px' : '8px'} 8px`,
  });

  if (window.heading) {
    $(`#${window.heading}`).parentsUntil('main').each(function() {
      $(this).children().show();
    });
  }

  // get most level and hide it
  let level = 6;
  let max = $(`h6`).length;
  for (let i = 6; i; i--) {
    if ($(`h${i}`).length > max) {
      max = $(`h${i}`).length;
      level = i;
    }
  }
  $(`h${(location.href.match(/tests/) ? 3 : level)}`).click();
  $(':header').last().click()[0].scrollIntoView();
}

/**
 * add side links forcely
 * @param {boolean} forceFlag flag
 */
function addSideLinks(forceFlag) {
  if (!forceFlag &&
    (!location.href.match(/notes/) ||
      typeof sideLinks != 'undefined')) {
    return;
  }

  sideLinks = $('#sideLinks').length ? $('#sideLinks').html('') : $('<aside>', {
    class: 'w3-card w3-light-gray',
    id: 'sideLinks',
  }).appendTo(main).css({
    overflow: 'auto',
  });

  const note = literals['notes'].find((note) => {
    return location.href.includes(note.href);
  });

  getNoteTags(note).tags.forEach((tag) => {
    const sideTagsDiv = $('<div>', {
      class: 'my-padding my-padding',
    }).appendTo(sideLinks);
    $('<p>', {
      class: 'my-tag',
      html: tag,
    }).appendTo(sideTagsDiv);

    literals['notes'].forEach((note) => {
      const noteTags = getNoteTags(note).tags;
      const title = noteTags[0];
      if (noteTags.find((t) => t.match(RegExp(tag, 'i'))) &&
        title != document.title) {
        $('<a>', {
          class: 'my-btn-small',
          html: title,
          href: `${dir}/notes/${note.href}.html`,
        }).appendTo(sideTagsDiv);
      }
    });
  });
}

/**
 *
 * @param {string} html tag content
 * @param {object} parent parent node
 * @param {function} func click function
 */
function createTag(html, parent, func) {
  $('<span>', {
    class: 'my-tag',
    html: html,
  }).appendTo(parent).click(function() {
    // Unselected Tag
    func($(this));
    $(this).toggleClass(`${color} my-highlight w3-text-white`);
  });
}

/**
 * click button to toggle filter
 * @param {object} tagBtn tag button
 */
function toggleFilter(tagBtn) {
  // Add selected tag to array
  if (tagBtn.is('.my-highlight')) {
    selectedTags.push(tagBtn.text());
  } else {
    // pop element by content
    selectedTags.splice(selectedTags.indexOf(tagBtn.text()), 1);
  }

  const entriesTagsArray = [];

  // if the entry do not contains selected tags, it is hidden.
  entries.each(function() {
    const entry = $(this).show();
    // get the entries tag
    const entryTagsArray = []; // one entry's tags.

    // join the entry tag in one string
    $('.my-tag', entry).each(function() {
      entryTagsArray.push($(this).text());
      if ($(this).text() == tagBtn.text() &&
        tagBtn.parent().attr('id') == 'tagsDiv') {
        $(this).toggleClass(`w3-text-white ${color}`);
      }
    });

    // if one selected tag is not in the entryTagsArray, the entry is hidden
    $(selectedTags).each(function() {
      if (!entryTagsArray.includes(this.toString())) {
        entry.hide();
      }
    });

    // if the entry is not hidden
    if ($(this).is(':visible')) {
      $(entryTagsArray).each(function() {
        entriesTagsArray.push(this.toString());
      });
      $('.my-tag', $('#tagsDiv')).each(function() {
        $(this).show();
        if (!entriesTagsArray.includes($(this).text())) {
          $(this).hide();
        }
        if ($(this).text() == tagBtn.text() &&
          tagBtn.parent()[0].id != 'tagsDiv') {
          $(this).toggleClass(`w3-text-white ${color}`);
        }
      });
    }
  });
}

/**
 * get note tags
 * @param {object} note note
 * @return {object} note
 */
function getNoteTags(note) {
  note.href.split(/\//).slice(0, -1).forEach((tag) => {
    if (tag && !note.tags.find((t) => t.match(RegExp(tag, 'i')))) {
      note.tags.push(toCase(tag));
    }
  });
  return note;
}

/**
 * add tags for notes or bookmarks
 */
function addTags() {
  /**
   * create entry
   * @param {object} entry note or bookmark entry
   */
  function createEntry(entry) {
    /**
     * get Entry Title
     * @return {string} title
     */
    function getEntryTitle() {
      if (entry.href.match(/wikipedia/)) {
        return entry.href.split('/').pop()
            .replace(/[_-]/g, ' ').replace(/.* of /, '');
      } else return entry.tags[0];
    }

    const div = $('<div>', {
      class: 'my-card w3-padding my-margin my-entry',
    }).appendTo($('#entries'));

    // title
    const titleDiv = $('<div>', {
      class: 'my-section',
    }).appendTo(div);

    if (entry.href.match(/http/)) {
      if (entry.href.match(/comparison/i)) entry.tags.push('Comparison');
      if (entry.href.match(/developer/)) entry.tags.push('Developer');
      if (entry.href.match(/wikipedia/)) entry.tags.push('Wikipedia');
      if (entry.href.match(/films/i)) entry.tags.push('Films');
      if (entry.href.match(/\bai\b/i)) entry.tags.push('AI');
    } else {
      entry = getNoteTags(entry);
    }

    if (entry.tags[0] != 'Bookmark') {
      const href = `${dir}/notes/${entry.href}.html`;
      $('<a>', {
        class: 'my-highlight w3-large my-link',
        href: entry.href.match(/http/) ? entry.href : href,
        html: getEntryTitle(),
      }).appendTo(titleDiv).css({
        padding: 0,
      }).click(() => {
        window.link = '';
      });
    } else {
      $('<span>', {
        class: 'my-highlight w3-large my-click',
        html: getEntryTitle(),
      }).appendTo(titleDiv).css({
        padding: 0,
      }).click(function() {
        execScripts($(this).text());
      });
    }

    let icon = getEntryTitle();
    let style = 'ios-filled';
    let size = 18;
    icon = icon.replace(/Windows/, 'windows client');
    icon = icon.replace(/Office/, 'office 365');
    icon = icon.replace(/VSCode/, 'visual studio logo');
    icon = icon.replace(/Windows/, 'windows client');
    icon = icon.replace(/HTML/, 'HTML 5');
    icon = icon.replace(/CSS/, 'CSS3');
    icon = icon.replace(/Devices/, 'Multiple Devices');

    if (icon.match(/Windows/)) {
      style = 'ios-glyphs';
    } else if (icon.match(/NodeJS/)) {
      style = 'windows';
      size = 32;
    }
    const skippedIcons = ['GRE', 'TOEFL', 'Integers', 'Getting Started',
      'G Suite', 'ESLint', 'JSDoc', 'Formula', 'MDN', 'W3Schools'];
    if (!skippedIcons.includes(icon)) {
      createIcon(icon, titleDiv, '', size, style);
    }

    // tags
    const tagDiv = $('<div>').appendTo(div);

    $(entry.tags).each(function() {
      createTag(this, tagDiv, toggleFilter);
    });
  }

  // create tagsDiv
  // Add element when a tag is selected in tag div. otherwise remove it.

  const div = $('#tags').addClass('my-margin');
  $('<span>', {
    class: 'w3-bar-item my-padding',
    html: 'Tags',
  }).appendTo($('<div>', {
    class: `w3-bar w3-padding-small w3-card w3-large ${color} my-round-top`,
  }).appendTo(div));
  const tagsDiv = $('<div>', {
    class: 'w3-padding w3-card',
    id: 'tagsDiv',
  }).appendTo(div);

  // Get Entries Object

  if (entries) {
    entries.concat({
      href: '',
      tags: ['bookmark'],
    }).forEach((entry) => {
      createEntry(entry);
    }); // Create Entry Div
    entries = $('.my-entry'); // Get Created Entry
  }

  const tagsArray = []; // All tags need to be show in tag div on load.

  // Create Search Button to Filter Tag
  createSearchBtn(tagsDiv.prev(), filterNodes);
  tagsDiv.prev().children().css({
    padding: '4px 8px',
  }); // override w3-bar-item padding;

  // Create tags based on entries Tags
  $('#entries .my-tag').each(function() {
    const text = $(this).text();
    const tag = $(this).html();
    const length = $(`#entries .my-tag:contains('${tag}')`).length;
    if (!tagsArray.includes(text) && length > 1) {
      tagsArray.push(text);
      createTag(text, tagsDiv, toggleFilter);
    }
  });
}

/**
 * add or update links
 */
function addLinks() {
  /**
   * format node text
   * @param {object} node node
   * @return {object} node
   */
  function formatText(node) {
    return node.text().replace(/ /g, '_').replace(/[<>\u2009?]/g, '');
  }

  $('main a:not([class])').each(function() {
    const text = encodeURI($(this).text());
    this.href = encodeURI(this.href) || '';
    if (this.href.match(/chrome$/)) {
      this.href = `https://chrome.google.com/webstore/search/${text}`;
    } else if (this.href.match(/npm$/)) {
      this.href = `https://www.npmjs.com/package/${text}`;
    } else if (text.match(/\bgit\b/)) {
      this.href = `https://git-scm.com/docs/${text.replace(' ', '-')}`;
    } else if (this.href.match(/amazon$/)) {
      this.href = `https://www.amazon.com/s/ref=nb_sb_noss?url=search-alias%3Daps&field-keywords=${text.replace(/ /g, '+')}`;
    } else if (this.href.match(/ms-.*:/)) {
      if (navigator.platform != 'Win32') this.href = ``;
    } else if (this.href == location.href) {
      const note = literals.notes.find((n) => {
        return n.href.match(RegExp(`${$(this).text()}$`, 'i'));
      });
      this.href = `${dir}/notes/${note ? note.href : ''}.html`;
    } else if (this.href.match(/\/q=/)) {
      this.href = `https://www.google.com/search?${this.href.split('/').pop()}`;
    } else if (this.href.match(/wiki/)) {
      this.href = `https://en.wikipedia.org/wiki/${$(this).text().replace(/ /g, '_')}`;
    }
  });

  let selector = '';
  let header = [2, 3];
  $('section[id]').filter(function() {
    const id = $(this).attr('id');
    switch (id) {
      case 'mdn':
        'https://developer.mozilla.org/en-US/docs';
        break;
      case 'w3s':
        'https://www.w3schools.com';
        break;
      case 'vsc':
        'https://code.visualstudio.com/docs';
        break;
      case 'msdoc':
        'https://docs.microsoft.com/en-us/';
        break;
      default:
        break;
    }
    return window[$(this).attr('id')];
  }).each(function() {
    if ($(this).attr('id') == 'mdn') header = [3, 4];
    header.forEach((level) => selector += `h${level}:not(:has('a')),`);
    $(`${selector}>:header:not(:has('a'))`, $(this)).wrapInner($('<a>', {
      class: `${$(this).attr('id')}-link`,
    }));
  });

  $('.my-note').each(function() {
    if (this.href.match(/\.html$/)) return;
    this.href = `${dir}/notes/${$(this).attr('href')}.html`;
  });

  $(`a[class*=mdn]:not('.my-link')`).each(function() {
    $(this).addClass('mdn-link');
    if ($(this).is('.mdn-glossary')) this.href = `Glossary/${this.href}`;
    else if ($(this).is('.mdn-css')) this.href = `Web/CSS/${this.href}`;
    else if ($(this).is('.mdn-api')) this.href = `Web/API/${this.href}`;
    else if ($(this).is('.mdn-svg')) this.href = `Web/SVG/Element/${this.href}`;
    else if ($(this).is('.mdn-element')) {
      this.href = `Web/HTML/Element/${this.href}`;
    } else if ($(this).is('.mdn-objects')) {
      this.href = `Web/JavaScript/Reference/Global_Objects/${this.href}`;
    }
  });

  $(`[class$=link]:not('.my-link')`).each(function() {
    if (!$(this).attr('href')) {
      $(this).attr({
        href: '',
      });
    }

    let prefix = window[this.className.match(/^\w+/)[0]];
    let suffix = '';
    $(this).addClass('my-link my-highlight');

    if ($(this).parent().is(':header')) {
      // get prefix path from parent header
      const parent = $(this).parents('section').eq(1);
      prefix = $('>:header a', parent).attr('href') || prefix;
      suffix = formatText($(this)).toLowerCase();
    } else {
      if (!this.href.match(/#/) && !this.className.match(/glossary|api/)) {
        suffix = formatText($(this));
      }

      let href = $(this).attr('href');
      href = href.replace(location.href.replace(/\w+(-\w+)*.\w+$/, ''), '');
      $(this).attr({href: href});
    }
    this.href = `${prefix}/${$(this).attr('href')}/${suffix}`;

    this.href = this.href.replace(/(\w)\/+(\w|$)/g, '$1/$2');
    this.href = this.href.replace(/\/undefined/g, '');
    if (this.href.match(/CSS/)) this.href = this.href.replace(/[()]/g, '');
    if (this.href.match(/w3.*_/)) this.href += '.asp';
    if ($(this).parent().parent().is('[id]') &&
      !$(this).parent().parent().is(`#mdn`)) {
      this.href = this.href.replace(/\w+$/, '');
    }
  });

  $(`.mdn-img:not('.w3-image')`).each(function() {
    this.src = `https://mdn.mozillademos.org/files/${$(this).attr('src')}`;
  });

  $(`.vsc-img:not('.w3-image')`).each(function() {
    const node = $('h3 a', $(this).parents(`section:has('h3')`).first());
    const href = node.attr('href').replace(/docs/, 'assets/docs');
    this.src = `${href}/${$(this).attr('src')}`;
  });
}

/**
 * show nodes with query content
 * @param {string} value query
 * @param {array} nodes array of nodes
 */
function filterNodes(value, nodes) {
  (nodes ? nodes : $('.my-tag', $('#tagsDiv'))).each(function() {
    if ($(this).html().match(value)) {
      $(this).show();
    } else {
      $(this).hide();
    }
  });
}

let sideTOC;
let noteContent;
let sideLinks;
let entries = [];
const selectedTags = [];
if (location.href.match(/notes/) && $('h1').length) {
  document.title = $('h1').text();
  addLinks();
  addTOC();
  addSideLinks();

  const aside = $('aside').click(function() {
    if (mobileFlag) {
      $(this).hide();
      noteContent.show();
    }
  }).height(screen.height - $('nav').height());
  $.merge(aside, $('nav')).addClass('my-sticky');
  if (mobileFlag) $('aside').hide();

  noteContent = $('main>section').attr({
    id: 'noteContent',
  }).first().addClass(`w3-container ${mobileFlag ? '' : 'w3-margin-left'}`);
  if (noteContent.length && !mobileFlag) {
    main.addClass('my-flex-container');
  }
} else if (link && link.match(/Notes|Bookmarks/)) {
  const div = $('<div>').appendTo($('main'));
  entries = literals[link.toLowerCase()];
  renameTitle();
  $('<div>', {
    id: `tags`,
  }).appendTo(div);
  $('<div>', {
    id: `entries`,
    class: 'my-grid-container',
  }).appendTo(div);
  addTags(link);
}
