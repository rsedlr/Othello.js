
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