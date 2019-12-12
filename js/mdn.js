const toc = [{
  name: 'Getting Started',
}, {
  name: 'HTML',
  children: [{
    name: 'Introduction to HTML',
    children: ['Getting Started', 'The HTML Head', 'HTML Text Formatting',
      'Creating Hyperlinks', 'Navigatoin Menu', 'Advanced Text Formatting',
      'Document and website structure', 'Debug Example', 'Marking up a letter',
      'Structuring a page of content'],
  }, {
    name: 'Multimedia and embedding',
    children: ['Images in HTML', 'Video and Audio content',
      'Other embedding technologies', 'Adding vector graphics to the web',
      'Responsive Images', 'MDN splash page'],
  }, {
    name: 'Tables',
    children: ['Basic', 'Advanced', 'Assessment'],
  }, {
    name: 'Forms',
    children: ['Your first HTML form', 'HTML form structure',
      'Native form widgets'],
  }],
}, {
  name: 'CSS',
  children: [{
    name: 'Introduction to CSS',
    children: ['How CSS works', 'Cascade and inheritance', 'CSS selectors',
      'Box model', 'CSS values and units', 'Debugging CSS',
      'Fundamental CSS comprehension'],
  }, {
    name: 'Styling boxes',
    children: ['Box model recap', 'Backgrounds', 'Borders',
      'Advanced box effects', 'Styling tables', 'Letterheaded paper',
      'Cool information box'],
  }, {
    name: 'Styling text',
    children: ['Fundamentals', 'Styling lists', 'Styling links',
      'Web fonts', 'Typesetting a homepage'],
  }, {
    name: 'CSS layout',
    children: ['Flexbox', 'Grids', 'Floats', 'Positioning', 'Multicol',
      'Fundamental Layout comprehension'],
  }],
}, {
  name: 'JavaScript',
  children: [{
    name: 'Learn',
    children: [{
      name: 'Introduction to JS 1',
      children: ['What is JS', 'First splash', 'Maths',
        'String methods', 'Array', 'Story generator'],
    }, {
      name: 'Building blocks',
      children: ['Conditionals', 'Loops', 'Functions', 'Events', 'Gallery'],
    }, {
      name: 'OOJS',
      children: ['Prototype', 'JSON'],
    }],
  }, {
    name: 'Guide',
    children: ['Working with Objects', 'Details of the object model'],
  }],
}];

/**
 * add nodes
 * @param {string} html paragraph html
 * @param {object} parent the node paragraph need to append to
 * @param {string} attr node attribute
 * @return
 */
function addNodes(nodes = [''], node = 'p', parent = $('main'), attr = {}) {
  let element;
  if (parent == main) {
    if (node.match(/(link|script|base|meta)/)) parent = head;
    else if (node.match(/(header|nav|footer|main)/)) parent = body;
  }

  toArray(nodes).forEach((html) => {
    attr.html = html;
    element = $(`<${node}>`, attr).appendTo(parent);
  });
  return element;
}

/**
 *
 * @param {array} subFolders sub folders
 * @param {object} parent the section the heading resided in
 * @param {number} level heading level
 */
function addMDNScripts(subFolders, parent, level) {
  subFolders.forEach((subFolder) => {
    const section = $('<section>').appendTo(parent);
    $(`<h${level}>`, {html: subFolder.name ? subFolder.name : subFolder}).appendTo(section);
    if (subFolder.children) addMDNScripts(subFolder.children, section, level + 1);
    else return;
  });
}

/**
 *
 * @param {string} script the script name based on the folder name
 */
