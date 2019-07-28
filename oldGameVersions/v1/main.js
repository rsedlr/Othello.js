var initialBoard = [[' ',' ',' ',' ',' ',' ',' ',' '],  // ' ' = empty square, 'b' = black piece, 'w' = white piece;
										[' ',' ',' ',' ',' ',' ',' ',' '],
										[' ',' ',' ',' ',' ',' ',' ',' '],
										[' ',' ',' ','b','w',' ',' ',' '],
										[' ',' ',' ','w','b',' ',' ',' '],
										[' ',' ',' ',' ',' ',' ',' ',' '],
										[' ',' ',' ',' ',' ',' ',' ',' '],
										[' ',' ',' ',' ',' ',' ',' ',' ']];
var board = [];  // stores the current board layout
var boardBackup = [];  // stores a clone of the board one move behind
var dir = [1,-1];  // an array of two directions
var checkPlay = {'w': 1, 'b': -1, ' ': 0}  // converts player colour into a number. This alows enemy pieces to be found by multiplying current by -1
var scoreDiv = document.getElementById("scoreDiv");  // stores a reference to the score html element
var passCount = 0;  // how many consecutive passes have occured
var undoable = false;  // player cannot undo as no move has been made
var player;  // current player
var move;  // stores a reference to the timeout function which allows it to be cleared on new game

newGame();  // start a new game

// sets the board up for a new game
function newGame() {  // initialise the game
	undoable = false;  // the player cannot undo a move as no move has been made yet
	player = 'b';  // black player always goes first
	board = initialBoard.map(r => r.slice(0)); // copy a deep clone of initialBoard to board
	renderBoard();  // render the pieces on the board
} 

// creates the board in HTML and fills it with pieces
function renderBoard() {  // renders the board
	while (boardDiv.firstChild) boardDiv.removeChild(boardDiv.firstChild); // wipes board
	board.forEach((row,r) => {  // loops over board rows
		var boardRow = document.createElement("div");  // instantiates a HTML div element
		boardDiv.appendChild(boardRow);  // makes the div a child of boardDiv
		boardRow.className = "boardRow";  // appends the classname 'boardRow' to the div
		row.forEach((square,c) => {  // loops over the squares in the row
			var boardSquare = document.createElement("div");  // instantiates a HTML div element
			boardRow.appendChild(boardSquare);  // makes the div a child of the boardRow div
			boardSquare.className = "boardSquare";  // appends the classname 'boardSquare' to the div
			if (['w','b'].includes(board[r][c])) {  // checks if the current square contains a board
				var boardPiece = document.createElement("div");  // instantiates a HTML div element
				boardSquare.appendChild(boardPiece);  // makes the board a child of the square div
				boardPiece.className = "boardPiece " + board[r][c].toLowerCase();  // appends the classname 'boardPiece ' along with the letter of the board's colour
			}
			var direction = checkMove(board, r, c, player);  // checks the available moves for the board
			if (board[r][c] == ' ' && direction.reduce((a, b) => a + b) != 0) {  // if the square is empty and a move can be made on it
				boardSquare.className += " clickable";  // append ' clickable' to the className of the square so that it appears a different colour
				boardSquare.onclick = function(){ placePiece(r, c, direction); };  // if its a humans move, allow the player to click the squares
			}
		});
	});
	if (!findTotal(board)) {  // if the game is not over yet
		passCount = 0;  // reset pass count as a move has occured
		infoDiv.innerHTML = ((player == 'w') ? "white" : "black")+" player's move";  // set the info div to current player
	}
}

// places a piece on the specifed board co-ordinate
function placePiece(r,c, direction) { // r = row, c = column
	boardBackup = board.map(r => r.slice(0));  // make a clone of the board in case of undo
	board[r][c] = player;  // assigns square with piece
	capture(board, r, c, direction);  // performs the capture
	player = (player == 'w') ? 'b' : 'w';  // changes player
	undoable = true;  // allows undo
	renderBoard();  // renders the changes
}

// checks which squares are viable moves
function checkMove(board, r, c, player) {  // board, row, column, player
	var direction = [0,0,0,0,0,0,0,0]; // top bottom left right topLeft bottomRight BottomLeft TopRight
	for (var i = 0; i < 8; i++) {  // loops over the directions
		if (i < 2) { var x = dir[i], y = 0; }  // first checks horizontal...
		else if (i < 4) { var x = 0, y = dir[i-2]; }  // then vertical...
		else if (i < 6) { var x = dir[i-4], y = x; }  // then diagonal...
		else { var x = dir[i-6], y = -x; }  // ..then the other diagonal
		try {  // try because it may be referencing a coordinate that doesn't exist (off the board)
			while (checkPlay[board[r - x][c - y]] == checkPlay[player]*-1) {  // while there are consecutive enemy peices
				direction[i] += 1;  // increases the count of direction
				if (i < 2) { x += dir[i]; }  // first incriments the horizontal...
				else if (i < 4) { y += dir[i-2]; }  // then the vertical...
				else if (i < 6) { x += dir[i-4]; y = x; }  // then diagonal...
				else { x += dir[i-6]; y = -x; }  // then the other diagonal
			}
			if (board[r - x][c - y] != player) {  // if consective enemy pieces aren't surrounded by a friendly piece
				direction[i] = 0;  // reset this direction to 0
			}
		} catch { // if the coordinate doesn't exist
			direction[i] = 0;  // reset this direction to 0
		}
	}
	return direction  // return the result
}

// captures all the surrounded pieces
function capture(board, r, c, direction) {  // capture funcion
	for (var i = 0; i <= direction.length; i++) {  // loop over direction
		for (var z = 1; z <= direction[i]; z++) {  // loop over amount in current direction
			if (i < 2) { var x = dir[i]*z, y = 0; }  // first capture horizontal pieces...
			else if (i < 4) { var x = 0, y = dir[i-2]*z; }  // then vertical pieces...
			else if (i < 6) { var x = dir[i-4]*z, y = x; }  // then diagonal...
			else { var x = dir[i-6]*z, y = -x; }  // then the other diagonal
			board[r - x][c - y] = player.toLowerCase();  // set current piece to players colour
		}
	}
}

// finds the total for each player
function findTotal(board, end=false) {
	board = board.map(r => r.slice()); // deep clone of array
	var blackTotal = 0, whiteTotal = 0;  // reset totals
	for (i=0; i < board.length; i++) {  // loop over board rows
		for (j=0; j < board[i].length; j++) {  // loop over row squares
			if (board[i][j] == 'w') {  // if current square has a white piece on it
				whiteTotal += 1;  // incriment the white total
			} else if (board[i][j] == 'b') {  // if current square has a black piece on it
				blackTotal += 1;  // incriment black total
			}
		}
	}
	scoreDiv.innerHTML = (`black score: ${blackTotal} | white score: ${whiteTotal}`)  // update score div with info
	if (whiteTotal + blackTotal == 64 || whiteTotal == 0 || blackTotal == 0 || end) {  // if the game is over
		if (whiteTotal > blackTotal) {  // if white scored higher
			infoDiv.innerHTML =  "WHITE WINS!";  // white won
		} else if (blackTotal > whiteTotal) {  // if black scored higher
			infoDiv.innerHTML =  "BLACK WINS!";  // black won
		} else {  // if neither scored higher
			infoDiv.innerHTML =  "DRAW!";  // its a draw
		}
		return true  // true as game is over
	}
	return false  // false as game is not over yet
}

