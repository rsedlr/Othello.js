var initialBoard = [ // ' ' = empty square, 'b' = black piece, 'w' = white piece;
	[' ',' ',' ',' ',' ',' ',' ',' '],
	[' ',' ',' ',' ',' ',' ',' ',' '],
	[' ',' ',' ',' ',' ',' ',' ',' '],
	[' ',' ',' ','w','b',' ',' ',' '],
	[' ',' ',' ','b','w',' ',' ',' '],
	[' ',' ',' ',' ',' ',' ',' ',' '],
	[' ',' ',' ',' ',' ',' ',' ',' '],
	[' ',' ',' ',' ',' ',' ',' ',' ']];
var draughts = [];
var canTake = [];
var player = 'B'; // current active player
var checkPlay = {'W':1,'B':-1,' ':0}
var scoreDiv = document.getElementById("scoreDiv");
var highlightOptions = true;

initialise();


function initialise() {
	draughts = initialBoard.map(r => r.slice()); // copy initialBoard to draughts
	renderBoard();
}

function renderBoard() {
	var gameOver = true;
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
				// draughtsSquare.className += " clickable";
				draughtsPiece.className = "draughtsPiece " + draughts[r][c];
			}
			var check = checkAvailable(draughts, r, c, player);
			if (draughts[r][c] == ' ' && check) {
				gameOver = false;
				draughtsSquare.onclick = function(){placePiece(r,c);};
				if (highlightOptions) draughtsSquare.className += " clickable";
			}
			findTotal(draughts);
		});
	});
	if (gameOver != true) infoDiv.innerHTML = ((player == 'W') ? "white" : "black")+"'s move";
}

function checkAvailable(board, r, c, player) {  // board, row, column, player
	var check = false, dir = [1,-1];
	for (var i = 0; i < 8; i++) {
		var wle = false;
		if (i < 2) { var x = dir[i], y = 0; }
		else if (i < 4) { var x = 0, y = dir[i-2]; }
		else if (i < 6) { var x = dir[i-4], y = x; }
		else { var x = dir[i-6], y = -x; }
		try {
			while (checkPlay[board[r - x][c - y].toUpperCase()] == checkPlay[player]*-1) {
				wle = true;
				if (i < 2) { x = (dir[i] == 1) ? x+1 : x-1; }
				else if (i < 4) { y = (dir[i-2] == 1) ? y+1 : y-1; }
				else if (i < 6) { x = (dir[i-4] == 1) ? x+1 : x-1; y = x; }
				else { x = (dir[i-6] == 1) ? x+1 : x-1; y = -x; }
			}
			if (checkPlay[board[r - x][c - y].toUpperCase()] == checkPlay[player] && wle == true) {
				canTake[r][c].push(x,y);
			} 
		} catch { /* pass; */	}
	}
	return check
}

function checkCapture(board, r, c) {
	var direction = [0,0,0,0,0,0,0,0]; // top bottom left right topLeft bottomRight BottomLeft TopRight
	var dir = [1,-1];
	for (var i = 0; i < dir.length; i++) {
		var x = dir[i];
		try {
			while (checkPlay[board[r - x][c].toUpperCase()] == checkPlay[player]*-1) {
				direction[i] += 1;
				x = (dir[i] == 1) ? x+1 : x-1;
			}
			if (checkPlay[board[r - x][c].toUpperCase()] == checkPlay[player]) {
				for (var z = 0; z <= direction[i]; z++) {
					board[r - ((dir[i] == 1) ? z : -z)][c] = player.toLowerCase();
				}
			} else {
				direction[i] = 0;
			}
		} catch { /* pass; */	}
	}
	for (var i = 2; i < dir.length+2; i++) {
		var y = dir[i-2];
		try {
			while (checkPlay[board[r][c - (y)].toUpperCase()] == checkPlay[player]*-1) {
				direction[i] += 1;
				y = (dir[i-2] == 1) ? y+1 : y-1;
			}
			if (checkPlay[board[r][c - (y)].toUpperCase()] == checkPlay[player]) {
				for (var z = 0; z <= direction[i]; z++) {
					board[r][c - ((dir[i-2] == 1) ? z : -z)] = player.toLowerCase();
				}
			} else {
				direction[i] = 0;
			}
		} catch { /* pass; */	}
	}
	for (var i = 4; i < dir.length+4; i++) {
		var x = dir[i-4];
		try {
			while (checkPlay[board[r - x][c - x].toUpperCase()] == checkPlay[player]*-1) {
				direction[i] += 1;
				x = (dir[i-4] == 1) ? x+1 : x-1;
			}
			if (checkPlay[board[r - x][c - x].toUpperCase()] == checkPlay[player]) {
				for (var z = 0; z <= direction[i]; z++) {
					board[r - ((dir[i-4] == 1) ? z : -z)][c - ((dir[i-4] == 1) ? z : -z)] = player.toLowerCase();
				}
			} else {
				direction[i] = 0;
			}
		} catch { /* pass; */	}
	}
	for (var i = 6; i < dir.length+6; i++) {
		var x = dir[i-6];
		try {
			while (checkPlay[board[r - x][c + x].toUpperCase()] == checkPlay[player]*-1) {
				direction[i] += 1;
				x = (dir[i-6] == 1) ? x+1 : x-1;
			}
			if (checkPlay[board[r - x][c + x].toUpperCase()] == checkPlay[player]) {
				for (var z = 0; z <= direction[i]; z++) {
					board[r - ((dir[i-6] == 1) ? z : -z)][c + ((dir[i-6] == 1) ? z : -z)] = player.toLowerCase();
				}
			} else {
				direction[i] = 0;
			}
		} catch { /* pass; */	}
	}
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
	}
}

