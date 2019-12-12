node = require('./node.js');
pokemon = {
  X: '00055D00',
  Y: '00055E00',
  OR: '0011C400',
  AS: '0011C500',
  S: '00164800',
  M: '00175E00',
  US: '001B5000',
  UM: '001B5100',
};
dir = `${process.env.APPDATA}/Citra/sdmc/Nintendo 3DS/00000000000000000000000000000000/00000000000000000000000000000000/title/00040000`;

function save() {
  Object.entries(pokemon).forEach((game) => {
    oldSave = `${dir}/${game[1]}/data/00000001/main`;
    newSave = `${os.homedir}/Downloads/Games/DeSmuMe/Battery/${game[0]}`;
    if (fs.existsSync(newSave)) {
      fs.copyFileSync(newSave, oldSave);
      fs.unlinkSync(newSave);
    } else
      {fs.copyFileSync(oldSave, newSave)};
  });
}

// https://bulbapedia.bulbagarden.net/wiki/List_of_Pok%C3%A9mon_by_National_Pok%C3%A9dex_number
bulbapedia = 'https://bulbapedia.bulbagarden.net/wiki';
function getPokemon() {
  let pokedex = [];

  $('a').each(function() {
    if (this.href.includes('_(Pok%C3%A9mon)') && $(this).text()) {
      pokedex.push($(this).text());
    }
  });

  copy(pokedex);
}
fs.readFileSync('c:/github/links/games/pokemon/pokedex.html', 'utf8').split('\n').forEach((pokemon) => {
  const file = `${__dirname}/bulbapedia.bulbagarden.net\\${pokemon}.html`;
  fs.writeFileSync(file, '', 'utf8');
  node.getHTML(`${bulbapedia}/${pokemon}_(Pok%C3%A9mon)`, pokemon);
})
;