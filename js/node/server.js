/* global node, fs */
node = require('./node.js');
node.updateContent('');
const http = require('http');
const url = require('url');
http.createServer((req, res) => {
  const query = url.parse(req.url, true);
  const type = query.path.split('.')[1];

  fs.readFile(`.${query.path}`, (err, data) => {
    if (!type.match(/ico/)) {
      res.writeHead(200, {
        Content: `text/${type}`,
      });
      res.write(data);
    }
    return res.end();
  });
}).listen(8080);
// http://localhost:8080/index.html
