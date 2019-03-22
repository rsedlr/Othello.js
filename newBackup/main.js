/*
move = {r: row of moving piece,
		c: column of moving piece,
		moveSequence: array of {r,c} coordinates showing the squares moved to during a single move (usually one, but is more than one when taking multiple pieces in a single move)
	   }


findLegalMoves() populates the legalMoves array with all possible moves given the current board and player state.
renderBoard: creates the board in the DOM. Squares have onclick attributes to allow interactions when the current active player is not the AI.

	*click* OR aiMove()
		=>
			selectPiece: saves a piece to the 'selected' variable.
			placePiece: updates the game state and calls findLegalMoves and renderBoard


aiMove calls mcMove which runs mcts (monte carlo tree search) many times. mcts runs mcSelection, mcExpansion, mcSimulation and mcBackpropagation. The best move according to its win:play ratio is chosen.

*/

var draughtsInitial = [ // ' ' is an empty square, 'b' a black piece, 'w' a white piece; 'B' and 'W' are kings.
	[' ','b',' ','b',' ','b',' ','b'],
	['b',' ','b',' ','b',' ','b',' '],
	[' ','b',' ','b',' ','b',' ','b'],
	[' ',' ',' ',' ',' ',' ',' ',' '],
	[' ',' ',' ',' ',' ',' ',' ',' '],
	['w',' ','w',' ','w',' ','w',' '],
	[' ','w',' ','w',' ','w',' ','w'],
	['w',' ','w',' ','w',' ','w',' ']];
var draughts = [];
var player = 'B'; // current active player
var playMode = 2; // number of human players (1 or 2)
var aiColourMode = "random"; // "random", 'W', or 'B'. Colour of AI player.
var humans = {W: true, B: true}; // human or AI
var selected; // piece selected to be moved
var legalMoves = []; // array of all possible moves given the current board and player state.
var highlightOptions = true;

function setPlayMode(n) {
	playMode = n;
	button1player.className = "playModeButton";
	button2player.className = "playModeButton";
	document.getElementById("button"+n+"player").className += " selectedPlayMode";
	initialise();
}

function setColourMode(c) {
	aiColourMode = c;
	if (playMode == 1) initialise();
}

function initialise() {
	player = 'B';
	humans.W = true;
	humans.B = true;
	if (playMode == 1) { // game against AI
		if (aiColourMode == "random") {
			if (Math.random() < 0.5) humans.W = false;
			else humans.B = false;
		} else {
			humans[aiColourMode] = false;
		}
	}
	draughts = draughtsInitial.map(r => r.slice()); // copy draughtsInitial to draughts
	selected = false;
	legalMoves = findLegalMoves(draughts,player);
	renderBoard();
	
	// MCTS AI
	mcTree = {r: -1, c: -1, moveSequence: [], player: 'B', wins: 0, plays: 0, parent: null, children: []};
	mcState = draughts.map(r => r.slice()); // copy array
	if (!humans[player]) aiMove();
}

function renderBoard() {
	while (boardDiv.firstChild) boardDiv.removeChild(boardDiv.firstChild);
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
				draughtsPiece.className = "draughtsPiece "+draughts[r][c];
				if (selected && selected.r == r && selected.c == c) draughtsPiece.className += " selected";
			}
			if (draughts[r][c] == 'W' || draughts[r][c] == 'B') draughtsPiece.textContent = '\u2654'; // king
			if (legalMoves.some(m => m.r == r && m.c == c)) {
				if (humans[player]) {
					draughtsSquare.onclick = function(){selectPiece(r,c);};
					if (highlightOptions) draughtsSquare.className += " clickable";
				} else if (highlightOptions) draughtsSquare.className += " aiOption";
			}
			if (selected &&
				legalMoves.some(m => 
					(m.r == selected.r && m.c == selected.c &&
					 m.moveSequence[0].r == r && m.moveSequence[0].c == c))) {
				if (humans[player]) {
					draughtsSquare.onclick = function(){placePiece(r,c);};
					if (highlightOptions) draughtsSquare.className += " clickable";
				} else if (highlightOptions) draughtsSquare.className += " aiOption";
			}
		});
	});
	if (humans.B && humans.W) infoDiv.innerHTML = ((player == 'W') ? "white" : "black")+"'s move";
	else infoDiv.innerHTML = humans[player] ? "your move" : "AI thinking...";
	if (legalMoves.length === 0) infoDiv.innerHTML = ((player == 'W') ? "BLACK" : "WHITE")+" WINS";
}

function selectPiece(r,c) { // r = row, c = column
	if (selected && selected.r == r && selected.c == c) selected = false;
	else selected = {r: r, c: c};
	renderBoard();
}