// NOTES
// -Make check available return a list of all points it would take (empty if none)
// -Then checkCapture would simply take them onclick 

// function checkAvailable(board, r, c, player) {  // board, row, column, player
// 	var check = false, dir = [1,-1];
// 	for (var i = 0; i < 8; i++) {
// 		var wle = false;
// 		if (i < 2) { var x = dir[i], y = 0; }
// 		else if (i < 4) { var x = 0, y = dir[i-2]; }
// 		else if (i < 6) { var x = dir[i-4], y = x; }
// 		else { var x = dir[i-6], y = -x; }
// 		try {
// 			while (checkPlay[board[r - x][c - y].toUpperCase()] == checkPlay[player]*-1) {
// 				wle = true;
// 				if (i < 2) { x = (dir[i] == 1) ? x+1 : x-1; }
// 				else if (i < 4) { y = (dir[i-2] == 1) ? y+1 : y-1; }
// 				else if (i < 6) { x = (dir[i-4] == 1) ? x+1 : x-1; y = x; }
// 				else { x = (dir[i-6] == 1) ? x+1 : x-1; y = -x; }
// 			}
// 			if (checkPlay[board[r - x][c - y].toUpperCase()] == checkPlay[player] && wle == true) {
// 				check = true;
// 			} 
// 		} catch { /* pass; */	}
// 	}
// 	return check
// }

// function checkAvailable(board, r, c, p) {  // board, row, column, player
//   var check = false;		// NEED TO FIX DIS ---------------------------------------------------------------------------------------
// 	var dir = [-1,0,1];
// 	for (var x=0; x < dir.length; x++) {
// 		for (var y=0; y < dir.length; y++) {
// 			try {
// 				var temp = board[r+dir[x]][c+dir[y]].toUpperCase();
// 				if (temp != p && temp != ' ') {
// 					check = true;
// 				}
// 			} catch { /* pass; */	}
// 		}
// 	}
// 	return check
// }
// 
// function checkCapture(board, r, c) {
// 	var direction = [0,0,0,0,0,0,0,0]; // top bottom left right topLeft bottomRight BottomLeft TopRight
// 	var dir = [1,-1];
// 	for (var i = 0; i < dir.length; i++) {
// 		var x = 0;
// 		try {
// 			while (checkPlay[board[r - (dir[i]+x)][c].toUpperCase()] == checkPlay[player]*-1) {
// 				direction[i] += 1;
// 				x = (dir[i] == 1) ? x+1 : x-1;
// 			}
// 			if (checkPlay[board[r - (dir[i]+x)][c].toUpperCase()] == checkPlay[player]) {
// 				for (var z = 0; z <= direction[i]; z++) {
// 					board[r - ((dir[i] == 1) ? z : -z)][c] = player.toLowerCase();
// 				}
// 			} else {
// 				direction[i] = 0;
// 			}
// 		} catch { /* pass; */	}
// 	}
// 	for (var i = 2; i < dir.length+2; i++) {
// 		var y = 0;
// 		try {
// 			while (checkPlay[board[r][c - (dir[i-2]+y)].toUpperCase()] == checkPlay[player]*-1) {
// 				direction[i] += 1;
// 				y = (dir[i-2] == 1) ? y+1 : y-1;
// 			}
// 			if (checkPlay[board[r][c - (dir[i-2]+y)].toUpperCase()] == checkPlay[player]) {
// 				for (var z = 0; z <= direction[i]; z++) {
// 					board[r][c - ((dir[i-2] == 1) ? z : -z)] = player.toLowerCase();
// 				}
// 			} else {
// 				direction[i] = 0;
// 			}
// 		} catch { /* pass; */	}
// 	}
// 	for (var i = 4; i < dir.length+4; i++) {
// 		var x = 0;
// 		try {
// 			while (checkPlay[board[r - (dir[i-4]+x)][c - (dir[i-4]+x)].toUpperCase()] == checkPlay[player]*-1) {
// 				direction[i] += 1;
// 				x = (dir[i-4] == 1) ? x+1 : x-1;
// 			}
// 			if (checkPlay[board[r - (dir[i-4]+x)][c - (dir[i-4]+x)].toUpperCase()] == checkPlay[player]) {
// 				for (var z = 0; z <= direction[i]; z++) {
// 					board[r - ((dir[i-4] == 1) ? z : -z)][c - ((dir[i-4] == 1) ? z : -z)] = player.toLowerCase();
// 				}
// 			} else {
// 				direction[i] = 0;
// 			}
// 		} catch { /* pass; */	}
// 	}
// 	for (var i = 6; i < dir.length+6; i++) {
// 		var x = 0;
// 		try {
// 			while (checkPlay[board[r - (dir[i-6]+x)][c + (dir[i-6]+x)].toUpperCase()] == checkPlay[player]*-1) {
// 				direction[i] += 1;
// 				x = (dir[i-6] == 1) ? x+1 : x-1;
// 			}
// 			if (checkPlay[board[r - (dir[i-6]+x)][c + (dir[i-6]+x)].toUpperCase()] == checkPlay[player]) {
// 				for (var z = 0; z <= direction[i]; z++) {
// 					board[r - ((dir[i-6] == 1) ? z : -z)][c + ((dir[i-6] == 1) ? z : -z)] = player.toLowerCase();
// 				}
// 			} else {
// 				direction[i] = 0;
// 			}
// 		} catch { /* pass; */	}
// 	}
// }

