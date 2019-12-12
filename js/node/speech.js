node = require('./node.js');
util = require('util');
puppeteer = require(`${modules_path}/puppeteer`);
const readFile = util.promisify(fs.readFile);

(async () => {
  const browser = await puppeteer.launch({
    headless: false,
  });
  const page = await browser.newPage();
  await page.goto('https://text-to-speech-demo.ng.bluemix.net/');
  await page.addScriptTag({
    url: 'https://code.jquery.com/jquery-3.3.1.min.js',
  });

  async function getSpeech(value, name) {
    await page.evaluate(() => {
      $('textarea').val(value).focus();
    });
    await page.keyboard.type(' ');
    await page.evaluate(() => {
      $('.download-button').click();
    });
    await readFile('C:/Users/decisactor/Downloads/transcript.mp3');

    return new Promise((resolve) => {
      setTimeout(() => {
        resolve('resolved');
      }, 2000);
    });
  }

  node.readJS('C:/GitHub/js/gre.js').forEach(async (set) => {
    if (set.questions) {
      set.questions.forEach(async (question) => {
        if (question.stem.match(/_/)) {
          let stem = question.stem;
          question.answer.split('').forEach((index) => {
            let replacement = question.choices.flat()[index];
            if (question.type == 'checkbox' && index == 0) replacement += `or _`;
            stem = stem.replace(/_+/, replacement);
          });
          await getSpeech(stem, set.name);
        }
      });

      set.passages.forEach(async (passage) => {
        await getSpeech(passage.passage);
      });
    }
  });
  await browser.close();
})();