function placePiece(r,c) { // r = row, c = column
	var move = legalMoves.find(m => 
		(m.r == selected.r && m.c == selected.c &&
		 m.moveSequence[0].r == r && m.moveSequence[0].c == c));
	
	draughts = updateState(draughts,selected.r,selected.c,r,c);
	
	if (move.moveSequence.length > 1) {
		legalMoves = legalMoves.filter(m =>
			(m.r == selected.r && m.c == selected.c &&
			 m.moveSequence[0].r == r && m.moveSequence[0].c == c)).map(m =>
			 ({r: m.moveSequence[0].r, c: m.moveSequence[0].c, moveSequence: m.moveSequence.slice(1)}));
		selected = {r:r,c:c};
	} else {
		selected = false;
		player = (player == 'W') ? 'B' : 'W';
		legalMoves = findLegalMoves(draughts,player);
	}
	renderBoard();
	if (!humans[player] && !selected && legalMoves.length > 0) aiMove();
}

function updateState(board,pieceR,pieceC,destinationR,destinationC) { // p = player
	board = board.map(r => r.slice()); // copy array
	board[destinationR][destinationC] = board[pieceR][pieceC];
	if (board[pieceR][pieceC] == 'w' && destinationR == 0) board[destinationR][destinationC] = 'W';
	if (board[pieceR][pieceC] == 'b' && destinationR == 7) board[destinationR][destinationC] = 'B';
	board[pieceR][pieceC] = ' ';
	
	if (Math.abs(destinationR-pieceR) == 2) { // a piece has been captured
		board[(pieceR+destinationR)/2][(pieceC+destinationC)/2] = ' ';
	}
	
	return board;
}

function findLegalMoves(board,p) { // p = player
	var possibleCaptures = [];
	var possibleSteps = []; // non-capturing moves
	board.forEach((row,r) => {
		row.forEach((square,c) => {
			if (square.toUpperCase() == p) {
				var king = (square == 'W' || square == 'B');
				var captures = findPossibleCaptures(board,r,c,p,king);
				if (captures.length > 0 || possibleCaptures.length > 0)
					possibleCaptures = possibleCaptures.concat(captures.map(seq =>
						({r: r, c: c, moveSequence: seq})));
				else {
					var steps = findPossibleSteps(board,r,c,p);
					if (steps.length > 0)
						possibleSteps = possibleSteps.concat(steps.map(step =>
							({r: r, c: c, moveSequence: step})));
				}
			}
		});
	});
	if (possibleCaptures.length > 0) return possibleCaptures;
	else return possibleSteps;
}

function findPossibleCaptures(board,r,c,p,king) { // r = row, c = column, p = player
	var possibleCaptures = [];
	var dir = (p == 'B') ? 1 : -1;
	if (c >= 2 && r+2*dir >= 0 && r+2*dir < 8 && // take piece on the left
		board[r+dir][c-1] != ' ' && board[r+dir][c-1].toUpperCase() != p &&
		board[r+2*dir][c-2] == ' ') {
		var simulation = board.map(r => r.slice()); // copy array
		simulation[r+2*dir][c-2] = simulation[r][c];
		simulation[r+dir][c-1] = ' ';
		simulation[r][c] = ' ';
		var furtherCaptures = findPossibleCaptures(simulation,r+2*dir,c-2,p,king);
		if (furtherCaptures.length === 0) possibleCaptures.push([{r:r+2*dir,c:c-2}]);
		else possibleCaptures = possibleCaptures.concat(furtherCaptures.map(cap => [{r:r+2*dir,c:c-2}].concat(cap)));
	}
	if (c <= 5 && r+2*dir >= 0 && r+2*dir < 8 && // take piece on the right
		board[r+dir][c+1] != ' ' && board[r+dir][c+1].toUpperCase() != p &&
		board[r+2*dir][c+2] == ' ') {
		var simulation = board.map(r => r.slice()); // copy array
		simulation[r+2*dir][c+2] = simulation[r][c];
		simulation[r+dir][c+1] = ' ';
		simulation[r][c] = ' ';
		var furtherCaptures = findPossibleCaptures(simulation,r+2*dir,c+2,p,king);
		if (furtherCaptures.length === 0) possibleCaptures.push([{r:r+2*dir,c:c+2}]);
		else possibleCaptures = possibleCaptures.concat(furtherCaptures.map(cap => [{r:r+2*dir,c:c+2}].concat(cap)));
	}
	
	// kings can also capture backwards
	if (king) {
		dir *= -1;
		if (c >= 2 && r+2*dir >= 0 && r+2*dir < 8 && // take piece on the left
			board[r+dir][c-1] != ' ' && board[r+dir][c-1].toUpperCase() != p &&
			board[r+2*dir][c-2] == ' ') {
			var simulation = board.map(r => r.slice()); // copy array
			simulation[r+2*dir][c-2] = simulation[r][c];
			simulation[r+dir][c-1] = ' ';
			simulation[r][c] = ' ';
			var furtherCaptures = findPossibleCaptures(simulation,r+2*dir,c-2,p,king);
			if (furtherCaptures.length === 0) possibleCaptures.push([{r:r+2*dir,c:c-2}]);
			else possibleCaptures = possibleCaptures.concat(furtherCaptures.map(cap => [{r:r+2*dir,c:c-2}].concat(cap)));
		}
		if (c <= 5 && r+2*dir >= 0 && r+2*dir < 8 && // take piece on the right
			board[r+dir][c+1] != ' ' && board[r+dir][c+1].toUpperCase() != p &&
			board[r+2*dir][c+2] == ' ') {
			var simulation = board.map(r => r.slice()); // copy array
			simulation[r+2*dir][c+2] = simulation[r][c];
			simulation[r+dir][c+1] = ' ';
			simulation[r][c] = ' ';
			var furtherCaptures = findPossibleCaptures(simulation,r+2*dir,c+2,p,king);
			if (furtherCaptures.length === 0) possibleCaptures.push([{r:r+2*dir,c:c+2}]);
			else possibleCaptures = possibleCaptures.concat(furtherCaptures.map(cap => [{r:r+2*dir,c:c+2}].concat(cap)));
		}
	}
	
	return possibleCaptures;
}

