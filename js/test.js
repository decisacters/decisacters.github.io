
/* global $, color, dir, body, nav, main, footer,
user, mobileFlag, bgColor, link,
sideTOC, noteContent, sideLinks
literals, toefl, gre, words, essays
removeHighlight, toCase, createSearchBtn, filterNodes, addScripts, execScripts

 */

/**
       * Show title
       */
function showEssay() {
  /**
         * Show Topic title
         */
  function showTopics() {
    Object.keys(essays).forEach((topic, i) => {
      $('<div>', {
        class: 'my-padding my-highlight my-margin-small',
        html: `${i + 1}. ${essays[`topic${i + 1}`].topic}`,
      }).appendTo(main).unbind().click(function() {
        execScripts(`topic${i + 1}`);
      });
    });
    createSearchBtn(div, filterNodes, $('div.my-highlight', main));
  }

  main.html('');
  const div = $('<div>', {
    class: 'w3-bar',
  }).appendTo(main);

  addScripts('essays', showTopics);
}

/**
 * add click to filter
 * @param {string} selector css selector
 * @param {string} classes html classes
 */
function addFilterClick(selector, classes) {
  $(selector).each(function() {
    $(this).click(() => {
      $(selector).each(function() {
        $(this).removeClass(classes.join(' '));
        if (classes.includes('my-highlight') && !selector.match('#tagsDiv')) {
          removeHighlight($(this));
        }
      });

      $(this).addClass(classes.join(' '));
    });
  });
}

/**
 * find words in gre or toefl
 * @param {RegExp} regExp reg exp for match word
 * @param {object} div div
 * @param {boolean} exact exeact match
 */
function findWords(regExp, div, exact) {
  if (typeof gre == 'undefined' || typeof toefl == 'undefined') return;

  /**
   * create result div after find words
   * @param {string} val match value
   * @param {string} html html
   * @param {string} name test set name
   * @param {object} parent parent node
   * @return {object} result div
   */
  function createResultDiv(val, html, name, parent) {
    html = `<b>${name}</b><br>${html}`;
    const resultDiv = $('<div>', {
      class: `${exact ? '' : 'my-padding'} w3-section my-click`,
    }).appendTo(parent);
    $('<a>', {
      href: `${dir}/index.html`,
      html: html.replace(
          RegExp(val),
          `<b>${val.toString().replace(/\\b/g, '')}</b>`),
    }).css({
      textDecoration: 'none',
    }).appendTo(resultDiv).click(function() {
      localStorage.setItem('link', name.replace(/-q\d+$/, ''));
      localStorage.setItem('number', name.match(/\d+$/)[0]);
    });

    return resultDiv;
  }

  /**
   * traverse passage
   * @param {object} passage toefl or gre passage
   * @param {string} name test set name
   * @param {object} question test question
   */
  function traversePassage(passage, name, question = '') {
    if (!passage) return;
    passage = passage.replace(
        /<span class="question\d+">(.*?)<\/span>/g,
        ' $1 ',
    );
    if (passage.match(regExp)) {
      let val = passage.match(regExp);
      let matches;
      let html;
      val = exact ? `\\b${val}\\b` : val;
      const affix = `([':,!\\.\\?\\)])[a-zA-Z0-9 -]*`;
      const regEx = `${affix}${val}.*?`;
      if (matches = passage.match(RegExp(`${regEx}${affix}`))) {
        html = matches[0];
      } else if (matches = passage.match(RegExp(regEx))) {
        html = matches[0];
      } else html = exact ? '' : passage.match(val)[0];
      name = `${name}${question ? `-q${question}` : ''}`;
      createResultDiv(val, html, name, div);
    }
  }

  $(gre.concat(toefl)).each(function() {
    const name = this.name;
    $(this.questions).each(function(i) {
      let html;
      if (this.choices &&
        this.choices.join().match(regExp) ||
        this.stem.match(regExp)) {
        html = `${this.stem}
        ${this.choices ? this.choices.flat().join('  ') : ''}`;
        // regExp = exact ? `\\b${regExp}\\b` : regExp
        const val = html.match(regExp);
        if (val) {
          const resultDiv = createResultDiv(val, html, `${name}-q${i}`, div)
              .css({
                overflow: 'auto',
              });
          if (exact && !html.match(`\\b${regExp}\\b`)) resultDiv.hide();
        }
      }
    });
    $(this.passages).each(function() {
      traversePassage(this.passage, name, this.start);
    });
    $(this.responses).each(function() {
      traversePassage(this.toString(), name);
    });
    traversePassage(this.passage, name);
  });
}

// #endregion

// #region test

/**
 * toggle nav, footer and main
 */
function toggleElement() {
  nav.toggle();
  footer.toggle();
  main.toggle();
}

/**
 * add color for radio button or checkbox
 */
function addInputColor() {
  $('input:checked + *').css({
    background: bgColor,
  });
  $('input:not(:checked) + *').css({
    background: `lightgray`,
  });
}

/**
 * create checkbox or diao choices
 * @param {object} parent parent node
 * @param {string} type checkbox or radio
 * @param {string} html choice content
 * @param {string} name input attribute
 * @return {object} label node
 */
function createChoiceInput(parent, type, html, name = type) {
  const label = $('<label>', {
    class: 'my-label',
  }).appendTo(parent).click(addInputColor);

  $('<span>').html(html).appendTo(label);

  $('<input>', {
    name: name,
    type: type,
  }).appendTo(label).hide();

  $('<span>', {
    class: `my-${type}`,
  }).appendTo(label);

  return label;
}

// test sets
function addSetsDiv(test) {
  function createBar(html, parent) {
    return $('<div>', {
      class: 'w3-margin-right my-paging my-round my-padding',
      html: html,
    }).appendTo($('<div>', {
      class: 'my-bar my-margin-small',
    }).appendTo(parent)).parent();
  }

  function createTest(name, examples, parent) {
    function getName(example) {
      return example[0] + (example.match(/\d/) ? example.match(/\d/)[0] : '');
    }
    let div = $('#testDiv').html('');
    if (!div.length) {
      div = $('<div>', {
        class: 'my-bar my-margin-small',
        id: 'testDiv',
      }).appendTo(parent);
    }
    examples[2] = 'Verbal 1';
    examples = examples.concat(['Verbal 2', 'Quantitative 1', 'Quantitative 2']);
    for (let i = 0; i < examples.length; i++) {
      $('<button>', {
        class: 'my-btn',
        html: mobileFlag ? getName(examples[i]) : examples[i],
      }).appendTo(div).data({
        link: name,
      }).unbind().click(function(i) {
        execScripts(`${$(this).data('link')}-${getName($(this).text()).toLowerCase()}`);
      });
    }
  }

  const setsDiv = $('<div>', {
    id: 'setsDiv',
  }).prependTo(main);
  let div = $('<div>', {
    class: `my-bar`,
  }).appendTo(setsDiv);
  const tests = Object.keys(literals.tests[test]);

  $(tests).each(function(tests) {
    $('<button>', {
      class: `my-btn`,
      html: `${this.toUpperCase()}`,
    }).appendTo(div).click(function() {
      const text = $(this).text();
      if (text.match(/TPO|OG/) && test == 'toefl') {
        addCategoryFilter(text);
      } else {
        const name = text;
        $('div.my-margin-small').remove();
        const set = literals.tests[test][name.toLowerCase()];

        div = createBar('Example', setsDiv);

        const examples = ['Issue', 'Argument', 'Verbal'];
        for (let i = 0; i < examples.length; i++) {
          $('<button>', {
            html: mobileFlag ? examples[i][0] : examples[i],
          }).appendTo(div);
        }
        if (set['e']) $('div.my-margin-small').eq(0).remove();

        $(Object.keys(set)).each(function() {
          div = createBar(toCase(renameTitle(this).replace(/(GRE|TOEFL) /g, '')), setsDiv);

          if (typeof set[this] == 'object') {
            $(Object.entries(set[this])).each(function() {
              for (let i = 0; i < this[1]; i++) {
                const text = this[1] == 1 ? this[0] : `${this[0]}${i + 1}`;
                $('<button>', {
                  html: mobileFlag ? text.toUpperCase() : renameTitle(text),
                }).appendTo(div);
              }
            });
          } else {
            for (let i = 1; i <= set[this]; i++) {
              $('<button>', {
                html: i,
              }).appendTo(div);
            }
          }
          $('.my-margin-small button').addClass('my-btn').data({
            book: name,
          }).unbind().click(function() {
            const type = $(this).text().match(/^\d/) ? `v` : '';
            let setName = $(this).prevAll().eq(-1).text().match(/\b\w/g).join('');
            const text = mobileFlag ? $(this).text() : $(this).text().replace(/^(\w)[a-z]* ?(\d*)/, '$1$2');
            if (setName.match(/^D$/)) setName = $(this).prevAll().eq(-1).text().match(/\w{2}/)[0];
            const link = `${$(this).data('book')}-${setName}-${type}${text}`.toLowerCase();
            // link = window.link.match(/^\w+-\w+-\w+$/) ? window.link : link

            if (setName.match(/^PT$/)) {
              createTest(`${$(this).data('book')}-${setName}${text}`.toLowerCase(), examples, $(this).parent().parent());
            } else execScripts(link);
          });
        });
      }
    });
  });
  return setsDiv;
}

