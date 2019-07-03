var initialBoard = [
	[' ',' ',' ',' ',' ',' ',' ',' '],
	[' ',' ',' ',' ',' ',' ',' ',' '],
	[' ',' ',' ',' ',' ',' ',' ',' '],
	[' ',' ',' ','b','w',' ',' ',' '],
	[' ',' ',' ','w','b',' ',' ',' '],
	[' ',' ',' ',' ',' ',' ',' ',' '],
	[' ',' ',' ',' ',' ',' ',' ',' '],
	[' ',' ',' ',' ',' ',' ',' ',' ']];
var board = [];
var boardBackup = [];
var boardBackup2 = [];
var modeBtn = ['ai_btn', '1p_btn', '2p_btn']
var dir = [1,-1];
var checkPlay = {'w':1,'b':-1,' ':0}
var scoreDiv = document.getElementById("scoreDiv");
var gameMode = 1;
var passCount = 0;
var player;
var move;
var undoable;

initialise();


function initialise() {
	clearTimeout(move)
	undoable = false;
	player = 'b';
	board = initialBoard.map(r => r.slice(0))
	renderBoard();
} 

function renderBoard() {
	var gameOver = true, idealMove = [0, []];
	while (boardDiv.firstChild) boardDiv.removeChild(boardDiv.firstChild)
	board.forEach((row,r) => {
		var boardRow = document.createElement("div");
		boardDiv.appendChild(boardRow);
		boardRow.className = "boardRow";
		row.forEach((square,c) => {
			var boardSquare = document.createElement("div");
			boardRow.appendChild(boardSquare);
			boardSquare.className = "boardSquare";
			if (['w','b'].includes(board[r][c])) {
				var boardPiece = document.createElement("div");
				boardSquare.appendChild(boardPiece);
				boardPiece.className = "boardPiece " + board[r][c].toLowerCase();
			}
			var direction = checkAvailable(board, r, c, player);
			if (board[r][c] == ' ' && JSON.stringify(direction) != JSON.stringify([0,0,0,0,0,0,0,0])) {
				boardSquare.className += " clickable";
				gameOver = false;
				if (gameMode != 2) {
					var score = direction.reduce(function(a, b) { return a + b }, 0);
					if (score > idealMove[0]) {
						idealMove[0] = score;
						idealMove[1] = [[r, c, direction]]
					} else if (score == idealMove[0]) {
						idealMove[1].push([r, c, direction]);
					}
				}
				if (gameMode == 2 || (gameMode == 1 && player == 'b')) boardSquare.onclick = function(){ placePiece(r, c, direction); };
			}
		});
	});
	var find = findTotal(board);
	if (!gameOver) {
		passCount = 0;
		if (gameMode == 1) {
			infoDiv.innerHTML = ((player == 'b') ? "your move" : "AI thinking...");
			if (player == 'w') move = setTimeout(function() { placePiece(...idealMove[1][Math.floor(Math.random() * idealMove[1].length)].slice()) }, 700);
		} else if (gameMode == 0) {
			infoDiv.innerHTML = ((player == 'w') ? "white AI thinking..." : "black AI thinking...");
			var e = document.getElementById ("delay");			
			move = setTimeout(function() { placePiece(...idealMove[1][Math.floor(Math.random() * idealMove[1].length)].slice()) }, e.options[e.selectedIndex].value);
		} else if (gameMode == 2) {
			infoDiv.innerHTML = ((player == 'w') ? "white" : "black")+"'s move";
		}
	} else if (!find) {
		setTimeout(function() { pass() }, 1);
	}
}

function placePiece(r,c, direction) {
	boardBackup2 = boardBackup.map(r => r.slice(0));
	boardBackup = board.map(r => r.slice(0));
	board[r][c] = player.toLowerCase();
	capture(board, r, c, direction);
	player = (player == 'w') ? 'b' : 'w';
	undoable = true;
	renderBoard();
}

function checkAvailable(board, r, c, player) {
	var direction = [0,0,0,0,0,0,0,0]
	for (var i = 0; i < 8; i++) {
		if (i < 2) { var x = dir[i], y = 0; }
		else if (i < 4) { var x = 0, y = dir[i-2]; }
		else if (i < 6) { var x = dir[i-4], y = x; }
		else { var x = dir[i-6], y = -x; }
		try {
			while (checkPlay[board[r - x][c - y]] == checkPlay[player]*-1) {
				direction[i] += 1;
				if (i < 2) { x = (dir[i] == 1) ? x+1 : x-1; }
				else if (i < 4) { y = (dir[i-2] == 1) ? y+1 : y-1; }
				else if (i < 6) { x = (dir[i-4] == 1) ? x+1 : x-1; y = x; }
				else { x = (dir[i-6] == 1) ? x+1 : x-1; y = -x; }
			}
			if (board[r - x][c - y] != player) {
				direction[i] = 0;
			}
		} catch { 
			direction[i] = 0;
		}
	}
	return direction
}

function capture(board, r, c, direction) {
	for (var i = 0; i <= direction.length; i++) {
		for (var z = 1; z <= direction[i]; z++) {
			if (i < 2) { var x = dir[i]*z, y = 0; }
			else if (i < 4) { var x = 0, y = dir[i-2]*z; }
			else if (i < 6) { var x = dir[i-4]*z, y = x; }
			else { var x = dir[i-6]*z, y = -x; }
			board[r - x][c - y] = player.toLowerCase();
		}
	}
}

function pass() {
	if (gameMode != 2 && passCount < 2) {
		passCount += 1;
		player = (player == 'w') ? 'b' : 'w';
		renderBoard();
	} else if (passCount >= 2) {
		console.log('more than 2 passes bro');
		findTotal(board, true);
	}
}

function undo() {
	if (undoable == true && gameMode != 0) {
		if (gameMode == 2) {
			board = boardBackup
			player = (player == 'w') ? 'b' : 'w'; 
		} else if (gameMode == 1) {
			board = boardBackup2;
		}
		undoable = false;
		renderBoard();
	}
}

function setMode(mode) {
	modeBtn.forEach(function(option) {
		if (modeBtn[mode] == option) {
			document.getElementById(option).className = "enabled";
		} else {
			document.getElementById(option).className = "";
		}
	});
	gameMode = mode;
	initialise();
}

function findTotal(board, end=false) {
	board = board.map(r => r.slice())
	var blackTotal = 0, whiteTotal = 0;
	for (i=0; i < board.length; i++) {
		for (j=0; j < board[i].length; j++) {
			if (board[i][j] == 'w') {
				whiteTotal += 1;
			} else if (board[i][j] == 'b') {
				blackTotal += 1;
			}
		}
	}
	scoreDiv.innerHTML = (`black: ${blackTotal} | white: ${whiteTotal}`)
	if (whiteTotal + blackTotal == 64 || whiteTotal == 0 || blackTotal == 0 || end) {
		if (whiteTotal > blackTotal) {
			infoDiv.innerHTML =  "WHITE WINS!";
		} else if (blackTotal > whiteTotal) {
			infoDiv.innerHTML =  "BLACK WINS!";
		} else {
			infoDiv.innerHTML =  "DRAW!";
		}
		return true
	}
	return false
}
