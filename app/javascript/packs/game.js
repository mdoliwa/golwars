var canvas = document.getElementById('board');

const rows = 32, columns = 64;
const cellWidth = 16;

canvas.width = columns * cellWidth;
canvas.height = rows * cellWidth;

const ctx = canvas.getContext('2d');

var playerCells = [], enemyCells = [];
var tickNo = 0;
var playerCellsHistory = [], enemyCellsHistory = []
var gameResult;

loadEnemyCells();
draw();

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

	drawGrid();
	drawCells();
}

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
	enemyCells = JSON.parse(canvas.dataset.opponentBoard).map(coordinates => [coordinates[0] + columns / 2, coordinates[1]]);
}

function drawCells() {
	playerCells.forEach(coordinates => drawCell(coordinates, 'red'));
	enemyCells.forEach(coordinates => drawCell(coordinates, 'blue'));
}

function drawCell(coordinates, color) {
  const prevFillStyle = ctx.fillStyle;

	ctx.fillStyle = color;
	ctx.fillRect(coordinates[0] * cellWidth, coordinates[1] * cellWidth, cellWidth, cellWidth);

	ctx.fillStyle = prevFillStyle;
}

function update() {
	const playerCellValue = 1, enemyCellValue = 9;
	var grid = [...Array(columns)].map(x => Array(rows));
	var newPlayerCells = [], newEnemyCells = [];

	playerCells.forEach(cell => grid[cell[0]][cell[1]] = playerCellValue);
	enemyCells.forEach(cell => grid[cell[0]][cell[1]] = enemyCellValue);

	for (var i = 0; i < columns; i++) {
		for (var j = 0; j < rows; j++) {
      const neighbourCellsTotalValue = [
        grid[mod(i - 1, columns)][mod(j + 1, rows)],
        grid[mod(i - 1, columns)][j],
        grid[mod(i - 1, columns)][mod(j - 1, rows)],
        grid[mod(i + 1, columns)][mod(j + 1, rows)],
        grid[mod(i + 1, columns)][j],
        grid[mod(i + 1, columns)][mod(j - 1, rows)],
        grid[i][mod(j + 1, rows)],
        grid[i][mod(j - 1, rows)]
      ].filter(cell => cell).reduce((a, b) => a + b, 0);

			const neighbourPlayerCellsCount = neighbourCellsTotalValue % enemyCellValue;
			const neighbourEnemyCellsCount = Math.floor(neighbourCellsTotalValue / enemyCellValue);
			const neighbourCellsCount = neighbourPlayerCellsCount + neighbourEnemyCellsCount;

			if (grid[i][j] && (neighbourCellsCount == 2 || neighbourCellsCount == 3)) {
				grid[i][j] == playerCellValue ? newPlayerCells.push([i, j]) : newEnemyCells.push([i, j]); 
			} else if (!grid[i][j] && neighbourCellsCount == 3) {
				neighbourPlayerCellsCount > neighbourEnemyCellsCount ? newPlayerCells.push([i, j]) : newEnemyCells.push([i, j]);
			}
		}
	}

	playerCells = newPlayerCells;
	enemyCells = newEnemyCells;
}

function loop() {
	updateHistory();

	update();

	checkGameResult();

	if (gameResult && gameResult.stopReason == 'CYCLE') {
		console.log(gameResult.message);
		return;
	}

	draw();

	if (gameResult && gameResult.stopReason == 'NO_CELLS') {
		console.log(gameResult.message);
		return;
	}

	tickNo++;

  setTimeout(function() {loop();}, 50);
}

function updateHistory() {
	playerCellsHistory[tickNo] = playerCells;
	enemyCellsHistory[tickNo] = enemyCells;
}

function checkGameResult() {
	var gameResultMessage;

	for (var i = 0; i < tickNo; i++) {
		if (playerCellsHistory[i].concat(enemyCellsHistory[i]).equals(playerCells.concat(enemyCells))) {
			if (playerCellsHistory[i-1].length > enemyCellsHistory[i-1].length) {
				gameResultMessage = "PLAYER WINS";
			} else if (playerCellsHistory[i-1].length < enemyCellsHistory[i-1].length) {
				gameResultMessage = "OPPONENT WINS";
			} else {
				gameResultMessage = "DRAW";
			}

			gameResult = {stopReason: 'CYCLE', message: gameResultMessage};
			return
		}
	}

	if (playerCells.length == 0 || enemyCells.length == 0) {
		if (playerCells.length > enemyCells.length) {
			gameResultMessage = "PLAYER WINS";
		} else if (playerCells.length < enemyCells.length) {
			gameResultMessage = "OPPONENT WINS";
		} else {
			gameResultMessage = "DRAW";
		}

		gameResult = {stopReason: 'NO_CELLS', message: gameResultMessage};
		return
	}
}

canvas.onselectstart = function () { return false; }

canvas.addEventListener('mousedown', function(e) {
  const [x, y] = getCellCoordinates(canvas, e);

  if (x >= columns / 2 ) { return };

  const index = playerCells.findIndex(cell => cell[0] == x && cell[1] == y);

  if (index > -1) {
    playerCells.splice(index, 1);
  } else {
    playerCells.push([x, y]);
  }

  playerCells = playerCells.sort();
  draw();
})

var playButton = document.getElementById('play');

playButton.addEventListener('click', function(e) {
	const csrfToken = document.querySelector("meta[name='csrf-token']").getAttribute('content');

	fetch('games', {
		method: "POST",
		headers: { 
			'Content-Type': 'application/json',
			'X-CSRF-Token': csrfToken
		},
		body: JSON.stringify({player_cells: playerCells})
	});

	loop();
});

function getCellCoordinates(canvas, event) {
  const rect = canvas.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;

  return [Math.floor(x / cellWidth), Math.floor(y / cellWidth)]
}

function mod(n, m) {
  return ((n % m) + m) % m;
}

// Warn if overriding existing method
if(Array.prototype.equals)
	console.warn("Overriding existing Array.prototype.equals. Possible causes: New API defines the method, there's a framework conflict or you've got double inclusions in your code.");
// attach the .equals method to Array's prototype to call it on any array
Array.prototype.equals = function (array) {
	// if the other array is a falsy value, return
	if (!array)
		return false;

	// compare lengths - can save a lot of time 
	if (this.length != array.length)
		return false;

	for (var i = 0, l=this.length; i < l; i++) {
		// Check if we have nested arrays
		if (this[i] instanceof Array && array[i] instanceof Array) {
			// recurse into the nested arrays
			if (!this[i].equals(array[i]))
				return false;       
		}           
		else if (this[i] != array[i]) { 
			// Warning - two different object instances will never be equal: {x:20} != {x:20}
			return false;   
		}           
	}       
	return true;
}