function setArticleHeight(height) {
  height = height ? height : screen.height / 3;
  if (typeof height == 'object') {
    article = height;
    height = screen.height / 3;
  }
  if (typeof article == 'undefined') return;
  article.addClass('w3-section').css({
    height: height,
    overflow: 'scroll',
  });
}

// Reading Question
function showSpecialQuestion(passageDiv, questionDiv) {
  // question = $('.question', section)

  if (question.stem.match(/paragraph \d/)) {
    const para = question.stem.match(/paragraph \d/)[0].slice(-1);
    const paragraph = $('p', passageDiv).eq(para - 1);
    paragraph[0].scrollIntoView();
    $('html').scrollTop(-32);
  }

  // insert Text
  $('[data-answer]', passageDiv).click(function() {
    $('[data-answer]', passageDiv).text('\u25a0').addClass('w3-xxlarge');
    $(this).text(`[${question.stem}] `).removeClass('w3-xxlarge');
  }).each(function() {
    if (question.type == 'insert') $(this).text('\u25a0').addClass('w3-xxlarge my-highlight my-click');
    else $(this).text();
  });
  if (question.type == 'insert') $('[data-answer]', passageDiv)[0].scrollIntoView();

  // highlight
  const highlight = $(`.question${+set.questions.indexOf(question) + 1}`);
  if (highlight.length) {
    addHighlight(highlight).css({
      textDecoration: 'underline',
    }).children().css({
      color: bgColor,
    })[0].scrollIntoView();
    $('html').scrollTop(-32);
  }
}

function addTextarea(parent) {
  function getAllIndexes(arr, val) {
    const indexes = [];
    let i = -1;
    while ((i = arr.indexOf(val, i + 1)) != -1) {
      indexes.push(i);
    }
    return indexes;
  }
  wordCountDiv = $('<div>', {
    class: 'w3-padding w3-section',
  }).appendTo(parent);
  wordCount = $('<span>', {
    class: 'w3-large my-highlight',
    html: 'Word Count: 0',
  }).appendTo(wordCountDiv);

  $('<span>', {
    id: 'time',
    class: 'w3-large w3-right my-highlight',
  }).appendTo(wordCountDiv);

  if (typeof article != 'undefined') article.toggleClass('w3-padding-small');
  if (typeof section != 'undefined') section.toggleClass('w3-padding-small');

  return $('<textarea>', {
    class: 'my-border w3-padding w3-block',
  }).appendTo(parent).height(window.innerHeight).on('input', function() {
    wordCount.html(`Word Count: ${getAllIndexes(this.value, ' ').length + 1}`);
  }).addClass(mobileFlag ? '' : 'w3-margin');
}

function createPageBar(object, parent, func) {
  const pageBar = $('<div>', {
    class: 'my-bar',
  }).prependTo(parent);
  $(object).each(function(i) {
    $('<button>', {
      class: `${color} my-paging`,
      html: i + 1,
    }).appendTo(pageBar).click(() => {
      func(i);
    });
  });
  return pageBar;
}

