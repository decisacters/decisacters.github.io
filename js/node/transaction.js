node = require('c:/github/js/node/node.js');

function getAlipay() {
  // https://translate.google.com/translate?sl=auto&tl=en&u=https%3A%2F%2Fconsumeprod.alipay.com%2Frecord%2Findex.htm

  // download txt and Open with Code then Reopen with Encoding
  let csv = fs.readFileSync('c:/gitHub/temp/archive/csv/alipay_record.txt', 'utf8');
  csv = csv.replace(/(.*\r?\n)*.*Transaction record details list.*\r?\n/, '');
  csv = csv.replace(/\r?\n-+ *-+\r?\n(.*\r?\n)*/, '');
  const list = node.fromCSV(csv);

  /* $ = cheerio.load(fs.readFileSync('c:/github/temp/temp.html', 'utf8').replace(/\n * /g, ' '));

  if (!$('#tradeRecordsIndex').length) return; // alipay

  $('.J-item').each(function () {
    let transaction = {
      name:'',
      date:$('.time-d', $(this)).text().trim(),
      amount: +$('.amount', $(this)).text().trim().replace(/ +/, ''),
      category:0
    }
    node.pushElement(transactions, transaction, (t) => t.date == transaction.date && t.amount == transaction.amount, 'push');
  }); */
}

function getWechat() {
  node.traverseDir('c:/gitHub/temp/archive/csv').forEach((file) => {
    let csv = fs.readFileSync(file, 'utf8');
    csv = csv.replace(/(.*\r?\n)*.*WeChat payment bill list.*\r\n/, '');
    const list = node.fromCSV(csv, 1, 7);
  });
}

function getBOC() {

}

const jsPath = 'c:/github/js/transactions.js';
transactions = node.readJS(jsPath);
getAlipay();
getWechat();
// node.writeJS(jsPath);