function findPossibleSteps(board,r,c,p) { // r = row, c = column, p = player
	var steps = [];
	var dir = (p == 'B') ? 1 : -1;
	if (c >= 1 && r+dir >= 0 && r+dir < 8 &&
		board[r+dir][c-1] == ' ') steps.push([{r:r+dir,c:c-1}]);
	if (c <= 6 && r+dir >= 0 && r+dir < 8 &&
		board[r+dir][c+1] == ' ') steps.push([{r:r+dir,c:c+1}]);
	
	// kings can also step backwards
	if (board[r][c] == 'W' || board[r][c] == 'B') {
		dir *= -1;
		if (c >= 1 && r+dir >= 0 && r+dir < 8 &&
			board[r+dir][c-1] == ' ') steps.push([{r:r+dir,c:c-1}]);
		if (c <= 6 && r+dir >= 0 && r+dir < 8 &&
			board[r+dir][c+1] == ' ') steps.push([{r:r+dir,c:c+1}]);
	}
	
	return steps;
}

function toggleHighlight() {
	highlightOptions = !highlightOptions;
	renderBoard();
}

setPlayMode(2);



/* ##################################################################### 


                                  AI    


mcTree node = {
	r: row coordinate of the moving piece of the move represented by this node,
	c: column coordinate of the moving piece of the move represented by this node,
	moveSequence: array of squares visited during the move represented by this node,
	parent: node representing the move prior to this node's move,
	children: nodes representing all possible moves that can be made in reply to this move,
	player: the player about to make a move ('children' moves are the options available to 'player'),
	plays: number of simulations run on this node and its descendents that did not result in a draw or reach the depth-limit,
	wins: number of simulations run on the descendents of this node that result in a win for the player who made this move
}

to save memory, instead of saving the state at each node, reproduce the state from the sequence of moves in every selection phase.
save the state in mcState after every move. Before every move, use mcState to work out which move was played by the opponent.
*/

var mcTree; // set by initialise()
var mcState; // set by initialise()



function aiMove() {
	setTimeout(aiMoveMaker,100); // allow DOM to render before mcMove processing freezes it
}

function aiMoveMaker() {
	var then = Date.now();
	var move = mcMove();
	var elapsed = Date.now()-then;
	if (elapsed < 500) {
		setTimeout(function(){
			selectPiece(move.r,move.c);
			delayMove(move.moveSequence);}, 600-elapsed);
	} else {
		selectPiece(move.r,move.c);
		delayMove(move.moveSequence);
	}
}

function delayMove(moveSequence) {
	setTimeout(function(){
		placePiece(moveSequence[0].r,moveSequence[0].c);
		if (moveSequence.length > 1) delayMove(moveSequence.slice(1));}, 600);
}

function randomMove() {
	return legalMoves[Math.floor(Math.random()*legalMoves.length)];
}

