
/**
 * @param {number} x x coordinate of point
 * @param {number} y y coordinate of point
 */
class Point {

}

/**
 * @param {number} p1 point 1 in the line
 * @param {number} p2 point 2 in the line
 */
class Line {
  /**
   * constructor of line
   * @param {number} p1 point 1 of the line
   * @param {number} p2 point 2 of the line
   * @param {number} x x coordinate
   * @param {number} y y coordinate
   */
  constructor(p1, p2, x = 0, y = 0) {
    this.p1 = p1,
      this.p2 = p2,
      this.x = x,
      this.y = y;
  }

  /**
   * get point slope form
   * @param {number} x1 point 1 x coordinate
   * @param {number} y1 point 1 y coordinate
   * @param {number} x2 point 2 x coordinate
   * @param {number} y2 point 2 y coordinate
   * @param {number} x x coordinate to define y coordinate
   * @param {number} y y coordinate to define x coordinate
   */
  getPointSlope(x1, y1, x2, y2, x, y) {
    let slope = (y2 - y1) / (x2 - x1);
    let intersect = x1 * slope - y1;
    if (intersect.toString().length > 6) {
      intersect = toTex(math.fraction(math.evaluate(intersect)).toFraction());
    }
    if (slope.toString().length > 6) {
      slope = toTex(math.fraction(math.evaluate(slope)).toFraction());
    }
    evaluate(`y=${slope}x${getSign(-intersect)}`, 'latex');
    if (y) evaluate(`y=${y},x=${(y + fromFraction(intersect)) / fromFraction(slope)}`, 'latex');
    if (x) evaluate(`x=${x},y=${fromFraction(slope) * x + fromFraction(intersect)}`, 'latex');
  }
}

/**
 * @class Clinder
 * @param {number} radius radius of clinder
 * @param {number} height height of clinder
 */
class Clinder {
  /**
   * clinder construction
   * @param {number} radius clinder radius
   * @param {number} height clinder height
   */
  constructor(radius, height) {
    this.radius = radius;
    this.height = height;
    this.surfaceArea = 2 * this.radius * (this.radius + this.height);
    this.volume = this.radius * this.radius * this.height;
  }

}

/**
 * @class Sequence
 * @param {number} a1 first term of the sequence
 * @param {number} cd common difference
 * @param {number} n nth term of the sequence
 */
class Sequence {
  constructor(a1, cd, n) {
    this.a1 = a1;
    this.cd = cd;
    this.n = n;
  }

  get explictFormula() {
    return `a_n=${this.cd}n${getSign(this.a1 - this.cd)}`;
  }

  get an() {
    return `a_${this.n}=${this.cd * this.n + this.a1 - this.cd}`;
  }
}

/**
 * @param {number} exp expression
 * @return {string} expression including sgin
 */
function getSign(exp) {
  return `${exp > 0 ? '+' : '-'}${Math.abs(exp)}`;
}

function showTex(exp, node) {
  function toTex(exp) {
    // if (exp.match(/\(.*\)/))
    // exp = `({${toTex(exp.match(/\(.*\)/)[0].replace(/[\(\)]/g, ''))})`

    exp = `${exp}`.replace(/\(?(.*?)\)?\/(.*)/g, '\\frac{$1}{$2}');
    // while (exp.match(/&lt(?!{)/))
    // exp = exp.replace(/&lt(.*)(?!&lt)/g, '\\lt{$1}')
    while (exp.match(/<=(.*)(?!&lt)/)) { exp = exp.replace(/<=(.*)(?!&lt)/g, '\\le{$1}') };
    return exp;
  }

  katex.render(toTex(exp), node);
  $('.base').css({ fontWeight: 'bold' });
  if ($('.mfrac', $(node)).length) {
    $('.base', $(node)).css({
      display: 'unset',
      fontSize: 28,
      fontWeight: 'bold'
    })
  };
}

function fromFraction(exp) {
  exp = exp.toString();
  if (exp.match(/frac/))
  // exp = exp.match(/(?<=\{)\d+(?=\})/g)[0] / exp.match(/(?<=\{)\d+(?=\})/g)[1]
  { return +exp };
}

function evaluates(exp, option) {
  let prefix = '';
  if (exp.match('\u2003')) {
    prefix = exp.split('\u2003')[0];
    exp = exp.split('\u2003')[1];
  }
  if (option == 'frac') {
    result = toTex(math.fraction(math.evaluate(exp)).toFraction())
  } else if (!option) {
    result = toTex(math.evaluate(exp))
  }

  result = option == 'latex' ? exp : `${toTex(exp)} = ${result}`;

  const p = $('<p>', {
    class: 'my-math',
  }).appendTo(main).css({
    overflow: mobileFlag ? 'scroll' : '',
  });
  showTex(result, p[0]);
  // if (option != 'latex') katex.render(result, p[0])
  // else katex.render(result, p[0]) //p.html(`\$\$${result}\$\$`)
  if (prefix) p.html(`${prefix}\u2003${p.html()}`);
}

function createCalculator(object, parent) {
  function addMethodFunc(object) {
    getMethods(object).forEach((method) => {
      if (method.match(/construct/)) return;
      if (type == 'calc') {
        showTex(object[method], $(`#${method}Output`)[0]);
        // $(`#${method}Output`).html();
      } else if (type == 'show') {
        const div = $('<div>', { class: 'my-section' }).appendTo(parent);
        const result = method.replace(/(\w)([A-Z])/g, '$1 $2').replace(/^([a-z])/g, (match, p1) => {
          return match.replace(p1, p1.toUpperCase());
        });
        $('<span>', {
          class: 'my-padding my-highlight',
          html: result,
        }).appendTo(div);
        $('<span>', { class: 'my-padding my-highlight', id: `${method}Output` }).appendTo(div);
      }
    });
  }
  $('<p>', { class: 'my-padding my-highlight', html: object.constructor.name }).appendTo(parent);

  Object.keys(object).forEach((prop) => {
    const div = $('<div>', { class: 'my-section' }).appendTo(parent);
    const label = $('<label>').appendTo(div);
    $('<span>', { class: 'my-padding my-highlight', html: prop }).css({
      display: 'inline-block',
      textAlign: 'right',
      width: 80,
    }).appendTo(label);
    $('<input>', { class: 'my-input', id: `${prop}Input` }).appendTo(label).on('input', function () {
      object[$(this).attr('id').replace(/Input/, '')] = +$(this).val();
      addMethodFunc(object, 'calc');
    });
  });
  addMethodFunc(object, 'show');
}

/*
toExplictFormula(3, -14, 3)
  evaluate('lcm(30,75)');
  evaluate('gcd(30,75)');
  evaluate('1.2.4\u2003-8/11 + 5/11', 'frac');
  evaluate('1.2.5\u20031/3 + -2/5', 'frac');
  evaluate('1.2.6\u200310/7 * (-1/3)', 'frac');
  evaluate('1.2.8\u200310/7 * (-1/3)', 'frac');
  evaluate('1.2.9\u200317/8 * (-1/3)', 'frac');
   */
$('.my-tex, .JXGtext').each(function() {
  if (!$('.katex', $(this)).length) {
    showTex($(this).addClass('my-tex my-highlight').text(), $(this)[0]);
  }
}).css({
  zIndex: 'unset',
});