function startScripts(script) {
  // #region functions
  /**
   *
   * @param {string} title document title and level 1 heading
   */
  function showTitle(title, isHyperLink = '') {
    $('h1').remove();
    main.html('');
    document.title = isHyperLink ? `My ${title} page` : title;
    return addNodes(isHyperLink ? `This is my ${title} page` : title, 'h1', main);
  }

  /**
   *
   * @param {string} suffix extra folder name append to the href
   */
  function addBase(suffix = '') {
    let href = '';
    $('base').remove();
    script.parentsUntil(`:has('h1')`).each(function() {
      href = `${$(this).children().first().text()}/${href}`;
    });
    href = href.replace(/\/Learn/, ``);
    href = href.replace(/\/$/, `${suffix}/`);
    href = href.replace(/Document and website /g, 'Document_and_website_');
    $('<base>', {href: `${mdn}/${href}`.toLowerCase().replace(/ /g, '-')}).appendTo(head);
  }

  /**
   *
   * @param {*} time time element
   */
  function setDateTime(time) {
    const date = new Date(time.text());
    time.attr({
      datetime: `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`,
    });
  }

  function createRow(parent = table) {
    return addNodes('', 'tr', parent);
  }

  /**
   *
   * @param {object} label label for the widget
   * @param {object} parent the label parent which it append to
   */
  function addLabels(labels, parent = $('form')) {
    toArray(labels).forEach((label) => {
      function addInput(label) {
        return $(`<input>`, {
          name: $('label', div).attr('for'),
          id: $('label', div).attr('for'),
        }).attr(label).removeAttr('html for widget').appendTo(div);
      }
      const div = addNodes('', 'div', parent);

      // label
      $('<label>', {
        for: label.for ? label.for : label.type,
        html: `${label.html}: ${(label.required ? ' <b><abbr>*</abbr></b>' : '')}`,
      }).appendTo(div);

      // input or widget
      if (label.widget) {
        function addOptions(options, parent = widget) {
          options.forEach((option) => {
            if (typeof option != 'object') {
              option = {html: option};
            }
            $('<option>', {
              html: option.html,
              value: option.value ? option.value : option.html.toLowerCase(),
            }).appendTo(parent).attr(option.attr ? option.attr : {});
          });
        }

        widget = $(`<${label.widget.type}>`, {
          name: label.widget.attr && label.widget.attr.name ? label.widget.attr.name : $('label', div).attr('for'),
          id: $('label', div).attr('for'),
        }).appendTo(div).attr(label.widget.attr ? label.widget.attr : {});
        if (label.widget.html) widget.html(label.widget.html);

        if (label.widget.type == 'select') {
          function addOptgroups(optgroups) {
            optgroups.forEach((optgroup) => {
              addOptions(optgroup.options, $('<optgroup>', {
                label: optgroup.label,
              }).appendTo(widget).attr(optgroup.attr ? optgroup.attr : {}));
            });
          }

          if (label.widget.options) addOptions(label.widget.options);
          else addOptgroups(label.widget.optgroups);
        } else if (label.widget.type == 'datalist') {
          widget.attr({id: label.widget.id});

          addInput(label).attr({list: label.widget.id});
          addOptions(label.widget.options);
        }
      } else {
        addInput(label);
      }
    });
  }

  function addFormStyle(button) {
    $('<button>', {
      type: 'submit',
      html: button.html,
    }).appendTo($('<div>').appendTo($('form'))).attr(button.attr ? button.attr : '  ');

    $('label span').css({display: 'unset'});
    $('label').css({width: 'unset'}).parent().addClass('my-margin').children().addClass('my-margin-small');
    $(`[type='submit']`).parent().addClass('w3-center w3-margin-top');
    $('form').addClass('w3-section my-border').css({
      margin: '0 auto',
      borderRadius: 16,
      maxWidth: 450,
      width: 'unset',
    });
    $('textarea').prev().css({verticalAlign: 'top'});
    $('select, input, fieldset, textarea').addClass('my-border').css({
      width: '-webkit-fill-available',
      minHeight: 30,
    });
    $('fieldset').addClass('w3-margin');
  }

  function getAllFuncs(obj) {
    let props = [];

    do {
      const funcs = Object.getOwnPropertyNames(obj).filter((func) => {
        return typeof obj[func] == 'function' &&
          obj.constructor.name != 'Object' &&
          !func.match(/constructor/);
      });
      props = props.concat(funcs);
    } while (obj = Object.getPrototypeOf(obj));

    return [...new Set(props)];
  }

  function addObjsFuncs(classes, func) {
    classes.forEach((objs) => {
      addNodes(objs[0].constructor.name, 'h2');
      objs.forEach((obj) => {
        const div = addNodes('', 'div');
        let name = obj.fullName;
        if (func) {
          name = func(obj);
        }
        addNodes(name, 'p', div);

        getAllFuncs(obj).forEach((func) => {
          addNodes(func, 'button', div).click(() => obj[func]());
        });
      });
    });
  }

  // #endregion functions

  const mdn = 'https://raw.githack.com/mdn/learning-area/master';
  const text = script.text();
  body.html(''); // remove body content
  bgColor = '';
  addBase();
  addMain();
  showTitle(text);
  addStyle('style.css');

  class Person {
    constructor(first, last, age, gender, interests) {
      this.name = {
        first: first,
        last: last,
      };
      this.age = age;
      this.gender = gender;
      this.interests = interests;
      this.fullName = `${this.name.first} ${this.name.last}`;
    }
  }

  const persons = [
    new Person('Bob', 'Smith', 32, 'male', ['music', 'skiing']),
    new Person('Diana', 'Cope', 28, 'female', ['kickboxing', 'brewing']),
    new Person('Tammi', 'Smith', 17, 'female', ['music', 'skiing', 'kickboxing']),
    new Person('Han', 'Solo', 25, 'male', ['Smuggling']),
    new Person('Leia', 'Organa', 19, 'female'['Government']),
  ];

  if (text.match(/Getting Started/) && script.is('h2')) {
    /**
     *
     * @param {object} img the image element being click
     */
    function switchImage(img) {
      if (img.src.match('firefox-icon.png')) {
        img.src = 'images/firefox2.png';
      } else {
        img.src = 'images/firefox-icon.png';
      }
    }

    function setUserName() {
      let myName;
      if (!localStorage.getItem('name')) {
        while (!myName || myName === null) {
          myName = prompt('Please enter your name.');
        }
        localStorage.setItem('name', myName);
      }
      $('h1').html(`Mozilla is cool, ${localStorage.getItem('name')}`);
    }

    // #region head
    $('base').remove();
    $('<base>', {href: 'https://raw.githack.com/mdn/beginner-html-site-scripted/gh-pages/'}).appendTo(head);
    addStyle('http://fonts.googleapis.com/css?family=Open+Sans');
    addStyle('styles/style.css');
    // #endregion

    // #region body
    body.css({width: mobileFlag ? 300 : 600});

    // <h1> element and its style
    showTitle('Mozilla is cool').appendTo(main.removeClass('w3-container')).css({
      fontSize: mobileFlag ? 36 : 60,
      textShadow: 'unset',
    });

    // image, its style and click event
    $('<img>', {
      src: `images/firefox-icon.png`,
      alt: 'The Firefox logo: a flaming fox surrounding the Earth.',
    }).click((e) => {
      switchImage($(e.target));
    }).appendTo(main);

    // paragraphs
    addNodes([
      'At Mozilla, we\'re a global community of',
      'working together to keep the Internet alive and accessible, so people worldwide can be informed contributors and creators of the Web. We believe this act of human collaboration across an open platform is essential to individual growth and our collective future.',
      'Read the <a></a> to learn even more about the values and principles that guide the pursuit of our mission.</p>',
    ]);

    // list
    const ul = $('<ul>').insertAfter($('p').first()); // first create ul element
    // put <li> content into array so you can creat <li> element iterally
    ['technologists', 'thinkers', 'builders'].forEach((item) => {
      $('<li>', {html: item}).appendTo(ul);
    });

    // href and content in a
    $('p a').attr({
      class: 'my-link',
      href: 'https://www.mozilla.org/en-US/about/manifesto/',
    }).html('Mozilla Manifesto').css({
      color: body.css('color'),
    });

    // buton and its click event
    $('button', {html: 'Change User'}).click(setUserName).appendTo(main);
    // #endregion

    // #region script

    // Personalized welcome message code
    setUserName();
    // #endregion
  }
  // #region HTML

  // #region Introduction to HTML
  else if (text.match(/Getting Started/)) {
    // #region body
    showTitle('Some Music');

    // paragraph
    addNodes('I really enjoy <strong>playing the drums</strong>. One of my favorite drummers is Neal Peart, who plays in the band <a href="https://en.wikipedia.org/wiki/Rush_%28band%29" title="Rush Wikipedia article">Rush</a>. My favourite Rush album is currently <a href="http://www.deezer.com/album/942295">Moving Pictures</a>');

    // image
    $('<img>', {
      src: 'http://www.cygnus-x1.net/links/rush/images/albums/sectors/sector2-movingpictures-cover-s.jpg',
      alt: 'The Firefox logo: a flaming fox surrounding the Earth.',
    }).appendTo(main);

    $('p a').addClass('my-link my-highlight');
    // #endregion
  } else if (text.match(/The HTML Head/)) {
    /**
     *
     * @param {*} li
     */
    function changeListContent(li) {
      li.html(prompt('Enter new content for your list item'));
    }

    function addListItem() {
      $('<li>').appendTo($('ul')).css({
        marginLeft: 20,
        color: 'white',
      }).html(prompt('What content do you want the list item to have?')).click((e) => {
        e.stopPropagation(); // prevent the html click event being trigger;
        changeListContent($(e.target));
      });
    }

    /**
     *
     * @param {string} name name attribute
     * @param {string} content content attribute
     */
    function addMetaTag(name, content) {
      $('<meta>', {name: name, content: content}).appendTo(head);
    }

    showTitle('Meta Example');

    // #region head
    // twitter cards
    // https://developer.twitter.com/en/docs/tweets/optimize-with-cards/overview/abouts-cards
    const metaTags = [
      {name: 'author', content: 'Alan Turing'},
      {name: 'description', content: 'This is an example page to demonstrate usage of metadata on web pages.'},
      {name: 'twitter:card', content: `summary`},
      {name: 'twitter:image', content: `${dir}/avatar.jpg`},
      {name: 'twitter:creator', content: $('[name=author]').attr('content')},
      {name: 'twitter:site', content: `@MozDevNet`},
      {name: 'twitter:title', content: document.title},
      {name: 'twitter:description', content: $('[name=description]').attr('content')},
    ];
    metaTags.forEach((metaTag) => {
      addMetaTag(metaTag.name, metaTag.content);
    });

    // #endregion

    // #region body

    // paragraph
    addNodes('Below is a dynamic list. Click anywhere outside the list to a new list item. Click an existing list item to change its text to something else.');
    // #endregion

    // #region script

    // ul
    $('<ul>').appendTo(main);
    body.click(addListItem);
    // #endregion
  } else if (text.match(/HTML Text Formatting/)) {
    showTitle('Quick hummus recipe');

    // paragraphs
    addNodes([
      'This recipe makes quick, tasty hummus, with no messing. It has been adapted from a number of different recipes that I have read over the years.',
      'hummus is a delicious thick paste used heavily in Greek and Middle Eastern dishes. It is very tasty with salad, grilled meats and pitta breads.',
      'For a different flavour, you could try blending in a small measure of lemon and coriander, chili pepper, lime and chipotle, harissa and mint, or spinach and feta cheese. Experiment and see what works for you.',
      'Refrigerate the finished hummus in a sealed container. You should be able to use it for about a week after you\'ve made it. If it starts to become fizzy, you should definitely discard it.',
      'hummus is suitable for freezing; you should thaw it and use it within a couple of months.',
    ]);

    // h2
    addNodes(['Ingredients', 'Instructions', 'Storage'], 'h2');

    // move h2
    $('h2').insertAfter($('p').eq(1));
    $('h2').last().insertAfter($('p').eq(2));

    // li for ul
    const ul = $('<ul>').insertAfter($('h2').eq(0));
    addNodes(['1 can (400g) of chick peas (garbanzo beans)', '175g of tahini', '6 sundried tomatoes', 'Half a red pepper', 'A pinch of cayenne pepper', '1 clove of garlic', 'A dash of olive oil'], 'li', ul);

    // li for ol
    const ol = $('<ol>').insertAfter($('h2').eq(1));
    addNodes(['Remove the skin from the garlic, and chop coarsely.', 'Remove all the seeds and stalk from the pepper, and chop coarsely.', 'Add all the ingredients into a food processor.', 'Process all the ingredients into a paste.', 'If you want a coarse "chunky" hummus, process it for a short time.', 'If you want a smooth hummus, process it for a longer time.'], 'li', ol);
  } else if (text.match(/Creating Hyperlinks/)) {
    function showProjectHomepage() {
      $('<a>', {
        href: `${mdn}/html/introduction-to-html/creating-hyperlinks/pdfs/project-brief.pdf`,
        html: 'project brief',
      }).appendTo(addNodes('A link to my ', 'p', main));
    }

    /**
     *
     * @param {string} anchor heading id
     */
    function showContactsHomepage(anchor) {
      addNodes(['The <a href="#Mailing_address">company mailing address</a> can be found at the bottom of this page.', 'Chris is the only guy that works here, and he doesn\'t have a phone.'], 'p', main);

      $('<h2>', {
        id: 'Mailing_address',
      }).appendTo(main);

      $('<address>', {
        html: '52 Business street<br>Very important town<br>Commerce city<br>CA, 999654',
      }).appendTo(main);
      if (anchor) location.href = `${location.href.replace(/#.*/, '')}#${anchor}`;
    }

    function showSampleHomepage() {
      // #region body
      // paragraph
      $('<span>', {
        id: 'project',
        html: 'project homepage',
      }).appendTo(addNodes('Visit my ', 'p', main));

      $('<span>', {
        id: 'contacts',
        html: 'contacts page',
      }).appendTo(addNodes('Want to contact a specific staff member? Find details on our ', 'p', main));

      $('<span>', {
        id: 'Mailing_address',
        html: 'mailing address',
      }).appendTo(addNodes('Want to write us a letter? Use our ', 'p', main));
      // #endregion
    }

    function showHomepage() {
      showTitle(this.id.match(/Mailing_address/) ? 'contacts' : (this.id ? this.id : $(this).text()), true);
      $('h1').appendTo(main);
      if (this.id.match(/project/) || $(this).text().match(/Project/)) {
        showProjectHomepage();
      } else if (this.id.match(/contacts/) || $(this).text().match(/Contacts/)) {
        showContactsHomepage();
      } else if (this.id.match(/Mailing_address/)) {
        showContactsHomepage(this.id);
      } else showSampleHomepage();
      $('span[id]').addClass('my-link').click(showHomepage);
    }

    addNav(['Sample', 'Project', 'Contacts']);
    $('nav button').unbind().click(showHomepage);
    $('button:contains("Sample")').click();
  } else if (text.match(/Navigatoin Menu/)) {
    /**
     *
     * @param {string} heading level 1 heading
     * @param {string} parargraph intro pargraph
     */
    function showContent(heading, parargraph) {
      $('h1').html(heading);
      $('p').html(parargraph);
    }

    addNav(['Home', 'Pictures', 'Projects', 'Social']);
    showTitle('Home').appendTo(main); // set document title and level 1 heading

    // parargraph
    addNodes('Welcome to my exciting homepage', 'p', main);

    $('nav button').unbind().click(function() {
      title = $(this).text();

      if ($(this).text() == 'Projects') parargraph = 'Welcome to my project page, showing what exciting things I am currently doing.';
      else if ($(this).text() == 'Pictures') parargraph = 'My pictures will go here, when I start taking some.';
      else if ($(this).text() == 'Home') parargraph = 'Welcome to my exciting homepage.';
      else if ($(this).text() == 'Social') parargraph = 'Welcome to my social media page. I am currently antisocial, but will start putting my social media widgets on here when the time is right.';

      showContent(title, parargraph);
    });
  } else if (text.match(/Advanced Text Formatting/)) {
    addNodes(['Description list example', 'Quote examples', 'Other semantics examples'], 'h2');

    // #region Description list example
    const dl = addNodes('', 'dl').insertAfter($('h2').eq(0));
    addNodes(['soliloquy', 'monologue', 'aside'], 'dt', dl);
    addNodes(['In drama, where a character speaks to themselves, representing their inner thoughts or feelings and in the process relaying them to the audience (but not to other characters.)', 'In drama, where a character speaks their thoughts out loud to share them with the audience and any other characters present.', 'In drama, where a character shares a comment only with the audience for humorous or dramatic effect. This is usually a feeling, thought or piece of addtional background information.'], 'dd', dl);

    // insert dd after dt
    $('dd').each(function(i) {
      $(this).insertAfter($('dt').eq(i));
    });

    // #endregion

    // #region Quote examples
    addNodes(['According to the ', '<strong>HTML <code>&lt;blockquote&gt;</code> Element</strong> (or <em>HTML Block Quotation Element</em>) indicates that the enclosed text is an extended quotation.', 'The quote element &mdash; <code>&lt;q&gt;</code> &mdash; '], 'p');
    $('p').insertAfter($('h2').eq(1));
    addNodes('MDN blockquote page', 'cite', $('<a>', {
      href: 'https://developer.mozilla.org/en-US/docs/Web/HTML/Element/blockquote',
    }).appendTo($('p').eq(0)));

    $('p').eq(1).appendTo($('<blockquote>', {
      cite: 'https://developer.mozilla.org/en-US/docs/Web/HTML/Element/blockquote',
    }).insertAfter($('p').eq(0)));

    $('<q>', {
      cite: 'https://developer.mozilla.org/en-US/docs/Web/HTML/Element/q',
      html: 'intended for short quotations that don\'t require paragraph breaks.',
    }).appendTo($('p').eq(2));
    $('p').eq(2).html(`${$('p').eq(2).html()} -- `);
    addNodes('MDN q page', 'cite', $('<a>', {
      href: 'https://developer.mozilla.org/en-US/docs/Web/HTML/Element/q',
    }).appendTo($('p').eq(2)));

    // #endregion

    // #region Other semantics examples

    addNodes(['We use <b></b> to structure our web documents.', 'I think <b></b> Green did it in the kitchen with the chainsaw.', 'Chris Mills, Manchester, The Grim North, UK', 'Caffeine\'s chemical formula is C<sub>8</sub>H<sub>10</sub>N<sub>4</sub>O<sub>2</sub>.', 'If x<sup>2</sup> is 9, x must equal 3.', 'You shouldn\'t use presentational elements like <code>&lt;font&gt;</code> and <code>&lt;center&gt;</code>.', 'In the above JavaScript example, <var>para</var> represents a paragraph element.', 'Select all the text with <kbd>Ctrl</kbd>/<kbd>Cmd</kbd> + <kbd>A</kbd>.'], 'p');

    $('<abbr>', {
      title: 'Hypertext Markup Language',
      html: 'HTML',
    }).appendTo($('b', $('p').eq(3))).unwrap('b');

    $('<abbr>', {
      title: 'Reverend',
      html: 'Rev.',
    }).appendTo($('b', $('p').eq(4))).unwrap('b');

    $('p').eq(5).appendTo($('<address>').insertAfter($('p').eq(4)));

    // #endregion
  } else if (text.match(/Document and website structure/)) {
    document.title = 'My page title';
    addStyle('https://fonts.googleapis.com/css?family=Open+Sans+Condensed:300|Sonsie+One');
    $('h1').remove();
    addNodes('Header', 'h1', addNodes('', 'header'));

    // #region nav
    const nav = addNodes('', 'nav');

    // ul
    let ul = addNodes('', 'ul', nav);
    addNodes(['Home', 'Team', 'Projects', 'Contact'], 'a', ul);
    $('ul a').wrap('<li>');

    // form
    const form = addNodes('', 'form', nav);
    $('<input>', {
      type: 'search',
      name: 'q',
      placeholder: 'Search query',
    }).appendTo(form);
    $('<input>', {
      type: 'submit',
      value: 'Go!',
    }).appendTo(form);

    // #endregion

    // main
    const main = addNodes('', 'main');

    // #region aritcle
    const article = addNodes('', 'article', main);

    addNodes('Article heading', 'h2', article);

    addNodes(['Lorem ipsum dolor sit amet, consectetur adipisicing elit. Donec a diam lectus. Set sit amet ipsum mauris. Maecenas congue ligula as quam viverra nec consectetur ant hendrerit. Donec et mollis dolor. Praesent et diam eget libero egestas mattis sit amet vitae augue. Nam tincidunt congue enim, ut porta lorem lacinia consectetur.', 'Donec ut librero sed accu vehicula ultricies a non tortor. Lorem ipsum dolor sit amet, consectetur adipisicing elit. Aenean ut gravida lorem. Ut turpis felis, pulvinar a semper sed, adipiscing id dolor.', 'Pelientesque auctor nisi id magna consequat sagittis. Curabitur dapibus, enim sit amet elit pharetra tincidunt feugiat nist imperdiet. Ut convallis libero in urna ultrices accumsan. Donec sed odio eros.', 'Donec viverra mi quis quam pulvinar at malesuada arcu rhoncus. Cum soclis natoque penatibus et manis dis parturient montes, nascetur ridiculus mus. In rutrum accumsan ultricies. Mauris vitae nisi at sem facilisis semper ac in est.', 'Vivamus fermentum semper porta. Nunc diam velit, adipscing ut tristique vitae sagittis vel odio. Maecenas convallis ullamcorper ultricied. Curabitur ornare, ligula semper consectetur sagittis, nisi diam iaculis velit, is fringille sem nunc vet mi.'], 'p', article);

    $('<h3>', {html: 'subsection'}).insertAfter($('p').eq(0));
    $('<h3>', {html: 'Another subsection'}).insertAfter($('p').eq(2));

    // #endregion

    // #region aside
    const aside = addNodes('', 'aside', main);
    addNodes('Related', 'h2', aside);

    // ul
    ul = addNodes('', 'ul', aside);
    addNodes(['Oh I do like to be beside the seaside', 'Oh I do like to be beside the sea', 'Although in the North of England', 'It never stops raining', 'Oh well...'], 'a', ul);
    $('aside ul a').wrap('<li>');
    addNodes('&copy;Copyright 2050 by nobody. All rights reversed.', 'p', addNodes('', 'footer'));
    $('a').attr({href: '#'});
    // #endregion

    // #region responsive design

    if (mobileFlag) {
      $.merge(body.css({width: 'unset', margin: 'unset'}), $('article, aside')).addClass('w3-container');
      $('.w3-container').css({padding: '0.01em 16px'});
      $('h2').css({fontSize: '2.5rem'});
      $('p, li').css({fontSize: '2rem'});
      $('aside').hide();
      $(`form`).hide();
    }
    // #endregion
  } else if (text.match(/Debug Example/)) {
    main.html(`${main.html()}<p>What causes errors in HTML?<ul><li>Unclosed elements: If an element is <strong>not closed properly, then its effect can spread to areas you didn\'t intend<li>Badly nested elements: Nesting elements properly is also very important for code behaving correctly. <strong>strong <em>strong emphasised?</strong> what is this?</em><li>Unclosed attributes: Another common source of HTML problems. Let\'s look at an example: <a href="https://www.mozilla.org/>link to Mozilla homepage</a></ul>`);

    $('h1').prependTo(main);
    addNodes(['Unfixed Example', 'Fixed Example'], 'h2');
    $('h2').first().insertAfter('h1');

    const ul = addNodes('', 'ul');
    addNodes(['Unclosed elements: If an element is <strong>not closed properly</strong>, then its effect can spread to areas you didn\'t intend', 'Badly nested elements: Nesting elements properly is also very important for code behaving correctly. <b>strong <i>strong emphasised?</i></b> what is this?', 'Unclosed attributes: Another common source of HTML problems. Let\'s look at an example: '], 'li', ul);
    $('<a>', {href: 'https://www.mozilla.org/', html: 'link to Mozilla homepage'}).appendTo($('li').eq(5));
  } else if (text.match(/Marking up a letter/)) {
    /**
     * Provide an HTML5 doctype (<!doctype html>, 1 mark)
     * Include a <head> element just below that (1 mark)
     * Wrap the content in a <body> element (1 mark)
     * Wrap head and body in an <html> element (1 mark)
     * You get one bonus mark for including a lang attribute in the <html> tag (1 mark)
     */

    // #region head
    document.title = 'Awesome science application correspondance';
    // The answer should be <meta charset="utf-8"> or equivalent, included inside the <head> element. (1 mark)
    $('<meta>', {name: 'author', content: 'Dr Eleanor Gaye'}).appendTo(head);

    // The CSS from the provided CSS file should be pasted inside a <style> element, included inside the <head> element. OR, it would also be acceptable (in fact better) if the student put the CSS inside an external CSS file and linked it via a <link> element. (2 marks)

    // If the student's code validates, apart from the Google Font link element, they get the marks. (2 marks)
    // #endregion

    // #region style
    $('body').css({
      maxWidth: `800px`,
      margin: `0 auto`,
    });

    $('.sender-column').css({
      textAlign: `right`,
    });

    $('h1').css({
      fontSize: `1.5em`,
    });

    $('h2').css({
      fontSize: `1.3em`,
    });

    $('p,ul,ol,dl,address').css({
      fontSize: `1.1em`,
    });

    $('p, li, dd, dt, address').css({
      lineHeight: `1.5`,
    });

    // #endregion

    // #region body

    // #region letter header

    // The first <p> element in the document should be given an attribute of class="sender-column"; (1 mark)
    const senderPara = addNodes('Awesome Science faculty<br>University of Awesome<br>Bobtown, CA 99999,<br>USA<br><b>Tel</b>: 123-456-7890<br><b>Email</b>: no_reply@example.com', 'address').addClass('sender-column');

    // "Dr. Eleanor Gaye", "Miss Eileen Dover", "Tel", and "Email" should be wrapped in a <strong> element. (2 marks, half a mark each)
    $('<b>', {html: 'Dr. Eleanor Gaye<br>'}).prependTo(senderPara);

    // The first date should be wrapped in a <p>, which should also be given the class="sender-column" attribute. (1 mark)
    $('<time>', {html: '20 January 2016'}).appendTo(addNodes().addClass('sender-column'));

    // Wrap both of the addresses in an <address> element, and put a <br> element at the end of each line of the address, except for the last line in each case.
    const receiverPara = addNodes('<br>4321 Cliff Top Edge<br>Dover, CT9 XXX<br>UK', 'address');
    $('<b>', {html: 'Miss Eileen Dover'}).prependTo(receiverPara); // receiver

    // #endregion

    // #region letter body

    // Mark up the "Re:" line as an <h1> element (1 mark)
    addNodes('Re: Eileen Dover university application', 'h1');

    // Mark up all appropriate structural elements that shouldn't be headings or lists as paragraphs (2 marks)
    addNodes('Dear Eileen,');
    addNodes('Thank you for your recent application to join us at the University of Awesome\'s science faculty to study as part of your <abbr title="Doctor of Philosophy">PhD</abbr> next year. I will answer your questions one by one, in the following sections.');

    // #region h2 Starting dates
    // Mark up the "Starting dates", "Subjects of study" and "Exotic dance moves" as <h2> elements (3 marks)
    addNodes('Starting dates', 'h2');
    addNodes('We are happy to accommodate you starting your study with us at any time, however it would suit us better if you could start at the beginning of a semester; the start dates for each one are as follows:');

    // Mark up the semester start dates as an unordered list (<ul>/<li>), or arguably an ordered list (<ol>/<li>)  either is ok (2 marks)
    const ul = addNodes('', 'ul');

    addNodes(['First semester: <time>9 September 2016</time>', 'Second semester: <time>15 January 2017</time>', 'Third semester: <time>2 May 2017</time>'], 'li', ul);

    addNodes(['Please let me know if this is ok, and if so which start date you would prefer.', 'You can find more information about <a>important university dates</a> on our website.']);

    // #endregion

    // #region h2 Subjects of study
    addNodes('Subjects of study', 'h2');
    addNodes('At the Awesome Science Faculty, we have a pretty open-minded research facility &mdash; as long as the subjects fall somewhere in the realm of science and technology. You seem like an intelligent, dedicated researcher, and just the kind of person we\'d like to have on our team. Saying that, of the ideas you submitted we were most intrigued by are as follows, in order of priority:');

    // Mark up the study subjects as an ordered list (<ol>/<li>) (2 marks)
    const ol = addNodes('', 'ol');

    // The four numbers in the chemical formulae should be wrapped in a <sub> element, e.g. H<sub>2</sub>O. (2 marks)
    // The rightmost number in both exponential expressions should be wrapped in a <sup> element, e.g. 10<sup>3</sup>. (1 mark)
    addNodes(['Turning H<sub>2</sub>O into wine, and the health benefits of Resveratrol (C<sub>14</sub>H<sub>12</sub>O<sub>3</sub>.)', 'Measuring the effect on performance of funk bassplayers at temperatures exceeding 30&deg;C (86&deg;F), when the audience size exponentially increases (effect of 3 &times; 10<sup>3</sup> increasing to 3 &times; 10<sup>4</sup>.)', '<abbr title="HyperText Markup Language">HTML</abbr> and <abbr title="Cascading Style Sheet">CSS</abbr> constructs for representing musical scores.'], 'li', ol);

    addNodes('So please can you provide more information on each of these subjects, including how long you\'d expect the research to take, required staff and other resources, and anything else you think we\'d need to know? Thanks.');

    // #endregion

    // #region h2 Exotic dance moves
    addNodes('Exotic dance moves', 'h2');

    // Try to mark up at least two appropriate words in the text with strong importance/emphasis (1 mark, half a mark each) did and very
    addNodes('Yes, you are right! As part of my post-doctorate work, I <i>did</i> study exotic tribal dances. To answer your question, my favourite dances are as follows, with definitions:');

    // Mark up the exotic dances as a description list (<dl>/<dd>/<dt>) (2 marks)
    const dl = addNodes('', 'dl');
    addNodes(['Polynesian chicken dance', 'Icelandic brownian shuffle', 'Arctic robot dance'], 'dt', dl);
    addNodes(['A little known but <i>very</i> influential dance dating back as far as 300<abbr title="Before Christ">BC</abbr>, a whole village would dance around in a circle like chickens, to encourage their livestock to be "fruitful".', 'Before the Icelanders developed fire as a means of getting warm, they used to practice this dance, which involved huddling close together in a circle on the floor, and shuffling their bodies around in imperceptibly tiny, very rapid movements. One of my fellow students used to say that he thought this dance inspired modern styles such as Twerking.', 'An interesting example of historic misinformation, English explorers in the 1960s believed to have discovered a new dance style characterized by "robotic", stilted movements, being practiced by inhabitants of Northern Alaska and Canada. Later on however it was discovered that they were just moving like this because they were really cold.'], 'dd', dl);

    // insert dd after dt
    $('dd').each(function(i) {
      $(this).insertAfter($('dt').eq(i));
    });

    // #endregion

    // #endregion

    // #region letter footer
    addNodes('For more of my research, see <a>my exotic dance research page</a>.');
    addNodes(['Yours sincerely,', 'Dr. Eleanor Gaye']);

    // "Be excellent to each other" should be wrapped in a <q> element (1 mark)
    // "The memoirs of Bill S Preston, Esq" should be wrapped in a <cite> element (1 mark)
    addNodes('University of Awesome motto: <q>Be awesome to each other.</q> -- <cite>The memoirs of Bill S Preston</cite>, <abbr title="Esquire">Esq</abbr>');

    // #endregion

    // #region node style
    // The two places should have an <a> element wrapped around reasonable words to make the link. Each element should have an href attribute pointing to a dummy URL, such as "http://www.example.com" or "*", and a title attribute that describes what the link should point to. Half a mark should be taken off if the link text is inappropriate, and/or attributes are missing. (4 marks)
    // First instance: something like <a href="http://www.example.com" title="table of awesome university important dates">important university dates</a>
    // Second instance: something like <a href="htp://www.example.com" title="Dr Gaye's exotic dance research">exotic dance research page</a>
    $('p a').each(function() {
      $(this).attr({
        title: `a link to ${$(this).text()}`,
        href: 'http://example.com',
      });
    });

    // All four dates should be marked up using a <time> element. Each one should have a datetime attribute containing a machine readable date. For example <time datetime="2016-01-20">20 January 2016</time>
    // set datetime attribute in time element
    $('time').each(function() {
      setDateTime($(this));
    });

    // #endregion

    // #endregion
  } else if (text.match(/Structuring a page of content/)) {
    // #region head
    document.title = 'Birdwatching';
    // If the student's code validates, apart from the Google Font link element, they get the marks.
    addBase('-start');
    addStyle('https://fonts.googleapis.com/css?family=Roboto+Condensed:300|Cinzel+Decorative:700');
    addStyle('style.css');
    // #endregion

    // #region header
    // They need to wrap the <h1>, first <img> and whole of the <ul> in a <header> element. (4 marks)
    const header = addNodes('', 'header');
    $('h1').remove();
    addNodes('Birdwatching', 'h1', header);
    $('<img>', {src: 'dove.png', alt: 'a simple dove logo'}).appendTo(header);

    // #region nav
    const nav = $('<nav>').appendTo(header);

    // ul
    const ul = addNodes('', 'ul', nav);

    // They need to wrap the <ul> in a <nav> element.
    addNodes(['Home', 'Get started', 'Photos', 'Gear', 'Forum'], 'span', ul);
    $('ul span').wrap('<li>');

    // #endregion

    // #endregion

    // #region body

    // main
    const main = addNodes('', 'main');

    // #region aritcle
    const article = addNodes('', 'article', main);

    // They need to wrap both <h2>s, the first two <p>s and the last four <img>s in a <main> element.
    addNodes('Welcome', 'h2', article);

    // They need to wrap the first <h2> and the first two <p>s in an <article> element or a <section> element.
    addNodes(['Welcome to our fake birdwatching site. If this were a real site, it would be the ideal place to come to learn more about birdwatching, whether you are a beginner looking to learn how to get into birding, or an expert wanting to share ideas, tips, and photos with other like-minded people.', 'So don\'t waste time! Get what you need, then turn off that computer and get out into the great outdoors!'], 'p', article);

    // #endregion

    // #region aside
    const aside = addNodes('', 'aside', main);

    // They need to wrap the second <h2> and the last four <img>s in an <aside> element.
    addNodes('Favourite photos', 'h2', aside);

    ['Small black bird, black claws, long black slender beak, links to larger version of the image', 'Top half of a pretty bird with bright blue plumage on neck, light colored beak, blue headdress, links to larger version of the image', 'Top half of a large bird with white plumage, very long curved narrow light colored break, links to larger version of the image', 'Large bird, mostly white plumage with black plumage on back and rear, long straight white beak, links to larger version of the image'].forEach((alt, i) => {
      const a = $('<a>', {href: `favorite-${i + 1}.jpg`}).appendTo(aside);
      $('<img>', {src: `favorite-${i + 1}_th.jpg`, alt: alt}).appendTo(a);
    });

    // #endregion

    // #endregion

    // #region footer
    // They need to wrap the last two <p>s in a <footer> element.
    const footer = addNodes('', 'footer');
    addNodes('This fake website example is CC0 &mdash; any part of this code may be reused in any way you wish. Original example written by Chris Mills, 2016.', 'p', footer);

    $('<a>', {
      href: 'http://game-icons.net/lorc/originals/dove.html',
      html: 'Dove icon',
    }).prependTo(addNodes(' by Lorc.', 'p', footer));

    // #endregion
  }
  // #endregion Introduction to HTML
  // #region Multimedia and embedding
  else if (text.match(/Images in HTML/)) {
    $('<img>', {
      src: 'dinosaur.jpg',
      alt: 'The head and torso of a dinosaur skeleton; it has a large head with long sharp teeth',
      title: 'A T-Rex on display in the Manchester University Museum',
    }).appendTo(main);
  } else if (text.match(/Video and Audio content/)) {
    ['video', 'audio'].forEach((type, index) => {
      const section = $('<section>', {class: 'w3-section'}).appendTo(main);
      addNodes(type, 'h2', section);
      let node = $(`<${type}>`).prop({
        controls: true,
        loop: true,
        muted: true,
        preload: 'auto',
      }).appendTo(section);

      const tracks = index ? ['viper.mp3', 'viper.ogg'] : ['rabbit320.mp4', 'rabbit320.w3bm'];
      node = index ? node : node.attr({poster: 'poster.png'});

      for (let i = 0; i < tracks.length; i++) {
        $('<source>', {src: tracks[i]}).attr({
          type: function() {
            return `video/${this.src.match(/\w+$/)[0]}`;
          },
        }).appendTo(node);
      }

      addNodes(`Your browser doesn\'t support HTML5 ${type}. Here is a <a href="${tracks[0]}">link to the ${type}</a> instead.`, 'p', node);
    });
  } else if (text.match(/Other embedding technologies/)) {
    addNodes('Iframe with basic details', 'h2');
    const iframe = $('<iframe>', {
      src: 'https://www.youtube.com/embed/QH2-TGUlwu4',
      class: 'w3-image',
    }).css({border: 0}).appendTo(main);

    addNodes('Object image example', 'h2');
    let object = $('<object>', {
      data: 'dinosaur.jpg',
      type: 'image/jpeg',
      class: 'w3-image',
    }).prop({typemustmatch: true}).appendTo(main);
    addNodes('Why oh why didn\'t we just use the image element?', 'p', object);

    addNodes('Object PDF example', 'h2');
    object = $('<object>', {
      data: 'mypdf.pdf',
      type: 'application/pdf',
      class: 'w3-image',
    }).prop({typemustmatch: true}).appendTo(main);
    addNodes('You don\'t have a PDF plugin, but you can <a href="mypdf.pdf">download the PDF file.</a>', 'p', object);
  } else if (text.match(/Adding vector graphics to the web/)) {
    addNodes('raster', 'h2');
    $('<img>', {src: 'star.png', alt: 'A raster star'}).appendTo(addNodes());
    addNodes('vector', 'h2');
    $('<img>', {src: 'star.svg', alt: 'A vector star'}).appendTo(addNodes());
  } else if (text.match(/Responsive Images/)) {
    // #region body
    addNodes('', 'header');
    const section = addNodes('', 'section', addNodes('', 'main'));
    $('h1').remove();
    addNodes('My website', 'h1', section);
    addNodes(['Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris eget venenatis ligula. Ut lacinia at dolor vitae pulvinar. Aliquam pretium dignissim eros. Integer faucibus, dui non aliquet bibendum, lectus orci lobortis odio, ornare porttitor est tellus eget velit. Nulla eros elit, malesuada id neque vel, viverra vehicula neque. Nullam auctor turpis non leo iaculis finibus. Quisque blandit arcu venenatis libero tempor, ac pulvinar ligula dapibus.', 'Suspendisse potenti. Ut in luctus eros. Mauris pulvinar vehicula aliquet. Etiam imperdiet eleifend luctus. Duis ut justo nec eros ornare consectetur. Vestibulum convallis condimentum varius. Maecenas rutrum porta varius. Phasellus volutpat sem id sagittis luctus. Morbi vitae quam vitae nisi iaculis dignissim.', 'Header image originally by <a href="https://www.flickr.com/photos/miwok/17086751527/">Miwok</a>.'], 'p', section);

    // #region picture
    picture = $('<picture>').insertAfter($('p').eq(0));
    [480, 800, 3000].forEach((source) => {
      let srcset;
      if (source == 480) srcset = '480w-close-portrait';
      else if (source == 800) srcset = '800w';
      else if (source == 3000) srcset = 'original';
      $('<source>', {
        media: `(max-width: ${source}px)`,
        srcset: `elva-${srcset}.jpg`,
      }).appendTo(picture);
    });
    $('<img>', {
      alt: 'Chris standing up holding his daughter Elva',
      src: 'elva-480-close-portrait.jpg',
    }).appendTo(picture);
    // #endregion

    // #region srcset
    srcset = `elva-fairy-original.jpg ${2600 / 320}x`;
    [320, 480, 640, 800].forEach((src) => {
      srcset = `elva-fairy-${src}w.jpg ${src / 320}x, ${srcset}`;
    });

    img = $('<img>', {
      srcset: srcset,
      alt: 'Elva dressed as a fairy',
      src: 'elva-fairy-320w.jpg',
    }).insertAfter($('p').eq(1));
    // #endregion

    // #endregion

    // #region style
    $('html').css({
      fontFamily: `sans-serif`,
      background: `gray`,
    });

    $('body').css({
      width: `100%`,
      maxWidth: `1200px`,
      margin: `0 auto`,
      background: `white`,
    });

    $('header').css({
      background: `url(header.jpg) no-repeat center`,
      height: `200px`,
    });

    $('section').css({
      padding: `20px`,
    });

    $('p').css({
      lineHeight: `1.5`,
    });

    $('img').css({
      display: `block`,
      margin: `0 auto`,
      maxWidth: `100%`,
    });
    // #endregion
  } else if (text.match(/MDN splash page/)) {
    /**
     * A total of 6 marks should be awarded for this section
     * 1 for creating the 400px and 120px version of the Firefox logo.
     * 1 for creating the 400px and 120px version of the Addons image.
     * 1 for creating the 400px and 120px version of the Dinosaur logo.
     * 1 for leaving the MDN logo SVG as it is.
     * 1 for creating the 1200px and 600px version of the Red Panda image, but only if the former is landscape, and the latter is portrait and shows the panda close up.
     * 1 for optimizing them so they are nice and compact.
     */

    // #region head
    document.title = text;
    // If the student's code validates, apart from the Google Font link element, they get the marks.
    addBase('-finished');
    addStyle('https://fonts.googleapis.com/css?family=Roboto+Condensed:300|Cinzel+Decorative:700');
    // #endregion

    // #region header

    $('h1').remove();
    const header = addNodes('Mozilla', 'h1', addNodes('', 'header')).parent();

    $('<img>', {
      alt: 'Firefox logo', // 1 for giving the image appropriate alt text.
      src: 'firefox-logo120.png', // 1 for making the image src point to the 120px version of the Firefox logo.
    }).appendTo(header);
    // #endregion

    const main = addNodes('', 'main');

    // #region article
    const article = addNodes('', 'article', main);
    addNodes('Rocking the free web', 'h2', article);

    // 'https://www.youtube.com/watch?v=ojcNcvb1olg'.replace(/watch\?v=/g, 'embed/')
    $('<iframe>', {
      src: 'https://www.youtube.com/embed/ojcNcvb1olg', // 1 for embedding the correct video.
      width: 400, // 1 for making it 400px wide, and a reasonable amount tall.
    }).css({border: 0}).prependTo(article);

    addNodes(['Mozilla are a global community of technologists, thinkers, and builders, working together to keep the Internet alive and accessible, so people worldwide can be informed contributors and creators of the Web. We believe this act of human collaboration across an open platform is essential to individual growth and our collective future.', 'Click on the images below to find more information about the cool stuff Mozilla does. <a href="https://www.flickr.com/photos/mathiasappel/21675551065/">Red panda picture</a> by Mathias Appel.'], 'p', article);

    // #endregion

    // #region further-info div
    const images = [{
      src: 'firefox-logo%%.png',
      href: 'https://www.mozilla.org/en-US/firefox/new/',
      alt: 'Download Firefox',
    }, {
      src: 'firefox-addons%%.jpg',
      href: 'https://www.mozilla.org/',
      alt: 'Download Firefox',
    }, {
      src: 'mozilla-dinosaur%%.png',
      href: 'https://addons.mozilla.org/',
      alt: 'Customize Firefox with add-ons',
    }, {
      src: 'mdn.svg',
      href: 'https://developer.mozilla.org/en-US/',
      alt: 'Learn web development with MDN',
    }];
    let div = $('<div>', {class: 'further-info'}).appendTo(main);
    images.forEach((image, index) => {
      // Use the correct image inside the link (Firefox logo for "Download Firefox", Dinosaur for mozilla.org, Add-ons image for the add-ons site.)
      const img = addNodes('', 'img', $('<a>', {href: image.href}).appendTo(div)).attr({
        alt: image.alt, // Include an appropriate src and alt attribute.
        src: image.src.replace(/%%/, '120'),
      });

      // 2 for embedding the SVG image inside the last link, just in a normal image element, with appropriate src attribute and alt text.
      if (index != 3) {
        let srcset = ``;
        [120, 400].forEach((src) => {
          srcset += `${image.src.replace(/%%/, src)} ${src}w, `;
        });
        img.attr({
          srcset: srcset.replace(/, $/, ''), // Include a srcset attribute that declares the 120px version of the image as 120w, and the 400px version of 400w.
          sizes: '(max-width: 480px) 120px, 400px', // Include a sizes attribute that declares that the 120px version should be used if the viewport is 480px wide or narrower ((max-width: 480px)), and the 400px version should be used otherwise.
        });
      }
    });

    $('<div>', {class: 'clearfix'}).appendTo(div);
    // #endregion

    // #region red panda div
    div = $('<div>', {class: 'red-panda'}).appendTo(main);
    picture = addNodes('', 'picture', div); // 1 for using a <picture> element.

    // 2 for including a <source> element with a srcset attribute pointing to the portrait version of the image, and a media attribute that causes the portrait image to show up only if the viewport is 600px wide or less ((max-width: 600px).)
    $('<source>', {
      media: `(max-width: 600px)`,
      srcset: `red-panda-portrait-small.jpg`,
    }).appendTo(picture);

    // 2 for including an <img> element inside the <picture> element, pointing to the landscape version, with appropriate alt text.
    $('<img>', {
      alt: 'a red panda',
      src: 'red-panda-landscape.jpg',
    }).appendTo(picture);

    // #endregion

    // #region style

    $('html').css({
      fontFamily: `'Open Sans', sans-serif`,
      background: `url(pattern.png)`,
    });

    $('body').css({
      width: `100%`,
      maxWidth: `1200px`,
      margin: `0 auto`,
      background: `white`,
      position: `relative`,
    }).removeClass('w3-container');

    //  Header styling

    $('header').css({
      height: `150px`,
    });

    $('header img').css({
      width: `100px`,
      position: `absolute`,
      right: `32.5px`,
      top: `32.5px`,
    });

    $('h1').css({
      fontSize: `50px`,
      lineHeight: `140px`,
      margin: `0 0 0 32.5px`,
    });

    //  main section and video styling

    $('main').css({
      background: `#ccc`,
    });

    $('article').css({
      padding: `20px`,
    });

    $('h2').css({
      marginTop: `0`,
    });

    $('p').css({
      lineHeight: `2`,
    });

    $('iframe').css({
      float: `left`,
      margin: `0 20px 20px 0`,
      maxWidth: `100%`,
    });

    //  further info links

    $('.further-info').css({
      clear: `left`,
      padding: `40px 0`,
      background: `#c13832`,
      boxShadow: `inset 0 3px 2px rgba(0,0,0,0.5), inset 0 -3px 2px rgba(0,0,0,0.5)`,
    });

    $('.further-info a').css({
      width: `25%`,
      display: `block`,
      float: `left`,
    });

    $('.further-info img').css({
      maxWidth: `100%`,
    });

    $('.clearfix').css({
      clear: `both`,
    });

    //  Red panda image

    $('.red-panda img').css({
      display: `block`,
      maxWidth: `100%`,
    });
    // #endregion
  }
  // #endregion Multimedia and embedding
  // #region Tables
  else if (text.match(/Basic/)) {
    addStyle('minimal-table.css');
    let tr;

    // #region Dogs Table
    table = createTable('Dogs Table');

    [
      ['&nbsp;', 'Knocky', 'Flor', 'Ella', 'Juan'],
      ['Breed', 'Jack Russell', 'Poodle', 'Streetdog', 'Cocker Spaniel'],
      ['Owner', 'Mother-in-law', 'Me', 'Me', 'Sister-in-law'],
      ['Eating Habits', 'Eats everyone\'s leftovers', 'Nibbles at food', 'Hearty eater', 'Will eat till he explodes'],
    ].forEach((row, index) => {
      tr = createRow();
      addNodes(row[0], (index ? 'th' : 'td'), tr);
      addNodes(row.slice(1, row.length), (index ? 'td' : 'th'), tr);
      if (!index) $('th', tr).attr({scope: 'col'});
    });

    // #endregion

    // #region Animals Table
    table = createTable('Animals Table');

    addNodes('Animals', 'th', createRow()).attr({colspan: 2});
    [
      ['Hippopotamus', 'Horse', 'Mare', 'Crocodile'],
      ['Crocodile', 'Chicken', 'Hen', 'Rooster'],
    ].forEach((row) => {
      addNodes(row[0], 'th', createRow()).attr({colspan: 2});

      tr = createRow();
      addNodes(row[1], 'th', tr).attr({rowspan: 2});
      addNodes(row[2], 'td', tr);

      addNodes(row[3], 'td', createRow());
    });
    // #endregion

    // #region School timetable
    table = createTable('Florence\'s weekly lesson timetable');
    const colgroup = addNodes('', 'colgroup', table);
    $('<col>', {span: 2}).appendTo(colgroup);
    ['background:#97DB9A;', 'width:42px;', 'background:#97DB9A;', 'background:#DCC48E; border:4px solid #C1437A;', 'width:42px;'].forEach((style) => {
      $('<col>', {style: style}).appendTo(colgroup);
    });
    $('col').eq(5).attr({span: 2});

    [
      ['&nbsp;', 'Mon', 'Tues', 'Wed', 'Thurs', 'Fri', 'Sat', 'Sun'],
      ['1st period', 'English', '&nbsp;', '&nbsp;', 'German', 'Dutch', '&nbsp;', '&nbsp;'],
      ['2nd period', 'English', 'English', '&nbsp;', 'German', 'Dutch', '&nbsp;', '&nbsp;'],
      ['3rd period', '&nbsp;', 'German', '&nbsp;', 'German', 'Dutch', '&nbsp;', '&nbsp;'],
      ['4th period', '&nbsp;', 'English', '&nbsp;', 'English', 'Dutch', '&nbsp;', '&nbsp;'],
    ].forEach((row, index) => {
      tr = createRow();
      addNodes(row[0], (index ? 'th' : 'td'), tr);
      addNodes(row.slice(1, row.length), (index ? 'td' : 'th'), tr);
    });
    // #endregion

    $('th:not([scope])').attr({scope: 'row'});
    $('td', $('colgroup').parent()).css({background: 'unset'});
  } else if (text.match(/Advanced/)) {
    addStyle('minimal-table.css');
    let table;
    let thead;
    let tbody;
    let tr;

    // #region Spending Record
    table = createTable('How I chose to spend my money');
    addNodes(['Purchase', 'Location', 'Date', 'Evaluation', 'Cost'], 'th', createRow(addNodes('', 'thead', table)));

    tbody = addNodes('', 'tbody', table);
    [
      ['Haircut', 'Hairdresser', '12/09', 'Great idea', '30'],
      ['Lasagna', 'Restaurant', '12/09', 'Regrets', '18'],
      ['Shoes', 'Shoeshop', '13/09', 'Big regrets', '65'],
      ['Toothpaste', 'Supermarket', '13/09', 'Good', '5'],
    ].forEach((row) => {
      addNodes(row, 'td', createRow(tbody));
    });
    addNodes(['SUM', '118'], 'td', createRow(addNodes('', 'tfoot', table)));
    $('tfoot td').first().attr({colspan: 4});

    // #endregion

    // #region Items Sold August 2016
    table = createTable('Items Sold August 2016');

    // #region thead
    thead = addNodes('', 'thead', table);
    [
      ['&nbsp;', '&nbsp;', 'Clothes', 'Accessories'],
      ['&nbsp;', '&nbsp;', 'Trousers', 'Skirts', 'Dresses', 'Bracelets', 'Rings'],
    ].forEach((row) => {
      tr = createRow(thead).addClass('w3-black');
      addNodes(row.slice(0, 2), 'td', tr);
      addNodes(row.slice(2, row.length), 'th', tr);
    });

    $('th', thead).eq(0).attr({colspan: 3});
    $('th', thead).eq(1).attr({colspan: 2});
    // #endregion

    // #region tbody
    tbody = addNodes('', 'tbody', table);
    [
      ['Antwerp', '56', '22', '43', '72', '23'],
      ['Gent', '46', '18', '50', '61', '15'],
      ['Brussels', '51', '27', '38', '69', '28'],
      ['Amsterdam', '89', '34', '69', '85', '38'],
      ['Utrecht', '80', '12', '43', '36', '19'],
    ].forEach((row) => {
      tr = createRow(tbody);
      addNodes(row[0], 'th', tr);
      addNodes(row.slice(1, row.length), 'td', tr);
    });
    $('<th>', {html: 'Belgium', rowspan: 3}).prependTo($('tr', tbody).eq(0));
    $('<th>', {html: 'The Netherlands', rowspan: 2}).prependTo($('tr', tbody).eq(3));

    // #endregion

    // #region table acessiblity

    // #region id and headers
    /* $('th').each(function () {
      $(this).attr({ id: $(this).text().replace(/ /g, '_').replace(/\W/g,'') });
    });
    $('td').each(function () {
      if (!$(this).text()) return;
      let ids = '';
      $(this).parent().children().index($(this))
      $('th[id]', $(this).parent()).each(function () {ids += `${this.id} ` });
      $(this).attr({ id: ids });
    }); */
    // #endregion

    // #endregion

    // #endregion

    $('tbody').css({
      fontSize: `90%`,
      fontStyle: `italic`,
    });

    $('tfoot').css({
      fontWeight: `bold`,
    });
  } else if (text.match(/Assessment/)) {
    // #region head
    addBase('-start');
    addStyle('minimal-table.css');
    showTitle('Planets data');
    // #endregion

    // The student just needs to include a <table> element in the page, with a <thead> and <tbody> as children.

    // the provided caption needs to be put in a <caption> element, right below the opening <table> tag.
    table = createTable('Data about the planets of our solar system (Planetary facts taken from <a href="http://nssdc.gsfc.nasa.gov/planetary/factsheet/">Nasa\'s Planetary Fact Sheet - Metric</a>.)');

    // #region colgroup

    /**
     * Add a <colgroup> element just below the <caption> element.
     * Inside this, nest two <col> elements, one with a span="2" attribute, and the other with a style attribute along the lines of style="border: 2px solid black".
     */
    const colgroup = addNodes('', 'colgroup', table);
    addNodes(['', '', ''], 'col', colgroup);
    $('col').eq(0).attr({span: 2});
    $('col').eq(1).css({border: '2px solid black'});
    $('col').eq(2).attr({span: 9}); // add to match column number to pass HTML validate

    // #endregion

    // #region thead

    // Put the cells of the row inside a <tr> element and use <th> elements for the cells because they are headers (2 marks).

    // Put the column header text in each cell correctly, copied from the raw data (1 mark).
    addNodes(['Name', 'Mass (10<sup>24</sup>kg)', 'Diameter (km)', 'Density (kg/m<sup>3</sup>)', 'Gravity (m/s<sup>2</sup>)', 'Length of day (hours)', 'Distance from Sun (10<sup>6</sup>km)', 'Mean temperature (&deg;C)', 'Number of moons', 'Notes'], 'th', createRow(addNodes('', 'thead', table)));

    // Leave a two-column gap at the start of the row - this is best done with a single cell with colspan="2" set on it, but we would accept two cells (2 marks).
    $('<td>', {html: '', colspan: 2}).prependTo($('thead tr'));

    // #endregion

    // #region tbody
    // First of all, each row needs to be put inside the <tbody> (1 mark).
    tbody = addNodes('', 'tbody', table);
    [
      ['Mercury', '0.330', '4,879', '5427', '3.7', '4222.6', '57.9', '167', '0', 'Closest to the Sun'],
      ['Venus', '4.87', '12,104', '5243', '8.9', '2802.0', '108.2', '464', '0', ''],
      ['Earth', '5.97', '12,756', '5514', '9.8', '24.0', '149.6', '15', '1', 'Our-world'],
      ['Mars', '0.642', '6,792', '3933', '3.7', '24.7', '227.9', '-65', '2', 'The-red-planet'],
      ['Jupiter', '1898', '142,984', '1326', '23.1', '9.9', '778.6', '-110', '67', 'The largest planet'],
      ['Saturn', '568', '120,536', '687', '9.0', '10.7', '1433.5', '-140', '62', ''],
      ['Uranus', '86.8', '51,118', '1271', '8.7', '17.2', '2872.5', '-195', '27', ''],
      ['Neptune', '102', '49,528', '1638', '11.0', '16.1', '4495.1', '-200', '14', ''],
      ['Pluto', '0.0146', '2,370', '2095', '0.7', '153.3', '5906.4', '-225', '5', 'Declassified as a planet in 2006, but this <a href="http://www.usatoday.com/story/tech/2014/10/02/pluto-planet-solar-system/16578959/">remains controversial</a>.'],
    ].forEach((row) => {
      // Each row needs to contain a <th> element containing the planet name at the start followed by nine <td> elements containing the planet's data (5 marks).
      tr = createRow(tbody);
      addNodes(row[0], 'th', tr);
      addNodes(row.slice(1, row.length), 'td', tr);
    });

    // #region row header
    // The first body row needs to contain an extra <th> element at the start of it, containing "Terrestial planets", with rowspan="4" and colspan="2" (2 marks).
    $('<th>', {html: 'Terrestrial planets', rowspan: 4, colspan: 2}).prependTo($('tr', tbody).eq(0));

    // The seventh body row needs to contain an extra <th> element at the start, containing "Ice giants", with rowspan="2" (2 marks).
    $('<th>', {html: 'Ice giants', rowspan: 2}).prependTo($('tr', tbody).eq(6));

    // The fifth body row needs to contain two extra <th> elements at the start, containing "Jovian planets" and "Gas giants" respectively. The former needs rowspan="4", and the latter needs rowspan="2"
    $('<th>', {html: 'Jovian planets', rowspan: 4}).prependTo($('tr', tbody).eq(4));
    $('<th>', {html: 'Gas giants', rowspan: 2}).prependTo($('tr', tbody).eq(4));

    // The ninth body row needs to contain an extra <th> element at the start, containing "Dwarf planets", with colspan="2" (2 marks).
    $('<th>', {html: 'Dwarf planets', colspan: 2}).prependTo($('tr', tbody).eq(8));
    // #endregion

    // #endregion

    /**
     * col: All the <th> elements in the table header row.
     * row: All the <th> elements containing planet names
     * rowgroup: The <th> elements containing "Terrestial planets", "Jovian planets", "Gas giants", "Ice giants", and "Dwarf planets".
     */
  }
  // #endregion Tables
  // #region Forms
  else if (text.match(/Your first HTML form/)) {
    addNodes('', 'form');

    const labels = [{
      html: 'Name',
      type: 'text',
    }, {
      html: 'E-mail',
      type: 'email',
    }, {
      html: 'Message',
      for: 'msg',
      widget: {type: 'textarea'},
    }];
    addLabels(labels);

    // #region style
    $('form').css({
      //  Just to center the form on the page
      margin: `0 auto`,
      width: `450px`,
      //  To see the outline of the form
      padding: `1em`,
      border: `1px solid #CCC`,
      borderRadius: `1em`,
    });

    $('form div + div').css({
      marginTop: `1em`,
    });

    $('label').css({
      //  To make sure that all labels have the same size and are properly aligned
      display: `inline-block`,
      width: `90px`,
      textAlign: `right`,
    });

    $('input, textarea').css({
      //  To make sure that all text fields have the same font settings By default, textareas have a monospace font
      font: `1em sans-serif`,
      //  To give the same size to all text fields
      width: `300px`,
      boxSizing: `border-box`, //  To harmonize the look & feel of text field border
      border: `1px solid #999`,
    });

    $('input:focus, textarea:focus').css({
      //  To give a little highlight on active elements
      borderColor: `#000`,
    });

    $('textarea').css({
      //  To properly align multiline text fields with their labels
      verticalAlign: `top`,
      //  To give enough room to type some text
      height: `5em`,
    });

    $('.button').css({
      //  To position the buttons to the same position of the text fields
      paddingLeft: `90px`,
      //  same size as the label elements
    });

    $('button').css({
      //  This extra margin represent roughly the same space as the space between the labels and their text fields
      marginLeft: `.5em`,
    });

    addFormStyle({html: 'Send your message', attr: {class: 'button'}});

    // #endregion
  } else if (text.match(/HTML form structure/)) {
    let labels;
    addStyle('payment-form.css');
    $('h1').remove();

    const form = addNodes('', 'form');
    addNodes('Payment form', 'h1', form);
    addNodes('Required fields are followed by <b><abbr title="required">*</abbr></b>.', 'p', form);

    // #region Contact information
    let section = addNodes('', 'section', form);
    addNodes('Contact information', 'h2', section);

    const fieldset = addNodes('', 'fieldset', section);
    addNodes('Title', 'legend', fieldset);
    ['Mister', 'Miss'].forEach((title, i) => {
      const label = createChoiceInput(addNodes('', 'div', fieldset), 'radio', title, `title`);
      $('input', label).attr({id: `title_${i}`, value: i ? 'M.' : 'Ms.'});
    });

    labels = [{
      html: 'Name',
      type: 'text',
      required: true,
    }, {
      html: 'E-mail',
      type: 'email',
      required: true,
    }, {
      html: 'Password',
      type: 'password',
      for: 'pwd',
      required: true,
    }];
    addLabels(labels, section);
    // #endregion

    // #region Payment information
    section = addNodes('', 'section', form);
    addNodes('Payment information', 'h2', section);

    labels = [{
      html: 'Card type',
      widget: {
        type: 'select',
        attr: {
          name: 'usercard',
        },
        options: [
          {html: 'Visa', value: 'visa'},
          {html: 'Mastercard', value: 'mc'},
          {html: 'American Express', value: 'amex'},
        ],
      },
      for: 'card',
    }, {
      html: 'Card number',
      type: 'number',
      required: true,
    }, {
      html: 'Expiration date',
      type: 'date',
      required: true,
    }];
    addLabels(labels, section);
    // #endregion

    // #region style
    addFormStyle({html: 'Validate the payment'});
    $('fieldset label').css({width: 'unset', marginBottom: 'unset'});
    $('fieldset div').removeClass('w3-section');
    $('fieldset').width(mobileFlag ? 150 : 250);
    // #endregion
  } else if (text.match(/Native form widget/)) {
    const form = addNodes('', 'form');
    let labels;

    // #region single line text field

    addNodes('Single line text field examples', 'h2', form);

    labels = [{
      html: 'Enter your username',
      for: 'username',
      value: 'I\'m a text field',
    }, {
      html: 'Enter your email address',
      type: 'email',
    }, {
      html: 'Enter your password',
      type: 'password',
      for: 'pwd',
    }, {
      html: 'Search',
      type: 'search',
    }, {
      html: 'Enter your number',
      type: 'tel',
    }, {
      html: 'Web address',
      type: 'url',
    }];

    addLabels(labels);
    // #endregion

    // #region multi-line text field

    addNodes('Multiple line text field examples', 'h2', form);

    labels = [{
      html: 'Add a comment here',
      for: 'comment',
      widget: {
        type: 'textarea',
        html: 'This is my default content.',
        attr: {
          cols: 30,
          rows: 10,
        },
      },
    }];
    addLabels(labels);

    // #endregion

    // #region drop-down content

    addNodes('Drop down content examples', 'h2', form);

    labels = [{
      html: 'Select box with option groups',
      for: 'groups',
      widget: {
        type: 'select',
        optgroups: [{
          label: 'fruits',
          options: ['Banana', 'Cherry', 'Lemon'],
        }, {
          label: 'vegetables',
          options: ['Carrot', 'Eggplant', 'Potato'],
        }],
      },
    }, {
      html: 'What\'s your favorite fruit?',
      for: 'fruits',
      widget: {
        type: 'datalist',
        id: 'suggestion',
        options: ['Apple', 'Banana', 'Blackberry', 'Blueberry', 'Lemon', 'Lychee', 'Peach', 'Pear'],
      },
    }];
    addLabels(labels);
    $('datalist').removeAttr('name');
    // #endregion

    // #region checkable item
    addNodes('Checkable items examples', 'h2', form);

    const fieldsets = [{
      legend: 'Choose all the vegetables you like to eat',
      widgets: ['Carrots', 'Peas', 'Cabbage', 'Cauliflower', 'Broccoli'],
    }, {
      legend: 'What is your favorite meal?',
      widgets: ['Soup', 'Curry', 'Pizza', 'Tacos', 'Bolognaise'],
    }];

    fieldsets.forEach((fieldset, i) => {
      fieldsetNode = addNodes('', 'fieldset', form);
      addNodes(fieldset.legend, 'legend', fieldsetNode);
      fieldset.widgets.forEach((label) => {
        label = label.toLowerCase();
        labelNode = createChoiceInput(addNodes('', 'div', fieldsetNode), i ? 'radio' : 'checkbox', label, i ? 'meal' : label);
        $('input', labelNode).attr({id: label, value: label});
      });
    });

    // #endregion

    // #region advance examples

    addNodes('Advanced examples', 'h2', form);

    labels = [{
      html: 'What is your age?',
      for: 'age',
      type: 'number',
      min: 1,
      max: 10,
      step: 2,
    }, {
      html: 'How many beans can you eat?',
      for: 'beans',
      type: 'range',
      min: 0,
      max: 500,
      step: 10,
    }, {
      html: 'When are you available this summer?',
      type: 'date',
      min: '2013-06-01',
      max: '2013-08-31',
    }, {
      html: 'When shall we have the meeting?',
      for: 'meet',
      type: 'datetime-local',
    }, {
      html: 'What month is your favorite?',
      type: 'month',
    }, {
      html: 'Set the time for your wifi fridge',
      type: 'time',
    }, {
      html: 'What is your favourite color?',
      type: 'color',
    }];

    addLabels(labels);

    $('<span>', {
      class: 'beancount',
      html: $('#beans').val(),
    }).insertBefore($('#beans').on('input', () => {
      $('.beancount').html($('#beans').val());
    }));

    // #endregion

    // #region other example
    addNodes('Other examples', 'h2', form);
    labels = [{
      html: 'Choose an image to upload',
      type: 'file',
      accept: 'image/*',
      multiple: true,
    }, {
      html: 'Click the image to submit',
      alt: 'map png',
      type: 'image',
      src: 'map.png',
    }, {
      html: 'This is a progress',
      widget: {
        type: 'progress',
        attr: {
          max: 100,
          value: 75,
        },
      },
    }, {
      html: 'This is a prefered meter',
      widget: {
        type: 'meter',
        attr: {
          max: 100,
          min: 0,
          value: 75,
          low: 33,
          high: 66,
          optimum: 99,
        },
      },
    }, {
      html: 'This is a average meter',
      widget: {
        type: 'meter',
        attr: {
          max: 100,
          min: 0,
          value: 50,
          low: 33,
          high: 66,
          optimum: 99,
        },
      },
    }, {
      html: 'This is a worst meter',
      widget: {
        type: 'meter',
        attr: {
          max: 100,
          min: 0,
          value: 25,
          low: 33,
          high: 66,
          optimum: 99,
        },
      },
    }, {
      html: 'There is a hidden input',
      type: 'hidden',
    }];

    addLabels(labels);
    $('progess').html(`${$('progess').attr('value')}/${$('progess').attr('max')}`);
    $('meter').html($('meter').val());
    $(`[type='image']`).addClass('w3-image');
    $(`[for='hidden']`).removeAttr('for');
    // #endregion

    $('h2').addClass('w3-padding-small');
    addFormStyle({html: 'Submit Me!'});
  }
  // #endregion Forms

  // #endregion HTML

  // #region CSS

  // #region Introduction to CSS
  else if (text.match(/How CSS works/)) {
    showTitle('My CSS experiment');
    addNodes('This my first CSS Experiment');
  } else if (text.match(/Cascade and inheritance/)) {
    // important div
    const importantDiv = $('<div>', {id: 'important'}).appendTo(main);
    $('<p>', {
      class: 'better',
      html: 'This is a paragraph.',
    }).appendTo(importantDiv);

    $('<p>', {
      class: 'better', id: 'winning',
      html: 'One selector to rule them all!',
    }).appendTo(importantDiv);

    // weight and live div
    ['weight', 'live'].forEach((id) => {
      const div = $('<div>', {id: id}).appendTo(main);
      const outerDiv = $('<div>', {
        class: 'container', id: 'outer',
      }).appendTo(div);
      const innerDiv = $('<div>', {
        class: 'container', id: 'inner',
      }).appendTo(outerDiv);

      const ul = $('<ul>').appendTo(innerDiv);
      $('<a>', {html: 'One'}).appendTo($('<li>', {class: 'nav'}).appendTo(ul));
      $('<a>', {html: 'Two'}).appendTo($('<li>', {class: 'nav'}).appendTo(ul));
    });
  } else if (text.match(/CSS selectors/)) {
    let div; let ul; let ol;

    // #region element selectors div

    div = $('<div>', {id: 'element-selectors'}).appendTo(main);
    $('h1').remove();
    addNodes('Hello World!', 'h1', div);
    addNodes('This is a paragraph.', 'p', div);
    ul = $('<ul>').appendTo(div);
    addNodes(['This is', 'A list'], 'li', ul);

    // #endregion

    // #region class selectors

    div = $('<div>', {id: 'class-selectors'}).appendTo(main);
    $('<p>', {class: 'base-box warning', html: 'My first paragraph.'}).appendTo(div);
    $('<p>', {class: 'editor-note', html: 'My second paragraph.'}).appendTo(div);
    $('<p>', {class: 'important', html: 'My third paragraph.'}).appendTo(div);

    // #endregion

    // #region id selectors

    div = $('<div>', {id: 'id-selectors'}).appendTo(main);
    $('<p>', {id: 'first', html: '<b>Winner</b>: Velma Victory'}).appendTo(div);
    $('<p>', {id: 'second', html: '<b>2nd</strong>: Colin Contender'}).appendTo(div);
    $('<p>', {id: 'third', html: '<b>3rd</b>: Phoebe Player'}).appendTo(div);

    // #endregion

    // #region attribute selectors

    div = $('<div>', {id: 'attribute-selectors'}).appendTo(main);
    ol = $('<ol>').appendTo(div);

    // set data-* with attr()
    [{'lang': 'en-GB', 'data-perf': 'inc-pro', 'html': 'Manchester United'},
      {'lang': 'es', 'data-perf': 'same-pro', 'html': 'Barcelona'},
      {'lang': 'de', 'data-perf': 'dec', 'html': 'Bayern Munich'},
      {'lang': 'es', 'data-perf': 'same', 'html': 'Real Madrid'},
      {'lang': 'de', 'data-perf': 'inc-rel', 'html': 'Borussia Dortmund'},
      {'lang': 'en-GB', 'data-perf': 'dec-rel', 'html': 'Southampton FC'}].forEach((li) => {
      $('<li>', li).appendTo(ol);
    });

    // #endregion

    // #region pseudo class selectors

    div = $('<div>', {id: 'pseudo-class-selectors'}).appendTo(main);
    ul = $('<ul>').appendTo(div);
    addNodes(['United Kingdom', 'Germany', 'Finland', 'Russia', 'Spain', 'Poland'], 'li', ul);
    $('li', ul).wrapInner($('<a>').attr({href: '#'}));

    // #endregion

    // #region pseudo element selectors

    div = $('<div>', {id: 'pseudo-element-selectors'}).appendTo(main);
    addNodes(['This is my very important paragraph. I am a distinguished gentleman of such renown that my paragraph needs to be styled in a manner befitting my majesty. Bow before my splendour, dear students, and go forth and learn CSS!'], 'p', div);

    // #endregion

    // #region combinators

    div = $('<div>', {id: 'combinators'}).appendTo(main);
    ul = $('<ul>').appendTo(div);
    addNodes(['Home', 'Portfolio', 'About'], 'li', ul);
    $('li', ul).wrapInner($('<a>').attr({href: '#'}));

    addNodes('Welcome to my website', 'h1', div);
    addNodes('Hello, and welcome! I hope you enjoy your time here.', 'p', div);
    addNodes('My philosophy', 'h2', div);
    addNodes('I am a believer in chilling out, and not getting grumpy. I think everyone else should follow this ideal, and <a href="#">drink green tea</a>.', 'p', div);
    // #endregion
  } else if (text.match(/Box model$/)) {
    addNodes('Header', 'header', body);
    addNodes('Main', 'main', body);
    addNodes('Footer', 'footer', body);
  } else if (text.match(/CSS values and units/)) {
    let div;

    // #region length-simple

    div = $('<div>', {id: 'length-simple'}).appendTo(main);
    for (let i = 0; i < 3; i++)
    {
addNodes('This is a paragraph.', 'p', div);
}

    // #endregion

    // #region unitless

    div = $('<div>', {id: 'unitless'}).appendTo(main);
    addNodes('Blue ocean silo royal baby space glocal evergreen relationship housekeeping native advertising diversify ideation session. Soup-to-nuts herding cats resolutionary virtuoso granularity catalyst wow factor loop back brainstorm. Core competency baked in push back silo irrational exuberance circle back roll-up.', 'div', div);

    // #endregion

    // #region animation

    div = $('<div>', {id: 'animation'}).appendTo(main);
    addNodes('Hello', 'p', div);

    // #endregion

    // #region percentage

    div = $('<div>', {id: 'percentage'}).appendTo(main);
    addNodes(['Fixed width layout with pixels', 'Liquid layout with percentages'], 'div', div);

    // #endregion

    // #region color

    div = $('<div>', {id: 'color'}).appendTo(main);
    addNodes(['This paragraph has a red background', 'This paragraph has a blue background', 'This paragraph has a kind of pinky lilac background'], 'p', div);

    // #endregion

    // #region length-playground
    div = $('<div>', {id: 'length-playground'}).appendTo(main);
    const outerDiv = $('<div>', {class: 'outer'}).appendTo(div);
    const innerDiv = $('<div>', {class: 'inner'}).appendTo(outerDiv);
    $('<div>').appendTo(innerDiv);
    // #endregion

    // #region color-playground

    div = $('<div>', {id: 'color-playground'}).appendTo(main);
    $('<div>', {class: 'first'}).appendTo(div);
    $('<div>', {class: 'second'}).appendTo(div);
    $('<div>', {class: 'third'}).appendTo(div);

    // #endregion
  } else if (text.match(/Debugging CSS/)) {
    addBase('-finished');
    addStyle('style.css');

    addNodes('This is my lovely blog', 'h1', addNodes('', 'header'));
    main = addNodes('', 'main');
    addNodes('My article', 'h2');

    $('<img>', {
      src: 'https://mdn.mozillademos.org/files/11947/ff-logo.png',
      alt: 'firefox logo',
    }).appendTo(main);

    addNodes('Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer nec odio. Praesent libero. Sed cursus ante dapibus diam. Sed nisi. Nulla quis sem at nibh elementum imperdiet. Duis sagittis ipsum. Praesent mauris. Fusce nec tellus sed augue semper porta. Mauris massa. Vestibulum lacinia arcu eget nulla.', 'p');

    const ul = addNodes('', 'ul');
    addNodes(['Lorem ipsum dolor sit amet, consectetur adipiscing elit.', 'Integer nec odio. Praesent libero.', 'Sed cursus ante dapibus diam.'], 'li', ul);
    addNodes('Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Curabitur sodales ligula in libero. Sed dignissim lacinia nunc. Curabitur tortor. Pellentesque nibh. Aenean quam. In scelerisque sem at dolor.', 'p');

    addNodes('&copy;1978 Chris\' brain', 'p', addNodes('', 'footer'));

    if (mobileFlag) $('body').width('unset');
  } else if (text.match(/Fundamental CSS comprehension/)) {
    /*
    "create a new file in the same directory as your HTML and image files"(1 mark)
      The first task - creating your CSS file - is only worth one mark.It is pretty easy, although you won't be able to do much without getting this right.

    "Link your CSS to your HTML file via a <link> element"(2 marks)
      Slightly more challenging, but again pretty easy.

    "copy and paste them into the top of your new CSS file. Use them as a test to make sure your CSS is properly applied to your HTML."(1 mark)
      This is just copy and paste, so not really worth much.
    */
    const section = $('<section>', {class: 'card'}).appendTo(body);
    addNodes('Chris Mills', 'h2', $('<header>').appendTo(section));

    article = addNodes('', 'article', section);

    $('<img>', {
      src: 'chris.jpg',
      alt: 'A picture of Chris - a man with glasses, a beard, and a silly wooly hat',
    }).appendTo(article);

    addNodes('50 My Street</br>he Town<br> Gray Peach<br>UK<br>ZO50 1MU<br><b>Tel</b>: 01234 567 890<br><b>Mail</b>: chris@nothere.com', 'p', article);

    addNodes('Editing, writing, and web development services', 'p', $('<footer>').appendTo(section));

    // #region style

    /*
    "Above the two rules, add a CSS comment with some text inside it to indicate that this is a set of general styles for the overall page. "General page styles" would do. Also add three more comments..."(2 marks)
    Good commenting is important.You should award 0.5 marks for each of the four comments, as long as they are written in a sensible place with meaningful text.  */

    //  General styles - put these straight into your stylesheet

    $('body').css({
      margin: 0,
    });

    $('html').css({
      fontFamily: `'Helvetica neue', Arial, 'sans serif'`,
      fontSize: 10,
      backgroundColor: `lightgray`,
    });

    //  Rulesets to be matched up with selectors

    /*
    "look at the four selectors, and calculate the specificity for each one." (2 marks)
    The correct specificity for each one is as follows (half a mark each):
    0012
    0011
    0011
    0010

    "Now it's time to put the right selector on the right rule set!" (4 marks)
    The correct pairing are as follows (1 mark for each):

    "Beware! There are two errors in the provided rulesets." (2 marks)
    The errors are as follows (one mark for fixing each one):
    */

    /**
     * "You'll get bonus marks if you write your CSS for maximum readability, with a separate declaration on each line." (2 marks)
    If the CSS is arranged in a readable manner, with a separate declaration on each line (or similar), then they get the marks. If not, then they don't.

    "You should include .card at the start of the selector chain in all your rules, so that these rules wouldn't interfere with the styling of any other elements if the business card were to be put on a page with a load of other content." (1 mark)
    A nice little addition to include in the assessment for promoting the idea of "compartmentalisation", or "namespacing" of CSS so different sets of rules don't interfere with one another. Not that important in this particular context, but it would be nice for the student to include.
     */
    // .card goes with the first ruleset.
    $('.card').css({
      width: `35em`,
      height: `22em`,
      margin: `5em auto`,
      backgroundColor: `red`,
      border: `0.2em solid black`,
      borderRadius: `1.5em`,
    });

    // .card header goes with the second ruleset.
    $('.card header').css({
      backgroundImage: `linear-gradient(to bottom, rgba(0, 0, 0, 0.1), rgba(0, 0, 0, 0))`,
      borderRadius: `1.5em 1.5em 0 0`,
    });

    // .card footer goes with the third ruleset.
    $('.card footer').css({
      backgroundImage: `linear-gradient(to bottom, rgba(0, 0, 0, 0), rgba(0, 0, 0, 0.1))`,
      borderRadius: `0 0 1.5em 1.5em`,
    });

    /**
     * "Write a ruleset that targets both the card header, and card footer..." (3 marks)
    The correct rule should look something like this. Since the default font size as set on the <html> element is 10px, 1em is 10px, so the height (30px) should be represented by 3em, and the padding by 1em. 10 + 30 + 10 = 50.
     */
    $('.card header, .card footer').css({
      height: `3em`,
      padding: `1em`,
    });

    /**
     * "To stop the image from spilling out of the main business card content (the <article> element), we need to give it a specific height." (3 marks)
    The correct rule should look something like this. The height needs to be 12ems (as 12 x the base size of 10px = 120px), and the color needs to be RGBA - black expressed in RGB (0,0,0) with an alpha channel value of about 0.1-0.3.
     */
    // .card article img goes with the fourth ruleset.
    $('article').css({
      height: `12em`,
      fontSize: `1.2em`,
      backgroundColor: `rgba(0, 0, 0, .25)`, // background-colour in the first ruleset: colour > color.
    });

    /**
     * "The default margin applied to the <h2> and <p> elements by the browser will interfere with our design" (3 marks)
    The correct rule should look something like this. Simply setting the margin to 0 on all paragraphs and the <h2> should be fine.
     */
    $('p, h2').css({
      margin: 0,
    });

    /**
     * "Write a ruleset that gives the <h2> an effective font size of 20px (but expressed in ems) and an appropriate line height to place it in the center of the header's content box..." (3 marks)
    The correct rule should look something like this. The height needs to be 2ems (2 x 10 = 20), and the line height would be expressed best as 1.5 (1.5 x 20px = 30px, the height of the header content.) Setting line height to 30px would also be ok.
     */
    $('h2').css({
      fontSize: `2em`,
      lineHeight: 1.5,
    });

    /**
     * "Write a ruleset that gives the <p> an effective font size of 15px (but expressed in ems) and an appropriate line height to place it in the center of the header's content box..." (3 marks)
    The correct rule should look something like this. The height needs to be 1.5ems (1.5 x 10 = 15), and the line height would be expressed best as 2 (2 x 15px = 30px, the height of the header content.) Setting line height to 30px would also be ok.
     */
    $('footer p').css({
      fontSize: `1.5em`,
      lineHeight: 2,
    });

    $('article img').css({
      maxHeight: `100%`, // max-height: 100% in the fourth rule needs a semi-colon at the end of it.
      float: `right`,
    });

    /**
     * "As a last little touch, give the paragraph inside the <article> an appropriate padding value so that its left edge lines up with the <h2> and footer paragraph, and set its color to be fairly light so it is easy to read." (3 marks)
    The correct rule should look something like this. The padding needs to be 1em, and the color needs to be set to some kind of lighter color that will show up well against the darker background we set earlier. Pure white would be ok, or something similar.
     */
    $('article p').css({
      color: `rgba(255, 255, 255, .8)`,
      padding: `1em`,
    });

    // #endregion
  }
  // #endregion Introduction to CSS

  // #region Styling boxes
  else if (text.match(/Box model recap/)) {
    // #region Box sizing example
    addStyle('box-sizing-example.css');
    addNodes('Box sizing example', 'h2');

    const one = $('<div>', {class: 'one'}).appendTo(main);
    const two = $('<div>', {class: 'two'}).appendTo(main);

    function outputWH(box) {
      box.text(`Width: ${box.width()}px, Height: ${box.height()}px.`);
    }

    $(`[href='box-sizing-example.css']`).on('load', () => {
      outputWH(one);
      outputWH(two);
    });
    // #endregion

    // #region CSS tables example

    addNodes('CSS tables example', 'h2');
    const form = $('<form>').appendTo(main).css({
      display: `table`,
      margin: `0 auto`,
    });
    addNodes('First of all, tell us your name and age.', 'p', form);
    labels = [{
      html: 'First name',
      for: 'fname',
    }, {
      html: 'Last name',
      for: 'lname',
    }, {
      html: 'Age',
      for: 'age',
    }];
    addLabels(labels, form);

    // #region style

    $('form div').css({
      display: `table-row`,
    });

    $('form label, form input').css({
      display: `table-cell`,
      marginBottom: `10px`,
    });

    $('form label').css({
      width: `200px`,
      paddingRight: `5%`,
      textAlign: `right`,
    });

    $('form input').css({
      width: `300px`,
    });

    $('form p').css({
      display: `table-caption`,
      captionSide: `bottom`,
      width: `300px`,
      color: `#999`,
      fontStyle: `italic`,
    });
    // #endregion

    // #endregion

    // #region Flexbox example

    // #region body
    addNodes('Flexbox example', 'h2');

    section = $('<section>').appendTo(main).css({
      width: `70%`,
      height: `300px`,
      margin: `20px auto`,
      background: `purple`,
      display: `flex`,
    });

    for (let i = 0; i < 3; i++) {
      addNodes('This is a box.', 'div', section);
    }

    function createBox() {
      $('<div>').appendTo(section).text('This is a box');
      updateStyle();
    }

    $('<button>', {
      class: 'create',
      html: 'Create box',
    }).appendTo(main).click(createBox);

    $('<button>', {
      class: 'reset',
      html: 'Reset demo',
    }).appendTo(main).click(() => {
      section.html('');
      for (let i = 0; i < 3; i++) {
        createBox();
      }
    });

    // #endregion

    // #region style

    function updateStyle() {
      $('section>div').css({
        color: `white`,
        background: `orange`,
        flex: `1`,
        marginRight: `10px`,
        textShadow: `1px 1px 1px black`,
      });

      $('div:last-child').css({
        marginRight: `0`,
      });

      $('section, div').css({
        border: `5px solid rgba(0,0,0,0.85)`,
        padding: `10px`,
      });
    }

    updateStyle();
    // #endregion

    // #endregion

    // #region Max width image example

    addStyle('min-max-image-container.css');
    addNodes('Max width image example', 'h2');
    addNodes(['Tacos actually microdosing, pour-over semiotics banjo chicharrones retro fanny pack portland everyday carry vinyl typewriter. Tacos PBR&B pork belly, everyday carry ennui pickled sriracha normcore hashtag polaroid single-origin coffee cold-pressed. PBR&B tattooed trust fund twee, leggings salvia iPhone photo booth health goth gastropub hammock.', 'Cray food truck brunch, XOXO +1 keffiyeh pickled chambray waistcoat ennui. Organic small batch paleo 8-bit. Intelligentsia umami wayfarers pickled, asymmetrical kombucha letterpress kitsch leggings cold-pressed squid chartreuse put a bird on it. Listicle pickled man bun cornhole heirloom art party.']);

    $('<img>', {
      src: 'teddy-bear.jpg',
      alt: 'A teddy bear in a box',
    }).insertBefore($('p').last());
    // #endregion
  } else if (text.match(/Backgrounds/)) {
    addNodes('Backgrounds example', 'h2');
    addNodes('Exciting box!').css({
      fontFamily: `sans-serif`,
      padding: `20px`,
      //  background properties
      color: 'black',
      background: 'url(fire-ball-icon.png) no-repeat 99% center, \
                  linear-gradient(to bottom, yellow, gold 50%, orange)',
    });

    addNodes('Repeating background example', 'h2');
    addNodes('A single instance of the image looks like this: <img src="tile.png" alt="a background tile">. If we use it as a repeating background image along with a solid background color, it could look like this:').css({
      fontFamily: `sans-serif`,
      textAlign: `center`,
    });

    addNodes('', 'div').css({
      width: `100%`,
      height: `400px`,
      //  background properties
      backgroundColor: `red`,
      backgroundImage: `url(tile.png)`,
    });

    addNodes('Background attachment example', 'h2');
    addStyle('background-attachment.css');
    const section = addNodes('', 'section');
    [
      '<code>background-attachment: scroll</code> causes the element\'s background to be fixed to the page, so that it scrolls when the page is scrolled. If the element content is scrolled, the background does not move.',
      '<code>background-attachment: fixed</code> causes an element\'s background to be fixed to the viewport, so that it doesn\'t scroll when the page or element content is scrolled. It will always remain in the same position on the screen.',
      '<code>background-attachment: local</code>, new to CSS3, causes an element\'s background to be fixed to the actual element itself. So When the page is scrolled, the element\'s background will move along with it only if the element does so (so not in the case of elements with <code>position: fixed</code>.) When the element\'s content is scrolled, the background will scroll along with it.',
    ].forEach((para) => {
      const article = $('<article>', {class: para.match(/\w+(?=<)/)[0]}).appendTo(section);
      addNodes(para, 'p', article);
      $('<pre>').appendTo(section);
    });

    $(':header').addClass('my-margin');
    $('body').css({margin: `0`});
    $('code').css({color: 'black'});
  } else if (text.match(/Borders/)) {
    addNodes('Border image', 'h2');
    addNodes('Border image', 'p', addNodes('', 'div').css({
      width: `300px`,
      padding: `20px`,
      margin: `10px auto`,
      lineHeight: `3`,
      background: `padding-box salmon`,
      textAlign: `center`,
      //  border-related properties
      border: `20px solid black`,
      borderImage: `url(border-image.png) 40 / / 5px round`,
    }));

    addNodes('Writing progress', 'h2');

    [
      {class: 'complete', para: 'Chapter 1: I was born'},
      {class: 'complete', para: 'Chapter 2: School'},
      {class: 'written review', para: 'Chapter 3: University'},
      {class: 'written', para: 'Chapter 4: Rock and roll'},
      {class: 'incomplete writing', para: 'Chapter 5: Fell in love'},
      {class: 'incomplete', para: 'Chapter 6: Children'},
      {class: 'incomplete', para: 'Chapter 7: Tired!'},
      {class: 'round', para: 'Chapter 8: Rounded!'},
    ].forEach((node) => {
      addNodes(node.para, 'p', $('<div>', {class: node.class}).appendTo(main));
    });

    $('div[class]').css({
      width: `220px`,
      padding: `20px`,
      margin: `10px`,
      lineHeight: `2`,
      backgroundColor: `yellow`,
      textAlign: `center`,
      display: `inline-block`,
    });

    $('.complete').css({
      borderStyle: `solid`,
    });

    $('.written').css({
      borderStyle: `dashed`,
    });

    $('.incomplete').css({
      borderStyle: `dotted`,
    });

    $('.writing, .review').css({
      borderBottom: `6px solid red`,
    });

    $('.round').css({
      borderStyle: `dashed`,
      borderRadius: `20px`,
    });
  } else if (text.match(/Advanced box effects/)) {
  } else if (text.match(/Styling tables/)) {
    table = addNodes('', 'table');
    addNodes('A summary of the UK\'s most famous punk bands', 'caption', table);

    const thead = addNodes('', 'thead', table);
    const tbody = addNodes('', 'tbody', table);
    const tfoot = addNodes('', 'tfoot', table);

    addNodes(['Band', 'Year formed', 'No. of Albums', 'Most famous song'], 'th', addNodes('', 'tr', thead));

    [
      ['Buzzcocks', '1976', '9', 'Ever fallen in love (with someone you shouldn\'t)'],
      ['The Clash', '1976', '6', 'London Calling'],
      ['The Damned', '1976', '10', 'Smash it up'],
      ['Sex Pistols', '1975', '1', 'Anarchy in the UK'],
      ['Sham 69', '1976', '13', 'If The Kids Are United'],
      ['Siouxsie and the Banshees', '1976', '11', 'Hong Kong Garden'],
      ['Stiff Little Fingers', '1977', '10', 'Suspect Device'],
      ['The Stranglers', '1974', '17', 'No More Heroes'],
    ].forEach((row) => {
      tr = createRow();
      addNodes(row[0], 'th', tr);
      addNodes(row.slice(1, row.length), 'td', tr);
    });

    tr = addNodes('', 'tr', tfoot);
    ['Total albums', '77'].forEach((cell, index) => {
      $(`<${index ? 'td' : 'th'}>`, {
        html: cell,
        colspan: 2,
      }).appendTo(tr);
    });

    // #region style
    $('th').css({
      backgroundColor: `unset`,
    });

    $('tbody th').css({
      color: `black`,
    });
    // #endregion
  } else if (text.match(/Letterheaded paper/)) {
  } else if (text.match(/Cool information box/)) {
  }
  // #endregion Styling boxes

  // #region Styling text

  else if (text.match(/Fundamentals/)) {
    $('html').css({
      fontSize: `10px`,
    });

    addNodes('Tommy the cat', 'h1').css({
      fontSize: `3rem`,
      textTransform: `capitalize`,
      textShadow: `-1px -1px 1px #aaa,
                  0px 2px 1px rgba(0, 0, 0, 0.5),
                  2px 2px 2px rgba(0, 0, 0, 0.7),
                  0px 0px 3px rgba(0, 0, 0, 0.4)`,
      textAlign: `center`,
    });
    addNodes(['I remember as if it were a meal ago...', 'Said Tommy the Cat as he reeled back to clear whatever foreign matter may have nestled its way into his mighty throat. Many a fat alley rat had met its demise while staring point blank down the cavernous barrel of this awesome prowling machine. Truly a wonder of nature this urban predator - Tommy the cat had many a story to tell. But it was a rare occasion such as this that he did.']);

    $('p').css({
      fontSize: `1.4rem`,
      color: `red`,
      fontFamily: `Helvetica, Arial, sans-serif`,
      lineHeight: `1.5`,
    });

    $('h1 + p').css({
      fontWeight: `bold`,
    });

    $('p::first-line').css({
      letterSpacing: `2px`,
      wordSpacing: `4px`,
    });
  } else if (text.match(/Styling lists/)) {
    addNodes('Shopping (unordered) list', 'h2');
    addNodes(['Humous', 'Pitta', 'Green salad', 'Halloumi'], 'li', addNodes('', 'ul'));

    addNodes('Recipe (ordered) list', 'h2');
    addNodes(['Toast pitta, leave to cool, then slice down the edge.', 'Fry the halloumi in a shallow, non-stick pan, until browned on both sides.', 'Wash and chop the salad.', 'Fill pitta with salad, humous, and fried halloumi.'], 'li', $('<ol>', {start: '4'}).appendTo(main));

    addNodes('Ingredient description list', 'h2');
    addNodes('<dt>Humous</dt><dd>A thick dip/sauce generally made from chick peas blended with tahini, lemon juice, salt, garlic, and other ingredients.</dd><dt>Pitta</dt><dd>A soft, slightly leavened flatbread.</dd><dt>Halloumi</dt><dd>A semi-hard, unripened, brined cheese with a higher-than-usual melting point, usually made from goat/sheep milk.</dd><dt>Green salad</dt><dd>That green healthy stuff that many of us just use to garnish kebabs.</dd>', 'dl');

    // #region style

    //  General styles

    $('html').css({
      fontFamily: `Helvetica, Arial, sans-serif`,
      fontSize: `10px`,
    });

    $('h2').css({
      fontSize: `2rem`,
    });

    $('ul,ol,dl,p').css({
      fontSize: `1.5rem`,
    });

    $('li, p').css({
      lineHeight: `1.5`,
    });

    //  Unordered list styles

    $('ul').css({
      paddingLeft: `2rem`,
      listStyleType: `none`,
    });

    $('ul li').css({
      paddingLeft: `2rem`,
      backgroundImage: `url(star.svg)`,
      backgroundPosition: `0 0`,
      backgroundSize: `1.6rem 1.6rem`,
      backgroundRepeat: `no-repeat`,
    });

    //  Ordered list styles

    $('ol').css({
      paddingLeft: `3rem`,
      listStyleType: `upper-roman`,
    });

    //  Description list styles

    $('dd, dt').css({
      lineHeight: `1.5`,
    });

    $('dt').css({
      fontWeight: `bold`,
    });

    // #endregion
  } else if (text.match(/Styling links/)) {
    addNodes('There are several browsers available, such as <a href="https://www.mozilla.org/en-US/firefox/">Mozilla Firefox</a>, <a href="https://www.google.com/chrome/index.html">Google Chrome</a>, and <a href="https://www.microsoft.com/en-us/windows/microsoft-edge">Microsoft Edge</a>.');

    const ul = addNodes('', 'ul');
    ['Home', 'Pizza', 'Music', 'Wombats', 'Finland'].forEach((html) => {
      addNodes(html, 'a', addNodes('', 'li', ul));
    });

    // #region style
    $('body').css({
      width: `400px`,
      margin: `0 auto`,
      fontFamily: `sans-serif`,
    });

    $('li').css({
      display: `inline`,
      padding: 0,
    });

    $('li a').css({
      padding: `1em`,
      color: `black`,
    });

    const style = `p a:link {
      color: DarkOliveGreen;
    }

    p a:visited {
      color: DarkGreen;
    }

    p a:focus {
      border-bottom: 1px solid;
      background: LightGreen;
    }

    p a:hover {
      border-bottom: 1px solid;     
      background: PaleGreen;
    }

    p a:active {
      background: DarkOliveGreen;
      color: PaleGreen;
    }
    li a:link,
    li a:visited,
    li a:focus {
      background: yellow;
    }

    li a:hover {
      background: orange;
    }

    li a:active {
      background: red;
      color: white;
    }
    `;

    $('<style>', {html: style}).appendTo(head);

    // #endregion
  } else if (text.match(/Web fonts/)) {
    addStyle('https://fonts.googleapis.com/css?family=Lobster|Raleway');
    addStyle('google-font.css');

    addNodes('Hipster ipsum is the best', 'h1');
    addNodes(['Tacos actually microdosing, pour-over semiotics banjo chicharrones retro fanny pack portland everyday carry vinyl typewriter. Tacos PBR&amp;B pork belly, everyday carry ennui pickled sriracha normcore hashtag polaroid single-origin coffee cold-pressed. PBR&amp;B tattooed trust fund twee, leggings salvia iPhone photo booth health goth gastropub hammock.', 'Cray food truck brunch, XOXO +1 keffiyeh pickled chambray waistcoat ennui. Organic small batch paleo 8-bit. Intelligentsia umami wayfarers pickled, asymmetrical kombucha letterpress kitsch leggings cold-pressed squid chartreuse put a bird on it. Listicle pickled man bun cornhole heirloom art party.']);

    addNodes('It is the quaintest', 'h2');
    addNodes('Bespoke green juice aesthetic leggings DIY williamsburg selvage. Bespoke health goth tote bag, fingerstache venmo ennui thundercats butcher trust fund cardigan hella. Wolf vinyl you probably haven\t heard of them taxidermy, ugh quinoa neutra meditation asymmetrical mixtape church-key kitsch man bun occupy. Knausgaard butcher raw denim ramps, offal seitan williamsburg venmo gastropub mlkshk cardigan chillwave chartreuse single-origin coffee twee. Ethical asymmetrical banjo typewriter fap. Polaroid waistcoat tousled selfies four dollar toast locavore thundercats. Truffaut post-ironic skateboard trust fund.');

    addNodes('No, really...', 'h2');
    addNodes(['Trust fund celiac farm-to-table PBR&amp;B. Brunch art party mumblecore, fingerstache cred echo park literally stumptown humblebrag chambray. Mlkshk vinyl distillery humblebrag crucifix. Mustache craft beer put a bird on it, irony deep v poutine ramps williamsburg heirloom brooklyn.', 'Taxidermy tofu YOLO, sustainable etsy flexitarian art party stumptown portland. Ethical williamsburg retro paleo. Put a bird on it leggings yuccie actually, skateboard jean shorts paleo lomo salvia plaid you probably haven\'t heard of them.']);
  } else if (text.match(/Typesetting a homepage/)) {
    let ul;
    $('h1').remove();

    const header = addNodes('', 'header');
    addNodes('St Huxley\'s Community College', 'h1', header);

    const main = addNodes('', 'main');

    // #region section
    const section = addNodes('', 'section', main);

    addNodes('Brave new world', 'h2', section);

    addNodes(['It\'s a brave new world out there. Our children are being put in increasing more competitive situations, both during recreation, and as they start to move into the adult world of <a href="https://en.wikipedia.org/wiki/Examination">examinations</a>, <a href="https://en.wikipedia.org/wiki/Jobs">jobs</a>, <a href="https://en.wikipedia.org/wiki/Career">careers</a>, and other life choices. Having the wrong mindset, becoming <a href="https://en.wikipedia.org/wiki/Emotion">too emotional</a>, or making the wrong choices can contribute to them experiencing difficulty in taking their rightful place in today\'s ideal society.', 'As concerned parents, guardians or carers, you will no doubt want to give your children the best possible start in life - and you\'ve come to the right place.'], 'p', section);

    addNodes('The best start in life', 'h2', section);
    addNodes('At St. Huxley\'s, we pride ourselves in not only giving our students a top quality education, but also giving them the societal and emotional intelligence they need to win big in the coming utopia. We not only excel at subjects such as genetics, data mining, and chemistry, but we also include compulsory lessons in:', 'p', section);

    // #region ul
    ul = addNodes('', 'ul', section);
    ['Emotional control', 'Judgement', 'Assertion', 'Focus and resolve'].forEach((li) => {
      addNodes(li, 'li', ul);
    });

    addNodes('If you are interested, then you next steps will likely be to:', 'p', section);
    const ol = addNodes('', 'ol', section);
    ['<a href="#">Call us</a> for more information',
      '<a href="#">Ask for a brochure</a>, which includes signup form',
      '<a href="#">Book a visit</a>!'].forEach((li) => {
      addNodes(li, 'li', ol);
    });
    // #endregion section

    // #endregion section

    // #region article

    const aside = addNodes('', 'aside', main);
    addNodes('Top course choices', 'h2', aside);
    ul = addNodes('', 'ul', aside);
    ['Genetic engineering', 'Genetic mutation', 'Organic Chemistry',
      'Pharmaceuticals', 'Biochemistry with behaviour', 'Pure biochemistry',
      'Data mining', 'Computer security', 'Bioinformatics', 'Cybernetics'].forEach((a) => {
      addNodes(a, 'a', addNodes('', 'li', ul));
    });
    addNodes('See more', 'a', addNodes('', 'p', aside));

    // #endregion article

    // #region nav
    const nav = addNodes('', 'nav');
    ul = addNodes('', 'ul', nav);
    ['Home', 'Finding us', 'Courses', 'Staff', 'Media', 'Prospectus'].forEach((a) => {
      addNodes(a, 'a', addNodes('', 'li', ul));
    });

    // #endregion nav

    // #region footer
    const footer = addNodes('', 'footer');
    addNodes('&copy; 2016 St Huxley\'s Community College', 'p', footer);

    // #endregion footer

    // #region style
    //  General setup

    $('*').css({
      boxSizing: `border-box`,
    });

    $('body').css({
      margin: `0 auto`,
      minWidth: `1000px`,
      maxWidth: `1400px`,
    });

    //  Layout

    $('section').css({
      float: `left`,
      width: `50%`,
    });

    $('aside').css({
      float: `left`,
      width: `30%`,
    });

    $('nav').css({
      float: `left`,
      width: `20%`,
    });

    $('footer').css({
      clear: `both`,
    });

    $('header, section, aside, nav, footer').css({
      padding: `20px`,
    });

    //  header and footer

    $('header, footer').css({
      borderTop: `5px solid #a66`,
      borderBottom: `5px solid #a66`,
    });

    //  WRITE YOUR CODE BELOW HERE

    //  font imports

    /*

    Lovato light font obtained from fontspring.com,
    originally created by Philatype
    See https://www.fontspring.com/fonts/philatype/lovato

    Josefin slab bold obtained from fontsquirrel.com,
    originally created by Typemade
    See https://www.fontsquirrel.com/fonts/josefin-slab

    */

    $('@font-face').css({
      fontFamily: `'lovatolight'`,
      src: `url('fonts/Lovato-Light-webfont.eot')`,
      src: `url('fonts/Lovato-Light-webfont.eot?#iefix') format('embedded-opentype'),
      url('fonts/Lovato-Light-webfont.woff2') format('woff2'),
      url('fonts/Lovato-Light-webfont.woff') format('woff'),
      url('fonts/Lovato-Light-webfont.ttf') format('truetype'),
      url('fonts/Lovato-Light-webfont.svg#lovatolight') format('svg')`,
      fontWeight: `normal`,
      fontStyle: `normal`,
    });

    $('@font-face').css({
      fontFamily: `'josefin_slabbold'`,
      src: `url('fonts/josefinslab-bold-webfont.eot')`,
      src: `url('fonts/josefinslab-bold-webfont.eot?#iefix') format('embedded-opentype'),
      url('fonts/josefinslab-bold-webfont.woff2') format('woff2'),
      url('fonts/josefinslab-bold-webfont.woff') format('woff'),
      url('fonts/josefinslab-bold-webfont.ttf') format('truetype'),
      url('fonts/josefinslab-bold-webfont.svg#josefin_slabbold') format('svg')`,
      fontWeight: `normal`,
      fontStyle: `normal`,
    });

    //  typography stuff

    $('html').css({
      fontFamily: `lovatolight, serif`,
      fontSize: `10px`,
    });

    $('h1, h2').css({
      fontFamily: `josefin_slabbold, sans-serif`,
      letterSpacing: `2px`,
    });

    $('h1').css({
      fontSize: `5rem`,
      textAlign: `center`,
    });

    $('h2').css({
      fontSize: `3.2rem`,
    });

    $('section h2 + p').css({
      textIndent: `20px`,
    });

    $('p, li').css({
      fontSize: `1.6rem`,
      lineHeight: `1.5`,
      letterSpacing: `0.5px`,
      wordSpacing: `3px`,
    });

    //  Link styling

    $('a').css({
      outline: `none`,
    });

    $('a[href*="http"]').css({
      paddingRight: `19px`,
      background: `url(external-link-52.png) no-repeat 100% 0`,
      backgroundSize: `16px 16px`,
    });

    $('a:link, a:visited').css({
      color: `#a66`,
    });

    $('a:focus, a:hover').css({
      textDecoration: `none`,
    });

    $('a:active').css({
      color: `transparent`,
      textShadow: `0px 0px 1px #f00,
      0px 0px 2px #f00,
      0px 0px 3px black,
      0px 0px 4px black`,
    });

    /* lists: extra margin top and bottom to make it
    always have the same spacing as with paragraphs */

    $('ul, ol').css({
      margin: `1.6rem 0`,
    });

    $('ul').css({
      listStyleType: `square`,
    });

    $('ol').css({
      listStyleType: `lower-latin`,
    });

    //  nav menu

    $('nav ul').css({
      paddingLeft: `0`,
      marginTop: `0.8rem`,
    });

    $('nav li').css({
      listStyleType: `none`,
      marginBottom: `2rem`,
    });

    $('nav li a').css({
      textDecoration: `none`,
      display: `inline-block`,
      width: `100%`,
      lineHeight: `3`,
      textAlign: `center`,
      fontSize: `2.5rem`,
      border: `1px solid #a66`,
    });

    $('nav li a:focus, nav li a:hover').css({
      color: `white`,
      background: `#a66`,
    });

    $('nav li a:active').css({
      color: `white`,
      background: `black`,
    });

    // #endregion style
  }

  // #endregion Styling text

  // #region CSS layout
  else if (text.match(/Flexbox/)) {
    const header = addNodes('', 'header').css({
      background: `purple`,
      height: `100px`,
    });
    addNodes('Complex flexbox example', 'h1', header).css({
      textAlign: `center`,
      color: `white`,
      lineHeight: `100px`,
      margin: `0`,
    });
    const main = addNodes('', 'main');
    const section = addNodes('', 'section', main).css({
      display: `flex`,
    });

    ['First', 'Second', ''].forEach((heading) => {
      const article = addNodes('', 'article', section);
      if (heading) addNodes(`${heading} article`, 'h2', article);
      else {
        addNodes(['Smile', 'Laugh', 'Wink', 'Shrug', 'Blush'], 'button', addNodes('', 'div', article));
        addNodes('', 'div', article);
      }
      addNodes('Tacos actually microdosing, pour-over semiotics banjo chicharrones retro fanny pack portland everyday carry vinyl typewriter. Tacos PBR&B pork belly, everyday carry ennui pickled sriracha normcore hashtag polaroid single-origin coffee cold-pressed. PBR&B tattooed trust fund twee, leggings salvia iPhone photo booth health goth gastropub hammock.', 'p', article);

      if (!heading)
      {
addNodes('Cray food truck brunch, XOXO +1 keffiyeh pickled chambray waistcoat ennui. Organic small batch paleo 8-bit. Intelligentsia umami wayfarers pickled, asymmetrical kombucha letterpress kitsch leggings cold-pressed squid chartreuse put a bird on it. Listicle pickled man bun cornhole heirloom art party.', 'p', article);
}
    });

    // #region style
    $('body').css({
      margin: `0`,
    });

    $('article').css({
      padding: `10px`,
      margin: `10px`,
      background: `aqua`,
    });

    //  Add your flexbox CSS below here

    $('article').css({
      flex: `1 200px`,
    });

    $('article:nth-of-type(3)').css({
      flex: `3 200px`,
    });

    $('article:nth-of-type(3) div:first-child').css({
      display: `flex`,
      flexFlow: `row wrap`,
      alignItems: `center`,
      justifyContent: `space-around`,
    });

    $('button').css({
      flex: `1 auto`,
      margin: `5px`,
      fontSize: `18px`,
      lineHeight: `1.5`,
    });

    $('button:first-child').css({
      order: `1`,
    });

    $('button:last-child').css({
      order: `-1`,
    });
    // #endregion
  } else if (text.match(/Grids/)) {
    let container;
    addNodes('Simple grid example', 'h2');
    container = $('<div>', {
      class: 'grid',
    }).appendTo(main).css({
      display: `grid`,
      gridTemplateColumns: `repeat(auto-fill, minmax(200px, 1fr))`,
      gridAutoRows: `minmax(100px, auto)`,
      gridGap: `20px`,
    });

    ['One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven'].forEach((html) => {
      addNodes(html, 'div', container);
    });

    $('body').css({
      width: `90%`,
      maxWidth: `900px`,
      margin: `2em auto`,
      font: `.9em/1.2 Arial, Helvetica, sans-serif`,
    });

    $('.grid > div').css({
      borderRadius: `5px`,
      padding: `10px`,
      background: `PowderBlue`,
      border: `2px solid MediumTurquoise`,
    });

    container = $('<div>', {
      class: 'container',
    }).appendTo(main).css({
      marginTop: '2em',
      display: `grid`,
      gridTemplateColumns: `repeat(12, minmax(0,1fr))`,
      gridGap: `20px`,
    });

    addNodes('This is my lovely blog', 'header', container).css({
      gridColumn: `1 / 13`,
      gridRow: `1`,
    });

    const article = addNodes('', 'article', container).css({
      gridColumn: `4 / 13`,
      gridRow: `2`,
    });
    addNodes('My article', 'h1', article);
    addNodes(['Duis felis orci, pulvinar id metus ut, rutrum luctus orci. Cras porttitor imperdiet nunc, at ultricies tellus laoreet sit amet. Sed auctor cursus massa at porta. Integer ligula ipsum, tristique sit amet orci vel, viverra egestas ligula. Curabitur vehicula tellus neque, ac ornare ex malesuada et. In vitae convallis lacus. Aliquam erat volutpat. Suspendisse ac imperdiet turpis. Aenean finibus sollicitudin eros pharetra congue. Duis ornare egestas augue ut luctus. Proin blandit quam nec lacus varius commodo et a urna. Ut id ornare felis, eget fermentum sapien.', 'Nam vulputate diam nec tempor bibendum. Donec luctus augue eget malesuada ultrices. Phasellus turpis est, posuere sit amet dapibus ut, facilisis sed est. Nam id risus quis ante semper consectetur eget aliquam lorem. Vivamus tristique elit dolor, sed pretium metus suscipit vel. Mauris ultricies lectus sed lobortis finibus. Vivamus eu urna eget velit cursus viverra quis vestibulum sem. Aliquam tincidunt eget purus in interdum. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus.'], 'p', article);

    const aside = addNodes('', 'aside', container).css({
      gridColumn: `1 / 4`,
      gridRow: `2`,
    });
    addNodes('Other things', 'h2', aside);
    addNodes('Nam vulputate diam nec tempor bibendum. Donec luctus augue eget malesuada ultrices. Phasellus turpis est, posuere sit amet dapibus ut, facilisis sed est.', 'p', aside);

    addNodes('Contact me@mysite.com', 'footer', container).css({
      gridColumn: `1 / 13`,
      gridRow: `3`,
    });

    $('.container').css({
      display: `grid`,
      gridTemplateAreas: `"header header"
                        "sidebar content"
                        "footer footer"`,
      gridTemplateColumns: `1fr 3fr`,
      gridGap: `20px`,
    });

    $('header').css({
      gridArea: `header`,
    });

    $('article').css({
      gridArea: `content`,
    });

    $('aside').css({
      gridArea: `sidebar`,
    });

    $('footer').css({
      gridArea: `footer`,
    });

    $('header, footer').css({
      borderRadius: `5px`,
      padding: `10px`,
      background: `PowderBlue`,
      border: `2px solid MediumTurquoise`,
    });
  } else if (text.match(/Floats/)) {
    main.css({padding: '1em'});
    const div = $('<div>', {class: 'wrapper'}).appendTo(main);
    $('<div>', {class: 'box', html: 'Float'}).appendTo(div);

    addNodes('Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla luctus aliquam dolor, eu lacinia lorem placerat vulputate.', 'p', div);

    addNodes(['Duis felis orci, pulvinar id metus ut, rutrum luctus orci. Cras porttitor imperdiet nunc, at ultricies tellus laoreet sit amet. Sed auctor cursus massa at porta. Integer ligula ipsum, tristique sit amet orci vel, viverra egestas ligula. Curabitur vehicula tellus neque, ac ornare ex malesuada et. In vitae convallis lacus. Aliquam erat volutpat. Suspendisse ac imperdiet turpis. Aenean finibus sollicitudin eros pharetra congue. Duis ornare egestas augue ut luctus. Proin blandit quam nec lacus varius commodo et a urna. Ut id ornare felis, eget fermentum sapien.', 'Nam vulputate diam nec tempor bibendum. Donec luctus augue eget malesuada ultrices. Phasellus turpis est, posuere sit amet dapibus ut, facilisis sed est. Nam id risus quis ante semper consectetur eget aliquam lorem. Vivamus tristique elit dolor, sed pretium metus suscipit vel. Mauris ultricies lectus sed lobortis finibus. Vivamus eu urna eget velit cursus viverra quis vestibulum sem. Aliquam tincidunt eget purus in interdum. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus.']);

    $('body').css({
      width: mobileFlag ? 'unset' : `90%`,
      maxWidth: `900px`,
      margin: `0 auto`,
      font: `.9em/1.2 Arial, Helvetica, sans-serif`,
    });

    $('.box').css({
      float: `left`,
      marginRight: `15px`,
      width: `150px`,
      height: `150px`,
      borderRadius: `5px`,
      background: `PowderBlue`,
      color: `black`,
      padding: `1em`,
    });

    $('.wrapper').css({
      background: `MediumTurquoise`,
      padding: `10px`,
      color: `white`,
      display: `flow-root`,
    });
  } else if (text.match(/Positioning/)) {
    addNodes(['I am a basic block level element. My adjacent block level elements sit on new lines below me.', 'By default we span 100% of the width of our parent element, and our are as tall as our child content. Our total width and height is our content + padding + border width/height.', 'Now I\'m absolutely positioned, I\'m not playing by the rules any more!', 'We are separated by our margins. Because of margin collapsing, we are separated by the width of one of our margins, not both.', 'inline elements <span>like this one</span> and <span>this one</span> sit on the same line as one another, and adjacent text nodes, if there is space on the same line. Overflowing inline elements <span>wrap onto a new line if possible - like this one containing text</span>, or just go on to a new line if not, much like this image will do: <img src="long.jpg">']);

    addNodes('<dt>A</dt><dd>Apple</dd><dd>Ant</dd><dd>Altimeter</dd><dd>Airplane</dd><dt>B</dt><dd>Bird</dd><dd>Buzzard</dd><dd>Bee</dd><dd>Banana</dd><dd>Beanstalk</dd><dt>C</dt><dd>Calculator</dd><dd>Cane</dd><dd>Camera</dd><dd>Camel</dd><dt>D</dt><dd>Duck</dd><dd>Dime</dd><dd>Dipstick</dd><dd>Drone</dd><dt>E</dt><dd>Egg</dd><dd>Elephant</dd><dd>Egret</dd>', 'dl');

    // #region style

    $('body').css({
      width: `500px`,
      height: `3000px`,
      margin: `0 auto`,
      position: 'relative',
    });

    $('p').css({
      background: `aqua`,
      border: `3px solid blue`,
      padding: `10px`,
      margin: `10px`,
    });

    $('span').css({
      background: `red`,
      border: `1px solid black`,
    });

    $('h1').css({
      position: `fixed`,
      top: `0px`,
      width: `500px`,
      margin: `0 auto`,
      background: `white`,
      padding: `10px`,
    });

    $('p:nth-of-type(1)').css({
      marginTop: `60px`,
    });

    $('p').eq(1).addClass('relative').css({
      position: `relative`,
      background: `yellow`,
      top: `20px`,
      left: `30px`,
    });

    $('p').eq(2).addClass('absolute').css({
      position: `absolute`,
      background: `lime`,
      top: `10px`,
      left: `60px`,
      zIndex: `1`,
    });

    $('dt').css({
      backgroundColor: `black`,
      color: `white`,
      padding: `10px`,
      position: `sticky`,
      top: `0`,
      left: `0`,
      margin: `1em 0`,
    });

    // #endregion
  } else if (text.match(/Multicol/)) {
    addNodes(['Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla luctus aliquam dolor, eu lacinia lorem placerat vulputate. Duis felis orci, pulvinar id metus ut, rutrum luctus orci. Cras porttitor imperdiet nunc, at ultricies tellus laoreet sit amet. Sed auctor cursus massa at porta. Integer ligula ipsum, tristique sit amet orci vel, viverra egestas ligula. Curabitur vehicula tellus neque, ac ornare ex malesuada et. In vitae convallis lacus. Aliquam erat volutpat. Suspendisse ac imperdiet turpis. Aenean finibus sollicitudin eros pharetra congue. Duis ornare egestas augue ut luctus. Proin blandit quam nec lacus varius commodo et a urna. Ut id ornare felis, eget fermentum sapien.', 'Nam vulputate diam nec tempor bibendum. Donec luctus augue eget malesuada ultrices. Phasellus turpis est, posuere sit amet dapibus ut, facilisis sed est. Nam id risus quis ante semper consectetur eget aliquam lorem. Vivamus tristique elit dolor, sed pretium metus suscipit vel. Mauris ultricies lectus sed lobortis finibus. Vivamus eu urna eget velit cursus viverra quis vestibulum sem. Aliquam tincidunt eget purus in interdum. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus.'], 'p', $('<div>', {class: 'container'}).appendTo(main));

    const div = $('<div>', {class: 'container'}).appendTo(main);
    for (let i = 0; i < 7; i++) {
      addNodes('Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla luctus aliquam dolor, eu lacinia lorem placerat vulputate. Duis felis orci, pulvinar id metus ut, rutrum luctus orci. Cras porttitor imperdiet nunc, at ultricies tellus laoreet sit amet. Sed auctor cursus massa at porta. Integer ligula ipsum, tristique sit amet orci vel, viverra egestas ligula.', 'p', $('<div>', {class: 'card'}).appendTo(div));
    }

    $('body').css({
      padding: '1em',
      width: mobileFlag ? 'unset' : `90%`,
      maxWidth: `900px`,
      margin: `2em auto`,
      font: `.9em/1.2 Arial, Helvetica, sans-serif`,
    });

    $('.container').css({
      columnWidth: `250px`,
      columnGap: `20px`,
      columnRule: `4px dotted rgb(79, 185, 227)`,
    });

    $('.card').css({
      breakInside: `avoid`,
      backgroundColor: `rgb(207, 232, 220)`,
      border: `2px solid rgb(79, 185, 227)`,
      padding: `10px`,
      margin: `0 0 1em 0`,
    });
  } else if (text.match(/Fundamental Layout comprehension/)) {
  }
  // #endregion CSS layout

  // #endregion CSS

  // #region JavaScript

  //  #region Learn

  //   #region Introduction to JS
  else if (text.match(/What is JS/)) {
    function updateName() {
      para.text(`Player 1: ${prompt('Enter a new name')}`);
    }

    function createParagraph() {
      $('<p>').appendTo(main).text('You clicked the button!');
    }

    const para = addNodes('Player 1: Chris').click(updateName).css({
      fontFamily: `'helvetica neue', helvetica, sans-serif`,
      textTransform: `uppercase`,
      textAlign: `center`,
      border: `2px solid rgba(0,0,200,0.6)`,
      background: `rgba(0,0,200,0.3)`,
      color: `rgba(0,0,200,0.6)`,
      boxShadow: `1px 1px 2px rgba(0,0,200,0.4)`,
      borderRadius: `10px`,
      padding: `3px 10px`,
      display: `inline-block`,
      cursor: `pointer`,
    });

    $('<button>', {
      html: 'Click me',
    }).appendTo(addNodes()).click(createParagraph);
  } else if (text.match(/First splash/)) {
    let i = 0; // iterator for turns been taken
    let modal;
    const min = 1;
    const max = 100;
    let number = getRandom(max);
    const guessCounts = 10;

    function showField(h2) {
      addNodes(h2, 'h2', form);
      addLabels({
        html: 'Enter a guess',
        for: 'guessField',
        type: 'number',
        min: min,
        max: max,
      });
      addFormStyle({html: 'Submit guess'});
    }

    showTitle('Number guessing game');
    addNodes(`We have selected a random number between <b>${min}</b> and <b>${max}</b>. See if you can guess it in <b>${guessCounts}</b> turns or fewer. We'll tell you if your guess was too high or too low.`);

    const form = addNodes('', 'form');

    // #region my custom script
    function reset() {
      $('.w3-modal').remove();
      $('#result').html('');
      $('#left').html(`Guess Left: <b>${guessCounts - i}</b>`);
    }

    function disableGuess() {
      $('input').attr({disabled: true});
      $('button').unbind();
      reset();
    }

    function restartGuess() {
      i = 0;
      number = getRandom(100);
      reset();
    }

    showField('My Custom Code');
    $('<span>', {
      class: 'w3-right',
      id: 'left',
      html: `Guess Left: <b>${guessCounts - i}</b>`,
    }).insertAfter($('label'));

    $('<div>', {id: 'result'}).appendTo(form);
    $('button').click(() => {
      i++;
      const val = $('input').val();
      if (+val == number || i > guessCounts - 1) {
        modal = createModal('Result', restartGuess, disableGuess);
        if (+val == number)
        {
result = `You guess is <b>${val}</b>, and you are <b>right</b>.`;
}
        else
        {
result = `You run out of guesses.`;
}
        $('<p>', {html: `${result} Do you want to Restart? `}).appendTo(modal.children().eq(1));
      } else {
        $('<p>', {html: `You guess is <b>${val}</b>, and it is ${val > number ? 'high' : 'low'}.`}).appendTo($('#result'));
      }
      $('#left').html(`Guess Left: <b>${guessCounts - i}</b>`);
      $('input').val('').parent().removeClass('my-margin');
    });
    // #endregion

    // #region orginal script
    showField('Original Code');
    /**
     *

     */
    const resultParas = $('<div>', {class: 'resultParas'}).appendTo(form);
    /* let guesses =  */$('<p>', {class: 'guesses'}).appendTo(resultParas);
    /* let lastResult =  */$('<p>', {class: 'lastResult'}).appendTo(resultParas);
    /* let lowOrHi =  */$('<p>', {class: 'lowOrHi'}).appendTo(resultParas);
    // let randomNumber = getRandom(max);
    /* let guessSubmit =  */$('button').last().addClass('guessSubmit');
    /* let guessField =  */$('input').last().addClass('guessField');

    let randomNumber = Math.floor(Math.random() * 100) + 1;
    const guesses = $('.guesses');
    const lastResult = $('.lastResult');
    const lowOrHi = $('.lowOrHi');
    const guessSubmit = $('.guessSubmit');
    const guessField = $('.guessField');
    let guessCount = 1;
    let resetButton;

    function checkGuess() {
      const userGuess = Number(guessField.val());
      if (guessCount === 1) {
        guesses.text('Previous guesses: ');
      }

      guesses.text(guesses.text() + userGuess + ' ');

      if (userGuess === randomNumber) {
        lastResult.text('Congratulations! You got it right!').css({background: `green`});
        lowOrHi.text('');
        setGameOver();
      } else if (guessCount === 10) {
        lastResult.text('!!!GAME OVER!!!');
        lowOrHi.text('');
        setGameOver();
      } else {
        lastResult.text('Wrong!').css({background: `red`});
        if (userGuess < randomNumber) {
          lowOrHi.text('Last guess was too low!');
        } else if (userGuess > randomNumber) {
          lowOrHi.text('Last guess was too high!');
        }
      }

      guessCount++;
      guessField.val('').focus();
    }

    guessSubmit.click(checkGuess);

    function setGameOver() {
      guessField.attr({disabled: true});
      guessSubmit.attr({disabled: true});
      resetButton = $('<button>').appendTo(main);
      resetButton.text('Start new game').click(resetGame);
    }

    function resetGame() {
      guessCount = 1;
      const resetParas = $('.resultParas p');
      for (let i = 0; i < resetParas.length; i++) {
        resetParas[i].textContent = '';
      }

      resetButton.remove();
      guessField.attr({disabled: false});
      guessSubmit.attr({disabled: false});
      guessField.val('').focus();
      lastResult.css({background: `white`});
      randomNumber = Math.floor(Math.random() * 100) + 1;
    }
    // #region style
    $('html').css({
      fontFamily: `sans-serif`,
    });

    $('body').css({
      width: `50%`,
      maxWidth: `800px`,
      minWidth: `480px`,
      margin: `0 auto`,
    });

    $('.lastResult').css({
      color: `white`,
      padding: `3px`,
    });
    // #endregion

    // #endregion
    $('button').parent().unwrap('form');
    $('<div>').insertAfter($('main>p'));
  } else if (text.match(/Maths/)) {
    function updateBtn() {
      if (btn.text() === 'Start machine') {
        btn.text('Stop machine');
        txt.text('The machine has started!');
      } else {
        btn.text('Start machine');
        txt.text('The machine is stopped.');
      }
    }

    addNodes('First conditional example', 'h2');
    var btn = $('<button>', {
      html: 'Start machine',
    }).appendTo(addNodes()).click(updateBtn);
    var txt = addNodes('The machine is stopped.');

    // #region second conditional example
    addNodes('Second conditional example', 'h2');
    const div = addNodes('', 'div');
    addNodes('Tell me how you\'re feeling today.', 'p', div);
    const inputTxt = addNodes('', 'input', div).focus();
    var btn = $('<button>', {
      html: 'Enter',
    }).appendTo(addNodes('', 'p', div)).click(showMessage);
    const outputTxt = $('<p>', {class: 'output'}).appendTo(div);
    // #endregion second conditional example

    function showMessage() {
      const final = inputTxt.val().toLowerCase();
      if (final === 'happy') {
        outputTxt.text('I am glad you are feeling good today!');
        outputTxt.css({backgroundColor: `yellow`});
      } else if (final === 'sad') {
        outputTxt.text('Poor you, I\'m sad you\'re blue.');
        outputTxt.css({backgroundColor: `lightblue`});
      } else if (final === 'angry') {
        outputTxt.text('Whoa there, calm down, let me help.');
        outputTxt.css({backgroundColor: `red`});
      } else {
        outputTxt.text('I\'m not sure what that means...');
        outputTxt.css({backgroundColor: `beige`});
      }
    }
  } else if (text.match(/String methods/)) {
    function addButton(html, func) {
      addNodes(html, 'button', addNodes()).click(func);
    }

    function initialize(heading, array, button) {
      addNodes(heading, 'h2');
      const ul = $('<ul>').appendTo(main);
      addNodes(array, 'li', ul);
      addButton(button.html, button.click);
      return ul;
    }

    // #region Filtering greeting message

    function filterString(text) {
      filterList.html('');
      addNodes(greetings.filter((str) => str.match(text)), 'li', filterList);
    }

    const greetings = ['Happy Birthday!',
      'Merry Christmas my love',
      'A happy Christmas to all the family',
      'You\'re all I want for Christmas',
      'Get well soon'];

    button = {
      html: 'Filter',
      click: () => {
        filterString('Christmas');
      },
    };

    const filterList = initialize(
        'Filtering greeting messages',
        greetings,
        button);

    // #endregion filtering greeting message

    // #region Fixing capitalization
    const cities = ['lonDon', 'ManCHESTer', 'BiRmiNGHAM', 'liVERpoOL'];
    button = {
      html: 'Fix',
      click: fixString,
    };
    const fixedList = initialize('Fixing capitalization', cities, button);

    function fixString() {
      fixedList.html('');
      cities.forEach((city) => {
        city = city.replace(/(.)(.+)/, (match, firstChar, rest) => {
          return `${firstChar.toUpperCase()}${rest.toLowerCase()}`;
        });
        $('<li>', {
          html: city,
        }).appendTo(fixedList);
      });
    }

    // #endregion Fixing capitalization

    // #region Extract station
    function extractStation() {
      extractedList.html('');
      stations.forEach((station) => {
        station = station.replace(/(.{3}).+;/, '$1: ');
        $('<li>', {
          html: station,
        }).appendTo(extractedList);
      });
    }

    const stations = ['MAN675847583748sjt567654;Manchester Piccadilly',
      'GNF576746573fhdg4737dh4;Greenfield',
      'LIV5hg65hd737456236dch46dg4;Liverpool Lime Street',
      'SYB4f65hf75f736463;Stalybridge',
      'HUD5767ghtyfyr4536dh45dg45dg3;Huddersfield'];

    button = {
      html: 'Extract',
      click: extractStation,
    };

    const extractedList = initialize('Extract station', stations, button);

    // #endregion Extract station
  } else if (text.match(/Array/)) {
    // #region product list
    var list = addNodes('', 'ul');
    const totalBox = addNodes();
    let total = 0;

    class Product {
      constructor(name, price) {
        this.name = name;
        this.price = price;
      }
    }

    const products = [
      new Product('Underpants', 6.99),
      new Product('Socks', 5.99),
      new Product('T-shirt', 14.99),
      new Product('Trousers', 31.99),
      new Product('Shoes', 23.99),
    ];

    products.forEach((product) => {
      total += product.price;
      $('<li>', {
        html: `${product.name} \u2014 $${product.price}`,
      }).appendTo(list);
    });

    totalBox.text(`Total: $${total.toFixed(2)}`);

    // #endregion product list

    // #region tax table
    const table = addNodes('', 'table');
    addNodes('Invoice totals', 'caption', table);
    const tr = addNodes('', 'tr', addNodes('', 'thead', table));
    ['before sales tax', 'with 6% sales tax added'].forEach((th) => {
      addNodes(th, 'th', tr);
    });
    const tbody = addNodes('', 'tbody', table);

    const totals = [191.45, 890.56, 67.99, 12.34, 235.64];
    totals.forEach((td) => {
      const tr = addNodes('', 'tr', tbody);
      addNodes(`$${td.toString()}`, 'td', tr);
      addNodes(`$${(td * 1.06).toFixed(2).toString()}`, 'td', tr);
    });

    $('td').addClass('w3-center');
    // #endregion tax table
  } else if (text.match(/Story generator/)) {
    /**
     *
     * @param {*} array
     */
    function randomValueFromArray(array) {
      return array[Math.floor(Math.random() * array.length)];
    }

    function generateStory() {
      /**
       * Completing the result() function
       */

      /**
       * Create a new variable called newStory, and set it's value to equal storyText.
           One mark for this - another simple variable definition.
       */
      let newStory = storyText;

      /**
       * Create three new variables called xItem, yItem, and zItem...
          6 marks for this, 2 for each correct definition. For each one they basically have to initialise the new variable, and declare it's value as the corresponding array passed to the randomValueFromArray() function. So for example, var xItem = randomValueFromArray(insertX);.
       */
      const character = randomValueFromArray(characters);
      const place = randomValueFromArray(places);
      const action = randomValueFromArray(actions);
      let temperature = getRandom(100);
      let weight = getRandom(300);
      let name = 'Bob';

      /**
       * Next we want to replace the three placeholders in the newStory string...
          8 marks, two for each of the four lines needed. For each of these lines, we need to call the replace() string method on newStory, giving it as parameters the placeholder first of all (e.g. 'insertx:'), and then the variable value to replace the placeholder with (e.g. xItem). We need to store the result of that method call in newStory, so the result of each line is that newStory will be made equal to itself, but with some substitutions made. An example correct line is newStory = newStory.replace(':insertx:',xItem);. As an extra stipulation, the xItem line needs to be called twice, as using replace() like this only replaces the first instance of the matched substring.
       */
      newStory = newStory.replace(/{character}/g, `<b>${character}</b>`);
      newStory = newStory.replace(/{place}/g, `<b>${place}</b>`);
      newStory = newStory.replace(/{action}/g, `<b>${action}</b>`);

      newStory = newStory.replace(/{number}/, `<b>${temperature}</b>`);
      newStory = newStory.replace(/{number}/, `<b>${weight}</b>`);

      if (customName.val() !== '') {
        name = customName.val();
      }
      newStory = newStory.replace(/{Bob}/g, `<b>${name}</b>`);

      /**
       * Inside the second if block, we are checking to see if the uk radio button has been selected...    There are four parts to this question. Let's go through each one in turn:
          Four marks for this, 2 for each formula. The two required formulae are pounds x 0.0714286 = stone and (Farenheit - 32) * (5 / 9) = centigrade.
          Two marks for this. They need to replace 300 with 300*0.0714286, and then concatenate ' stone' onto the end of the whole line, so in total, the value of weight is Math.round(300*0.0714286) + ' stone'.
          Two marks for this. They need to replace 94 with (94-32) * 5 / 9, and then concatenate ' centigrade' onto the end of the whole line, so in total, the value of temperature is Math.round((94-32) * 5 / 9) + ' centigrade'.
          Four marks in total for these; they are just the same as the other replace() lines that came before them. For these two lines we need newStory = newStory.replace('94 farenheit',temperature); and newStory = newStory.replace('300 pounds',weight);
       */
      if ($('#uk:checked').length) {
        weight = Math.round(weight / 14);
        temperature = Math.round(temperature * 9 / 5 + 32);
        newStory = newStory.replace(/fahrenheit/, 'centigrade');
        newStory = newStory.replace(/pounds/, 'stone');
      } else {
        weight = Math.round(weight * 14);
        temperature = Math.round((temperature - 32) * 5 / 9);
        newStory = newStory.replace(/centigrade/, 'fahrenheit');
        newStory = newStory.replace(/stone/, 'pounds');
      }

      /**
       * Finally, in the second-to-last line of the function, make the textContent property of the story variable...
          One mark for this, as it's pretty easy; just add the newStory variable into the line - story.textContent = newStory;.
       */
      story.html(newStory);
    }

    /**
     * Basic setup
        Create main.js
          One mark for this; it is pretty simple.
        Apply the external JS file to your HTML
          One mark for this too.
     */

    // #region html
    const div = addNodes('', 'div');
    labels = [{
      html: 'Enter custom name',
      for: 'customname',
    }];
    addLabels(labels, div);

    ['us', 'uk'].forEach((label) => {
      labelNode = createChoiceInput(div, 'radio', label.toUpperCase(), 'usuk');
      $('input', labelNode).attr({id: label, value: label});
    });

    bgColor = getComputedStyle(addNav().hide()[0]).backgroundColor;
    $('.my-label input').eq(0).click();

    $('<button>', {
      class: 'randomize',
      html: 'Generate random story',
    }).appendTo(div).click(generateStory);

    var story = $('<p>', {class: 'story'}).appendTo(div);

    // #endregion html

    var customName = $('#customname');

    /**
     * Initial variables and functions
        Copy the code from section 1 of the raw text file into main.js.
          One mark for this.
        Placing the event handler and incomplete function
          Only one mark for this bit - it's just more simple copy and paste.
     */
    /**
     *  Store the big long text string inside a variable called storyText.
          One mark for this - creating a simple variable and storing a string inside it is not complex.
     */
    const storyText = 'It was {number} fahrenheit outside, so {character} went for a walk. When they got to {place}, they stared in horror for a few moments, then {action}. {Bob} saw the whole thing, but was not surprised \u2014 {character} weighs {number} pounds, and it was a hot day.';

    /**
     *  Store the three sets of strings inside three arrays called insertX, insertY, and insertZ.
          6 marks for this - 2 for each array. Creating an array of strings is not quite as simple as a string variable.
     */
    const characters = ['Willy the Goblin', 'Big Daddy', 'Father Christmas'];
    const places = ['the soup kitchen', 'Disneyland', 'the White House'];
    const actions = ['spontaneously combusted', 'melted into a puddle on the sidewalk', 'turned into a slug and crawled away'];
  }
  //   #endregion Introduction to JS

  //   #region Building blocks

  else if (text.match(/Conditionals/)) {
    // #region weather
    class Weather {
      constructor(type, detail) {
        this.type = type;
        this.detail = detail;
      }
    }

    const weather = [
      new Weather('Sunny', 'It is nice and sunny outside today. Wear shorts! Go to the beach, or the park, and get an ice cream.'),
      new Weather('Rainy', 'Rain is falling outside; take a rain coat and a brolly, and don\'t stay out for too long.'),
      new Weather('Snowing', 'The snow is coming down - it is freezing! Best to stay in with a cup of hot chocolate, or go build a snowman.'),
      new Weather('Overcast', 'It isn\'t raining, but the sky is grey and gloomy; it could turn any minute, so take a rain coat just in case.'),
    ];

    labels = [{
      html: 'Select the weather type today',
      for: 'weather',
      widget: {
        type: 'select',
        options: ['--Select weather--', 'Sunny', 'Rainy', 'Snowing', 'Overcast'],
      },
    }];

    addLabels(labels, main);

    const weatherSelect = $('select').eq(0).on('change', setWeather);
    const para = addNodes();

    function setWeather() {
      para.text(weather.find((w) => w.type.toLowerCase() == weatherSelect.val()).detail);
    }

    // #endregion weather

    // #region calendar

    labels = [{
      html: 'Select month',
      for: 'month',
      widget: {
        type: 'select',
        options: ['--Select month--', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
      },
    }];

    addLabels(labels, main);

    const monthSelect = $('select').eq(1).on('change', setMonth);
    const length = screen.width / 8.5;
    var list = $('<div>', {
      class: 'grid',
    }).appendTo(main).css({
      margin: `1em 0`,
      display: `grid`,
      gridTemplateColumns: `repeat(auto-fill, minmax(${length}px, 1fr))`,
      gridAutoRows: `minmax(${length}px, auto)`,
    });

    function setMonth() {
      const choice = monthSelect.val();
      let days = 31;

      if (choice.match(/February/i)) {
        days = 28;
      } else if (choice.match(/April|June|September|November/i)) {
        days = 30;
      }

      createCalendar(days, choice);
    }

    function createCalendar(days) {
      list.html('');
      for (let i = 1; i <= days; i++) {
        $('<div>').appendTo(list).text(i).addClass('my-padding my-color');
      }
    }

    // #endregion calendar
  } else if (text.match(/Loops/)) {

  } else if (text.match(/Functions/)) {
    $('h1').remove();
    main.width(mobileFlag ? screen.width : 400).css({
      background: 'white',
      margin: '0 auto',
    });
    $('.w3-container').removeClass('w3-container');
    body.css({background: 'lightgray'}).scrollTop(-32);
    const inputDiv = $('<div>', {id: 'inputDiv'}).appendTo(main);
    const sendBtn = addNodes('Send', 'button', inputDiv).css({
      padding: '4px 8px',
    }).click(() => {
      displayMessage($('input').val());
    });
    $('<input>', {
      id: 'msgInput',
    }).prependTo(inputDiv).width(inputDiv.width() - sendBtn.width() - 80);

    const msgDiv = $('<div>', {
      id: 'msgDiv',
    }).insertBefore(inputDiv).height(body.height() - inputDiv.height() - 16);

    function displayMessage(msgText) {
      const panel = $('<div>').appendTo(msgDiv);
      $('<p>', {
        class: 'msgBox w3-center',
        html: Date().replace(/GMT.*/, ''),
      }).appendTo(panel);

      $('<span>', {
        class: 'msgBox',
        html: msgText,
      }).appendTo(panel).css({
        borderRadius: 5,
        display: 'inline-block',
        padding: '.5em',
        margin: '.5em 0',
        color: 'white',
      }).addClass(color);

      $('input').val('');
    }
  } else if (text.match(/Events/)) {

  } else if (text.match(/Gallery/)) {
    /**
     * Adding an onclick handler
        Two marks; the <button> is referenced in the btn variable. In this case, invoking a named function would also be ok.
      Checking the current class name set on the <button> element
        Two marks;
      The conditional statement
        Six marks for this. It is not that complex, but there is a fair bit of work to do here.
        Then the student needs to grab the three lines provided in the assessment text, and modify it to set the things that are needed in each state. So a finished event handler could look something like this:
     */
    function toggleBackground() {
      const width = displayedImage.width();
      const height = displayedImage.height();
      overlay.width(width).height(height);
      if (btn.html().match(/Darken/)) {
        overlay.css({background: 'rgba(0,0,0,0.5)'});
        btn.html('Lighten');
      } else {
        overlay.css({background: 'rgba(0,0,0,0)'});
        btn.html('Darken');
      }
    }
    $('base').remove();
    $('<base>', {
      href: 'https://mdn.github.io/learning-area/javascript/building-blocks/gallery/',
    }).appendTo(head);
    addStyle('style.css');

    const fullImg = $('<div>', {
      class: 'full-img',
    }).appendTo(main);

    const displayedImage = $('<img>', {
      class: 'displayed-img',
      src: 'images/pic1.jpg',
    }).appendTo(fullImg);

    const overlay = $('<div>', {
      class: 'overlay',
    }).appendTo(fullImg);

    const btn = $('<span>', {
      class: 'dark',
      html: 'Darken',
    }).appendTo(fullImg).css({
      background: `rgba(150,150,150,0.6)`,
      position: `absolute`,
      cursor: `pointer`,
      top: `2px`,
      left: `2px`,
    }).click(toggleBackground);

    const thumbBar = $('<div>', {
      class: 'thumb-bar',
    }).appendTo(main);

    $(`.full-img${mobileFlag ? ', body' : ''}`).width('unset').height('unset');

    /* Looping through images */

    /**
     * Looping through the images
        Creating the loop
          Four marks for this — the actual solution is fairy simple, but there are a few details to get right (any suitable loop type can be used):
            The initializer should start at 1, and the loop should iterate until a value of 5. This is useful, as the first image has the number 1 in its filename, then 2, 3, etc.
            The iterator should add 1 to the initializer after each iteration.
        Building the image path for each loop iteration
          Three marks for this. The student basically just needs to replace the xxx placeholder with a string concatenation that will use the initializer to build the image path in each case. The pattern we need is this: 'images/pic' + i + '.jpg'.
     */
    for (let index = 1; index <= 5; index++) {
      const newImage = $('<img>', {
        src: `images/pic${index}.jpg`,
      }).appendTo(thumbBar).click((e) => {
        /**
         * Adding an onclick handler to each thumbnail image
            Find the value of the src attribute of the current image.
           Run a function, passing it the returned src value as a parameter.
            Two marks for this.
            This event handler function should set the src attribute value...
          Four marks for this. The student needs to define their own function, which is passed one parameter, the returned src value. The full-size image is reference by the displayedImage variable.
         */
        displayedImage.attr({src: e.target.src});
      });
    }

    /* Wiring up the Darken/Lighten button */
  }
  //   #endregion Building blocks

  //   #region OOJS
  else if (text.match(/Prototype/)) {
    Person.prototype.farewell = function() {
      alert(`${this.name.first} has left the building. Bye for now!`);
    };

    Person.prototype.greeting = function() {
      alert(`Hi! I'm ${this.name.first}`);
    };

    Person.prototype.bio = function() {
      // First define a string, and make it equal to the part of
      // the bio that we know will always be the same.
      let string = `${this.fullName} is ${this.age} years old. `;
      // define a variable that will contain the pronoun part of
      // the second sentence
      let pronoun;

      // check what the value of gender is, and set pronoun
      // to an appropriate value in each case
      if (this.gender.match(/^M/i)) {
        pronoun = 'He';
      } else if (this.gender.match(/^F/i)) {
        pronoun = 'She';
      }

      // add the pronoun string on to the end of the main string
      string += `${pronoun} likes `;

      // use another conditional to structure the last part of the
      // second sentence depending on whether the number of interests
      // is greater than 1
      if (this.interests.length > 1) {
        // get last interest so we can insert 'and' between it and
        // other interests which is join by comma
        const lastInterest = this.interests.pop();
        string += `${this.interests.join(', ')} and ${lastInterest}.`;
      } else {
        string += `${this.interests}.`;
      }

      // finally, with the string built, we alert() it
      alert(string);
    };

    class Teacher extends Person {
      constructor(first, last, age, gender, interests, subject, grade, students) {
        super(first, last, age, gender, interests);
        this.subject = subject;
        this.grade = grade;
        this.students = students;
      }
    }

    Teacher.prototype.greeting = function() {
      let title = '';
      if (this.gender.match(/^M/i)) {
        title = 'Mr.';
      } else if (this.gender.match(/^F/i)) {
        title = 'Mrs.';
      }

      alert(`Hello. My name is ${title} ${this.name.last}, and I teach ${this.subject}`);
    };

    class Student extends Person {
      constructor(first, last, age, gender, interests, _class, teachers) {
        super(first, last, age, gender, interests);
        this.class = _class;
        this.teachers = teachers;
      }
    }

    Student.prototype.greeting = function() {
      alert(`Yo! I'm ${this.name.first}.`);
    };

    const teachers = [
      new Teacher('Dave', 'Griffiths', 31, 'male', ['football', 'cookery'], 'math'),
      new Teacher('Melanie', 'Hall', 26, 'female', ['playing guitar', 'archery'], 'physics'),
      new Teacher('Severus', 'Snape', 58, 'male', ['Potions'], 'Dark arts', 5),
    ];

    const students = [
      new Student('Liz', 'Sheppard', 17, 'female', ['ninjitsu', 'air cadets'], 101),
    ];

    addObjsFuncs([persons, teachers, students]);
  } else if (text.match(/JSON/)) {
    function populateHeader(jsonObj) {
      $('<h1>', {html: jsonObj.squadName}).appendTo(header);

      $('<p>', {
        html:
          `Hometown: ${jsonObj.homeTown}<br>Formed: ${jsonObj.formed}`,
      }).appendTo(header);
    }

    function showHeroes(jsonObj) {
      const heroes = jsonObj.members;

      heroes.forEach((hero) => {
        const article = $('<article>').appendTo(section);
        $('<h2>', {html: hero.name}).appendTo(article);
        $('<p>', {
          html: `Secret identity: ${hero.secretIdentity}`,
        }).appendTo(article);
        $('<p>', {
          html: `Age: ${hero.age}`,
        }).appendTo(article);
        $('<p>', {
          html: `Superpowers:`,
        }).appendTo(article);

        const ul = $('<ul>').appendTo(article);
        hero.powers.forEach((power) => {
          $('<li>', {html: power}).appendTo(ul);
        });
      });
    }

    addStyle('https://fonts.googleapis.com/css?family=Faster+One');
    $('h1').remove();
    const header = addNodes('', 'header');
    const section = addNodes('', 'section');
    const requestURL = 'https://mdn.github.io/learning-area/javascript/oojs/json/superheroes.json';
    const request = requestJSON(requestURL);
    request.onload = () => {
      const superHeroes = request.response;
      populateHeader(superHeroes);
      showHeroes(superHeroes);

      $('header').prependTo(main);
      if (mobileFlag) {
        body.width('unset');
        $('article').width('unset').css({float: 'unset'});
      }
    };
  }
  //   #endregion OOJS

  //   #endregion Learn

  //  #region Guide
  else if (text.match(/Working with Objects/)) {
    function displayCar() {
      const result = `A Beatutiful ${this.year} ${this.make} ${this.model} owned by ${this.owner.fullName}`;
      console.log(result);
    }

    class Car {
      constructor(make, model, year, owner) {
        this.make = make;
        this.model = model;
        this.year = year;
        this.owner = owner;
        this.displayCar = displayCar;
      }
    }

    const cars = [
      new Car('Ford', 'Mustang', 1969),
      new Car('Eagle', 'Talon TSi', 1993),
      new Car('Nissan', '300ZX', 1992),
      new Car('Mazda', 'Miata', 1990),
    ];

    function getCar(obj) {
      return `${obj.year} ${obj.make} ${obj.model}`;
    }

    cars.forEach((car, index) => {
      car.owner = persons[index];
    });

    addObjsFuncs([cars], getCar);
  } else if (text.match(/Details of the object model/)) {
    /**
     * @class Employee has the properties
     * @prop {string} name (whose value defaults to the empty string) and
     * @prop {string} dept (whose value defaults to "general").
     */
    // First you define the Employee constructor function, specifying the name and dept properties.
    class Employee {
      constructor(name = '', dept = 'general') {
        this.name = name;
        this.dept = dept;
      }
    }
    Employee.prototype.specialty = 'none';

    /**
     * @class Manager is based on @class Employee. It adds the
     * @property {array} reports property (whose value defaults to an empty array, intended to have an array of Employee objects as its value).
     */
    // Next, you define the Manager constructor function, calling the Employee constructor and specifying the reports property.
    class Manager extends Employee {
      constructor() {
        super();
        this.report = [];
      }
    }

    /**
     * @class WorkerBee is also based on @class Employee. It adds the @prop {array} projects property (whose value @defaults to an empty array, intended to have an array of strings as its value).
     */
    class WorkerBee extends Employee {
      constructor(name, dept, projs = []) {
        super(name, dept);
        this.projects = projs; // Specify the reports property
      }
    }

    /**
     * @class SalesPerson is based on @class WorkerBee. It adds the @prop {number} quota property (whose value @defaults to 100). It also @overrides the dept property with the value "sales", indicating that all salespersons are in the same department.
     */
    class SalesPerson extends WorkerBee {
      constructor() {
        super();
        this.dept = 'sales';
        this.quota = 100;
      }
    }

    /**
     * @class Engineer is based on @class WorkerBee. It adds the @prop {string} machine property (whose value @defaults to the empty string) and also @overrides the dept property with the value "engineering".
     */
    class Engineer extends SalesPerson {
      constructor(name, projs, mach = '') {
        super(name, 'engineering', projs);
        this.machine = mach;
      }
    }
    Engineer.prototype.specialty = 'code';

    const jim = new Employee('Jones, Jim', 'marketing');
    // Parentheses can be omitted if the
    // constructor takes no arguments.
    // jim.name is ''
    // jim.dept is 'general'

    const sally = new Manager;
    // sally.name is ''
    // sally.dept is 'general'
    // sally.reports is []

    const mark = new WorkerBee('Doe, Mark', 'admin', ['navigator']);

    const fred = new SalesPerson;
    // fred.name is ''
    // fred.dept is 'sales'
    // fred.projects is []
    // fred.quota is 100

    const jane = new Engineer('Jane', [], 'belaup');
    const persons = [];
  }
  //  #endregion Guide

  // #endregion JavaScript
}

addMDNScripts(toc, $('main>section'), 2);
addTOC('force');
addSideLinks('force');

$(':header').filter(function() {
  return !$(this).siblings().length;
}).click(function() {
  startScripts($(this));

  $('caption').css({fontSize: 18, color: 'black'});

  // remove other css
  if ($('header').length && $('main').length > 1) {
    $(`link[href*='w3']`).remove();
    $('main.w3-container').remove();
    $('html').removeClass('my-scrollbar');

    // #region responsive design
    if (mobileFlag && $('aside').length) {
      body.css({
        width: 'unset',
        minWidth: 'unset',
        margin: 'unset',
      });
      $('article, aside, footer').addClass('w3-container');
      if ($('aside').length) body.addClass('w3-container');
      $('.w3-container').css({padding: '0.01em 16px'});
      $('html').css({fontSize: 'unset'});
      $('h1').css({fontSize: '1.8rem'});
      $('h2').css({fontSize: '1.6rem'});
      $('h3').css({fontSize: '1.4rem'});
      $(`nav li *`).css({fontSize: '1.2rem'});
      $(`p`).css({fontSize: '1.2rem'});
      $(`nav li:contains('Get ')`).remove();
      $('aside').hide();
      $(`form`).hide();
    }
    // #endregion
  } else {
    main.wrapInner($('<div>', {class: 'w3-container'}));
  }

  // remove other css
  if ($(this).parent().parent().text().match(/Table/) ||
    $(this).parent().parent().parent().text().match(/CSS/)) {
    $(`link[href*='w3']`).remove();
  }

  if ($('html').css('background').match(/0, 0, 0, 0/) &&
    !$(this).parent().parent().parent().text().match(/CSS/)) {
    bgColor = getComputedStyle(addFooter().hide()[0]).backgroundColor;
    $('th').css({background: bgColor});
  }
});

/** @todo school plan apps https://github.com/zalun/school-plan-app/blob/master/stage9/js/index.js */
