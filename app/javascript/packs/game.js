var canvas = document.getElementById('board');

const rows = 32, columns = 64;
const cellWidth = 16;

canvas.width = columns * cellWidth;
canvas.height = rows * cellWidth;

const ctx = canvas.getContext('2d');

var playerCells = [], enemyCells = [];

loadEnemyCells();
drawGrid();
drawCells();



function drawGrid() {
  const prevStrokeStyle = ctx.strokeStyle;

  ctx.strokeStyle = '#cbd5e0';

  for (var i = 0; i < columns+ 1; i++) {
    ctx.beginPath();
    ctx.moveTo(i * cellWidth, 0);
    ctx.lineTo(i * cellWidth, rows * cellWidth);
    ctx.stroke();
  }

  for (var j = 0; j < rows + 1; j++) {
    ctx.beginPath();
    ctx.moveTo(0, j * cellWidth);
    ctx.lineTo(columns * cellWidth, j * cellWidth);
    ctx.stroke();
  }


  ctx.strokeStyle = 'black';
	ctx.beginPath();
	ctx.moveTo(columns / 2 * cellWidth, 0);
	ctx.lineTo(columns / 2 * cellWidth, rows * cellWidth);
	ctx.stroke();

  ctx.strokeStyle = prevStrokeStyle;
}

function loadEnemyCells() {
	enemyCells = JSON.parse(canvas.dataset.opponentBoard);
}

function drawCells() {
	playerCells.forEach(coordinates => drawCell(coordinates, 'red'));
	enemyCells.forEach(coordinates => drawCell([coordinates[0] + columns / 2, coordinates[1]], 'blue'));
}

function drawCell(coordinates, color) {
  const prevFillStyle = ctx.fillStyle;

	ctx.fillStyle = color;
	ctx.fillRect(coordinates[0] * cellWidth, coordinates[1] * cellWidth, cellWidth, cellWidth);

	ctx.fillStyle = prevFillStyle;
}
