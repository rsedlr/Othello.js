var board = []; 
var boardBackup = [];  
var boardBackup2 = [];  
var modeBtn = ['ai_btn', '1p_btn', '2p_btn'];
var dir = [1,-1];  
var checkPlay = {'w': 1, 'b': -1, ' ': 0}  
var scoreDiv = document.getElementById("scoreDiv");  
var delay = document.getElementById("delay");  
var rowDrop = document.getElementById("rows");  
var colDrop = document.getElementById("cols");  
var gameMode = 1;  
var passCount = 0;  
var undoable = false;  
var animations = true;  
var waiting = false;
var isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;  
var player;  
var move;  

try {  
	if (getCookie('anims') == 'False') anims();  
	var dimensions = getCookie('board').split('-');  
	rowDrop.value = dimensions[0];  
	colDrop.value = dimensions[1];  
} catch { }  

if (isMac) {
	var x = document.getElementsByClassName('prefix');
	for (var i=0; i < x.length; i++) {
		x[i].classList += ' mac';
	}
}

newGame();  

function newGame() {  
	clearTimeout(move);
	var rows = parseInt(rowDrop.value);
	var cols = parseInt(colDrop.value);
	undoable = false;  
	player = 'b';  
	boardDiv.style.width = `${60 * cols}px`;
	board = Array(rows).fill(Array(cols).fill(' ')).map(r => r.slice(0));  
	boardBackup = board.map(r => r.slice(0));  
	board[rows/2 - 1][cols/2] = 'w';  
	board[rows/2][cols/2 - 1] = 'w';  
	board[rows/2 - 1][cols/2 - 1] = 'b';  
	board[rows/2][cols/2] = 'b';  
	renderBoard();  
	updateBoard();  
} 

function renderBoard() {  
	while (boardDiv.firstChild) boardDiv.removeChild(boardDiv.firstChild); 
	board.forEach((row,r) => {  
		var boardRow = document.createElement("div");  
		boardDiv.appendChild(boardRow);  
		boardRow.className = "boardRow";  
		row.forEach((square,c) => {  
			var boardSquare = document.createElement("div");  
			boardRow.appendChild(boardSquare);  
			boardSquare.className = "boardSquare";  
			boardSquare.id = `sq-${r}:${c}`;  
		});
	});
}

function updateBoard() {  
	waiting = false;
	var gameOver = true, idealMove = [0, []];  
	board.forEach((row,r) => {  
		row.forEach((square,c) => {  
			var boardSquare = document.getElementById(`sq-${r}:${c}`);  
			if (board[r][c] != boardBackup[r][c]) {  // || board[r][c] == ' '
				while (boardSquare.firstChild) boardSquare.removeChild(boardSquare.firstChild);
				if (['w','b'].includes(board[r][c])) {  
					var boardPiece = document.createElement("div");  
					boardSquare.appendChild(boardPiece);  
					boardPiece.className = "boardPiece " + board[r][c];  // .tolowercase()
					if (animations) boardPiece.className += ' anims';
				}
			}
			boardSquare.className = boardSquare.className.replace(' clickable','');  
			boardSquare.onclick = null;  
			var direction = checkMove(r, c, player);  
			if (board[r][c] == ' ' && direction.reduce((a, b) => a + b) != 0) {  
				boardSquare.className += ' clickable';  
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
				if (gameMode == 2 || (gameMode == 1 && player == 'b')) boardSquare.onclick = () => placePiece(r, c, direction);  
			} 
		});
	});
	var find = findTotal();
	if (!gameOver) {
		passCount = 0;  
		if (gameMode == 1) {  
			infoDiv.innerHTML = ((player == 'b') ? "your move" : "AI thinking...");  
			waiting = true;
			if (player == 'w') move = setTimeout(function() { placePiece(...idealMove[1][Math.floor(Math.random() * idealMove[1].length)].slice()); waiting = false; }, 700);  
		} else if (gameMode == 0) {  
			infoDiv.innerHTML = ((player == 'w') ? "white AI thinking..." : "black AI thinking...");  
			waiting = true;
			move = setTimeout(function() { placePiece(...idealMove[1][Math.floor(Math.random() * idealMove[1].length)].slice()); waiting = false; }, delay.options[delay.selectedIndex].value);  
		} else if (gameMode == 2) {  
			infoDiv.innerHTML = ((player == 'w') ? "white" : "black") + "'s move";  
		}
	} else if (!find) {  
		setTimeout(pass, 1);  
	}
}

