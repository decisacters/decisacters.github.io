node = require('./node.js');

function getHTML() {
  let content = '';
  fs.readdirSync(path.join(ebooks, ebook)).forEach((file) => {
    if (!file.match(regExp)) return;
    content += fs.readFileSync(path.join(ebooks, ebook, file), 'utf8');
  });
  content = content.replace(/(?<=\w)- (?=\w)| alt=".*?"/g, '');
  content = content.replace(/<img.*?blank-.*?\/>/g, '_'.repeat(8));
  content = content.replace(/<(div|span) e.*?\d"\/>/g, '').replace(/<span c.*?\d"\/>/g, '');
  content = content.replace(/<(div|span) class="(pagebreak)" epub:type="\2" id="page\d+"\/>/g, ''); // og
  content = content.replace(/<span \w+="blank-s"\/>/g, '_'.repeat(8)).replace(/<a.*?\d"\/>/g, ''); // kap
  content = content.replace(/<b\/>|<td>\W+?<\/td>| \(line.*?\)/g, ''); // kap vw
  fs.writeFileSync('C:/GitHub/temp/temp.html', content, 'utf8');
  return cheerio.load(node.updateContent(content));
}

function getText(node) {
  let text = node.text().trim();
  if (name.match(/be|gr/)) text = text.replace(/\n */g, ' ');
  return text;
}

function getQuestionType(stem, question) {
  blanks = stem.match(/_{2,}/g);
  if (!blanks && stem.match(/(Select|Identify|Choose|Click on) the( two)? sentence/) || (name.match(/pp/) && stem.match(/(Select|Which) (the|a)? ?sentence/))) {
    type = 'select';
  } else if (name.match(/og-pt/) && question.prev().is('.Ques')) {
    type = 'compare';
  } else if (name.match(/og-pt/) && question.prev().html().match(/answer in the box/)) {
    type = 'entry';
  } else {
    type = 'radio';
  }
}

function getName(name, i) {
  if (name.match(/-\w+\d-/))
    {name = name.replace(/(\w)\d-/, `$1${i}-`)};
  else if (name.match(/-\w\d+$/))
    {name = name.replace(/(\w)\d*$/, `$1${i}`)};
  return name;
}

function hasChoice() {
  return type.match(/radio|checkbox/);
}

function setPDF(name) {
  content = fs.readFileSync(`${ebooks}/${name}.html`, 'utf8');

  content = content.replace(/(\n *(Line)? |\n *\d+ *\n|ARGOPREP.COM\/GRE)/g, '\n');

  content = content.replace(/<p>\r?\n/g, '<p>');
  content = content.replace(/(- ?\r?\n|Blank \(i+\))/g, '');
  content = content.replace(/(\(i+\))(?!_) */g, '$1________ ');
  content = content.replace(/_ *([,\.\?!])/g, '_$1');
  content = content.replace(/ +([=_]|\u2014+) +/g, ' ________ ');
  content = content.replace(/\n\(\d?[05]\) /g, ' ');
  content = content.replace(/((?<!(Choices?|and|Vitamin)) +|\n)([B-IO0]|\u00ae|\u00a9) +/gi, '</div>\n<div class="choice">');
  content = content.replace(/\n(?<!(Choices?)) *A +/g, '</div>\n<div class="choice">');
  content = content.replace(/(?<=\n *)(! +|\d+\. (?=.{1,10}\n))/g, '</div>\n<div class="explanation"><p>');
  content = content.replace(/((?<=\n *)% +|\nQuestions? \d.*\n)/g, '</div>\n<div class="passage"><p>');
  content = content.replace(/(?<=\n *)(\?|\d+\.) +/g, '</div>\n<div class="question">');

  fs.writeFileSync(`${ebooks}/${name}.html`, content, 'utf8');
}

function getTex() {
  let content = fs.readFileSync(grePath, 'utf8');
  tex = node.readJS('c:/github/js/tex.js');
  tex.forEach((t) => content = content.replace(RegExp(`<img src=...{\\w+}/${t.image}.*?>`), t.tex));
  fs.writeFileSync(grePath, content, 'utf8');
}

function getTest(name) {
  function getQuestions(name, getQuestion, getPassage, getResponse) {
    if (name.match(/\d/)) {
      start = +name.match(/\d/)[0];
      end = start + sets.length;
    } else {
      start = 1;
      end = sets.length + 1;
    }

    for (i = 0; i < sets.length && name.match(/-[vq]\d*$/); i++) {
      ranges = sets[i];
      name = getName(name, start + i);
      set = {
        name: name,
        questions: [],
        passages: [],
      };

      for (j = 0; j < ranges.length; j++) {
        if (typeof ranges[j] == 'object') {
          range = ranges[j];
        } else {
          range = ranges;
        }

        for (let k = range[0] - 1; k <= range[1] - 1; k++) {
          answer = '';

          if ($(questions[k]).length) {
            getQuestion($(questions[k]), $(explanations[k]), k);
            question = {
              stem: stem,
              type: type,
              answer: answer,
              explanation: html,
            };
            if (choices.length) question.choices = choices;
            if (quantities.length) question.quantities = quantities;
            if (entry) question.entry = entry;
            set.questions.push(question);
          }
        }

        if (typeof ranges[j] == 'integer') {
          break;
        }
      }

      getPassage(passages);
    }

    if (name.match(/-[ia]\d*$/)) {
      name = getName(name, start + i);
      set = {
        name: name,
        question: '',
        responses: [],
      };

      getResponse(topic, name);
    }

    node.pushElement(gre, set, (s) => s.name == set.name);

    node.writeJS(grePath);
  }

  if (name.match(/^og/)) {
    function getSecondHalf(array) {
      return array.slice(Math.ceil(array.length / 2), array.length);
    }

    ebook = 'The Official Guide to the GRE General Test 3/EPUB/xhtml';
    sets = [];
    if (name.match(/ps-v/)) {
      regExp = /chapter0[4].*htm/;
      sets = [
        [
          [1, 17],
        ],
        [
          [18, 34],
        ],
        [
          [35, 51],
        ],
      ];
    } else if (name.match(/-pt1/)) {
      regExp = /chapter0[8].*htm/;
    } else if (name.match(/-pt2/)) {
      regExp = /chapter0[9].*htm/;
    }

    if (name.match(/-pt.*[vq]1/)) {
      sets = [
        [
          [1, 25],
        ],
      ];
    } else if (name.match(/-pt.*[vq]2/)) {
      sets = [
        [
          [26, 50],
        ],
      ];
    }
    selects = {
      1: 5,
    };

    $ = getHTML();
    questions = getSecondHalf($('p.question'));
    explanations = $('aside > :contains(Explanation)').parent();
    passages = $.merge(getSecondHalf($('.lefthd2')), getSecondHalf($('.question-para').prev()));
    const comparisons = getSecondHalf($('.Ques:not(:contains("Example"))'));
    quantatives = $.merge($.merge(comparisons.slice(0, 9), $('.NL-2digit').slice(0, 16)), $.merge(comparisons.slice(9, 20), $('.NL-2digit').slice(16, 32)));

    if (name.match(/-q/)) {
      questions = quantatives;
      explanations = explanations.slice(50, 100);
    }

    topics = getSecondHalf($('.Sidebar3'));
    topic = name.match(/-i/) ? topics.slice(0, 1) : topics.slice(1, 2);

    function getCompare(question, questionDiv) {
      if (question.is('.Ques') && question.nextUntil('.Ques-Quan-hd').length)
        {return question.nextUntil('.Ques-Quan-hd')};
      else return questionDiv;
    }

    function getChoice(question) {
      return question.next().text().match(/Indicate all|as a fraction/) ? question.next().next() : question.next();
    }

    function getStem(question) {
      let questions = [];
      if (question.prev().is('.equation, .image') && !question.prev().prev().html().match(/following data/))
        {questions.push(question.prev())};

      if (question.next().is('.question-para'))
        {question = question.next()};

      questions.push(question);

      if (question.next().html().match(/as a fraction/))
        {questions.push(question.next())};

      questions = getCompare(question, questions);

      return questions;
    }

    function getType(stem, questions) {
      blanks = stem.match(/_{2,}/g) ? stem.match(/_{2,}/g).length : 0;
      const div = $(questions[0]).is('.Ques') ? $(questions[0]) : $(questions[0]).prev();
      if (!blanks && stem.match(/(Select|Identify|Choose|Click on) the( two)? sentence/) || (name.match(/pp/) && stem.match(/(Select|Which) (the|a)? ?sentence/))) {
        type = 'select';
      } else if (div.is('.Ques')) {
        type = 'compare';
      } else if (div.html().match(/enter your/)) {
        type = 'entry';
      } else if (questions.slice(-1)[0].next().text().match(/Indicate all/)) {
        type = 'checkbox';
      } else {
        type = 'radio';
      }
    }

    function getText(questions) {
      let text = '';
      if (questions.toArray)
        {questions = questions.toArray()};
      questions.forEach((q) => {
        text += `${$(q).html().trim().replace(/<(span) \w+="underline">(.*?)<\/\1>/g, ' <u>$2</u> ').replace(/^\d+\.\s*|^<(span).*[A-I]<\/\1>*|\n+| (alt|class|style)=".*?"|<!--.*?-->/g, '').replace(/\.\.\/images/g, '${og}')}`;
        if ($(q).html().match(/<td/))
          {text = `<table>${text.replace(/<(colgroup).*?\1>|<\/?p>/g, '')}</table>`};
      });
      return text;
    }

    function getChoices(question) {
      choices = [];
      const choiceDiv = getChoice(question);

      const options = $('p:not(.table-head)', choiceDiv);
      const length = options.length;
      let choice = [];
      options.each(function(i) {
        if (length > 5 && blanks > 1 && i % 3 == 0) choice = [];
        choice.push(getText($(this)));
        if (length > 5 && blanks > 1 && (i + 1) % 3 == 0) choices.push(choice);
      });
      if (length < 6 || blanks < 2) choices.push(choice);
      return choices;
    }

    function getResponse(topic, name) {
      set.question = $(topic).html().replace(/( .*?"(?=>)|\r?\n\s*|<a.*a>)/g, '');
      const responses = name.match(/-i/) ? $('.Sidebar5').slice(0, 6) : $('.Sidebar5').slice(6, 13);
      responses.each(function() {
        const response = `<h5>${$(this).prevUntil('.Sidebar1').prev().html()}</h5>${$(this).html()}`;
        const comment = $(this).nextUntil('.Sidebar1').next().html();
        set.responses.push((response + comment).replace(/<a.*a>/, '').replace(/( .*?"(?=>)|\r?\n\s*|<a.*a>)/g, ''));
      });
    }

    function getQuestion(question, explanation, i) {
      const questions = getStem(question);
      stem = getText(questions);
      getType(stem, questions);
      choices = [];
      quantities = [];
      entry = '';
      if (type == 'compare') {
        getCompare(question, question).last().nextUntil('.Sidebar1', '.Ques-Quan').slice(0, 2).each(function() {
          quantities.push(getText($(this)));
        });
      } else if (hasChoice()) {
        choices = getChoices(question);
      } else if (type == 'entry') {
        entry = getText(getChoice(question));
      }

      if (choices.flat().length == 3 || (blanks == 1 && choices.flat().length == 6))
        {type = 'checkbox'};

      $('b', explanation).each(function() {
        if (blanks) {
          const index = choices.flat().findIndex((c) => c.match(RegExp($(this).text(), 'i')));
          answer += `${index}`;
        } else if (type == 'entry') {
          if ($(this).text().match(/\d/)) answer = $(this).text();
        } else {
          if ($(this).text().match(/ [A-I]/g))
            {$(this).text().match(/ [A-I]/g).forEach(a => {
              if (!answer.match(a.trim().charCodeAt(0) - 65))
                answer += a.trim().charCodeAt(0) - 65
            })};
        }
      });

      explanation.children().first().remove();
      html = getText(explanation);
      '';
    }

    function getPassage(passages) {
      function getSelection() {
        for (let i = passage.start; i <= passage.end; i++) {
          const question = set.questions[i];
          if (question.type == 'select') {
            question.answer = +question.explanation.match(/(?<=<b>.*?)\d+(?=.*?<\/b>)/) - 1;
            if (question.answer < 0)
              {question.answer = selects[i]};
          }
        }
      }

      $(passages).each(function(i) {
        let text;
        let parent = $(this).parent('aside');
        let length = 0;
        if (!parent.length)
          {parent = $(this).children('p').length ? $(this) : $(this).html(`<p>${$(this).html()}</p>`)};

        text = parent;
        if (text.html().match(/following (data|reading)/)) {
          if (text.html().match(/following data/))
            {text = parent.next()};// .html().replace(/ (alt|class)=".*?"/g, '')

          const numbers = parent.text().match(/.*based on/)[0].match(/\d+/g);
          length = numbers[1] ? +numbers[1] - +numbers[0] : 0;
        }
        passage = {
          passage: getText(text).replace(/(<\/p><p>)(line)? ?\d+\1|<h4.*?\/h4>/g, ' ').trim(),
        };
        const question = parent.nextUntil('.Sidebar4, .bridgehead3, .box-noindent', '.question, .question-para, .NL-2digit').eq(0);
        questionDiv = getStem(question);
        stem = getText(questionDiv);
        getType(stem, questionDiv);
        if (hasChoice()) {
          passage.start = set.questions.findIndex((q) => q.choices && q.choices[0][0] == getChoices(question)[0][0]);
        } else {
          passage.start = set.questions.findIndex((q) => q.stem == stem);
        }
        if (passage.start >= 0) passage.end = passage.start + length;
        /* var pairs = ['start', 'end']

        for (let i = 0; i < 2 && questions.length; i++) {
          do {
            let question = i ? questions.slice(-1) : questions.slice(0,1)
            questionDiv = getStem(question);
            stem = getText(questionDiv);
            getType(stem, questionDiv);
            if (hasChoice()) {
              passage[pairs[i]] = set.questions.findIndex(q => q.choices && q.choices[0][0] == getChoices(question)[0][0]);
            } else {
              passage[pairs[i]] = set.questions.findIndex(q => q.stem == stem);
            }

            questions = i ? questions.slice(1, questions.length) : questions.slice(0, -1)
          }  while (passage[pairs[i]] < 0 && questions.length)
        } */

        if (passage.end < 0 || passage.start < 0) return;
        set.passages.push(passage);
        getSelection();
      });
    }
  } else if (name.match(/mh/)) {
    if (name.match(/pq/)) {
      sets = [
        [
          [1, 10],
          [31, 40],
          [62, 63],
          [71, 72],
          [76, 76],
        ],
        [
          [11, 20],
          [41, 50],
          [64, 66],
          [73, 74],
        ],
        [
          [21, 30],
          [51, 61],
          [67, 70],
          [75, 75],
        ],
      ];

      regExp = /ch[4-6].*htm/;
      ebook = 'McGraw-Hill Education GRE 2019/OEBPS';
      selects = {
        '69': 1,
      };
    }

    var attr = 'id';
    var filter = /ch\dans1-\d/;
    var passageFilter = '.noindenttb:contains(Question)';
    var questionFilter = '.ques, .ques1, .noindenttb';
    $ = getHTML();
    questions = $('a').filter(function() {
      return $(this).attr(attr) && $(this).attr(attr).match(filter) && $(this).attr(attr).match(/^c/);
    }).parent();
    explanations = $('a').filter(function() {
      return $(this).attr(attr) && $(this).attr(attr).match(filter) && $(this).attr(attr).match(/^r/);
    }).closest('p');
    passages = $(passageFilter);

    function getQuestion(question, explanation, i) {
      console.log(i);
      if (question.text().match(/apply\./)) question = question.next();

      stem = question.html().replace(/<a.*a>\.?/g, '').trim();

      getQuestionType(stem);

      choices = [];
      if (type != 'select') {
        selector = `${questionFilter}, ${passageFilter}, h3`;
        src = question.find('img').attr('src') ? question.find('img').attr('src') : question.nextUntil(selector).last().find('img').attr('src');
        if (src && !src.match(/box|round/)) {
          file = src.replace(/\w+$/, 'txt');
          options = fs.readFileSync(path.join(ebooks, ebook, file), 'utf8').replace(/\r?\n$/, '').split(/\r?\n/);
        } else {
          options = question.nextUntil(selector);
        }

        if (blanks && name.match(/pd-v[1-5]|md-v[12]/) || question.next().html().match(/<td/)) {
          choices = [];
          for (let i = 0; i < blanks.length; i++) {
            choice = [];
            options.filter(function(index) {
              return index % blanks.length == i;
            }).each(function() {
              choice.push($(this).text().trim());
            });
            choices.push(choice);
          }
        } else {
          const length = options.length;
          choice = [];
          $(options).each(function(i) {
            if (length > 5 && blanks.length > 1 && i % 3 == 0) choice = [];
            choice.push($(this).text().trim() ? $(this).text().trim() : this.toString());
            if (length > 5 && blanks.length > 1 && (i + 1) % 3 == 0) choices.push(choice);
          });
          if (length < 6 || blanks.length < 2) choices.push(choice);
        }

        answer = '';
        $($('b', explanation).first().text().match(/\b[A-I]\b/g)).each(function() {
          answer += this.toString().charCodeAt(0) - 65;
        });
      } else {
        answer = selects[`${i}`];
      }

      if (choices.flat().length == 3 || (blanks && blanks.length == 1 && choices.flat().length == 6))
        {type = 'checkbox'};
      html = '';
      if (explanation.next().is('.choice'))
        {explanation.nextUntil('.ans1, .ans').each(function () {
          html += `<p>${$(this).html()}</p>`
        })};
      else
        {html = `<p>${explanation.html().replace(/<a.*a>\./, '')}</p>`};
    }

    function getPassage(passages) {
      $(passages).each(function() {
        let text = '';

        $(this).nextUntil(questionFilter).each(function(index) {
          if ($(this).is('.nums-1') && index != 0) text += '</p><p>';
          text += $(this).html().replace(/^\d?[50]? *\u00a0*/, ' ');
        });

        passage = {
          passage: `<p>${text}</p>`,
        };
        choiceFilter = '.alpha, .alphat, .alphag1i';
        let question = $(this).nextUntil(`${passageFilter}, h3`).filter(questionFilter);
        let start = question.first().nextUntil(`${passageFilter}, ${questionFilter}, h3`).filter(choiceFilter);
        let end = question.last().nextUntil(`${passageFilter}, ${questionFilter}, h3`).filter(choiceFilter);
        if (start.length && !start.text().match('Select the senten') && !start.parent().is('#div1')) {
          start = start.last().text().trim();
          passage.start = set.questions.findIndex((q) => q.choices.flat().includes(start));
        } else {
          start = question.first().html().replace(/^\d+\.|&#xA0;|<p.*?>|<\/p>|<span.*span>|<a.*a>\./g, '').trim();
          passage.start = set.questions.findIndex((q) => q.stem.includes(start));
        }
        if (end.length && !end.text().match('Select the sentence') && !end.parent().is('#div1')) {
          end = end.last().text().trim();
          passage.end = set.questions.findIndex((q) => q.choices.flat().includes(end));
        } else {
          end = question.last().html().replace(/^\d+\.|&#xA0;|<p.*?>|<\/p>|<span.*span>|<a.*a>\./g, '').trim();
          passage.end = set.questions.findIndex((q) => q.stem.includes(end));
        }
        if (!$(this).text().match(/Questions? \d/) && name.match(/pd-v[67]/))
          {passage.end = passage.start};
        if (passage.end < 0 || passage.start < 0) return;
        set.passages.push(passage);
      });
    }
  } else if (name.match(/du/)) {
    if (name.match(/pq/)) {
      sets = [
        [
          [1, 3],
          [7, 13],
          [21, 31],
        ],
        [
          [4, 6],
          [14, 20],
          [31, 40],
        ],
      ];

      regExp = /ch0[4-6].*htm/;
      ebook = 'GRE For Dummies 7/OEBPS';
      selects = {
        '24': 11,
        '28': 6,
        '34': 15,
        '37': 11,
      };
    }

    var passageFilter = '.Passage-1Col';
    var questionFilter = '.Example-Question';
    $ = getHTML();
    questions = $(questionFilter);
    explanations = $('.Normal').filter(function() {
      return $(this).prev().is('.Example-Choice-Last') || ($(this).prev().is('.Figure-Centered') && $(this).prev().prev().is('.Example-Question')) || $(this).prev().is('.Example-Question');
    });
    passages = $(passageFilter).filter(function() {
      return $(this).prev('.Normal').length;
    });

    function getQuestion(question, explanation, i) {
      console.log(i);
      stem = question.html().replace(/<a.*a>\.?|^\d+\./g, '').trim();

      getQuestionType(stem);

      choices = [];
      if (type != 'select') {
        selector = `${questionFilter}, ${passageFilter}, h3, .Normal`;
        src = question.find('img').attr('src') ? question.find('img').attr('src') : question.nextUntil(selector).last().find('img').attr('src');
        if (src && !src.match(/box|round/)) {
          file = src.replace(/\w+$/, 'txt');
          options = fs.readFileSync(path.join(ebooks, ebook, file), 'utf8').replace(/\r?\n$/, '').split(/\r?\n/);
        } else {
          options = question.nextUntil(selector);
        }

        const length = options.length;
        choice = [];
        $(options).each(function(i) {
          if (length > 5 && blanks.length > 1 && i % 3 == 0) choice = [];
          choiceReplacer = RegExp(`<sp.*?span>`, 'g');
          choice.push($(this).text() ? $(this).html().replace(choiceReplacer, '').trim() : this.toString());
          if (length > 5 && blanks.length > 1 && (i + 1) % 3 == 0) choices.push(choice);
        });
        if (length < 6 || blanks.length < 2) choices.push(choice);

        answer = '';
        $($('b, .zCheltBold', $.merge(explanation, explanation.nextUntil(questionFilter).filter('.Normal'))).text().match(/\b[A-I]\b/g)).each(function() {
          answer += this.toString().charCodeAt(0) - 65;
        });
      } else {
        answer = selects[`${i}`];
      }

      if (choices.flat().length == 3 || (blanks && blanks.length == 1 && choices.flat().length == 6))
        {type = 'checkbox'};

      html = '';
      explanation.each(function() {
        html += `<p>${$(this).html()}</p>`;
      });

      html = html.replace(/<s.*?(Italic|Script)">(.*?)<\/span>/g, '<i>$2</i>');
      html = html.replace(/<s.*?Bold">(.*?)<\/span>/g, '<b>$1</b>');
    }

    function getPassage(passages) {
      $(passages).each(function() {
        let text = '';

        $.merge($(this), $(this).nextUntil(questionFilter)).each(function(index) {
          if ($(this).is('.nums-1') && index != 0) text += '</p><p>';
          text += `<p>${$(this).html().replace(/^\d?[50]? *\u00a0*/, ' ')}</p>`;
        });

        passage = {
          passage: `<p>${text}</p>`,
        };
        choiceFilter = '[class*=Example-Choice]';
        let nodes = $(this).nextUntil(questionFilter).length ? $(this).nextUntil(questionFilter).last() : $(this);
        let questions = nodes.nextUntil(`${passageFilter}, h3`).filter(questionFilter);
        let start = questions.first().nextUntil(`${passageFilter}, ${questionFilter}, h3`).filter(choiceFilter);
        let end = questions.last().nextUntil(`${passageFilter}, ${questionFilter}, h3`).filter(choiceFilter);
        if (start.length && !start.text().match('Select the senten')) {
          start = start.last().html().replace(choiceReplacer, '').trim();
          passage.start = set.questions.findIndex((q) => q.choices.flat().includes(start));
        } else {
          start = questions.first().html().replace(/^\d+\.|&#xA0;|<p.*?>|<\/p>|<span.*span>|<a.*a>\./g, '').trim();
          passage.start = set.questions.findIndex((q) => q.stem.includes(start));
        }
        if (end.length && !end.text().match('Select the sentence')) {
          end = end.last().html().replace(choiceReplacer, '').trim();
          passage.end = set.questions.findIndex((q) => q.choices.flat().includes(end));
        } else {
          end = questions.last().html().replace(/^\d+\.|&#xA0;|<p.*?>|<\/p>|<span.*span>|<a.*a>\./g, '').trim();
          passage.end = set.questions.findIndex((q) => q.stem.includes(end));
        }
        if (!$(this).text().match(/Questions? \d/) && name.match(/pd-v[67]/))
          {passage.end = passage.start};
        if (passage.end < 0 || passage.start < 0) return;
        set.passages.push(passage);
      });
    }
  } else if (name.match(/mp-(pq|ps)/)) {
    if (name.match(/pq-v7/)) {
      sets = [
        [
          [1, 6],
          [145, 150],
          [292, 298],
          [463, 464],
        ],
        [
          [7, 12],
          [151, 156],
          [299, 305],
          [465, 466],
        ],
        [
          [13, 18],
          [157, 162],
          [306, 313],
          [467, 468],
        ],
        [
          [19, 24],
          [163, 168],
          [314, 318],
          [469, 471],
        ],
        [
          [25, 30],
          [169, 174],
          [319, 328],
          [472, 473],
        ],
        [
          [31, 36],
          [175, 180],
          [329, 336],
          [474, 475],
        ],
        [
          [37, 42],
          [181, 186],
          [337, 342],
          [476, 478],
        ],
        [
          [43, 48],
          [187, 192],
          [343, 347],
          [479, 481],
        ],
        [
          [49, 54],
          [193, 198],
          [348, 355],
          [482, 483],
        ],
        [
          [55, 60],
          [199, 204],
          [356, 361],
          [484, 486],
        ],
        [
          [61, 66],
          [205, 210],
          [362, 367],
          [487, 489],
        ],
        [
          [67, 72],
          [211, 216],
          [368, 375],
          [490, 491],
        ],
        [
          [73, 78],
          [217, 222],
          [376, 381],
          [492, 494],
        ],
        [
          [79, 84],
          [223, 228],
          [382, 389],
          [495, 496],
        ],
        [
          [85, 90],
          [229, 234],
          [390, 394],
          [497, 499],
        ],
        [
          [91, 96],
          [235, 240],
          [395, 403],
          [500, 501],
        ],
        [
          [97, 102],
          [241, 246],
          [404, 409],
          [502, 504],
        ],
        [
          [103, 108],
          [247, 252],
          [410, 417],
          [505, 506],
        ],
        [
          [109, 114],
          [253, 258],
          [418, 423],
          [507, 509],
        ],
        [
          [115, 120],
          [259, 264],
          [424, 430],
          [510, 511],
        ],
        [
          [121, 126],
          [265, 270],
          [431, 437],
          [512, 513],
        ],
        [
          [127, 132],
          [271, 276],
          [438, 444],
          [514, 515],
        ],
        [
          [133, 138],
          [277, 282],
          [445, 453],
          [516, 517],
        ],
        [
          [139, 144],
          [283, 291],
          [454, 461],
          [518, 519],
        ],
      ];

      regExp = /chapter0[3-6].*htm/;
      ebook = '5 lb  Book of GRE Practice Problems 3/OEBPS';
      selects = {
        '340': 5,
        '380': 1,
        '442': 1,
        '452': 10,
      };
    } else if (name.match(/ps/)) {
      regExp = /chapter(01|32).*htm/;
      ebook = '5 lb  Book of GRE Practice Problems 3/OEBPS';
      selects = {
        '340': 5,
        '380': 1,
        '442': 1,
        '452': 10,
      };

      sets = [
        [
          [1, 20],
        ],
        [
          [21, 40],
        ],
        [
          [41, 60],
        ],
        [
          [61, 80],
        ],
      ];
    }

    $ = getHTML();
    questionFilter = '[class*=num-list]';
    passageFilter = '.box:contains(uestion)';
    argumentFilter = '[class*=body-textb]';
    questions = $(questionFilter);
    explanations = $('.body-text').filter(function() {
      return $(this).text().match(/^ *\d+\. */);
    });
    passages = $.merge($(passageFilter).filter(function() {
      return $(this).text().match(/(^|\n)Question/);
    }), $(questionFilter).filter(function() {
      return $(this).next().is(argumentFilter);
    }));

    function getQuestion(question, explanation, i) {
      console.log(i);
      if (question.next().is(argumentFilter)) question = question.next();
      stem = question.html().replace(/<span.*?>|<\/span>|^\d+./g, '').trim();
      getQuestionType(stem);

      choices = [];
      choice = [];
      if (type != 'select') {
        if (question.next().html().match(/<td/)) {
          options = $('td:not(:contains(Blank))', question.next());
          for (let i = 0; i < blanks.length; i++) {
            choice = [];
            options.filter(function(index) {
              return index % blanks.length == i;
            }).each(function() {
              choice.push($(this).text().trim());
            });
            choices.push(choice);
          }
        } else if (question.next().html().match(/<li/)) {
          $('li', question.next()).each(function() {
            choice.push($(this).text().trim());
          });
          choices.push(choice);
        } else if (!blanks) {
          question.nextUntil(`${questionFilter}, ${passageFilter}, .subhead`).each(function() {
            choice.push($(this).text().replace(/^\([A-E]\)/, '').trim());
          });
          choices.push(choice);
        }
      } else {
        answer = selects[`${i}`];
      }

      if (choices.flat().length == 3 || (blanks && blanks.length == 1 && choices.flat().length == 6))
        {type = 'checkbox'};

      if (blanks) {
        answer = '';
        $($('b', explanation).text().replace(/\.[ \u00a0]?/, '').trim().split(', ')).each(function() {
          answer += choices.flat().findIndex((c) => {
            if (c.match(' ')) return c.match(RegExp(`\\b${this.toString()}\\b`, 'i'));
            else return c.match(RegExp(`^${this.toString()}$`, 'i'));
          });
        });
      } else if (type != 'select') {
        answer = '';
        if ($('b', explanation).text().match(/\d/)) {
          $($('b', explanation).text().match(/\d/g)).each(function() {
            answer += `${+this.toString() - 1}`;
          });
        } else {
          answer = `${$('b', explanation).text().match(/[A-I]/)[0].charCodeAt(0) - 65}`;
        }
      }
      html = '';
      $.merge(explanation, explanation.nextUntil(explanation.nextAll('p').filter(function() {
        return $(this).html().match(/^\d+. /);
      })[0])).each(function() {
        html += `<p>${$(this).html().replace(/^\d+\./, '').trim()}</p>`;
      });
    }

    function getPassage(passages) {
      $(passages).each(function(i) {
        let text = '';
        $(this).nextUntil(questionFilter, ':not([class*=box1])').each(function(index) {
          if ($(this).is('[class*=indentr]') && index != 0 || $(this).text().match(/^\d+ {2,}/))
            {text += '</p><p>'};
          text += $(this).html().replace(/^ *\d?[50]? *\u00a0*|<br>|^\d{3}\./g, ' ');
        });
        if ($(this).next().is(argumentFilter)) text = $(this).html().replace(/<span.*?>|<\/span>|^\d+./g, '');
        passage = {
          passage: `<p>${text}</p>`,
        };
        choiceFilter = '.upper-alpha';
        let question = $(this).nextUntil(passageFilter).filter(`${questionFilter}, ${argumentFilter}`);
        let start = question.first().nextUntil(`${passageFilter}, ${questionFilter}`).filter(choiceFilter);
        let end = question.last().nextUntil(`${passageFilter}, ${questionFilter}`).filter(choiceFilter);
        if (start.length && !start.text().match('Select the senten') && !start.parent().is('#div1')) {
          start = start.last().text().replace(/^\([A-E]\)/, '').trim();
          passage.start = set.questions.findIndex((q) => q.choices.flat().includes(start));
        } else {
          start = question.first().html().replace(/^\d+\.|&#xA0;|<p.*?>|<\/p>|<span.*span>|<a.*a>\./g, '').trim();
          passage.start = set.questions.findIndex((q) => q.stem.includes(start));
        }
        if (end.length && !end.text().match('Select the sentence') && !end.parent().is('#div1')) {
          end = end.last().text().replace(/^\([A-E]\)/, '').trim();
          passage.end = set.questions.findIndex((q) => q.choices.flat().includes(end));
        } else {
          end = question.last().html().replace(/^\d+\.|&#xA0;|<p.*?>|<\/p>|<span.*span>|<a.*a>\./g, '').trim();
          passage.end = set.questions.findIndex((q) => q.stem.includes(end));
        }
        if ($(this).next().is(argumentFilter)) passage.end = passage.start;
        if (passage.start < 0 || passage.end < 0) return;
        set.passages.push(passage);
      });
    }
  } else if (name.match(/(kap|mp)-(?!pp)/)) {
    if (name.match(/mp-pq/)) {
      sets = [
        [
          [1, 7],
          [47, 47],
          [57, 66],
          [117, 126],
        ],
        [
          [8, 12],
          [40, 46],
          [48, 48],
          [67, 76],
          [127, 136],
        ],
        [
          [13, 19],
          [49, 50],
          [77, 86],
          [137, 146],
        ],
        [
          [20, 25],
          [51, 52],
          [87, 96],
          [147, 156],
        ],
        [
          [26, 32],
          [53, 54],
          [97, 106],
          [157, 166],
        ],
        [
          [33, 39],
          [55, 56],
          [107, 116],
          [167, 176],
        ],
      ];

      regExp = /(tcse.*[23]_o.*1[1-4]|rc.*[8-9]_o.*).*htm/;
      ebook = 'GRE Verbal Strategies/OPS/text';
      selects = {
        '5': 5,
        '10': 12,
        '45': 11,
        '18': 2,
        '24': 5,
        '31': 3,
        '37': 8,
      };
    } else if (name.match(/kap-pq-v1/)) {
      sets = [
        [
          [1, 16],
        ],
        [
          [17, 41],
        ],
      ];

      regExp = /0[4-7]a?_o.*_p.*htm/;
      ebook = 'GRE Prep 2018/OPS/text';
      selects = {
        '9': 4,
        '40': 2,
      };
    } else if (name.match(/kap-pq-v3/)) {
      sets = [
        [
          [6, 9],
          [11, 16],
          [31, 40],
          [61, 70],
        ],
        [
          [1, 1],
          [17, 25],
          [41, 50],
          [71, 80],
        ],
        [
          [2, 5],
          [10, 10],
          [26, 30],
          [51, 60],
          [81, 90],
        ],
      ];

      regExp = /0[2-4]a?_o.*_p?.*htm/;
      ebook = 'GRE Verbal Workbook 10/OPS/text';
      selects = {
        '61': 17,
        '64': 3,
        '67': 9,
        '68': 1,
        '71': 2,
        '82': 1,
        '84': 6,
        '88': 5,
      };
    } else if (name.match(/kap-ps-v1/)) {
      sets = [
        [
          [1, 20],
        ],
        [
          [21, 40],
        ],
        [
          [41, 60],
        ],
        [
          [61, 80],
        ],
        [
          [81, 100],
        ],
        [
          [101, 120],
        ],
      ];

      regExp = /05a?_o.*_p.*htm/;
      ebook = 'GRE Verbal Workbook 10/OPS/text';
      selects = {
        '78': 4,
        '88': 8,
        '97': 1,
      };
    } else if (name.match(/kap-ps-v7/)) {
      sets = [
        [
          [1, 20],
        ],
        [
          [21, 40],
        ],
        [
          [41, 60],
        ],
      ];

      regExp = /08a?_o.*_p.*htm/;
      ebook = 'GRE Prep 2018/OPS/text';
      selects = {
        '47': 6,
        '55': 4,
      };
    } else if (name.match(/kap-vw-e/)) {
      sets = [
        [
          [22, 22],
          [26, 27],
          [32, 33],
          [37, 56],
        ],
      ];

      regExp = /(rc.*([1-5]_o|[79]_r).*).*htm/;
      ebook = 'GRE Verbal Strategies/OPS/text';
      selects = {
        '61': 17,
        '64': 3,
        '67': 9,
        '68': 1,
        '71': 2,
        '82': 1,
        '84': 6,
        '88': 5,
      };
    } else if (name.match(/mp-e/)) {
      sets = [
        [
          [22, 22],
          [26, 27],
          [32, 33],
          [37, 56],
        ],
      ];

      regExp = /(rc.*([1-5]_o|[79]_r).*).*htm/;
      ebook = 'GRE Verbal Strategies/OPS/text';
      selects = {
        '61': 17,
        '64': 3,
        '67': 9,
        '68': 1,
        '71': 2,
        '82': 1,
        '84': 6,
        '88': 5,
      };
    }

    $ = getHTML();
    questions = $('section:not(.ktp-feedback)').parent('.ktp-question');
    if (name.match(/pq-v3|ps-v1/)) explanations = $('.ktp-feedback').parent();
    else explanations = $('.ktp-feedback').parent('.ktp-question');
    if (name.match(/pq-v3|ps-v1/)) passages = $('.stimulus');
    else passages = $('.ktp-stimulus');

    function getQuestion(question, explanation, i) {
      stem = $('section:not(.ktp-stimulus)>p', question).html().replace(/<span.*?>|<\/span>/g, '').replace(/\n */g, ' ').trim();

      getQuestionType(stem);

      choices = [];
      if (type != 'select') {
        $('ol', question).each(function() {
          const choice = [];
          $('li', $(this)).each(function() {
            choice.push($(this).text().trim());
          });
          choices.push(choice);
        });
      } else {
        answer = selects[`${i}`];
      }

      if (choices.flat().length == 3 || (blanks && blanks.length == 1 && choices.flat().length == 6))
        {type = 'checkbox'};

      if (blanks || (name.match(/kap/) && type != 'select')) {
        if (name.match(/pq-v[3-9]|ps-v[1-6]/))
          {answers = $('b', explanation).text().replace(/\([A-I]\)/g, '')};
        else answers = $('b', explanation).first().text();
        if (name.match(/kap/)) {
          $(answers.replace(/\W/g, '').match(/[A-I]/g)).each(function() {
            answer += this.toString().charCodeAt(0) - 65;
          });
        } else if (name.match(/mp/)) {
          $(answers.replace(/\.[ \u00a0]?/, '').trim().split(', ')).each(function() {
            answer += choices.flat().findIndex((c) => {
              if (c.match(' ')) return c.match(RegExp(`\\b${this.toString()}\\b`, 'i'));
              else return c.match(RegExp(`^${this.toString()}$`, 'i'));
            });
          });
        }
      } else {
        if (!answer) {
          explanation.find('ol.list-bold, ol.no-number').remove();
          $('li:contains(CORRECT)', explanation).each(function() {
            const index = $('ol>li', explanation).index($(this));
            answer += `${index}`;
          });
        }
      }
      html = explanation.html().replace(/ \w+(-\w+)?=".*?"/g, '').replace(/\n */g, ' ').trim();
    }

    function getPassage(passages) {
      $(passages).each(function() {
        passage = {
          passage: $(this).html().replace(/ \w+(-\w+)?=".*?"/g, '').replace(/<\/span>|<span>/g, '').replace(/\n */g, ' ').trim(),
        };
        let selector = $(this).prop('tagName') == 'LI' ? '.ktp-question' : 'ol';
        if (name.match(/ps-v[7-9]/)) selector = '.ktp-question, li';
        let start = $(this).nextAll(selector).first();
        let end = $(this).nextAll(selector).last();
        if (start.find('li').length) {
          start = start.find('li').last().text().trim();
          passage.start = set.questions.findIndex((q) => q.choices.flat().includes(start));
        } else {
          start = start.find('p').html().replace(/\n */g, ' ').trim();
          passage.start = set.questions.findIndex((q) => q.stem.includes(start));
        }
        if (end.find('li').length) {
          end = end.find('li').last().text().trim();
          passage.end = set.questions.findIndex((q) => q.choices.flat().includes(end));
        } else {
          end = end.find('p').html().replace(/\n */g, ' ').trim();
          passage.end = set.questions.findIndex((q) => q.stem.includes(end));
        }
        if (passage.end < 0 || passage.start < 0) return;
        set.passages.push(passage);
      });
    }
  } else if (name.match(/pr/)) {
    if (name.match(/-e/)) {
      var questions = [];
      var passages = [];
      $('.Test_sample0').prev('.Test_samplet').next().each(function(i) {
        let question = {};
        question.stem = $(this).html();
        let explanations = '';
        $(this).next().nextUntil('.block_65').each(function() {
          explanations += `<p>${$(this).html()}</p>`;
        });
        question.type = 'radio';
        content = explanations.replace(/p .*\d">/g, 'p>');
        content = content.replace(/<span.*t">|<\/span>|<span e.*\/>/g, '');
        content = content.replace(/<\/strong> *<strong>/g, ' ');
        content = content.replace(/&#x(\w{4});/g, (match, p1) => {
          return String.fromCharCode(parseInt(`${p1}`, 16));
        });
        content = node.updateContent(content);
        question.answer = '';
        question.explanation = content.replace(/"/g, '"');
        choices = [];
        $(this).next().find('p').each(function() {
          choices.push($(this).text().trim());
        });
        question.choices = [];
        question.choices.push(choices);
        questions.push(question);

        let passage = {};
        passage.passage = `<p>${$(this).prev().html()}</p>`;
        passage.start = 17 + i;
        passage.end = 17 + i;
        passages.push(passage);
      });
    } else if (name.match(/pq-v1/)) {
      ebook = 'Verbal Workout for the GRE 6/OEBPS';
      regExp = /epub3_c0[3-5].*htm/;
      sets = [
        [
          [1, 7],
          [35, 47],
          [91, 100],
        ],
        [
          [8, 13],
          [48, 57],
          [101, 110],
        ],
        [
          [14, 20],
          [58, 71],
          [111, 119],
        ],
        [
          [21, 27],
          [72, 81],
          [120, 129],
        ],
        [
          [28, 34],
          [82, 90],
          [130, 139],
        ],
      ];
      filter = /c0([45]-ans|3-drl)\d+/;
      selects = {
        '44': 5,
        '47': 1,
        '53': 10,
        '61': 8,
        '65': 7,
        '70': 13,
        '71': 6,
        '79': 14,
        '85': 7,
      };
    } else if (name.match(/pq-v6/)) {
      ebook = 'Cracking the GRE Premium 2018/OEBPS';
      regExp = /epub3_(c0[4-7]|p05).*htm/;
      sets = [
        [
          [1, 3],
          [7, 9],
          [13, 14],
          [17, 21],
          [27, 32],
          [37, 38],
        ],
        [
          [4, 6],
          [10, 12],
          [15, 16],
          [22, 26],
          [33, 36],
          [39, 41],
        ],
      ];
      filter = /c0(4-q00|[56]-q|7-q000).*/;
      selects = {
        '28': 5,
      };
    } else if (name.match(/pq-v8/)) {
      ebook = '1,014 GRE Practice Questions 3/OEBPS';
      regExp = /epub_c02.*htm/;
      sets = [
        [
          [1, 7],
          [106, 113],
          [197, 206],
        ],
        [
          [8, 14],
          [114, 120],
          [207, 216],
        ],
        [
          [15, 22],
          [121, 126],
          [217, 226],
        ],
        [
          [23, 30],
          [127, 132],
          [227, 236],
        ],
        [
          [31, 37],
          [133, 139],
          [237, 246],
        ],
        [
          [38, 44],
          [140, 145],
          [247, 256],
        ],
        [
          [45, 52],
          [146, 152],
          [257, 266],
        ],
        [
          [53, 60],
          [153, 158],
          [267, 276],
        ],
        [
          [61, 67],
          [159, 165],
          [277, 286],
        ],
        [
          [68, 75],
          [166, 169],
          [287, 297],
        ],
        [
          [76, 82],
          [170, 177],
          [298, 306],
        ],
        [
          [83, 90],
          [178, 182],
          [307, 316],
        ],
        [
          [91, 98],
          [183, 188],
          [317, 326],
        ],
        [
          [99, 105],
          [189, 196],
          [327, 336],
        ],
      ];
      filter = /QST\d+/;
      selects = {
        '112': 10,
        '116': 12,
        '122': 10,
        '127': 6,
        '142': 15,
        '148': 2,
        '155': 1,
        '158': 3,
        '163': 9,
        '170': 8,
        '176': 7,
        '188': 13,
        '195': 14,
      };
    } else if (name.match(/ps-v1/)) {
      ebook = 'Verbal Workout for the GRE 6/OEBPS';
      regExp = /epub3_c08.*htm/;
      sets = [
        [
          [1, 20],
        ],
        [
          [21, 40],
        ],
      ];
      filter = /c08-ans\d+/;
      selects = {
        '7': 1,
        '17': 0,
        '26': 4,
      };
    } else if (name.match(/ps-v3/)) {
      ebook = 'Crash Course for the GRE 6/OEBPS';
      regExp = /epub3_bm([12]|[56]).*htm/;
      sets = [
        [
          [1, 20],
        ],
        [
          [21, 40],
        ],
      ];
      filter = /vd\d_q\d+/;
      selects = {
        '15': 0,
      };
    } else if (name.match(/ps-v5/)) {
      ebook = '1,014 GRE Practice Questions 3/OEBPS';
      regExp = /epub_c01.*htm/;
      sets = [
        [
          [1, 20],
        ],
      ];
      filter = /QST([2-3][1-9]|[34]0)/;
      selects = {
        '10': 5,
      };
    }

    $ = getHTML();
    var attr = name.match(/md-v[34]/) ? 'id' : 'href';
    questions = $('a').filter(function() {
      return $(this).attr(attr) && $(this).attr(attr).match(filter) && $(this).attr(attr).match(/a$/);
    }).parent();
    if (!name.match(/pd-v[1-5]|md-v[1-4]/)) questions = questions.next();
    else questions = questions.parent();
    explanations = $('a').filter(function() {
      return $(this).attr(attr) && $(this).attr(attr).match(filter) && $(this).attr(attr).match(/\d$/);
    }).closest('p');

    if (name.match(/pd-v[67]/)) {
      passages = $.merge($('.Test_sample1l:not(:contains(apply.))').filter(function() {
        return $(this).prev('.Test_sample2l').length && $(this).next('.Test_sample1l').length;
      }), $('.Test_samplen'));
    }
    passageFilter = '.question_break_2, .block_rc, .dis_img2, .Test_samplen';
    passages = $(passageFilter);

    function getQuestion(question, explanation, i) {
      let flag = question.text().match(/apply\./) || question.prev('.Test_sample2l').length && question.next('.Test_sample1l').length;
      if (name.match(/pd-v[1-7]|md-v[12]/) && flag) question = question.next();

      if (name.match(/pd-v[1-7]|md-v[1-4]/))
        {stem = question.html().trim().replace(/\n *|<span.*?>|<\/span>|<a.*a>\.?|<br>/g, '');}
      else {
        if (question.find('[class*=extract]').length) stem = question.find('[class*=extract]').html();
        else stem = question.find('.nonindent').html();
        stem = stem.replace(/<br>/g, '').replace(/\n */g, ' ');
      }

      getQuestionType(stem);

      choices = [];
      if (type != 'select') {
        selector = `[class*=extract1], .Test_sample2l, h1, .list0, ${passageFilter}`; // md[34] .list0
        src = question.find('img').attr('src') ? question.find('img').attr('src') : question.nextUntil(selector).last().find('img').attr('src');
        if (src && src.match(/\d+_r1/) && !src.match(/_42[01]_|L1[12]|circ/)) {
          file = src.replace(/\w+$/, 'txt');
          options = fs.readFileSync(path.join(ebooks, ebook, file), 'utf8').replace(/\r?\n$/, '').split(/\r?\n/);
        } else {
          options = $('div p', question.nextUntil(selector).filter('.img_hang').last());
          if (name.match(/pd-v[1-5]|md-v[12]/) || question.next().html().match(/<td/)) {
            if (question.next().html().match(/<td/)) options = $('td:not(:contains(Blank))', question.next());
            else if (question.parent().is('#div1')) options = question.nextUntil('.list1').filter('.list3_1');
            else if (!blanks) options = $('p:not(.list1)', question.parent());
            else options = question.nextUntil('.list0').filter('p.list2');
          } else if (name.match(/md-v[34]/)) options = question.nextAll();
          if (options.length > 9) options = $('div p', question.next());
        }

        if (blanks && name.match(/pd-v[1-5]|md-v[12]/) || question.next().html().match(/<td/)) {
          choices = [];
          for (let i = 0; i < blanks.length; i++) {
            choice = [];
            options.filter(function(index) {
              return index % blanks.length == i;
            }).each(function() {
              choice.push($(this).text().trim());
            });
            choices.push(choice);
          }
        } else {
          const length = options.length;
          choice = [];
          $(options).each(function(i) {
            if (length > 5 && blanks.length > 1 && i % 3 == 0) choice = [];
            choice.push($(this).text().trim() ? $(this).text().trim() : this.toString());
            if (length > 5 && blanks.length > 1 && (i + 1) % 3 == 0) choices.push(choice);
          });
          if (length < 6 || blanks.length < 2) choices.push(choice);
        }

        answer = '';
        $('b', explanation).each(function() {
          if ($('b', explanation).text().match(/[A-I]/g))
            {answer += $(this).text().match(/[A-I]/)[0].charCodeAt(0) - 65};
          else {
            if (choices.flat().includes($(this).text().replace(/\d+. */, '')))
              {answer += choices.flat().indexOf($(this).text().replace(/\d+. */, ''))};
            else {
              $($(this).text().match(/[a-zA-Z]+/g)).each(function() {
                answer += choices.flat().findIndex((c) => {
                  if (c.match(' ')) return c.match(this.toString());
                  else return c == this.toString();
                });
              });
            }
          }
        });
      } else {
        answer = selects[`${i}`];
      }

      if (choices.flat().length == 3 || (blanks && blanks.length == 1 && choices.flat().length == 6))
        {type = 'checkbox'};
      html = `<p><b>${explanation.text()}</b></p><p>${explanation.nextUntil('.list0').html()}`;
      if (!name.match(/pd-v[67]/)) {
        if (explanation.next().is('.extract, .list_nonindent, .left'))
          {html = `<p>${explanation.next().html().replace(/\n */g, ' ')}`};
        else
          {html = `<p>${explanation.html().replace(/\n */g, ' ').replace(/<a.*a>|<span.*span>/, '')}`};
      }
      html = `${html.replace(/(?<=<p><b>)\d+\. /, '').replace(/ \w+(-\w+)?=".*?"|\n */g, '')}</p>`;
    }

    function getPassage(passages) {
      $(passages).each(function() {
        let text = '';

        if (name.match(/pd-v[67]/) || $(this).next().is('.indent.spaceabove')) {
          if ($(this).text().match(/Questions? \d/) || $(this).next().is('.indent.spaceabove')) {
            $(this).nextUntil(passageFilter).filter('.indent.spaceabove').each(function() {
              text += `<p>${$(this).html()}</p>`;
            });
          } else
            {text = `<p>${$(this).html()}</p>`};
        } else if (name.match(/pd-v[1-5]|md-v[12]/) || $(this).next().is('.block_98')) {
          if ($(this).children().length > 1) images = $(this).children();
          else if ($(this).next().is('.block_98')) images = $(this).nextUntil('.custom_list, .sans');
          else images = $.merge($(this), $(this).nextUntil('.custom_list, .sans'));

          images.each(function() {
            const file = $('img', $(this)).attr('src').replace('jpg', 'txt');
            const content = fs.readFileSync(path.join(ebooks, ebook, file), 'utf8');
            text += content.replace(/(^|\r?\n)(\(\d?[05]\)|L[i\/]ne)/g, '\n').replace(/\r?\n/g, ' ').replace(/ +/g, ' ');
          });
        } else if (name.match(/md-v[34]/)) {
          text = `<p>${$(this).next().html()}</p>`;
        } else {
          text = $(this).html().replace(/\n */g, ' ');
          text = text.replace(/ ?<p.*?> ?/g, '<p>').replace(/ ?<\/p> ?/g, '</p>');
        }

        passage = {
          passage: text.replace(/ \w+(-\w+)?=".*?"|\n *|(?<=^<p>)\d+\.|&#xA0;|<h4.*?\/h4>/g, ''),
        };
        const nodes = $(this).nextUntil(`${passageFilter}, title`).filter('div').length ? $(this) : $(this).parent();
        let question = nodes.nextUntil(`${passageFilter}, title`).filter(function() {
          return $(this).is('.Test_sample1l, .sans, .custom_list, .block0') && $(this).text().trim().match(/^\d+\./) && !$(this).text().match(/_/);
        });
        filter = name.match(/pd-v[1-7]|md-v[12]/) ? '.img_hang' : '.square1';
        let start = name.match(/pd-v[1-5]|md-v[1-4]/) ? question.first() : question.first().next(filter);
        let end = name.match(/pd-v[1-5]|md-v[1-4]/) ? question.last() : question.last().next(filter);
        if (start.length && !start.text().match('Select the senten') && !start.parent().is('#div1')) {
          start = start.find('p').last().text().trim();
          passage.start = set.questions.findIndex((q) => q.choices.flat().includes(start));
        } else {
          start = question.first().html().replace(/^\d+\.|&#xA0;|<p.*?>|<\/p>|<span.*span>/g, '').trim();
          passage.start = set.questions.findIndex((q) => q.stem.includes(start));
        }
        if (end.length && !end.text().match('Select the sentence') && !end.parent().is('#div1')) {
          end = end.find('p').last().text().trim();
          passage.end = set.questions.findIndex((q) => q.choices.flat().includes(end));
        } else {
          end = question.last().html().replace(/^\d+\.|&#xA0;|<p.*?>|<\/p>|<span.*span>/g, '').trim();
          passage.end = set.questions.findIndex((q) => q.stem.includes(end));
        }
        if (!$(this).text().match(/Questions? \d/) && name.match(/pd-v[67]/))
          {passage.end = passage.start};
        if (passage.end < 0 || passage.start < 0) return;
        set.passages.push(passage);
      });
    }
  } else if (name.match(/be/)) {
    if (name.match(/pq/)) {
      sets = [
        [
          [25, 34],
          [55, 64],
          [85, 89],
        ],
        [
          [35, 44],
          [65, 74],
          [90, 93],
        ],
        [
          [45, 54],
          [75, 84],
          [94, 97],
        ],
      ];
    } else if (name.match(/-e/)) {
      sets = [
        [
          [1, 24],
        ],
      ];
    }

    regExp = /Barron_New_GRE_19.*htm/;
    ebook = '';
    selects = {};

    $ = getHTML();
    questions = $(`.question`);
    // questions.each(function () {console.log($(this).text())})
    explanations = $('.explanation');
    passages = $('.passage');

    function getQuestion(question, explanation, i) {
      stem = question.html().replace(/\n */g, ' ').replace(/decisact/g, '_________').trim();

      getQuestionType(stem);

      answer = '';
      choices = [];
      if (type != 'select') {
        question.nextUntil('.explanation, .question, .passage').each(function(i) {
          if (blanks && blanks.length > 1) {
            if (!choices.length) for (let i = 0; i < blanks.length; i++) choices.push([]);
            choices[i % blanks.length].push($(this).text().trim());
          } else {
            if (!choices.length) choices.push([]);
            choices[0].push(getText($(this)));
          }
        });

        $('u', explanation).each(function() {
          if ($(this).text().match(/^[A-I]$/))
            {answer += $(this).text().charCodeAt(0) - 65};
          else
            {answer += choices.flat().indexOf($(this).text()).toString()};
        });
      } else {
        answer = selects[`${i}`];
      }

      if (choices.flat().length == 3 || (blanks && blanks.length == 1 && choices.flat().length == 6))
        {type = 'checkbox'};
      html = `<p>${explanation.html().trim()}</p>`.replace(/\n */g, ' ').replace(/ +/g, ' ');
    }

    function getPassage(passages) {
      $(passages).each(function() {
        passage = {
          passage: `<p>${$(this).html()}</p>`.replace(/\n */g, ' ').replace(/(<\/?p>)\n* *\1/g, '$1').trim(),
        };
        let start = getText($(this).nextUntil('.passage').filter('.question').first().next());
        let end = getText($(this).nextUntil('.passage').filter('.question').last().next());
        passage.start = set.questions.findIndex((q) => q.choices.flat().includes(start));
        passage.end = set.questions.findIndex((q) => q.choices.flat().includes(end));
        if (passage.end < 0 || passage.start < 0) return;
        set.passages.push(passage);
      });
    }
  } else if (name.match(/vp/)) {
    sets = [
      [
        [1, 6],
        [131, 136],
        [251, 263],
      ],
      [
        [7, 11],
        [137, 141],
        [264, 278],
      ],
      [
        [12, 16],
        [142, 147],
        [279, 292],
      ],
      [
        [17, 21],
        [148, 151],
        [293, 308],
      ],
      [
        [22, 27],
        [152, 157],
        [309, 321],
      ],
      [
        [28, 34],
        [158, 162],
        [322, 334],
      ],
      [
        [35, 40],
        [163, 167],
        [335, 348],
      ],
      [
        [41, 46],
        [168, 170],
        [349, 364],
      ],
      [
        [47, 53],
        [171, 176],
        [365, 376],
      ],
      [
        [54, 59],
        [177, 180],
        [377, 391],
      ],
      [
        [60, 65],
        [181, 184],
        [392, 404],
      ],
      [
        [66, 69],
        [185, 188],
        [405, 421],
      ],
      [
        [70, 75],
        [189, 193],
        [422, 435],
      ],
      [
        [76, 81],
        [194, 198],
        [436, 449],
      ],
      [
        [82, 88],
        [199, 204],
        [450, 461],
      ],
      [
        [89, 95],
        [205, 210],
        [462, 473],
      ],
      [
        [96, 100],
        [211, 218],
        [474, 487],
      ],
      [
        [101, 104],
        [219, 223],
        [488, 503],
      ],
      [
        [105, 110],
        [224, 229],
        [504, 516],
      ],
      [
        [111, 116],
        [230, 236],
        [517, 528],
      ],
      [
        [117, 121],
        [237, 239],
        [529, 545],
      ],
      [
        [122, 125],
        [240, 245],
        [546, 560],
      ],
      [
        [126, 130],
        [246, 250],
        [561, 575],
      ],
    ];
    regExp = /GRE by Vibrant.*htm/;
    ebook = '';
    selects = {
      '253': 1,
      '261': 1,
      '263': 1,
      '264': 1,
      '270': 1,
      '275': 1,
      '287': 1,
      '288': 1,
      '291': 1,
      '303': 1,
      '315': 1,
      '320': 1,
      '330': 1,
      '333': 1,
      '334': 1,
      '337': 1,
      '343': 1,
      '347': 1,
      '351': 1,
      '352': 1,
      '359': 1,
      '360': 1,
      '371': 1,
      '379': 1,
      '383': 1,
      '397': 1,
      '412': 1,
      '414': 1,
      '418': 1,
      '424': 1,
      '428': 1,
      '434': 1,
      '467': 1,
      '478': 1,
      '481': 1,
      '483': 1,
      '489': 1,
      '492': 1,
      '499': 1,
      '502': 1,
      '506': 1,
      '512': 1,
      '513': 1,
      '523': 1,
      '527': 1,
      '528': 1,
      '534': 1,
      '545': 1,
      '570': 1,
    };

    var passageFilter = '.calibre18:contains("assage")';
    var questionFilter = `.calibre8, .calibre9`;
    $ = getHTML();
    questions = $(questionFilter).filter(function() {
      return $(this).text().trim().match(/^\d+[:\.] /) && !$(this).html().match(/calibre19[45]/);
    });
    explanations = $(questionFilter).filter(function() {
      return ($(this).text().trim().match(/^Answer to question \d+: *$/i)) || ($(this).text().trim().match(/^\d+[:\.] ?/) && $(this).html().match(/calibre19[45]/));
    });
    passages = $(passageFilter).parent();

    function getQuestion(question, explanation, i) {
      stem = question.html().replace(/\n */g, ' ').replace(/<span.*?>|<\/span>/g, '').replace(/\d+[:.]/, '').trim();

      getQuestionType(stem);

      answer = '';
      choices = [];
      if (type != 'select') {
        let src;
        let options = [];
        if (question.next().next().is('.calibre2')) {
          src = $('img', question.next().next()).attr('src');
          options = fs.readFileSync(`${ebooks}/GRE Text Completion and Sentence Equivalence${src.replace(/\.\./, '').replace(/jpeg/, 'txt')}`, 'utf8').replace(/Blank.*\r?\n/, '').trim();
        } else {
          question.nextUntil('.calibre8:contains(": "), .calibre9:contains(". "), .calibre9:contains(": "), .calibre9:contains("Passage "), .calibre9:contains("For Question"), .calibre9:contains("Select ")').each(function() {
            if ($(this).text().trim()) options.push($(this).text().trim());
          });
        }
        if (blanks && blanks.length > 1) {
          if (!choices.length) for (let i = 0; i < blanks.length; i++) choices.push([]);
          for (let i = 0; i < 3; i++) {
            let option = options.split('\r\n')[i].trim();
            for (let j = 0; j < blanks.length; j++) {
              if (option.trim().split(/ +/).length > blanks.length) {
                choices[j % blanks.length].push(option.split(/ {2,}/)[j].trim());
              } else {
                choices[j % blanks.length].push(option.split(/ +/)[j].trim());
              }
            }
          }
        } else {
          if (!choices.length) choices.push([]);
          if (typeof options == 'string') options = options.trim().split('\r\n');
          options.forEach((option) => choices[0].push(option.trim()));
        }

        answer = '';

        if (choices.flat().length == 3 || (blanks && blanks.length == 1 && choices.flat().length == 6))
          {type = 'checkbox'};

        if (explanation.is('.calibre9')) {
          explanation.next().text().split('.')[0].match(/\b[A-I]\b/g).forEach((choice) => answer += choice.charCodeAt(0) - 65);
        } else {
          text = explanation.html().replace(/and *(?= *<)?|,|\d+[:.]|<span.*?>|<\/span>/g, '  ').trim();
          if ((text.split(/ +/).length > blanks.length && type != 'checkbox') || (text.split(/ +/).length > 2 && type == 'checkbox'))
            {text = text.split(/ {2,}/)};
          else
            {text = text.split(/ +/)};

          text.forEach((choice) => answer += `${choices.flat().indexOf(choices.flat().find((c) => c.match(RegExp(choice, 'i'))))}`);
        }
      } else {
        answer = explanation.next().text().match(/(?<=").*(?=")/)[0];
      }

      html = explanation.html().replace(/and|(Answer to Question )?\d+[:\.]|<span.*?>|<\/span>/gi, ' ').replace(/ +/g, ' ');
      var explanation = explanation.next();
      while (explanation.text().trim() && !explanation.text().match(/\d+[:\.]/)) {
        html += `<p>${explanation.text().trim()}</p>`;
        explanation = explanation.next();
      }
    }

    function getPassage(passages) {
      $(passages).each(function() {
        let text = '';
        let paragraph = $(this).next().next();
        while (paragraph.text().trim() && !paragraph.text().trim().match(/^\d+[:\.]|answer choice|For Question/i)) {
          text += `<p>${paragraph.html().replace(/<span.*?>|<\/span>/g, '').trim()}</p>`;
          paragraph = paragraph.next();
        }

        passage = {
          passage: text,
        };
        let question = $(this).nextUntil('.calibre9:contains("Passage ")').filter(function() {
          return $(this).text().trim().match(/^\d+[:\.] /) && $(this).attr('class').match(/calibre[89]/);
        });
        let start = getText(question.first().next());
        let end = getText(question.last().next());
        if (end) {
          passage.end = set.questions.findIndex((q) => q.choices.flat().includes(end));
        } else {
          passage.end = set.questions.findIndex((q) => q.stem == question.last().html().replace(/<span.*?>|<\/span>/g, '').replace(/\d+[:.]/, '').trim());
        }
        if (start) {
          passage.start = set.questions.findIndex((q) => q.choices.flat().includes(start));
        } else {
          passage.start = set.questions.findIndex((q) => q.stem == question.first().html().replace(/<span.*?>|<\/span>/g, '').replace(/\d+[:.]/, '').trim());
        }
        if (passage.end < 0 || passage.start < 0) return;
        for (let i = passage.start; i <= passage.end; i++) {
          if (set.questions[i].answer.toString().match(/[A-Za-z]/)) {
            let index = node.updateContent(passage.passage).replace(/&quot;/g, '"').replace(/<\/?p>/g, '').split(/((?<=[^A-Z][a-z0-9][\)\>]))?[?!\.]'? /).filter((s) => s).findIndex((s) => s.includes(set.questions[i].answer.replace(/\. *$/, '')));
            set.questions[i].answer = index;
          }
        }
        set.passages.push(passage);
      });
    }
  } else if (name.match(/ap/)) {
    if (name.match(/pq/)) {
      sets = [
        [
          [9, 27],
        ],
      ];
    } else if (name.match(/-e/)) {
      sets = [
        [
          [1, 8],
        ],
      ];
    }

    regExp = /GRE by ArgoPrep.*htm/;
    ebook = '';
    selects = {};
    setPDF('GRE by ArgoPrep');
    $ = getHTML();
    questions = $(`.question`);
    explanations = $('.explanation');
    passages = $('.passage');

    function getQuestion(question, explanation, i) {
      stem = question.html().replace(/\n */g, ' ').replace(/decisact/g, '_________').trim();

      getQuestionType(stem);
      console.log(i);
      choices = [];
      if (type != 'select') {
        question.nextUntil('.explanation, .question, .passage').each(function(i) {
          if (blanks && blanks.length > 1) {
            if (!choices.length) for (let i = 0; i < blanks.length; i++) choices.push([]);
            choices[Math.floor(i / 3)].push($(this).text().trim());
          } else {
            if (!choices.length) choices.push([]);
            choices[0].push(getText($(this)));
          }
        });

        if ($('u', explanation).length) {
          $('u', explanation).each(function() {
            if ($(this).text().match(/^[A-I]$/))
              {answer += $(this).text().charCodeAt(0) - 65};
            else
              {answer += choices.flat().indexOf($(this).text()).toString()};
          });
        } else {
          $(explanation.text().split('.')[0].match(/[A-I]/g)).each(function() {
            answer += this.toString().charCodeAt(0) - 65;
          });
        }
      } else {
        answer = explanation.text().match(/(?<=").*(?=")/)[0];
      }

      if (choices.flat().length == 3 || (blanks && blanks.length == 1 && choices.flat().length == 6))
        {type = 'checkbox'};
      html = `<p>${explanation.html().trim()}</p>`.replace(/\n */g, ' ').replace(/ +/g, ' ');
    }

    function getPassage(passages) {
      $(passages).each(function() {
        passage = {
          passage: `<p>${$(this).html()}</p>`.replace(/\n */g, ' ').replace(/(<\/?p>)\n* *\1/g, '$1').trim(),
        };
        let question = $(this).nextUntil('.passage').filter(function() {
          return $(this).is('.question') && !$(this).text().match(/_/);
        });
        let start = getText(question.first().next('.choice'));
        let end = getText(question.last().next('.choice'));
        if (end) {
          passage.end = set.questions.findIndex((q) => q.choices.flat().includes(end));
        } else {
          passage.end = set.questions.findIndex((q) => q.stem == question.last().html().replace(/<span.*?>|<\/span>/g, '').replace(/\d+[:.]/, '').trim());
        }
        if (start) {
          passage.start = set.questions.findIndex((q) => q.choices.flat().includes(start));
        } else {
          passage.start = set.questions.findIndex((q) => q.stem == question.first().html().replace(/<span.*?>|<\/span>/g, '').replace(/\d+[:.]/, '').trim());
        }
        if (passage.end < 0 || passage.start < 0) return;

        for (let i = passage.start; i <= passage.end; i++) {
          if (set.questions[i].answer.toString().match(/[A-Za-z]/)) {
            let index = node.updateContent(passage.passage).replace(/&quot;/g, '"').replace(/(<\/?p>|&#x.*?;)/g, '').split(/((?<=[^A-Z][a-z0-9][\)\>]))?[?!\.]'? /).filter((s) => s).findIndex((s) => s.includes(set.questions[i].answer.replace(/(\. *$|[\u0080-\uffff])/, '')));
            set.questions[i].answer = index;
          }
        }
        set.passages.push(passage);
      });
    }
  } else if (name.match(/gr/)) {
    sets = [
      [
        [1, 7],
        [20, 23],
        [32, 44],
      ],
      [
        [8, 13],
        [24, 27],
        [45, 58],
      ],
      [
        [14, 19],
        [28, 31],
        [59, 72],
      ],
    ];

    regExp = /Gruber's Complete GRE Guide 2015.*htm/;
    ebook = '';
    selects = {};

    $ = getHTML();
    questions = $(`.question`);
    // questions.each(function () {console.log($(this).text())})
    explanations = $('.explanation');
    passages = $('.passage');

    function getQuestion(question, explanation, i) {
      stem = question.html().replace(/\n */g, ' ').replace(/decisact/g, '_________').trim();

      getQuestionType(stem);

      answer = '';
      choices = [];
      if (type != 'select') {
        question.nextUntil('.explanation, .question, .passage').each(function(i) {
          if (blanks && blanks.length == 2) {
            if (!choices.length) for (let i = 0; i < blanks.length; i++) choices.push([]);
            choices[i % 2].push($(this).text().trim());
          } else if (blanks && blanks.length == 3) {
            if (!choices.length) for (let i = 0; i < blanks.length; i++) choices.push([]);
            choices[i % 3].push($(this).text().trim());
          } else {
            if (!choices.length) choices.push([]);
            choices[0].push($(this).text().trim());
          }
        });

        $(html.split('.')[0].match(/\b[A-I]\b/g)).each(function() {
          answer += this.toString().charCodeAt(0) - 65;
        });
      } else {
        answer = selects[`${i}`];
      }

      if (choices.flat().length == 3 || (blanks && blanks.length == 1 && choices.flat().length == 6))
        {type = 'checkbox'};
      html = `<p>${explanation.html().trim()}</p>`.replace(/\n */g, ' ').replace(/ +/g, ' ');
    }

    function getPassage(passages) {
      $(passages).each(function() {
        passage = {
          passage: `<p>${$(this).html()}</p>`.replace(/\n */g, ' ').trim(),
        };
        let start = $(this).nextUntil('.passage').filter('.question').first().next().text().trim();
        let end = $(this).nextUntil('.passage').filter('.question').last().next().text().trim();
        passage.start = set.questions.findIndex((q) => q.choices.flat().includes(start));
        passage.end = set.questions.findIndex((q) => q.choices.flat().includes(end));
        if (passage.end < 0 || passage.start < 0) return;
        set.passages.push(passage);
      });
    }
  }

  getQuestions(name, getQuestion, getPassage, getResponse);
}

// 5lb 3rd has 478 questions, 5lb 2nd has 519 questions
name = 'og-pt';
ebooks = 'C:/Github/temp/ebooks';
grePath = 'C:/GitHub/js/gre.js';
gre = node.readJS(grePath);

if (!name.match(/-pt/)) getTest(name);
else {
  for (let i = 1; i < 3; i++)
    {['i', 'a', 'v1', 'v2', 'q1', 'q2'].forEach(set => { getTest(`${name}${i}-${set}`) })}; // 'i', 'a', 'v1', 'v2',
}

gre.sort((a, b) => (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0));
node.writeJS(grePath)
;