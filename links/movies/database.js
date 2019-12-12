/* global fs, path */
const node = require('c:/github/js/node/node.js');
let dir = 'D:/Downloads/movies';
const jsFile = 'c:/github/links/movies/movies.js';
const movies = node.readJS(jsFile);
if (!fs.existsSync(dir)) {
  dir = 'C:/Users/decisactor/Downloads/Videos';
}
fs.readdirSync(dir).forEach((file) => {
  if (!file.match(/.mp4/)) return;
  const movie = {
    name: file.replace(/\.\d+\.mp4/, '').replace(/\./g, ' '),
    year: file.match(/\d+(?=\.mp4)/)[0],
  };
  // add movie to database if its subtitle exist and it is not in the database
  if (fs.existsSync(path.join(dir, file.replace(/mp4/, 'srt'))) &&
    !movies.find((m) => m.name == movie.name && m.year == movie.year)) {
    console.log(file);
    movies.push(movie);
  }
});
node.writeJS(jsFile);
