node = require('./node.js');
tesseract = require(`${modules_path}/tesseract.js`);
jimp = require(`${modules_path}/jimp`);

// var folder = `C:/GitHub/temp/ebooks/Verbal Workout for the GRE 6/OEBPS`
let folder = `C:/GitHub/temp/pdf/Barron_New_GRE_19`;
height = 1;
width = 1;
isChoice = false;

function toText(path) {
  matches = isChoice ? $(this).parent().prev().text().match(/_+/g) : '';
  txt = path.replace(/gif|jpe?g/, 'txt');

  if (fs.existsSync(txt) || (!matches && isChoice)) return;

  if (fs.existsSync(path.replace(/.(gif|jpe?g)/, `_0.txt`))) {
    let text = '';
    for (i = 0; i < height * width; i++) {
      const file = path.replace(/.(gif|jpe?g)/, `_${i}.txt`);

      if (fs.existsSync(file)) {
        text += `${fs.readFileSync(file, 'utf8')}\n`.replace(/\n+/g, '\n');
        // fs.unlinkSync(file)
      }
    }
    // if (!fs.existsSync(txt)) fs.writeFileSync(txt, text, 'utf8');
  } else {
    jimp.read(path, (err, image) => {
      temp = '';

      for (i = 0; i < height; i++) {
        for (let j = 0; j < width; j++) {
          image.clone().crop(Math.floor(image.bitmap.width / width * j), Math.floor(image.bitmap.height / height * i), Math.floor(image.bitmap.width / width), Math.floor(image.bitmap.height / height)).getBufferAsync(jimp.MIME_JPEG).then((image) => {
            tesseract.recognize(image).then((data) => {
              if (temp != path) num = 0;
              console.log(path);
              const name = isChoice ? `_${num}.txt` : '.txt';
              fs.writeFileSync(path.replace(/.(gif|jpe?g)/, name), data.text, 'utf8');
              temp = path;
              num++;
            });
          });
          // write(path.replace(/.(gif|jpe?g)/, `${j}.jpg`))
        }
      }
    });
  }
}
num = 0;
fs.readdirSync(folder).forEach((file, index) => {
  if (index > 145 && index < 442) return;
  if (file.match(/0((39|58|7[23])-1|46-0|2[2-7]|4[01]|(59|60))/) || (index > 450 && index < 471) || (index > 492 && index < 513)) width = 2;
  else return;

  if ((folder.match(/ebooks/) && !file.match(/\.x?htm/)) || (folder.match(/pdf/) && !file.match(/\.jpg/))) return;

  if (folder.match(/ebooks/)) {
    const $ = cheerio.load(fs.readFileSync(path.join(folder, file), 'utf8'));
    $('.block_93 img, .block_91 img, .block_92 img').each(function() {
      toText(`${folder}/${$(this).attr('src')}`);
    });
  } else toText(`${folder}/${file}`);
})
;