function placePiece(r,c, direction) { 
	boardBackup2 = boardBackup.map(r => r.slice(0));  
	boardBackup = board.map(r => r.slice(0));  
	board[r][c] = player;  
	capture(r, c, direction);  
	player = (player == 'w') ? 'b' : 'w';  
	undoable = true;  
	updateBoard();  
}

function capture(r, c, direction) {  
	var dirLen = direction.length;  
	for (var i = 0; i <= dirLen; i++) {  
		for (var z = 1; z <= direction[i]; z++) {  
			if (i < 2) { var x = dir[i]*z, y = 0; }  
			else if (i < 4) { var x = 0, y = dir[i-2]*z; }  
			else if (i < 6) { var x = dir[i-4]*z, y = x; }  
			else { var x = dir[i-6]*z, y = -x; }  
			board[r - x][c - y] = player.toLowerCase();  
		}
	}
}

function checkMove(r, c, player) {  
	var direction = [0,0,0,0,0,0,0,0]; 
	for (var i = 0; i < 8; i++) {  
		if (i < 2) { var x = dir[i], y = 0; }  
		else if (i < 4) { var x = 0, y = dir[i-2]; }  
		else if (i < 6) { var x = dir[i-4], y = x; }  
		else { var x = dir[i-6], y = -x; }  
		try {  
			while (checkPlay[board[r - x][c - y]] == checkPlay[player]*-1) {  
				direction[i] += 1;  
				if (i < 2) { x += dir[i]; }  
				else if (i < 4) { y += dir[i-2]; }  
				else if (i < 6) { x += dir[i-4]; y = x; }  
				else { x += dir[i-6]; y = -x; }  
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

function pass() {  
	if (gameMode != 2 && passCount < 2) {  
		passCount += 1;  
		player = (player == 'w') ? 'b' : 'w';  
		updateBoard();  
	} else if (passCount >= 2) {  
		findTotal(board, true);  
	}
}

function undo() {  
	if (undoable && gameMode != 0) {  
		var tempBoard = board.map(r => r.slice(0));	
		if (gameMode == 2 || waiting == true) {  
			clearTimeout(move);
			board = boardBackup.map(r => r.slice(0));	
			boardBackup = tempBoard.map(r => r.slice(0));	
			player = (player == 'w') ? 'b' : 'w';  
		} else if (gameMode == 1) { 
			board = boardBackup2.map(r => r.slice(0));  
			boardBackup = tempBoard.map(r => r.slice(0));	
		}
		undoable = false;  
		updateBoard();  
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
	newGame();  
}

function findTotal(end=false) {  
	document.getElementById('undo').className = ((undoable && gameMode != 0) ? 'enabled' : '');
	board = board.map(r => r.slice()); 
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
	if (whiteTotal + blackTotal == parseInt(rowDrop.value) * parseInt(colDrop.value) || whiteTotal == 0 || blackTotal == 0 || end) {  
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

function anims() {  
	var animButton = document.getElementById('anims');  
	if (animations) {  
		animations = false;  
		animButton.className = '';  
		setCookie('anims', 'False');  
	} else {  
		animations = true;  
		animButton.className = 'enabled';  
		setCookie('anims', 'True');  
	}
}

function showHowTo() {  
	document.getElementById('howToModal').style.display = 'block';  
}	

function hideHowTo() {  
	document.getElementById('howToModal').style.display = 'none';  
}

function setCookie(name, value) {  
	document.cookie = name + "=" + (value || "")  + "; path=/";  
}

function getCookie(name) {  
	name += "=";  
	var cookies = document.cookie.split(';');  
	for(var i=0;i < cookies.length;i++) {  
		var cookie = cookies[i];  
		while (cookie.charAt(0)==' ') cookie = cookie.substring(1, cookie.length);  
		if (cookie.indexOf(name) == 0) return cookie.substring(name.length, cookie.length);  
	}
	return null;  
}

document.addEventListener('change', function() {  
	if (event.target.matches('.boardSelect')) {  
		setCookie('board', (rowDrop.value + '-' + colDrop.value));  
		newGame();  
	}
});

// TODO:
// undo button lights up on AI vs AI
// make settings on seperate window or somin like that so theres less clutter on the page
// IF SKIP OCCURS, UPDATE INFO DIV TO INFORM USER SO THEY AINT BAFFED
// hihglight pass when the current player cannot make a move, rather than doing it automatically

