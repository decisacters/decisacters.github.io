function createBoard(id, box, height = 300, width = 375) {
  if (!$(`#${id}`).length) {
    $('<div>', {
      id: id,
      class: 'my-svg my-container'
    }).appendTo(main)
  }
  if (!$(`#${id}`).height(height).width(width).length) return
  return JXG.JSXGraph.initBoard(id, {
    boundingbox: box,
    showCopyright: false,
    showNavigation: false
  })
}

function initBoard(box, scale, path, img, width = 375) {
  if ($(`div#${path}`).length) $(`div#${path}`).remove()
  $('<div>', {
    class: 'my-container my-svg',
    id: path
  }).appendTo(img.parent())
  img.remove();
  height = (box[1] - box[3]) * scale
  return createBoard(path, box, height, width)
}

function setOffset(pos) {
  if (pos == 'bottom') {
    return [0, -10]
  } else if (pos == 'top') {
    return [0, 10]
  } else if (pos == 'left') {
    return [-10, 0]
  } else if (pos == 'right') {
    return [10, 0]
  }
}

function getTextAttributes(size = 0) {
  return Object.assign(colorAttributes, {
    fontSize: size
  })
}

function getLabelAttributes(offset = [0, -1]) {
  return Object.assign(colorAttributes, {
    offset: offset
  })
}

function getPointAttributes(size = 0) {
  return Object.assign(colorAttributes, {
    withLabel: false,
    size: size
  })
}

function getLineAttributes(size = 2) {
  return Object.assign(colorAttributes, polygonAttributes, {
    strokeWidth: size,
  })
}

function createPoint(name, pos, ptpos, pointSize = 0, fontSize = pointSize * 40) {
  let point = board.create('point', pos, getPointAttributes(pointSize))
  ptpos[0] *= 1.05
  board.create('text', ptpos.concat(name), getTextAttributes(fontSize))
  return point;
}

function createAxis(start, end, axis) {
  if (axis == 'x') {
    points = [
      [start, 0],
      [end - 1, 0]
    ]
    board.create('text', [end - 0.8, 0.1, '\\\\textit{x}'], getLabelAttributes());

  } else if (axis == 'y') {
    points = [
      [0, start],
      [0, end - 1]
    ]
    board.create('text', [-0.1, end - 0.3, '\\\\textit{y}'], getLabelAttributes());
  }
  return board.create('segment', points, Object.assign(getLineAttributes(), axisAttributes));
}

function createCoordinates(xStart, xEnd, yStart, yEnd) {
  board.create('ticks', [createAxis(xStart, xEnd, 'x')], ticksAttributes)
  board.create('ticks', [createAxis(yStart, yEnd, 'y')], ticksAttributes)
  board.create('text', [-1, -1, '\\\\textit{O}'], getLabelAttributes());
}

function getSVG(imgs) {

  colorAttributes = {
    strokeColor: `#${rgb2hex(bgColor)}`,
    highlightStrokeColor: `#${rgb2hex(bgColor)}`,
    fillColor: `#${rgb2hex(bgColor)}`,
    highlightFillColor: `#${rgb2hex(bgColor)}`,
  }

  polygonAttributes = {
    borders: getLabelAttributes(),
    highlightFillColor: `#ffffff`,
    fillColor: '#ffffff'
  }

  ticksAttributes = {
    minorHeight: 0,
    majorHeight: 10,
    drawLabels: false,
    strokeColor: `#${rgb2hex(bgColor)}`,
    strokeWidth: 2,
  }

  axisAttributes = {
    lastArrow: true,
    ticks: ticksAttributes
  }

  imgs.each(function () {
    let img = $(this);
    if (img.attr('src').match(/TriangleOnly/)) { // TriangleOnly
      let path = 'TriangleOnly'
      board = initBoard([-1, 4, 7, -2], 50, path, img)

      //  Create Points
      var points = [{
        x: 0,
        y: 0
      },
      {
        x: 5,
        y: 3

      },
      {
        x: 6,
        y: 0
      },
      {
        x: 3,
        y: 0
      }
      ];
      var JXGPoints = [];

      $(points).each(function (i) {
        JXGPoints.push(
          createPoint(`${i < 3 ? String.fromCharCode(80 + i) : 'S'}`, [this.x, this.y], i == 1 ? [this.x, this.y + 0.5] : [this.x - 0.5, this.y - 0.5], 1)
        );
        if (i > 3) {
          JXGPoints[i].setDisplayRendNode(false)
        }
      });

      // Create Triangle
      board.create('segment', [JXGPoints[1], JXGPoints[3]], getLineAttributes(4))

      board.create('polygon', JXGPoints.slice(0, 3), polygonAttributes);
      board.create('text', [1.5, -1.5, 'PQ == PR'], getLabelAttributes());

    } else if (img.attr('src').match(/05_118-02/)) { // 05_118-02
      let path = '05_118-02'
      let box = [-6, 10, 7, -3]
      board = initBoard(box, 25, path, img)
      createCoordinates(box[0], box[2], box[3], box[1])

      board.create('text', [0.8, -1, '1'], getLabelAttributes());
      board.create('text', [-0.8, 1, '1'], getLabelAttributes());

      board.create('functiongraph', [(x) => {
        return 2 * Math.abs(x) + 4;
      }, -2, 2], Object.assign(getLineAttributes(), {
        lastArrow: false
      }));
      board.create('text', [2.3, 7.9, '\\\\textit{y = f(x)}'], getLabelAttributes());
    } else if (img.attr('src').match(/05_118-01/)) { // 05_118-01
      let path = '05_118-01'
      board = initBoard([-12, 2, 12, -2], 25, path, img, 600)

      board.create('axis', [
        [-12, 0],
        [12, 0]
      ], Object.assign(getLineAttributes(), {
        firstArrow: true,
        lastArrow: true,
        ticks: ticksAttributes
      }));

      for (let index = -11; index < 12; index++) {
        let scale = index.toString().length
        board.create('text', [index - 0.2 * scale, -1, index.toString()], getLabelAttributes());
      }

      for (let index = -2; index < 3; index++) {
        board.create('circle', [
          [index * 5, -1],
          [index * 5, -0.5]
        ], getLineAttributes());
      }

      board.create('line', [
        [1, 0.5],
        [1, 2]
      ], Object.assign(getLineAttributes(), {
        lastArrow: false
      }))

    }

  })

  $(`.my-svg`).children().each(function () {
    $(this).addClass('w3-left').css({
      overflow: mobileFlag ? 'auto' : 'none'
    }).width(mobileFlag ? 360 : $(this).width())
  })
  if (board) board.removeEventHandlers()
}

var board