{/* <html><head>
    <title>Othello.js</title>
    <link rel="stylesheet" href="style.css">
  </head>
  <body>
    <h1>Othello in pure JavaScript</h1>
    <div id="boardDiv"><div class="draughtsRow"><div class="draughtsSquare"></div><div class="draughtsSquare"></div><div class="draughtsSquare"></div><div class="draughtsSquare"></div><div class="draughtsSquare"></div><div class="draughtsSquare"></div><div class="draughtsSquare"></div><div class="draughtsSquare"></div></div><div class="draughtsRow"><div class="draughtsSquare"></div><div class="draughtsSquare"></div><div class="draughtsSquare"></div><div class="draughtsSquare"></div><div class="draughtsSquare"></div><div class="draughtsSquare"></div><div class="draughtsSquare"></div><div class="draughtsSquare"></div></div><div class="draughtsRow"><div class="draughtsSquare"></div><div class="draughtsSquare"></div><div class="draughtsSquare clickable"></div><div class="draughtsSquare clickable"></div><div class="draughtsSquare clickable"></div><div class="draughtsSquare"></div><div class="draughtsSquare"></div><div class="draughtsSquare"></div></div><div class="draughtsRow"><div class="draughtsSquare"></div><div class="draughtsSquare"></div><div class="draughtsSquare"><div class="draughtsPiece b"></div></div><div class="draughtsSquare"><div class="draughtsPiece b"></div></div><div class="draughtsSquare"><div class="draughtsPiece b"></div></div><div class="draughtsSquare"></div><div class="draughtsSquare"></div><div class="draughtsSquare"></div></div><div class="draughtsRow"><div class="draughtsSquare"></div><div class="draughtsSquare"></div><div class="draughtsSquare clickable"></div><div class="draughtsSquare"><div class="draughtsPiece b"></div></div><div class="draughtsSquare"><div class="draughtsPiece w"></div></div><div class="draughtsSquare"></div><div class="draughtsSquare"></div><div class="draughtsSquare"></div></div><div class="draughtsRow"><div class="draughtsSquare"></div><div class="draughtsSquare"></div><div class="draughtsSquare"></div><div class="draughtsSquare"><div class="draughtsPiece w"></div></div><div class="draughtsSquare"><div class="draughtsPiece b"></div></div><div class="draughtsSquare"><div class="draughtsPiece b"></div></div><div class="draughtsSquare"><div class="draughtsPiece b"></div></div><div class="draughtsSquare clickable"></div></div><div class="draughtsRow"><div class="draughtsSquare"></div><div class="draughtsSquare"></div><div class="draughtsSquare"></div><div class="draughtsSquare"></div><div class="draughtsSquare clickable"></div><div class="draughtsSquare"></div><div class="draughtsSquare clickable"></div><div class="draughtsSquare"></div></div><div class="draughtsRow"><div class="draughtsSquare"></div><div class="draughtsSquare"></div><div class="draughtsSquare"></div><div class="draughtsSquare"></div><div class="draughtsSquare"></div><div class="draughtsSquare"></div><div class="draughtsSquare"></div><div class="draughtsSquare"></div></div></div>
    <div id="infoDiv">white's move</div>
    <div id="scoreDiv">black: 7 | white: 2</div>
    <!-- <button onclick="toggleHighlight();">Toggle Highlight</button> -->
    <script src="main.js"></script>
  
</body></html> */}
