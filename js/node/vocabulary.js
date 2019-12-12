node = require('./node.js');

words = [];
wordsArray = [];

content = fs.readFileSync('c:/github/temp/vocabulary.txt', 'utf8');
node.traverseDir('c:/github/temp/html').forEach(file => {
  if (file.match(/pokemon|\.git|bulbapedia/)) return;
  if (!content.match(file.match(/\w+(?=.html$)/)[0]))
    fs.unlinkSync(file);
})

content.split(' ').sort().forEach(word => {

  //console.log(word);
  definitions = '';
  synonyms = [];
  etymology = '';
  family = [];

  if ($ = node.getHTML(`https://www.lexico.com/en/definition/${word}`)) {
    // defintion
    $('.ind').each(function () {
      if (!$(this).html().match(/'phrase'|&#.*?;/)) definitions += `<p>${$(this).text()}</p>`
    })

    /*
    // example
    examples = ''
    $('.examples').each(function () {
        sentences = []
        $('.ex', $(this)).each(function () {
            sentences.push($(this).text().replace(/ ?[\u2018-\u2019]/g, '').replace(/'/g, `'`))
        })
        examples += `<p>${sentences.sort(function (a,b) {
            return b.length - a.length
        })[0]}</p>`
    })
     */

    // synonym
    
    $('.synonyms .syn').each(function () {
      if ($(this).html().match(/phrase|View synonyms/)) return
      synonyms = synonyms.concat($(this).html().replace(/<.*?>/g,'').split(/, /))
    })

    // etymology
    
    $('.etymology').each(function () {
      if (!$(this).html().match(/\bOrigin\b/)) return
      let html = $('p', $(this)).html()
      while (html.includes('/strong')) 
        html = html.replace(/<strong class="(phrase|syn)">(.*?)<\/strong>/g, '$2')
      etymology += `<p>${html}</p>`
    })
  }

  if ($ = node.getHTML(`https://www.vocabulary.com/dictionary/${word}`)) {
    family = $('[data]').attr('data').replace(/,"hw.*?(?=,)/g, '').replace(/,"freq.*?(?=})/g, '')
    family = family.replace(/"word"/g, `"w"`).replace(/"parent"/g, `"p"`)
    family = JSON.parse(family);

    if (typeof definitions != 'undefined' && !definitions) {
      $('h3.definition').each(function () {
        $('a', $(this)).remove()
        definitions += `<p>${$(this).text().trim()}</p>`
      })
    }
  }

  if ($ = node.getHTML(`https://www.thefreedictionary.com/${word}`)) {
    // synonyms

    $('#ThesaurusInner .Syn').each(function () {
      if ($(this).text().match(/=/) || !$(this).text().match(/,/)) return
      var vocabulary = []
      $('a', $(this)).each(function () {
        let text = $(this).text();
        if (!text.match(/[\u0080-\uffff]/) && !synonyms.includes(text)) {
          vocabulary.push(text)
        }
      })
      //synonyms += `${vocabulary.join(', ')}${vocabulary.length ? ', ' : ''}`
      synonyms = synonyms.concat(vocabulary)
    });
    /*     synonyms += `</div>`
    synonyms = synonyms.replace(/, ?</, '<').replace(/'|\u2019|&apos;/g, '')
    synonyms = synonyms.replace(/((?<=>)| )\w+([ -]\w+)+(,|(?=<))/g, '')
    synonyms = synonyms.replace(/<div class=exs><b><\/b>,<\/div>|<b><\/b>/g, '')
    synonyms = synonyms.replace(/,(?=<)| ,/g, '')
    synonyms = synonyms.replace(/(?<!\/b)>, /g, '>')
    synonyms = synonyms.replace(/<(div|[ib])( class=(syn|exs|thesaurus))?>\W+<\/\1>/g, '') */

    // etymology

    etymology += `<p>${$('.etyseg').html()}</p>`
    etymology = etymology.replace(/<\/?[A-Z]+.*?>/g, '')
    etymology = etymology.replace(/<[Aa].*?>(.*?)<\/[Aa]>/g, '<b>$1</b>')
    etymology = etymology.replace(/(<i.*?>.*?<\/i>)/g, '<b>$1</b>')
    etymology = etymology.replace(/<span.*?>(.*?)<\/span>/g, '$1')
    etymology = etymology.toLowerCase()

  }

  if ($ = node.getHTML(`https://www.thesaurus.com/browse/${word}`)) {

    var vocabulary = []
    $('li a', $('.synonyms-container').eq(0)).each(function () {
      let text = $(this).text();
      if (!vocabulary.includes(text) && !synonyms.includes(text) && !text.match(/ |\d|[A-Z]/)) {
        vocabulary.push(text)
      }
    });
    /*synonyms = synonyms.concat(vocabulary)
    synonyms += `${vocabulary.join(', ')}${vocabulary.length ? ', ' : ''}</div>`
    synonyms = synonyms.replace(/\w*(&.*?;|[\u0080-\uffff])\w*(?=[,<])|&.*?;/g, '')
    synonyms = synonyms.replace(/, ?</, '<').replace(`'`, '')
    synonyms = synonyms.replace(/((?<=>)| )\w+([ -]\w+)+(,|(?=<))/g, '')
    synonyms = synonyms.replace(/,(?=<)| ,/g, '')
    synonyms = synonyms.replace(/<(div|[ib])( class=(syn|exs|thesaurus))?>\W+<\/\1>/g, '')*/
  }
  
  wordsArray.push(word);
  if (!definitions) console.log(word)
  words.push({
    word: word,
    synonyms: [...new Set(synonyms.filter(word => word && !word.match(/[- \.A-Z]/)))].join(', '),
    definitions: definitions,
    etymology: etymology,
    family: family,
    //examples: examples
  })

})
fs.writeFileSync('c:/github/temp/vocabulary.txt', wordsArray.join(' '), 'utf8')
node.writeJS('c:/github/js/json/words.json', words)

$(['www.lexico.com','www.vocabulary.com', 'www.thefreedictionary.com', 'www.thesaurus.com']).each(function () {
  $(fs.readdirSync(`c:/github/temp/html/${this.toString()}`)).each(function () {
    if (wordsArray.includes(this.toString())) {
      fs
    }
  })
})