function startTest() {
  function setTimer(second) {
    function startTimer() {
      min = parseInt(timer / 60);
      sec = parseInt(timer % 60);

      if (timer < 0) {
        return;
      }
      const secStr = sec < 10 ? `0${sec.toString()}` : sec.toString();
      if (time.length) time.html(min.toString() + `:${secStr}`);
      timer--;
      setTimeout(() => startTimer(), 1000);
    }
    var time = $('#time');
    var timer = second;
    var min = 0;
    var sec = 0;
    startTimer();
  }

  function playAudio(link, onEnd) {
    audio = Audio(link);
    // audio = document.createElement('audio')
    // audio.src = link
    // testDiv.appendChild(audio)
    const promise = audio.play();

    if (promise != undefined) {
      promise.catch(() => {
        // Auto-play was prevented
        // Show a UI element to let the user manually start playback
        article.toggle();
        let button = $('#playAudio', testDiv);
        if (!button) {
          button = $('<button>', {
            class: `${color} w3-button w3-block w3-section w3-hide`,
            id: 'playAudio',
            html: 'Play Audio',
          }).prependTo(testDiv);
        }
        button.toggle();
        button.click(() => {
          audio.play();
          article.toggle();
          button.toggle();
          audio.onended = () => onEnd();
        });
      }).then(() => audio.onended = () => onEnd);
    }
  }

  function waitTime(second, onTimeout) {
    setTimer(second);
    setTimeout(() => onTimeout, second * 1000);
  }

  function endTest() {
    testDiv.remove();
    toggleElement();
  }

  function recordAudio() {
    const data = [];

    const onFulfilled = (stream) => {
      mediaRecorder = MediaRecorder(stream);

      mediaRecorder.on('stop', () => {
        const blob = Blob(data, {
          'type': 'audio/mp3',
        });
        audioURL = window.URL.createObjectURL(blob);

        $('<a>', {
          src: audioURL,
        }).prop({
          controls: true,
        }).appendTo(testDiv);
      });
      mediaRecorder.on('dataavailable', (event) => data.push(event.data));
      return mediaRecorder;
    };
    navigator.mediaDevices.getUserMedia({
      audio: true,
    }).then(onFulfilled);
  }

  function navigateQuestion(button, question) {
    let index = set.questions.indexOf(question);
    index = Math.abs($(button).text() == 'Next' ? index + 1 : index - 1);
    setAnswer(question);

    if (index == set.questions.length) {
      const modal = createModal('Confirm', () => {
        modal.parent().remove();
        showModal(location.href);
      });
      $('<p>', {
        class: 'w3-large w3-center',
        html: '<b>Confirm to End the Test</b>',
      }).insertAfter($('.w3-bar:eq(0)', modal));
    } else {
      showQuestion(index);
    }
  }

  function setAnswer(question) {
    const index = set.questions.indexOf(question);
    let answer = question.answer;
    let flag;

    myAnswer[index] = '';
    if ($('.choice table', question).length) {
      const table = $('table', questions[id - 1]);
      for (let i = 1; i < table.rows.length; i++) {
        const element = table.rows[i];
        const inputs = $('input', element);
        flag = false;
        inputs.each(function() {
          const element = inputs[j];
          if (element.checked) {
            myAnswer[id - 1] += `${j}`;
          }
          flag = true;
        });
        if (!flag) {
          if (!myAnswer[id - 1]) {
            myAnswer[id - 1] = '';
          }
          myAnswer[id - 1] += 'N';
        }
      }
      if (location.href.match('reading')) {
        const category = answer.split('@');
        const keys = Array(answer.length + 1);
        answer = '';
        category[0].each(function() {
          keys[+category[0]] = 0;
        });
        category[1].each(function() {
          keys[+category[1]] = 1;
        });
        keys.each(function() {
          if (keys[i] !== 'A' && keys[i] !== 'B') {
            keys[i] = 'N';
          }
          answer += keys[i];
        });
      }
    } else if (question.type == 'select') {
      $('.sentence', passageDiv).each(function(i) {
        if ($(this).css('fontWeight') == '700') {
          myAnswer[index] = i;
        }
      });
    } else if (question.type == 'entry') {
      myAnswer[index] = $('section .my-border').val();
    } else {
      $('input:checked', questionDiv).each(function() {
        myAnswer[index] += $('input', questionDiv).index($(this));
      });
    }
  }

  function showModal() {
    if (location.href.match(/-speaking|-writing/)) {
      modal = createModal();
      p = $('<p>').appendTo(modal);
    } else {
      modal = reviewQuestions();
      // answering and correct rate

      const error = $('i', modal).filter(function() {
        return !$(this).text().match(/[a-z]/);
      }).length;
      $('<p>', {
        class: 'w3-padding w3-section',
        html: `<b>${myAnswer.length - error} of ${myAnswer.length}</b> answered questions are correct.`,
      }).insertAfter($('.w3-bar:eq(0)', modal));
    }

    if (location.href.match('speaking')) {
      p.html($('audio', testDiv).outerHTML);
    }
  }

  function reviewQuestions(question) {
    function saveExit() {
      function downloadResponse(url, fileName) {
        $('<a>', {
          href: url,
          download: fileName,
        }).appendTo(testDiv)[0].click();
      }

      if (location.href.match('speaking')) {
        downloadResponse(audioURL, html.replace('.html', '-recording.mp3'));
      } else if (location.href.match('writing')) {
        let text = $('textarea').value.replace('\n', '</p><p>', testDiv);
        text = `<p>${text}</p>`;

        const blob = Blob([text], {
          type: 'text/plain',
        });
        downloadResponse(window.URL.createObjectURL(blob), html);
      } else {
        const text = $('table', testDiv).outerHTML;

        const blob = Blob([text], {
          type: 'text/plain',
        });
        downloadResponse(window.URL.createObjectURL(blob), html);
      }
    }

    function checkAnswer(i) {
      const answer = set.questions[i].answer;
      let text = '';
      let ans = '';

      if (typeof answer == 'string' && set.questions[i].type != 'entry') {
        answer.split('').forEach((a) => text += String.fromCharCode(65 + +a));
      } else ans = myAnswer[i];

      if (!set.questions[i].type.match(/select|entry/)) {
        myAnswer[i].split('').forEach((a) => ans += String.fromCharCode(65 + +a));
      } else text = answer;

      return myAnswer[i] === answer ? `<b>${text}</b>` : `<i>${ans}</i> -> <b>${text}</b>`;
    }

    if (question) {
      setAnswer(question);
    }

    modal = createModal('Review Test', () => {
      saveExit();
      endTest();
    });

    const table = $('<table>', {
      class: 'w3-padding-small',
    }).insertAfter($('.w3-bar:eq(0)', modal));
    let tr = $('<tr>', {
      class: color,
    }).appendTo($('<thead>').appendTo(table));
    $('<td>', {
      html: 'Question',
    }).appendTo(tr);
    $('<td>', {
      html: 'Option',
    }).appendTo(tr);

    const tbody = $('<tbody>').appendTo(table);
    $(set.questions).each(function(i) {
      if (myAnswer[i] == undefined) {
        myAnswer[i] = '';
      }

      tr = $('<tr>').appendTo(tbody).click(() => {
        modal.parent().remove();
        showQuestion(i);
      });

      $('<td>', {
        class: `my-click ${mobileFlag ? 'my-padding-left' : ''}`,
        html: `${i + 1}. ${this.stem.replace(/<\/?p>/g, '')}`,
      }).appendTo(tr).css({
        maxWidth: 200,
        overflow: 'hidden',
        whiteSpace: 'nowrap',
        textOverflow: 'ellipsis',
      }).addClass(mobileFlag ? 'w3-medium' : '');
      let text = '';
      if (!this.type.match(/entry/)) {
        myAnswer[i].split('').forEach((a) => text += String.fromCharCode(65 + +a));
      } else text = myAnswer[i] ? +myAnswer[i] : '';
      $('<td>', {
        html: question ? text : checkAnswer(i),
      }).appendTo(tr);
    });

    if (question) {
      modal.parent().show();
    } else return modal;
  }

  function showQuestion(index) {
    const question = set.questions[index];

    createQuestion(question, passageDiv, questionDiv, index);

    inputs = $('.my-label input', testDiv);

    // Previous and Next Button
    const div = $('<div>', {
      class: 'w3-bar w3-display-container w3-section ',
    }).appendTo(questionDiv);
    $('<button>', {
      class: `${color} w3-button w3-left`,
      html: 'Previous',
    }).appendTo(div);

    // Time Ticking
    time.hide();
    timer = $('<span>', {
      class: 'w3-display-middle w3-xxlarge',
    }).appendTo(div);

    // Callback function to execute when mutations are observed

    // Create an observer instance linked to the callback function
    // Start observing the target node for configured mutations
    new MutationObserver(() => {
      timer.html(`<b>${time.text()}</b>`);
    }).observe(time[0], {
      childList: true, // Options for the observer (which mutations to observe)
    });

    $('<button>', {
      class: `${color} w3-button w3-right`,
      html: 'Next',
    }).appendTo(div);

    // show current number of all number
    $('<p>', {
      class: 'w3-xlarge w3-center my-margin-small',
      html: `<b>Questions ${index + 1} of ${set.questions.length}</b>`,
    }).appendTo($('<div>', {
      class: 'w3-section',
    }).appendTo(questionDiv));

    // Review Button
    $('<button>', {
      class: `${color} w3-button w3-block`,
      html: 'Review Questions',
    }).appendTo(questionDiv).click(() => {
      reviewQuestions(question);
    });
    $('button', div).click(function() {
      navigateQuestion(this, question);
    });

    if (!getPassage(question) && greFlag) { // Not Reading Comprehension
      questionDiv.removeClass(mobileFlag ? '' : 'w3-half');
      passageDiv.removeClass(mobileFlag ? '' : 'w3-half');
    } else { // Reading Comprehension
      if (mobileFlag) {
        questionDiv.css({
          borderTop: `3px solid ${bgColor}`,
        });
        setArticleHeight(screen.height - questionDiv[0].offsetHeight + 40);
      } else {
        setArticleHeight(680);
        questionDiv.addClass('w3-half');
        passageDiv.addClass('w3-half');
      }
    }

    if (!greFlag) showSpecialQuestion(passageDiv, questionDiv);

    // select sentence question
    if (question.type == 'select') {
      // split sentence with span
      addSentence(passageDiv);

      // Add sentence click event
      addFilterClick('article .sentence', ['my-highlight']);
    }

    // click Options
    if (myAnswer[index]) {
      options = myAnswer[index];
      if (question.type == 'select') {
        $('.sentence', passageDiv)[options].click();
      } else if (question.type == 'entry') {
        $('section .my-border').val(myAnswer[index]);
      } else {
        $(options.toString().split('')).each(function() {
          if (options.length > 4) {
            option = +this;
            if (option != 13) {
              const elem = inputs[i * 2 + option].parentNode;
              $('.my-checkbox', elem).css({
                background: bgColor,
              });
              elem.children[0].checked = true;
            }
          } else {
            $('input', questionDiv)[+this].click();
            if (!greFlag && section.children[1].text().length < 3) {
              insertArea[+this].text(`${section.children[0].text().split('.')[1]}. `);
            }
          }
        });
      }
    }
  }

  const seconds = [
    ['45', '60', '60'],
    ['15', '30', '20'],
  ];

  testDiv = $('<div>', {
    class: 'w3-container',
  }).appendTo(body);
  if (set.questions) myAnswer = Array(set.questions.length);

  toggleElement();
  passageDiv = $('<article>', {
    class: 'w3-half my-padding',
  }).appendTo(testDiv).hide();
  questionDiv = $('<section>', {
    class: 'w3-half my-padding',
  }).appendTo(testDiv);
  time = $('<p>', {
    id: 'time',
    class: 'w3-xxlarge w3-center my-margin-small my-highlight',
  }).appendTo(testDiv);

  if (greFlag) {
    if (link.match(/-[ia]/)) {
      passageDiv.html(set.question);
      addTextarea(questionDiv);
      waitTime(1800, showModal);
    } else {
      function getCountdown() {
        if (set.questions.length == 25) countdown = 2100;
        else if (set.questions.length == 20) countdown = 1800;
        else {
          countdown = Math.ceil(set.questions.filter((q) => !q.stem.match(/_/)).length * 1.75 + set.questions.filter((q) => q.stem.match(/_/)).length * 1.25) * 60;
        }
        return countdown;
      }
      waitTime(getCountdown(), showModal);
      showQuestion(0);
    }
  } else if (link.match(/-r/)) {
    waitTime(1200, showModal);
    showQuestion(1);
  } else if (link.match(/-l/)) {
    article.toggleClass('w3-half');
    const button = $('<button>', {
      class: `${color} w3-button w3-block w3-section w3-hide`,
      html: 'Next',
    }).appendTo(testDiv);
    button.onclick = () => navigateQuestion(this);

    function showListeningQuestion(index) {
      id = questions[index].id;

      function playListening() {
        article.id = element.id;
        article.html($('.question', element).html());
        button.hide();
        time.hide();
        playAudio(html.replace('.html', `-${element.id}.mp3`), () => {
          article.html(element.html());
          inputs = $('input', testDiv);
          button.classList.remove('w3-hide');
          time.classList.remove('w3-hide');
        });
      }

      if ($(questions[index]).is('.replay')) {
        article.html('<p>Listen again to part of the lecture. Then answer the question.</p>');
        button.hide();
        time.hide();
        playAudio(html.replace('.html', `-${element.id}-replay.mp3`), () => playListening());
      } else {
        playListening();
      }
    }

    playAudio(html.replace('.html', '.mp3'), () => {
      setTimer(240);
      showListeningQuestion(1);
    });
  } else if (link.match(/-s/)) {
    if (location.href.startsWith('file:/')) {
      mediaRecorder = recordAudio();
    }

    article.toggleClass('w3-half w3-section');

    playListening = () => {
      article.toggle();
      time.toggle();
      playAudio(html.replace('.html', '.mp3'), playQuestion);
    };
    playQuestion = () => {
      article.html(questionDiv.html());
      article.classList.remove('w3-hide');
      playAudio(html.replace('.html', '-question.mp3'), startPreparation);
    };
    startPreparation = () => playAudio('../../speaking_beep_prepare.mp3', waitPreparation);
    waitPreparation = () => {
      time.classList.remove('w3-hide');
      waitTime(seconds[1][Math.ceil(num / 2) - 1], startSpeak);
    };
    startSpeak = () => playAudio('../../speaking_beep_answer.mp3', waitSpeak);
    waitSpeak = () => {
      if (location.href.startsWith('file:/')) {
        mediaRecorder.start();
        waitTime(seconds[0][Math.ceil(num / 2) - 1], () => {
          mediaRecorder.stop();
          waitTime(1, showModal);
        });
      } else {
        const handleSuccess = (stream) => {
          const audio = document.createElement('audio');
          if (window.URL) {
            audio.src = window.URL.createObjectURL(stream);
          } else {
            audio.src = stream;
          }
          audio.setAttribute('controls', 'controls');
          testDiv.appendChild(audio);
        };

        navigator.mediaDevices.getUserMedia({
          audio: true,
        }).then(handleSuccess);
      }
    };

    if (num < 3) {
      playQuestion();
    } else if (num > 4) {
      playListening();
    } else {
      playAudio(html.replace('.html', '-reading.mp3'), () => {
        article.html(reading.html());
        waitTime(45, playListening);
      });
    }
  } else if (link.match(/-w/)) {
    addTextarea(questionDiv);
    if (link.match(/1$/)) {
      article.html(reading.html());
      waitTime(180, endReading);

      function playListening() {
        playAudio(html.replace('.html', '.mp3'), waitWriting);
      }

      function endReading() {
        wordCountDiv.toggle();
        article.toggle();
        playListening();
      }

      function waitWriting() {
        article.toggle();
        wordCountDiv.toggle();
        waitTime(1200, showModal);
      }
    } else {
      passageDiv.html(questionDiv.html());
      waitTime(1800, showModal);
    }
  }
}

