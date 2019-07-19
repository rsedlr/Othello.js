var initialBoard = [[' ',' ',' ',' ',' ',' ',' ',' '],  // ' ' = empty square, 'b' = black piece, 'w' = white piece;
										[' ',' ',' ',' ',' ',' ',' ',' '],
										[' ',' ',' ',' ',' ',' ',' ',' '],
										[' ',' ',' ','b','w',' ',' ',' '],
										[' ',' ',' ','w','b',' ',' ',' '],
										[' ',' ',' ',' ',' ',' ',' ',' '],
										[' ',' ',' ',' ',' ',' ',' ',' '],
										[' ',' ',' ',' ',' ',' ',' ',' ']];
var cleanBoard = Array(8).fill(Array(8).fill(' '));  // creates an 8 by 8 2d array of ' ' which is equivalent to a blank board
var board = [];  // stores the current board layout
var boardBackup = [];  // stores a clone of the board one move behind
var boardBackup2 = [];  // stores a clone of the board two moves behind
var modeBtn = ['ai_btn', '1p_btn', '2p_btn']  // stores the id's of the game mode buttons
var dir = [1,-1];  // an array of two directions
var checkPlay = {'w': 1, 'b': -1, ' ': 0}  // converts player colour into a number. This alows enemy pieces to be found by multiplying current by -1
var scoreDiv = document.getElementById("scoreDiv");  // stores a reference to the score html element
var gameMode = 1;  // 0 - AIvsAI, 1 - 1player, 2 - 2player 
var passCount = 0;  // how many consecutive passes have occured
var undoable = false;
var player;  // current player
var move;  // stores a reference to the timeout function which allows it to be cleared on new game

newGame();


function newGame(init=false) {  // initialise the game
	clearTimeout(move)  // stops any waiting AI moves from completing
	undoable = false;
	player = 'b';
	board = initialBoard.map(r => r.slice(0)); // copy a deep clone of initialBoard to board
	boardBackup = cleanBoard.map(r => r.slice(0));  // NOT IDEAL ------------------------------
	firstRender();
	renderBoard(init);
} 

function firstRender() {
	while (boardDiv.firstChild) boardDiv.removeChild(boardDiv.firstChild); // wipes board
	board.forEach((row,r) => {  // loops over board rows
		var boardRow = document.createElement("div");  // instantiates a HTML div element
		boardDiv.appendChild(boardRow);  // makes the div a child of boardDiv
		boardRow.className = "boardRow";  // appends the classname 'boardRow' to the div
		row.forEach((square,c) => {  // loops over the squares in the row
			var boardSquare = document.createElement("div");  // instantiates a HTML div element
			boardRow.appendChild(boardSquare);  // makes the div a child of the boardRow div
			boardSquare.className = "boardSquare";  // appends the classname 'boardSquare' to the div
			boardSquare.id = `sq-${r}${c}`; 
		});
	});
}

