var initialBoard = [ // ' ' is an empty square, 'b' a black piece, 'w' a white piece; 'B' and 'W' are kings.
	[' ',' ',' ',' ',' ',' ',' ',' '],
	[' ',' ',' ',' ',' ',' ',' ',' '],
	[' ',' ',' ',' ',' ',' ',' ',' '],
	[' ',' ',' ','w','b',' ',' ',' '],
	[' ',' ',' ','b','w',' ',' ',' '],
	[' ',' ',' ',' ',' ',' ',' ',' '],
	[' ',' ',' ',' ',' ',' ',' ',' '],
	[' ',' ',' ',' ',' ',' ',' ',' ']];
var draughts = [];
var player = 'B'; // current active player
// var selected; // piece selected to be moved
var checkPlay = {'W':1,'B':-1,' ':0}

initialise();


function initialise() {
	draughts = initialBoard.map(r => r.slice()); // copy initialBoard to draughts
	renderBoard();
}

function renderBoard() {
	while (boardDiv.firstChild) boardDiv.removeChild(boardDiv.firstChild); // wipes board
	draughts.forEach((row,r) => {
		var draughtsRow = document.createElement("div");
		boardDiv.appendChild(draughtsRow);
		draughtsRow.className = "draughtsRow";
		row.forEach((square,c) => {
			var draughtsSquare = document.createElement("div");
			draughtsRow.appendChild(draughtsSquare);
			draughtsSquare.className = "draughtsSquare";
			if (draughts[r][c].toUpperCase() == 'W' || draughts[r][c].toUpperCase() == 'B') {
				var draughtsPiece = document.createElement("div");
				draughtsSquare.appendChild(draughtsPiece);
				draughtsPiece.className = "draughtsPiece " + draughts[r][c];
				// if (selected && selected.r == r && selected.c == c) draughtsPiece.className += " selected";
			}
			// if (draughts[r][c] == 'W' || draughts[r][c] == 'B') draughtsPiece.textContent = '\u2654'; // king
			// if (!selected) { // legalMoves.some(m => m.r == r && m.c == c)
			// 	draughtsSquare.onclick = function(){selectPiece(r,c);};
			// 	if (highlightOptions) draughtsSquare.className += " clickable";
			// }
			if (draughts[r][c] == ' ') {
				draughtsSquare.onclick = function(){placePiece(r,c);};
			}
			// if (highlightOptions) draughtsSquare.className += " clickable";
		});
	});
	infoDiv.innerHTML = ((player == 'W') ? "white" : "black")+"'s move";
	// if (legalMoves.length === 0) infoDiv.innerHTML = ((player == 'W') ? "BLACK" : "WHITE")+" WINS";
}

// function checkCapture(board, r, c) {
// 	var direction = [0,0,0,0]; // top bottom left right
// 	var dir = [1,-1,1,-1];
// 	for (var i = 0; i < dir.length; i++) {
// 		var x = 0, y = 0;
// 		while (checkPlay[board[r - (dir[i]+x)][c - (dir[i]+y)].toUpperCase()] == checkPlay[player]*-1) {
// 			direction[i] += 1;
// 			if (i < 2) {
// 				x = (dir[i] == 1) ? x+1 : x-1;
// 				y = 0
// 			} else {
// 				y = (dir[i] == 1) ? y+1 : y-1;
// 				x = 0;
// 			}
// 		}
// 		if (checkPlay[board[r - (dir[i]+x)][c].toUpperCase()] == checkPlay[player]) {
// 			board[r-x][c] = player.toLowerCase();
// 		} else {
// 			direction[i] = 0;
// 		}
// 	}
// 	console.log(direction);
// }


function checkCapture(board, r, c) {
	var direction = [0,0,0,0]; // top bottom left right
	var dir = [1,-1];
	for (var i = 0; i < dir.length; i++) {
		var x = 0;
		while (checkPlay[board[r - (dir[i]+x)][c].toUpperCase()] == checkPlay[player]*-1) {
			direction[i] += 1;
			x = (dir[i] == 1) ? x+1 : x-1;
			// console.log(`x: ${x}`);
		}
		if (checkPlay[board[r - (dir[i]+x)][c].toUpperCase()] == checkPlay[player]) {
			board[r-x][c] = player.toLowerCase();
			// for (var x = 0; x < dir.length+2; i++) {
			// 	board[r-x][c] = player.toLowerCase();
			// }
		} else {
			console.log('else');
			direction[i] = 0;
		}
	}
	for (var i = 2; i < dir.length+2; i++) {
		var y = 0;
		// console.log(checkPlay[board[r][c - (dir[i-2]+y)].toUpperCase()]);
		while (checkPlay[board[r][c - (dir[i-2]+y)].toUpperCase()] == checkPlay[player]*-1) {
			direction[i] += 1;
			y = (dir[i-2] == 1) ? y+1 : y-1;
			// console.log(`y: ${y}`);
		}
		if (checkPlay[board[r][c - (dir[i-2]+y)].toUpperCase()] == checkPlay[player]) {
			// board[r][c-y] = player.toLowerCase();
			for (var i = 0; i < direction[i].length; i++) {
				board[r][c-i] = player.toLowerCase();
			}
		} else {
			console.log('else');
			direction[i] = 0;
		}
	}
	console.log(direction);
}


function updateState(board,destinationR,destinationC) {
	board = board.map(r => r.slice()); // copy array
	if (player == 'W') {
		board[destinationR][destinationC] = 'w';
	} else {
		board[destinationR][destinationC] = 'b';
	}
	checkCapture(board, destinationR, destinationC);
	return board;
}

function placePiece(r,c) { // r = row, c = column
	draughts = updateState(draughts,r,c);
	player = (player == 'W') ? 'B' : 'W';
	renderBoard();
}