function getCategoryLink(button) {
  const parent = mobileFlag ? button.parent().parent().parent() : button.parent();
  const set = parent.children().eq(0).text();
  const section = button.text().replace(/(\w).*(\d)/, '$1$2');
  return `${set}-${section}`.toLowerCase();
}

function addDropDown(section, length, parent) {
  if (mobileFlag) {
    dropdown = $('<div>', {
      class: 'w3-dropdown-click',
    }).appendTo(parent);
    $('<button>', {
      class: `w3-bar-item w3-button w3-padding-small ${color}`,
      html: section,
    }).appendTo(dropdown);
    dropdownContent = $('<div>', {
      class: 'w3-dropdown-content w3-bar-block w3-card',
    }).appendTo(dropdown);
  }
  for (let i = 1; i <= length; i++) {
    if (mobileFlag) {
      if (dropdown.parent().is('.w3-bar')) {
        dropdownContent.css({
          marginTop: 32,
        });
      }
      if (!dropdown.parent().is('.w3-bar')) {
        dropdownContent.width('-webkit-fill-available');
      }

      $('<button>', {
        class: 'w3-bar-item w3-button',
        html: `${section} ${i}`,
      }).appendTo(dropdownContent);
    } else {
      $('<button>', {
        class: `${color} w3-padding-small w3-bar-item w3-button w3-medium`,
        html: `${section.replace('ing', '').replace('Writ', 'Write')}${i}`,
      }).appendTo(parent);
    }
  }

  $('#setsDiv .w3-dropdown-content button, #setsDiv button.w3-medium').unbind().click(function() {
    // link = window.link.match(/^\w+-\w+\d$/) ? window.link : getCategoryLink($(this));
    execScripts(getCategoryLink($(this)));
    window.number = '';
  });
  $('.w3-dropdown-click button').each(function() {
    $(this).click(function() {
      $('.w3-dropdown-content').each(function() {
        $(this).hide();
      });
      $(this.nextElementSibling).toggle();
    });
  });
}

