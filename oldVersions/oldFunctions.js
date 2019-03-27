
// NOTES
// -Make check available return a list of all points it would take (empty if none)
// -Then checkCapture would simply take them onclick 

// CHECKAVAILABLE NEW ISH
function capture(board, r, c, direction) {
	for (var i = 0; i <= direction.length; i++) {
		for (var z = 0; z <= direction[i]-1; z++) {
			if (i < 2) { var x = (dir[i] > 0) ? dir[i]+z : dir[i]-z, y = 0; }
			else if (i < 4) { var x = 0, y = (dir[i-2] > 0) ? dir[i-2]+z : dir[i-2]-z; }
			else if (i < 6) { var x = (dir[i-4] > 0) ? dir[i-4]+z : dir[i-4]-z, y = x; }
			else { var x = (dir[i-6] > 0) ? dir[i-6]+z : dir[i-6]-z, y = -x; }
			board[r - x][c - y] = player.toLowerCase();
		}
	}
}


// 'CHECAVAILABLE' BEFORE IT STOPPED BEING JUST A CHECK
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
				check = true;
			} 
		} catch { /* pass; */	}
	}
	return check
}


// 'CHECKAVAILABLE' THAT WASNT ACCURATE
function checkAvailable(board, r, c, p) {  // board, row, column, player
  var check = false;		// NEED TO FIX DIS ---------------------------------------------------------------------------------------
	var dir = [-1,0,1];
	for (var x=0; x < dir.length; x++) {
		for (var y=0; y < dir.length; y++) {
			try {
				var temp = board[r+dir[x]][c+dir[y]].toUpperCase();
				if (temp != p && temp != ' ') {
					check = true;
				}
			} catch { /* pass; */	}
		}
	}
	return check
}


// OLD VERSION OF 'CHECKAVAILABLE'
function checkAvailable(board, r, c, player) {  // board, row, column, player
	var check = false;		// NEED TO FIX DIS -------------------------------------------------------------------------
	var dir = [1,-1];
	for (var i = 0; i < dir.length; i++) {  //UP DOWN
		var x = 0;
		try {
			while (checkPlay[board[r - (dir[i]+x)][c].toUpperCase()] == checkPlay[player]*-1) {
				x = (dir[i] == 1) ? x+1 : x-1;
			}
			if (checkPlay[board[r - (dir[i]+x)][c].toUpperCase()] == checkPlay[player] && x != 0) {
				check = true;
			} 
		} catch { /* pass; */	}
	}
	for (var i = 2; i < dir.length+2; i++) { //LEFT RIGHT
		var y = 0;
		try {
			while (checkPlay[board[r][c - (dir[i-2]+y)].toUpperCase()] == checkPlay[player]*-1) {
				y = (dir[i-2] == 1) ? y+1 : y-1;
			}
			if (checkPlay[board[r][c - (dir[i-2]+y)].toUpperCase()] == checkPlay[player] && y != 0) {
				check = true;
			} 
		} catch { /* pass; */	}
	}
	for (var i = 4; i < dir.length+4; i++) {  //DIAGONAL NEG ?
		var x = 0;
		try {
			while (checkPlay[board[r - (dir[i-4]+x)][c - (dir[i-4]+x)].toUpperCase()] == checkPlay[player]*-1) {
				x = (dir[i-4] == 1) ? x+1 : x-1;
			}
			if (checkPlay[board[r - (dir[i-4]+x)][c - (dir[i-4]+x)].toUpperCase()] == checkPlay[player] && x != 0) {
				check = true;
			} 
		} catch { /* pass; */	}
	}
	for (var i = 6; i < dir.length+6; i++) {  //DIAGONAL POS ?
		var x = 0;
		try {
			while (checkPlay[board[r - (dir[i-6]+x)][c + (dir[i-6]+x)].toUpperCase()] == checkPlay[player]*-1) {
				x = (dir[i-6] == 1) ? x+1 : x-1;
			}
			if (checkPlay[board[r - (dir[i-6]+x)][c + (dir[i-6]+x)].toUpperCase()] == checkPlay[player] && x != 0) {
				check = true;
			} 
		} catch { /* pass; */	}
	}
	return check
}

// OLD VERSION OF 'CHECKCAPTURE'
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

// RENDER BOARD
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
			var direction = checkAvailable(draughts, r, c, player);
			if (draughts[r][c] == ' ' && JSON.stringify(direction) != JSON.stringify([0,0,0,0,0,0,0,0])) {
				gameOver = false;
				draughtsSquare.onclick = function(){ placePiece(r, c, direction); };
				if (highlightOptions) draughtsSquare.className += " clickable";
			}
			findTotal(draughts);
		});
	});
	if (gameOver != true) infoDiv.innerHTML = ((player == 'W') ? "white" : "black")+"'s move";
}

