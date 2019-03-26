
// NOTES
// -Make check available return a list of all points it would take (empty if none)
// -Then checkCapture would simply take them onclick 

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