// Add Category Filter for test set page
function addCategoryFilter(name) {
  function addSet(set, parent) {
    $('<span>', {
      class: `w3-bar-item w3-button w3-padding-small ${color}`,
      html: set.toUpperCase(),
    }).appendTo(parent).addClass(mobileFlag ? '' : `w3-medium`).click(function() {
      if ($(this).next().is('.w3-dropdown-click')) return;
      const sectionDiv = $(this).parent();
      $(Object.entries(sections)).each(function() {
        addDropDown(this[0], this[1], sectionDiv);
      });
    });
  }
  var sections = {
    Reading: 3,
    Listening: 6,
    Speaking: 6,
    Writing: 2,
  };

  if (!link.match(/-/)) $('.w3-bar', main).remove();

  if (setFlag = link.match(/[rlsw]\d/)) {
    length = 1;
  } else {
    length = literals.tests.toefl[name.toLowerCase()];
  }

  setsDiv = $('#setsDiv');

  // add sets
  for (let i = 1; i <= length; i++) {
    const number = (i < 10 && name != 'OG' ? `0${i}` : i);
    const set = setFlag ? name : name + number;
    div = $('<div>', {
      class: 'w3-bar w3-section',
    }).appendTo(setsDiv).css({
      fontSize: () => {
        if (!mobileFlag) return 14;
        else return 13;
      },
    });
    if (!setFlag) {
      addSet(set, div);
    }
  }

  if (setFlag) { // Add category Button
    const category = Object.keys(literals.categories).find((k) => k.match(RegExp(`^${link.match(/\w+(?=\d$)/)}`)));
    $(literals.categories[category]).each(function() {
      if (this.links.includes(link)) tag = this.category;
    });

    $(`button:contains('Test')`).prependTo(setsDiv);
    $('<button>', {
      class: `${color} w3-button w3-section`,
      html: `${tag}`,
    }).prependTo(setsDiv).addClass(mobileFlag ? 'w3-left' : '').unbind().click(() => {
      execScripts(`${document.title.match(/\w+ing/)[0]} Category ${tag}`);
    });
    addSet(link.match(/^\w+/)[0].toUpperCase(), $('.w3-bar', setsDiv));

    $('#setsDiv').insertAfter($('main>span'));
  } else { // Add Category tags
    function filterSet(category) {
      // hide sets
      $('#setsDiv > div').each(function() {
        $(this).hide();
      });

      if (!(setDiv = $('#setDiv')).length) {
        setDiv = $('<div>', {
          class: 'w3-section',
          id: 'setDiv',
        }).prependTo($('#setsDiv'));
      }

      setDiv.show();
      setDiv.html('');
      // $('#setsDiv span').click()
      $(category.links).each(function() {
        // let text = `${text.replace(/-/, ' ').toUpperCase()}`
        $('<button>', {
          class: `${color} w3-button w3-padding-small my-margin-small`,
          html: this,
        }).appendTo(setDiv).unbind().click(function() {
          // link = window.link.match(/^\w+-\w+\d$/) ? window.link : text.replace(/ /, '-').toLowerCase()
          execScripts($(this).text());
          window.number = '';
        });
      });
    }

    categoriesDiv = $('<div>', {
      id: 'categoriesDiv',
    }).prependTo(main);

    div = $('<div>', {
      class: `w3-bar w3-card ${color} my-flex-container`,
    }).appendTo(categoriesDiv);

    // sections category
    $(Object.keys(sections)).each(function() {
      button = $('<button>', {
        class: 'w3-bar-item w3-button w3-hide w3-show',
        html: this,
      }).appendTo(div).css({
        flex: 1,
      }).click(function() {
        $('#tagsDiv').html('');
        $(literals.categories[$(this).text().toLowerCase()]).each(function() {
          createTag(this.category, $('#tagsDiv'), () => {
            filterSet(this);
          });
        });
        addFilterClick('#tagsDiv button', ['my-highlight', 'w3-text-white', color]);
      });
    });
    if (!(searchBtn = $('#searchBtn', main))) {
      searchBtn = createSearchBtn(div, filterNodes);
    }

    $('<div>', {
      id: 'tagsDiv',
      class: 'w3-padding-small w3-card w3-white',
    }).appendTo(categoriesDiv);
  }
}

function getPassage(question) {
  const id = set.questions.indexOf(question);
  return set.passages ? set.passages.find((p) => id <= +p.end && id >= +p.start) : '';
}