function mcMove() {
	if (mcTree.children.length === 0) mcTree.children = findLegalMoves(mcState,mcTree.player).map(m =>
		({r: m.r, c: m.c, moveSequence: m.moveSequence,
			player: (mcTree.player == 'W') ? 'B' : 'W', wins: 0, plays: 0, parent: mcTree, children: []}));
	if (mcTree.player != player) {
		// The opponent has made a move since mcMove() was last run (or has made the opening move) so the board state has changed.
		// Find which of the mcTree.children was played and prune mcTree accordingly.
		var board, move;
		for (var i = 0, lim = mcTree.children.length; i < lim; i++) {
			move = mcTree.children[i];
			board = simulateMoveSequence(mcState, move);
			if (board.toString() == draughts.toString()) {
				mcTree = move;
				mcTree.parent = null;
				mcState = board;
				break;
			}
		}
		if (i >= lim) {console.log("error: mcTree not updated"); console.log(mcTree); return false;}
	}
	var then = Date.now();
	var i = 0;
	while (Date.now()-then < 1000 && i < 1500) {  // runs mcts for at most 1 second or 1500 iterations
		mcts();
		i++;
	}
	var score, maxI;
	var maxScore = -1;
	mcTree.children.forEach((c,i) => {
		score = c.wins/c.plays;
		if (score >= maxScore) {
			maxScore = score;
			maxI = i;}});
	mcTree = mcTree.children[maxI];
	mcTree.parent = null;
	mcState = simulateMoveSequence(mcState, mcTree);
	return mcTree;
}

function simulateMoveSequence(board, move) {
	return move.moveSequence.reduce((a,b) =>
		({board:updateState(a.board,a.r,a.c,b.r,b.c),r:b.r,c:b.c}),
		{board: board.map(r => r.slice()), r: move.r, c: move.c}).board;
}

function mcts() {
	var leafNode = mcSelection();
	// Choose the best sequence of moves according to UCT until we find a node that has not been fully explored. Recreate the game state as we go down the tree.
	
	var childNode = mcExpansion(leafNode.node, leafNode.board);
	// Find all possible moves from the selected game state and choose one that has not been explored (played).
	
	var loser = (childNode.hasOwnProperty("loser")) ? childNode.loser : mcSimulation(childNode.board, childNode.node.player);
	// If there are no possible moves, the player has lost, no simulations are needed, skip to the back-propagation step. Otherwise, run a simulation; if the game ends before the depth-limit is reached, return which player lost.
	
	mcBackpropagation(childNode.node, loser);
	// If the move sequence resulted in a player losing, update the tree with this data.
}

function mcSelection() {
	var node = mcTree;
	var board = mcState.map(r => r.slice()); // copy array
	var totalPlays, uct, uctMax, uctMaxI;
	while (node.children.length > 0 && node.children.every(c => c.plays > 0)) {
		uctMax = -1;
		node.children.forEach((c,i) => {
			uct = (c.wins/c.plays) + 0.7*Math.sqrt((2*Math.log(node.plays-1))/c.plays);
			if (uct >= uctMax) {
				uctMax = uct;
				uctMaxI = i;}});
		node = node.children[uctMaxI];
		board = simulateMoveSequence(board, node);
	}
	return {node: node, board: board};
}

function mcExpansion(node, board) {
	if (node.children.length === 0) {
		node.children = findLegalMoves(board,node.player).map(m =>
			({r: m.r, c: m.c, moveSequence: m.moveSequence,
				player: (node.player == 'W') ? 'B' : 'W', wins: 0, plays: 0, parent: node, children: []}));
	}
	if (node.children.length === 0) return {node: node, loser: (node.player == 'W') ? 'B' : 'W'};
	else {
		var unvisitedNodes = node.children.filter(c => (c.plays === 0));
		var chosenNode = unvisitedNodes[Math.floor(Math.random()*unvisitedNodes.length)];
		return {node: chosenNode, board: simulateMoveSequence(board,chosenNode)};
	}
}

function mcSimulation(board,p) { // p = player
	var depth = 40;
	var loser = false;
	var moves, chosenMove;
	while (!loser && depth > 0) {
		moves = findLegalMoves(board,p);
		if (moves.length === 0) {
			loser = (p == 'W') ? 'B' : 'W';
//		} else if (moves.some(m => findLegalMoves(simulateMoveSequence(board,m),(p == 'W') ? 'B' : 'W').length === 0)) { // check if any moves result in a win
		} else {
			chosenMove = moves[Math.floor(Math.random()*moves.length)];
			board = simulateMoveSequence(board,chosenMove);
			p = (p == 'W') ? 'B' : 'W';
			depth--;
		}
	}
	return loser;
}

function mcBackpropagation(node, loser) {
	while (node !== null) {
		node.plays++;
		if (loser) {
			if (node.player != loser) node.wins++;
			else node.wins--;
		}
		node = node.parent;
	}
}