function renderBoard(init=false) {  // renders the board
	var gameOver = true, idealMove = [0, []];  // the score of the current ideal (highest capture) moves, followed by all the possible choices (row, col, direction)
	board.forEach((row,r) => {  // loops over board rows
		row.forEach((square,c) => {  // loops over the squares in the row
			var boardSquare = document.getElementById(`sq-${r}${c}`);  
			if (board[r][c] != boardBackup[r][c]) {  // if the piece is not in the square already
				while (boardSquare.firstChild) boardSquare.removeChild(boardSquare.firstChild);
				if (['w','b'].includes(board[r][c])) {  // checks if the current square contains a piece
					var boardPiece = document.createElement("div");  // instantiates a HTML div element
					boardSquare.appendChild(boardPiece);  // makes the board a child of the square div
					boardPiece.className = "boardPiece " + board[r][c].toLowerCase();  // appends the classname 'boardPiece ' along with the letter of the board's colour
				}
			}
			boardSquare.className = boardSquare.className.replace(' clickable','');  // removes the square's darker colour
			boardSquare.onclick = null;  // removes the square's previous onClick funcion
			var direction = checkMove(board, r, c, player);  // checks the available moves for the board
			if (board[r][c] == ' ' && JSON.stringify(direction) != JSON.stringify([0,0,0,0,0,0,0,0])) {  // if the square is empty and a move can be made on it
				boardSquare.className += ' clickable';  // append ' clickable' to the className of the square so that it appears a different colour
				gameOver = false;  // the game isnt over as moves can be made
				if (gameMode != 2) {  // if one of the ai options is enabled
					var score = direction.reduce(function(a, b) { return a + b }, 0);  // gets the sum of all captures in each direction
					if (score > idealMove[0]) {  // if this move scores better than the previous option
						idealMove[0] = score;  // assigns the first item in the array to the new high score
						idealMove[1] = [[r, c, direction]]  // assigns the row, column and direction of the move to the second item in the array
					} else if (score == idealMove[0]) {  // if the score is equal to the previous
						idealMove[1].push([r, c, direction]);  // add another row, column and direction to the second item of the array
					}
				}
				if (gameMode == 2 || (gameMode == 1 && player == 'b')) boardSquare.onclick = function(){ placePiece(r, c, direction); };  // if its a humans move, allow the player to click the squares
			} 
		});
	});
	var find = findTotal(board);
	if (!gameOver) {
		passCount = 0;  // reset pass count as a move has occured
		if (gameMode == 1) {  // if the game mode is 1player
			infoDiv.innerHTML = ((player == 'b') ? "your move" : "AI thinking...");  // update info div with current data
			if (player == 'w') move = setTimeout(function() { placePiece(...idealMove[1][Math.floor(Math.random() * idealMove[1].length)].slice()) }, 700);  // if the current player is the AI then pick a random ideal move from the array of moves in 700 milliseconds
		} else if (gameMode == 0) {  // else if the game mode is AI vs AI
			infoDiv.innerHTML = ((player == 'w') ? "white AI thinking..." : "black AI thinking...");  // update info div 
			var e = document.getElementById("delay");  // get the AI delay dropdown
			move = setTimeout(function() { placePiece(...idealMove[1][Math.floor(Math.random() * idealMove[1].length)].slice()) }, e.options[e.selectedIndex].value);  // if the current player is the AI then pick a random ideal move from the array of moves after the dealy defined by the html dropdown
		} else if (gameMode == 2) {  // else if the game mode is 2 player
			infoDiv.innerHTML = ((player == 'w') ? "white" : "black")+"'s move";  // set the info div to current player
		}
	} else if (!find) {  // if there are still empty spaces available to play
		setTimeout(function() { pass() }, 1);  // pass the current players go automatically
	}
}

function placePiece(r,c, direction) { // r = row, c = column
	boardBackup2 = boardBackup.map(r => r.slice(0));  // make a clone of the board in case of undo
	boardBackup = board.map(r => r.slice(0));  // make a clone of the board in case of undo
	board[r][c] = player;  // assigns square with piece
	capture(board, r, c, direction);  // performs the capture
	player = (player == 'w') ? 'b' : 'w';  // changes player
	undoable = true;  // allows undo
	renderBoard();  // renders the changes
}

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

function pass() {
	if (gameMode != 2 && passCount < 2) {  // if game mode is not 2 player and less than 2 consecutive passes have occured
		passCount += 1;  // incriment pass count
		player = (player == 'w') ? 'b' : 'w';  // switch current player
		renderBoard();  // render changes
	} else if (passCount >= 2) {  // no moves can be made as 2 passes occured (neither player can make a move)
		findTotal(board, true);  // find the total as the game is over
	}
}

function undo() {
	if (undoable == true && gameMode != 0) {  // if undo is allowed and its not in AIvsAI mode
		if (gameMode == 2) {  // if it is a human game
			board = boardBackup.map(r => r.slice(0));	// set the board back to how it was one move ago
			player = (player == 'w') ? 'b' : 'w';  // switch current player
		} else if (gameMode == 1) {  // if its 1player
			board = boardBackup2.map(r => r.slice(0));  // set the board back to how it was two moves ago as the AI also made a move
		}
		undoable = false;  // cannot do another undo after this
		renderBoard();  // render changes
	}
}

function setMode(mode) {
	modeBtn.forEach(function(option) {  // for every game mode button (currently 3)
		if (modeBtn[mode] == option) {  // if the current one is what was clicked
			document.getElementById(option).className = "enabled";  // change it's appearance
		} else {  // if it's another button
			document.getElementById(option).className = "";  // reset to default appearance
		}
	});
	gameMode = mode;  // set game mode
	newGame();  // reset board
}

function findTotal(board, end=false) {
	document.getElementById('undo').className = ((undoable) ? 'enabled' : '');
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
	scoreDiv.innerHTML = (`black: ${blackTotal} | white: ${whiteTotal}`)  // update score div with info
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


// IF SKIP OCCURS, UPDATE INFO DIV TO INFORM USER SO THEY AINT BAFFED