function getImageLink(path) {
  if (typeof tex != 'undefined') {
    tex.forEach((t) => path = path.replace(RegExp(`<img src=..{\\w+}/${t.image}.png">`), `${t.tex.match(/\[\]/) ? `${t.tex}` : `\`${t.tex}\``}`));
  }

  if (path.match(/`(.*?)`/g)) {
    path.match(/`(.*?)`/g).forEach((m) => {
      path = path.replace(m, m.replace(/`(.*?)<(.*?)`/g, '`$1&lt$2`'));
    });
  }

  if (link.match(/-q/)) {
    path = path.replace(/(<\/?i>|`)(.*?)(<\/?i>|`)(?!<\/b>)/g, `<span class="my-tex ${path.match(/^`.*`$/) ? 'my-container' : ''}">$2</span>`);
  }

  return eval(`\`${path.replace(/\$\{/g, `${ebooksRoot}/\${literals.epub.`)}\``);
}

function createQuestion(question, passageDiv, questionDiv, i) {
  questionDiv.html('');
  passageDiv.html('').hide();
  // Show Reading Comprehension question related passage if exist

  const passage = getPassage(question);
  if (set.passage) {
    passageDiv.html(set.passage.replace(/<\/span>(\w)/g, '<\/span> $1'));
  } else if (passage) passageDiv.html(getImageLink(passage.passage)); // .addClass('my-padding my-card')
  // else passageDiv.removeClass('my-padding my-card')
  passageDiv.css({
    maxHeight: mobileFlag && passageDiv.html() ? screen.height / 2 : 'unset',
  });
  if (passageDiv.html()) passageDiv.show();

  $('<div>', {
    html: `<p>${i + 1}. ${getImageLink(question.stem)}</p>`,
  }).appendTo(questionDiv);

  if (question.stem.match(/above|^<img/)) {
    $('img:eq(0)', questionDiv).wrap($('<div>', {
      class: 'my-container w3-section',
    }));
  }

  const choices = question.type != 'compare' ?
    question.choices : [
      ['Quantity A is greater.',
        'Quantity B is greater.',
        'The two quantities are equal.',
        'The relationship cannot be determined from the information given.',
      ],
    ];
  let type = question.type;

  if (question.type == 'compare') {
    type = 'radio';
    const quantityDiv = $('<div>', {
      class: 'my-flex-container',
    }).appendTo(questionDiv);

    // quantity value
    for (let i = 0; i < 2; i++) {
      const href = getImageLink(question.quantities[i]);
      $('<div>', {
        class: `w3-center w3-margin w3-padding`,
        html: `<p>Quantity ${String.fromCharCode(65 + i)}:</p><p>${href}</p>`,
      }).appendTo(quantityDiv).css({
        overflow: 'auto',
      });
    }
  } else if (question.type == 'entry') {
    const inputDiv = $('<div>', {
      class: `w3-section w3-margin w3-center`,
      html: getImageLink(question.entry).replace(/(.*)?\[\](.*)?/, '<span>$1</span><input><span>$2</span>'),
    }).appendTo(questionDiv);

    inputDiv.children().addClass(`my-highlight my-padding w3-large`).css({
      maxWidth: screen.width / 2,
    });
  }

  const choicesDiv = $('<div>', {
    // multiple blank question
    class: question.stem && question.stem.match(/_/) && !mobileFlag ? 'my-flex-container' : '',
  }).appendTo(questionDiv);

  // Update choices
  if (choices) {
    $(choices).each(function(i) {
      choiceDiv = $('<div>', {
        class: `${!mobileFlag ? 'w3-margin' : ''} my-padding`,
      }).appendTo(choicesDiv);

      $(this).each(function() {
        createChoiceInput(choiceDiv, type, getImageLink(this.toString()), type + i);
      });
    });
  } else if (question.table) {
    if (set.name.match(/-r/)) question.table.columns.push('Not Selected');
    const table = $('<table>').appendTo(questionDiv);
    tr = $('<tr>').appendTo($('<thead>').appendTo(table));

    $(question.table.columns).each(function() {
      $('<th>').appendTo(tr).html(this);
    });

    $(question.table.rows).each(function(j) {
      tr = $('<tr>').appendTo(table);
      for (let i = 0; i < question.table.columns.length; i++) {
        if (!i) $('<td>').appendTo(tr).html(this);
        else createChoiceInput($('<td>').appendTo(tr), 'radio', ' ', `radio${j}`);
      }
    });
  }
  addScripts('svg', () => {
    getSVG($('img', passageDiv));
  });
  // $('.my-label .my-flex-container').removeClass('my-flex-container')
  // questionDiv.addClass('my-padding my-card')
}

function addSentence(article) {
  let passage = article.html().replace('. . . ', '&#8230; ');
  passage = passage.replace(/\s{2,}</g, '<');
  passage = passage.replace(/([^A-Z][a-z0-9][\)\>]?[?!\.])('?)\s{1}/g, `$1$2</span> <span class='sentence my-click'>`);
  passage = passage.replace(/<p>/g, `<p><span class='sentence my-click'> `);
  passage = passage.replace(/<\/p>/g, '</span></p>');
  return article.html(passage);
}

function createAudio(name, parent = main) {
  const div = $('<div>', {
    class: 'w3-section',
  }).appendTo(parent);
  $('<audio>', {
    src: `${audioRoot}/toefl/${name.replace(/\d+-.*/, '')}/${name.replace(/-.*/, '')}/${name}.mp3`,
  }).prop({
    controls: true,
  }).appendTo(div);
  return div;
}

function showQuestions() {
  function showQuestion() {
    if ($('#question').length) return;
    const div = $('<div>', {
      class: 'w3-section',
    }).appendTo(main);
    const passageDiv = $('<div>', {
      id: 'passage',
    }).appendTo(div).css({
      overflow: 'auto',
    }).hide();
    const questionDiv = $('<div>', {
      id: 'question',
    }).appendTo(div);

    const pageBar = createPageBar(set.questions, div, function(i) {
      window.number = i;

      question = set.questions[i];

      createQuestion(question, passageDiv, questionDiv, i);

      const div = $('<div>', {
        class: 'w3-bar',
      }).appendTo(questionDiv); // this div is for button to display in block

      explanation = $('<div>', {
        html: `<p>${getImageLink(question.explanation)}</p>`,
        class: `my-explanation`,
      }).appendTo(questionDiv).hide();

      $('<button>', {
        class: `${color}`,
        html: 'Show Answer',
      }).addClass(mobileFlag ? 'w3-btn' : 'w3-button').appendTo(div).click(function() {
        explanation.show();
        addHighlight($('em, i', explanation));
        const input = $('#question input:visible');
        // Click Choices
        if (typeof question.answer == 'number') {
          article = addSentence(passageDiv);
          addHighlight($($('.sentence', article)[question.answer]));
        } else if (input.length) {
          input.val(question.answer);
        } else if (question.type == 'table') {
          $(question.answer.split('')).each(function(i) {
            $('input', $('tr').eq(i + 1)).eq(+this)[0].click();
          });
        } else {
          $(question.answer.split('')).each(function(i) {
            const option = $('input', questionDiv).eq(+this);
            if (questionDiv.text().match(/_/)) {
              let replacement;
              if ($('input', questionDiv).attr('type') == 'checkbox' && i == 0) {
                replacement = `${option.parent().text().replace(/^[A-I] /, '')} or _`;
              } else {
                replacement = option.parent().text().replace(/^[A-I] /, '');
              }
              $('p:eq(0)', questionDiv).html((i, html) => html.replace(/\(i+\) */g, '').replace(/_+/, `<u>${replacement}</u>`));
            }
            option[0].click();
          });
        }
        if ($('input', questionDiv).attr('type') == 'checkbox') {
          const synonyms = [];

          function hasWord(synonym, word) {
            let flag = false;
            synonym.split(', ').forEach((s) => {
              if (vocabulary.find((w) => w.id == word) && vocabulary.find((w) => w.id == word).word.family.find((w) => w.w == s)) {
                flag = 1;
                return;
              }
            });
            return flag;
          }
          $('.my-label b[id]', questionDiv).each(function(i) {
            const text = $(this).text();
            const synonym = vocabulary.find((w) => w.id == $(this).text()).word.synonyms;
            $('.my-label', questionDiv).each(function() {
              const thisWord = $(this).text().replace(/^an? /, '');
              if (text != thisWord && hasWord(synonym, thisWord) && !synonyms.includes(`${thisWord}, ${text}`)) {
                synonyms.push(`${text}, ${thisWord}`);
              }
            });
          });
          synonyms.forEach((s) => {
            $('<p>', {
              html: s,
            }).appendTo($(this).parent());
          });
        }
        if (!link.match('-q')) addWord(`#question p:eq(0)`);
      });

      if (!link.match('-q')) addWord(`#passage, #question>:not('.w3-bar')`);
      if (!greFlag) showSpecialQuestion(passageDiv, questionDiv);

      addNavigator(main, set.questions, i, (index) => {
        $('.my-paging').eq(index).click();
      });

      // TOEFL listening
      const times = $('[data-time]', main);
      let n = 0;
      const audio = $('.w3-section>audio');
      if (times.length) {
        audio[0].ontimeupdate = () => {
          const time = $(times[n]);
          const duration = parseFloat(time.data('time')) + parseFloat(time.data('length'));
          const parent = time.parent();
          time[0].scrollIntoView();
          $('html').scrollTop(-32);
          if (parseFloat(audio[0].currentTime.toFixed(2)) < duration) {
            // screen.scrollTop(parent.offset().top - 320)
            addHighlight(parent);
          } else {
            removeHighlight(parent);
            n++;
          }
        };
      }
    });

    if (set.name.match(/-l/)) { // TOEFL listening
      pageBar.after(createAudio(set.name));
    }
  }

  if (set.questions) { // Update Reading and Listening
    showQuestion();
    if (window.number) $('.w3-section button').eq(+window.number).click();
  } else { // Update Speaking and Writing
    if (set.reading) {
      $('<div>', {
        html: `<h4>Reading</h4>${set.reading}`,
      }).appendTo(main).children('h4').click(function() {
        $(this).parent().children(':not(:header)').toggle();
        $(this).show();
      });
    }

    if (set.listening) {
      createAudio(set.name);
      $('<div>', {
        html: `<h4>Listening</h4>${set.listening}`,
      }).appendTo(main);
    }

    $('<div>', {
      html: `<h4>Questions</h4>${set.question}`,
    }).appendTo(main);

    if (set.strategy) {
      $('<div>', {
        html: `<h4>Strategy</h4>${set.strategy}`,
      }).appendTo(main).children('h4').click(function() {
        $(this).parent().children(':not(:header)').toggle();
        $(this).show();
      });
    }

    const responses = set.responses;
    if (responses.length > 1) {
      div = $('<div>').appendTo(main);

      responseDiv = $('<div>', {
        id: 'responseDiv',
      }).appendTo(div);
      const pageBar = createPageBar(responses, div, function(i) {
        responseDiv.html($(responses[i]));
      });
      $(responses).each(function(i) {
        addNavigator(main, responses, responses[i], (element) => {
          $('.w3-button', pageBar).eq(responses.indexOf(element)).click();
        });
      });
      `w3-bar-item w3-button`;
    } else {
      $('<div>', {
        html: responses[0].match(/<h/) ? responses[0] : `<h4>Sample Response</h4>${responses[0]}`,
      }).appendTo(main);
    }
  }
}

// #endregion

// #region vocabulary

function addWordAudio(word, flag) {
  word = word.word ? word.word : word;

  if (!$('#wordAudios').length) {
    $('<div>', {
      id: `wordAudios`,
    }).appendTo(main);
  }

  if ($(`#${word}Audio`).length) {
    if (!flag) $(`#${word}Audio`)[0].play();
  } else {
    $('<audio>', {
      id: `${word}Audio`,
      src: `https://audio.lexico.com/mp3/${word}_us_1.mp3`,
    }).appendTo($('#wordAudios')).on('error', function() {
      const src = this.src;
      if (src.match(/\/con/)) {
        this.src = src.replace(word, `x${word}`);
      } else if (src.match('_us_1')) {
        this.src = src.replace('us_1', 'us_2');
      } else if (src.match('_us_2')) {
        this.src = src.replace('us_2', 'us_3');
      } else if (src.match('_us_3')) {
        this.src = `https://www.collinsdictionary.com/us/sounds/e/en_/en_us/en_us_${word}_2.mp3`;
      } else if (src.match(`${word}_2`)) {
        this.src = `https://www.collinsdictionary.com/us/sounds/e/en_/en_us/en_us_${word}_1.mp3`;
      } else {
        $(this).remove();
      }
    });
  }
}

function addSound(word, parent) {
  const icon = createIcon('speaker', parent).appendTo(parent);
  return icon.addClass('my-click').click(() => addWordAudio(word));
}

function addNavigator(parent = main, array, element, func) {
  function navigate(div) {
    index = $('#question').text().match(/^\d+/)[0] - 1; // if (array[0].stem)
    const sets = window[document.title.match(/^\w+/)[0].toLowerCase()];
    if (parent.is('.w3-modal-content')) parent.parent().remove();
    if (div.is('.w3-left')) {
      if (index > 0) func(--index);
      else {
        execScripts(sets[sets.findIndex((s) => s.name == link) - 1].name);
      }
    } else {
      if (index < array.length - 1) func(++index);
      else {
        execScripts(sets[sets.findIndex((s) => s.name == link) + 1].name);
      }
    }
  }
  let index = typeof element == 'number' || !array ? element : array.indexOf(element);
  ['left', 'right'].forEach((pos) => {
    if ($(`#${pos}NavBtn`).length) return;
    $('<div>', {
      id: `${pos}NavBtn`,
      class: `w3-${pos} my-click`,
    }).prependTo(parent).css({
      height: '100%',
      width: screen.width * 0.04,
      position: 'fixed',
    }).css(`${pos}`, 0).click(function() {
      if (array) navigate($(this));
      else if (mobileFlag) {
        noteContent.hide();
        if ($(this).is('.w3-left')) {
          sideTOC.show();
        } else {
          sideLinks.show();
        }
      }
    });
  });
}

function showWordModal(word, target) {
  const modal = createModal(`Word Detail: ${word.word}`);
  const heading = 'h5';
  // word content div
  const div = $('<div>', {
    class: 'my-margin-small',
    id: `${word.word}`,
  }).appendTo(modal);
  const termDiv = $('<div>', {
    class: 'w3-xlarge w3-center',
  }).appendTo(div);

  $('<a>', {
    href: `https://www.google.com/search?q=define+${word.word}`,
    html: `<b>${word.word}</b>`,
  }).appendTo(termDiv);

  let sound = addSound(word, termDiv);
  if (target && target != word.word) {
    $('<a>', {
      class: 'w3-large',
      href: `https://www.google.com/search?q=define+${target}`,
      html: `<br><b>${target}</b>`,
    }).appendTo(termDiv).css({
      textDecoration: 'none',
    });
    sound = addSound(target, termDiv);
  }
  sound.click();

  // details
  $(Object.keys(word).concat('examples')).filter(function() {
    return !this.match(/word/);
  }).each(function() {
    const detailDiv = $('<div>', {
      class: 'w3-padding-small',
    }).appendTo(div);

    detailDiv.html(`${detailDiv.html()}<${heading}>${this}</${heading}>${word[this]}`);

    if (this == 'synonyms') {
      detailDiv.html(detailDiv.html().replace(RegExp(`/${heading}>(.*)`), `/${heading}><div class="syn">$1</div>`));
      $('div', detailDiv).each(function() {
        $(this).html($(this).html().replace(/(\w{3,})/g, `<a class='my-link' href='https://www.google.com/search?q=define+$1'>$1</a>`));
      });
    } else if (this == 'family') {
      const members = word[this];

      function getChildren(parent, family) {
        let words = [];
        words = members.filter((word) => word.p == parent);

        if (words.length == 0) {
          return family;
        }

        if (!parent) {
          parent = '';
        }

        $(words).each(function() {
          family = family.replace(parent, `${parent}<ul><li>${this.w}</li></ul>`);
          family = getChildren(this.w, family);
        });
        return family;
      }

      family = getChildren(null, ``);
      detailDiv.html(`${detailDiv.html().replace(RegExp(`<${heading}>${this}.*`), '')}<${heading}>${this}</${heading}>${family}`);

      $('li', detailDiv).each(function() {
        const a = $('<a>', {
          class: 'my-link',
          href: (`https://www.google.com/search?q=define+${this.childNodes[0].textContent}`),
          text: this.childNodes[0].textContent,
        }).prependTo($(this));
        this.childNodes[1].textContent = '';
        if (target == this.childNodes[0].textContent) addHighlight(a);
      });
    } else if (this == 'etymology') {
      detailDiv.html(detailDiv.html().replace(/'(.*?)'/g, `<b>'$1'</b>`));
    } else if (this == 'definitions') {
      detailDiv.html(detailDiv.html().replace(RegExp(`${this}</${heading}>(.*)`), `${this}</${heading}><div class="def">$1</div>`));

      const textarea = $('<textarea>', {
        class: 'my-border my-padding-small w3-block',
      }).prependTo(detailDiv).hide();
      $(heading, detailDiv).click(() => {
        textarea.toggle().focus();
      });
    } else if (this == 'examples') {
      detailDiv.html(detailDiv.html().replace(/undefined/g, ``));
      findWords(target ? target : word.word, detailDiv, true);
    }
  });
  $(heading, div).click(function() {
    $(this).parent().children().toggle();
    $('textarea', $(this).parent()).toggle().focus();
    $(this).show();
  }).each(function() {
    if ($(this).text().match(/family|etymology/)) $(this).click();
  });
  addWord('.syn, .def', modal);

  if (typeof passageDiv != 'undefined' && !passageDiv.length) {
    addNavigator(modal, words, word, showWordModal);
  }
}

function addWord(selector, modal) {
  $(selector, modal).each(function() {
    const content = $(this);
    $(content.html().match(/\b[a-zA-Z]{3,}\b/g)).each(function() {
      function findWord(query) {
        if ($(`#${query}`, modal).length) return;
        let results = words.filter((word) => word.family.find((w) => w.w == query));
        if (!results.length) results = words.filter((word) => word.word == query);
        if (results.length) {
          let parent = query;
          const parents = [parent];
          do {
            parent = results[0].family.find((w) => w.w == parent);
            parent = parent ? parent.p : '';
            parents.push(parent);
          } while (parent);
          results = results.filter((w) => parents.includes(w.word));
          return results.length > 1 ? results.pop() : results.shift();
        }
      }

      const query = this.toString().replace(/our\b/, 'or');

      if (word = findWord(query.toLowerCase())) {
        const regexp = RegExp(`([^=][^'/])\\b${this}\\b`, 'g');
        content.html(content.html().replace(regexp, `$1<b id='${query}' class='my-click'>${this}</b>`));
        if (!vocabulary.find((w) => w.word == word)) {
          vocabulary.push({
            word: word,
            id: query,
          });
        }
        addWordAudio(word, true);
        addWordAudio(query, true);
        const id = $('.my-margin-small', modal).attr('id');
        $(`#${query}`, modal).unwrap('a').wrap(id && word.synonyms.match(id) ? '<u></u>' : '');
      }
    });
  });

  $(`b[id]`, modal).click(function() {
    const id = this.id;
    const word = vocabulary.find((w) => w.word.family.find((w) => w.w == id.toLowerCase()) || (!w.word.family.length && w.word.word == id.toLowerCase()));
    if (word) {
      const div = $(`div#${word.word.word}`);
      if (div.length <= 0) {
        showWordModal(word.word, $(this).text());
      } else {
        $('.w3-modal').hide();
        div.parent().parent().show();
        $('img', div)[0];
      }
    }
  });

  $(`.my-label`).click(addInputColor);
}

// #endregion

/**
 * create Table
 * @param {string} caption table caption
 * @param {object} parent parent node
 * @return {object} table node
 */
function createTable(caption, parent = main) {
  const table = $('<table>').appendTo(parent);
  $('<caption>', {html: caption}).appendTo(table);
  return table;
}


/**
 * create pop up modal
 * @param {string} title modal title bar title
 * @param {function} handleSuccess handler for click OK
 * @param {function} handleFail handler for click cancel
 * @param {object} parent parent node for modal div node
 * @return {object} modal div node
 */
function createModal(title = '', handleSuccess, handleFail, parent) {
  const modal = $('<div>', {
    class: 'w3-modal',
  }).appendTo(parent ? parent : main).show();

  const modalContent = $('<div>', {
    class: title ? 'my-padding' : '',
  }).appendTo($('<div>', {
    class: 'w3-modal-content my-round',
  }).appendTo(modal));

  // #region title bar
  if (title) {
    const bar = $('<div>', {
      class: `${color} w3-bar w3-padding my-round-top`,
    }).prependTo(modalContent.parent()).css({
      top: mobileFlag ? -52 : '',
    }).addClass(mobileFlag ? 'my-sticky' : '');
    $('<span>', {
      class: 'w3-left',
      html: title,
    }).appendTo(bar);
    $('<span>', {
      class: 'w3-right my-click',
      html: 'X',
    }).appendTo(bar).click(() => {
      removeModal(modal);
    });
  }
  // #endregion

  // #region button bar
  const buttonBar = $('<div>', {
    class: 'w3-bar',
  }).appendTo(modalContent.parent());

  if (handleSuccess) {
    $('<button>', {
      class: `w3-left`,
    }).html('OK').appendTo(buttonBar).click(handleSuccess);
  }
  if (handleFail) {
    $('<button>', {
      class: `w3-right`,
    }).html('Cancel').appendTo(buttonBar).click(handleFail);
  }
  // #endregion

  modal.unbind().click(function(e) {
    // if the target of the click isn't the container
    // nor a descendant of the container
    if (!modalContent.is(e.target) && modal.has(e.target).length === 0) {
      removeModal(modal);
    }
  });
  return modalContent.parent();
}

function showTest() {
  if (!homeFlag) return;
  const test = link.match(/(GRE|-[iavq]\d*$)/) ? 'gre' : 'toefl';

  if (link.match(/GRE|TOEFL|Category/)) {
    const div = addSetsDiv(test);

    // add essays
    if (link == 'TOEFL') {
      $('<button>', {
        class: `my-btn`,
        html: `Essays`,
      }).appendTo(div.children(0)).click(showEssay);
    }

    /** @todo add comment */
    if (link.match(/Category/)) {
      $(`button:contains('OG')`).click();
      $(`button:contains('${link.split(' ')[0]}')`).click();
      $(`button:contains('${link.split(' ')[2]}')`).click();
    }
  } else if (link.match(/-[iavqrlsw]\d*$/)) {
    // test set
    document.title = `${test.toUpperCase()} ${document.title}`;

    if (link.match(/-[iavq]\d*/)) greFlag = true;

    // #region title div
    const titleDiv = $('<div>', {
      id: 'titleDiv',
    }).appendTo(main);
    $('<button>', {
      class: `w3-right my-bar-small ${mobileFlag ? 'w3-section' : ''}`,
      html: 'Test',
    }).prependTo(titleDiv).click(startTest);

    // click title to show sets div
    $('<span>', {
      class: 'w3-xlarge my-highlight my-click',
      html: $('title').text(),
    }).prependTo(titleDiv).click(function() {
      $(`#setsDiv`).toggle();
      const setName = link.match(/^\w+/)[0].toUpperCase();
      $(`#setsDiv .w3-button:contains('${setName}')`).click();
    });
    // #endregion

    scripts = scripts.concat([test, 'words']);
    if (link.match(/-q/)) scripts = scripts.concat(['tex']);
    addScripts(scripts, () => {
      set = window[test].find((s) => s.name == link);
      showQuestions();
    });

    if (greFlag) {
      addSetsDiv(test);
    } else {
      addCategoryFilter();
    }
    $(`#setsDiv`).hide();
  } else if (link.match(/^topic\d+$/)) {
    addScripts('essays', () => {
      document.title = essays[link].topic;

      /** @todo create writing question */
      const articles = essays[link].articles;
      $('<div>', {
        class: 'my-section',
        html: `<h4>${document.title}</h4><p>${essays[link].question}</p><hr>`,
      }).appendTo(main);
      $('<div>', {
        id: 'passage',
        class: 'my-section',
      }).appendTo(main);

      createPageBar(articles, main, function(i) {
        $('#passage').html(articles[i]);
        addWord('#passage');
      });

      const textarea = $('<textarea>', {
        class: 'my-padding-small w3-block',
      }).appendTo($('.my-section').eq(0)).hide().css({
        height: body.height() / 2,
      });
      $('h4', $('.my-section').eq(0)).click(() => {
        textarea.toggle().focus();
      });
    });
  }
}

let greFlag = false;
git = `https://raw.githubusercontent.com/${user}`;
audioRoot = `${git}/audio/master`;
ebooksRoot = `${git}/ebooks/master`;
vocabulary = [];
/** @todo regexp click\( *[f\(]; remove anonymous function */

showTest();
