var initialBoard = [ // ' ' = empty square, 'b' = black piece, 'w' = white piece;
	[' ',' ',' ',' ',' ',' ',' ',' '],
	[' ',' ',' ',' ',' ',' ',' ',' '],
	[' ',' ',' ',' ',' ',' ',' ',' '],
	[' ',' ',' ','b','w',' ',' ',' '],
	[' ',' ',' ','w','b',' ',' ',' '],
	[' ',' ',' ',' ',' ',' ',' ',' '],
	[' ',' ',' ',' ',' ',' ',' ',' '],
	[' ',' ',' ',' ',' ',' ',' ',' ']];
var peices = [];
var dir = [1,-1];
var player = 'W'; // current active player
var checkPlay = {'W':1,'B':-1,' ':0}
var scoreDiv = document.getElementById("scoreDiv");
var aiEnabled = 1;
var move;

initialise();


function initialise() {
	clearTimeout(move)
	player = 'W';
	peices = initialBoard.map(r => r.slice()); // copy initialBoard to peices
	renderBoard();
}

function renderBoard() {
	var gameOver = true, idealMove = [0, []];  // the score of the current ideal (highest capture) moves, followed by all the possible choices (row, col, direction)
	while (boardDiv.firstChild) boardDiv.removeChild(boardDiv.firstChild); // wipes board
	peices.forEach((row,r) => {
		var boardRow = document.createElement("div");
		boardDiv.appendChild(boardRow);
		boardRow.className = "boardRow";
		row.forEach((square,c) => {
			var boardSquare = document.createElement("div");
			boardRow.appendChild(boardSquare);
			boardSquare.className = "boardSquare";
			if (peices[r][c].toUpperCase() == 'W' || peices[r][c].toUpperCase() == 'B') {
				var boardPiece = document.createElement("div");
				boardSquare.appendChild(boardPiece);
				boardPiece.className = "boardPiece " + peices[r][c].toLowerCase();
			}
			var direction = checkAvailable(peices, r, c, player);
			if (peices[r][c] == ' ' && JSON.stringify(direction) != JSON.stringify([0,0,0,0,0,0,0,0])) {
				boardSquare.className += " clickable";
				gameOver = false;
				if (aiEnabled != 0) {  // if one of the ai options is enabled
					var score = direction.reduce(function(a, b) { return a + b; }, 0);  // gets the sum of all captures in each direction
					if (score > idealMove[0]) {  // if this move scores better than the previous option
						idealMove[0] = score;
						idealMove[1] = [[r, c, direction]]
					} else if (score == idealMove[0]) {
						idealMove[1].push([r, c, direction]);
					}
				}
				if (aiEnabled == 0 || (aiEnabled == 1 && player == 'W')) boardSquare.onclick = function(){ placePiece(r, c, direction); };
			}
		});
	});
	var find = findTotal(peices);
	if (!gameOver) {
		if (aiEnabled == 1) {
			infoDiv.innerHTML = ((player == 'W') ? "your move" : "AI thinking...");
			if (player == 'B') move = setTimeout(function() { placePiece(...idealMove[1][Math.floor(Math.random() * idealMove[1].length)].slice()) }, 700);  // 1000
		} else if (aiEnabled == 2) {
			infoDiv.innerHTML = ((player == 'W') ? "white AI thinking..." : "black AI thinking...");
			var e = document.getElementById ("delay");			
			move = setTimeout(function() { placePiece(...idealMove[1][Math.floor(Math.random() * idealMove[1].length)].slice()) }, e.options[e.selectedIndex].value);  // 1000
		} else if (aiEnabled == 0) {
			infoDiv.innerHTML = ((player == 'W') ? "white" : "black")+"'s move";
		}
	} else if (!find) {
		setTimeout(function() { pass() }, 1);
	}
}

function placePiece(r,c, direction) { // r = row, c = column
	peices = updateState(peices,r,c, direction);
	player = (player == 'W') ? 'B' : 'W';
	renderBoard();
}

function updateState(board,destinationR,destinationC, direction) {
	board = board.map(r => r.slice()); // copy array
	if (player == 'W') {
		board[destinationR][destinationC] = 'w';
	} else {
		board[destinationR][destinationC] = 'b';
	}
	capture(board, destinationR, destinationC, direction);
	return board;
}

function checkAvailable(board, r, c, player) {  // board, row, column, player
	var direction = [0,0,0,0,0,0,0,0]; // top bottom left right topLeft bottomRight BottomLeft TopRight
	for (var i = 0; i < 8; i++) {
		if (i < 2) { var x = dir[i], y = 0; }
		else if (i < 4) { var x = 0, y = dir[i-2]; }
		else if (i < 6) { var x = dir[i-4], y = x; }
		else { var x = dir[i-6], y = -x; }
		try {
			while (checkPlay[board[r - x][c - y].toUpperCase()] == checkPlay[player]*-1) {
				direction[i] += 1;
				if (i < 2) { x = (dir[i] == 1) ? x+1 : x-1; }
				else if (i < 4) { y = (dir[i-2] == 1) ? y+1 : y-1; }
				else if (i < 6) { x = (dir[i-4] == 1) ? x+1 : x-1; y = x; }
				else { x = (dir[i-6] == 1) ? x+1 : x-1; y = -x; }
			}
			if (board[r - x][c - y].toUpperCase() != player) {  //  && direction[i] > 0
				direction[i] = 0;
			}
		} catch { 
			direction[i] = 0;
		}
	}
	return direction;
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
	if (aiEnabled == 2) {
		player = (player == 'W') ? 'B' : 'W';
		renderBoard();
	}
}

function enableAI() {
	document.getElementById('2p_btn').className = "";
	document.getElementById('ai_btn').className = "enabled";
	document.getElementById('AIvAI_btn').className = "";
	aiEnabled = 1;
	initialise();
}

function enableAIvAI() {
	document.getElementById('2p_btn').className = "";
	document.getElementById('ai_btn').className = "";
	document.getElementById('AIvAI_btn').className = "enabled";
	aiEnabled = 2;
	initialise();
}

function enable2P() {
	document.getElementById('ai_btn').className = "";
	document.getElementById('2p_btn').className = "enabled";
	document.getElementById('AIvAI_btn').className = "";
	aiEnabled = 0;
	initialise();
}

function findTotal(board) {
	board = board.map(r => r.slice()); // copy array
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
	if (whiteTotal + blackTotal == 64) {
		if (whiteTotal > blackTotal) {
			infoDiv.innerHTML =  "WHITE WINS!";
		} else if (blackTotal > whiteTotal) {
			infoDiv.innerHTML =  "BLACK WINS!";
		} else {
			infoDiv.innerHTML =  "DRAW!";
		}
		return true;
	}
	return false;
}


// NOTES
// add auto pass
// 