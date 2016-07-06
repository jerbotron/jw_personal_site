// Project: 2048 Game
// Author: Jeremy Wang

$(document).ready(function() {
	var gameBoard = new Board();
	var gameStart = true;
	var direction;
	gameBoard.beginGame();

	$('#startButton').click(function() {
		gameBoard.beginGame();
		gameStart = true;
	});

	$('#undoButton').click(function() {
		gameBoard.boardMatrix = gameBoard.prevMatrix.slice();
		gameBoard.updateBoard();
	});

	$(document).keydown(function(event) {
		if (gameStart) {
	    	switch(event.which) {
	    		case 37: 							// left
	    			direction = 0;
	    			gameBoard.move(0);
	    			break;
	    		case 38: 							// up
		    		direction = 1;
		    		gameBoard.move(1);
		    		break;
	    		case 39: 							// right
		    		direction = 2;
		    		gameBoard.move(2);
		    		break;
	    		case 40: 							// down
		    		direction = 3;
		    		gameBoard.move(3);
		    		break;
	    		default: break;;
	    	}
	    	if (!compareMatrices(gameBoard.boardMatrix, gameBoard.prevMatrix)) { 
				var children = document.getElementsByClassName('board')[0].children;
				for (var i = 0; i < children.length; ++i) {
					if (gameBoard.animateDists[i]) {
						children[i].firstChild.className += ' moving';
					}
				}
				var moves = removeZeros(gameBoard.animateDists);
				gameBoard.animateMove(direction, moves);
				++gameBoard.numberOfMoves;
			}
	    	document.getElementsByClassName('moves-counter')[0].innerHTML = gameBoard.numberOfMoves;
	    	// gameBoard.printMatrix(gameBoard.boardMatrix);
	    	if (gameBoard.deadBoard()) {
	    		alert("GAME OVER!");
	    		gameStart = false;
	    	}
	    }
	});
});

var BOARD_LENGTH = 16;
var TILE_WIDTH = 110;
var colorHash = {
	0: '#CDC1B4',
	2: '#EEE4DA',
	4: '#EDE0C8',
	8: '#F2B179',
	16: '#F59563',
	32: '#F67C5F',
	64: '#F65E3B',
	128: '#EDCF72',
	256: '#EDCC61',
	512: '#EDC850',
	1024: '#EDC53F',
	2048: '#EDC255'
};

var getRandomNumber = function(n) {
	return Math.floor(Math.random() * n);
};
var isNotEmpty = function(arr) {
	var l = arr.length;
	for (var i = 0; i < l; ++i) {
		if (arr[i] != 0) { return i; }
	}
	return false;
};
var removeZeros = function(arr) {
	var l = arr.length;
	var out = [];
	for (var i = 0; i < l; ++i) {
		if (arr[i]) {
			out.push(arr[i]);
		}
	}
	return out;
}
var compareMatrices = function(m1, m2) {
	if (m1.length != m2.length) { return false; }
	var l = m1.length;
	for (var i = 0; i < l; ++i) {
		if (m1[i] != m2[i]) { return false; }
	}
	return true;
}

//----- Board Class -----//
function Board() {
	this.boardMatrix = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
	this.prevMatrix = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
	this.animateDists = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
	this.numberOfMoves = 0;
};

Board.prototype.beginGame = function() {
	this.clearBoard();
	this.boardMatrix = [0,0,0,0,
						0,0,0,0,
						0,0,0,0,
						0,0,0,0];
	this.numberOfMoves = 0;
	document.getElementsByClassName('moves-counter')[0].innerHTML = 0;
	var t1 = getRandomNumber(BOARD_LENGTH);
	var t2 = getRandomNumber(BOARD_LENGTH);
	while (t2 == t1) { t2 = getRandomNumber(BOARD_LENGTH); }
	this.boardMatrix[t1] = (getRandomNumber(2)+1) * 2;
	this.boardMatrix[t2] = (getRandomNumber(2)+1) * 2;
	this.updateBoard();
};

Board.prototype.clearBoard = function() {
	var children = document.getElementsByClassName('board')[0].children;
	for (var i = 0; i < BOARD_LENGTH; ++i) {
		children[i].firstChild.innerHTML = '';
		children[i].firstChild.style.backgroundColor = colorHash[0];
	};
};

Board.prototype.updateBoard = function() {
	$('.moving').removeClass('moving');
	this.clearBoard();
	for (var i = 0; i < BOARD_LENGTH; ++i) {
		if (this.boardMatrix[i] != 0) {
			this.updateTile(i);
		}
	}
};

Board.prototype.updateTile = function(tileNumber) {
	var children = document.getElementsByClassName('board')[0].children;
	var tile = children[tileNumber].firstChild;
	var n = this.boardMatrix[tileNumber];
	tile.style.backgroundColor = colorHash[n];
	if (n > 4) { tile.style.color = 'white'; }
	else { tile.style.color = '#776E65'; }
	if (n > 1000) { tile.style.fontSize = '38px'; }
	else if (n > 100) {	tile.style.fontSize = '42px'; }
	tile.innerHTML = n;
};

Board.prototype.getNewTile = function() {
	var empty_tile_positions = [];
	for (var i = 0; i < BOARD_LENGTH; ++i) {
		if (this.boardMatrix[i] == 0) { empty_tile_positions.push(i); }
	}
	
	if (empty_tile_positions.length == 0) { return; }

	var new_pos = empty_tile_positions[getRandomNumber(empty_tile_positions.length)];
	var new_val = (getRandomNumber(2)+1) * 2;

	this.boardMatrix[new_pos] = new_val;
}

Board.prototype.move = function(direction) {
	// this.printMatrix(this.boardMatrix);
	this.prevMatrix = this.boardMatrix.slice();
	for (var y = 0; y < 4; ++y) {
		var d = [0,0,0,0];
		switch(direction) {
			case 0:
				var row = this.getRow(y);
				break;
			case 1:
				var row = this.getColumn(y);
				break;
			case 2:
				var row = this.getRow(y).reverse();
				break;
			case 3:
				var row = this.getColumn(y).reverse();
				break;
		}
		// console.log("row = " + row.toString());
		var offset = 0;
		for (var x = 0; x < 3; ++x) {
			var z = 0;
			if (row[x] == 0) {
				if (z = isNotEmpty(row.slice(x, 4))) {
					var t = [0,0,0,0];
					t = t.slice(0, 4 - x);
					var non_zero_section = row.slice(x + z, 4);
					// console.log("nzs = " + non_zero_section.toString());
					t.splice.apply(t, [0, 4 - x - z].concat(row.slice(x + z, 4)));
					for (var n = 0; n < non_zero_section.length; ++n) {
						if (non_zero_section[n]) {
							// console.log('x = ' + x);
							// console.log('z = ' + z);
							// console.log('n = ' + n);
							d[x + z + n + offset] += z;
						}
					}
					// console.log("d = " + d.toString());
					row.splice.apply(row, [x, 4 - x].concat(t));
				}
				else { break; }
			}
			// console.log("row = " + row.toString());
			var j = x + 1;
			while (row[j] == 0 && j < 3) { ++j; }
			if (row[x] == row[j]) {
				row[x] += row[j]
				row[j] = 0;
				// console.log('j = ' + j);
				// console.log('x = ' + x);
				// console.log('z = ' + z);
				if (z-x > 0) {
					d[x + j + z] += j - x;
					++offset;
				}
				else {
					d[j + z] += j - x;
				}
				// console.log("d = " + d.toString());
			}

		}
		switch(direction) {
			case 0:
				this.insertRow(this.boardMatrix, y, row);
				this.insertRow(this.animateDists, y, d);
				break;
			case 1:
				this.insertColumn(this.boardMatrix, y, row);
				this.insertColumn(this.animateDists, y, d);
				break;
			case 2:
				this.insertRow(this.boardMatrix, y, row.reverse());
				this.insertRow(this.animateDists, y, d.reverse());
				break;
			case 3:
				this.insertColumn(this.boardMatrix, y, row.reverse());
				this.insertColumn(this.animateDists, y, d.reverse());
				break;
		}
		// console.log("final d = " + d.toString());
	}
	// this.printMatrix(this.animateDists);
}

Board.prototype.animateMove = function(direction, moves) {
	var self = this;
	$('.moving').each(function(index) {
		var dist = (moves[index] * TILE_WIDTH).toString() + 'px';
		switch(direction) {
			case 0: var param = {'right': dist}; break;
			case 1: var param = {'bottom': dist}; break;
			case 2: var param = {'left': dist}; break;
			case 3: var param = {'top': dist}; break;
		}
		$(this).animate(param, 'fast');
	});
	var wait = function() {
		var n = $('.moving').queue('fx');
		if (n == 0) { 
			clearTimeout(t);
			// console.log("done animations");
			self.resetTilePositions(direction);
			self.getNewTile();
			self.updateBoard();	
			// self.printMatrix(self.boardMatrix);
		}
		else {
			var t = setTimeout(wait, 50);
		}
	}
	wait();
}

Board.prototype.resetTilePositions = function(direction) {
	$('.moving').each(function() {
		switch(direction) {
			case 0: 
				$(this).css('right', "");
				break;
			case 1:
				$(this).css('bottom', "");
				break;
			case 2: 
				$(this).css('left', "");
				break;
			case 3:
				$(this).css('top', "");
				break;
		}
	});
}

Board.prototype.boardFull = function() {
	for (var i = 0; i < BOARD_LENGTH; ++i) {
		if (this.boardMatrix[i] == 0) { return false; }
	}
	return true;
}

Board.prototype.getColumn = function(c) {
	var arr = [];
	for (var i = 0; i < BOARD_LENGTH; i+=4) {
		arr.push(this.boardMatrix[i + c]);
	}
	return arr;
}

Board.prototype.insertColumn = function(m, c, newColumn) {
	for (var i = 0; i < 4; ++i) {
		m[c + 4 * i] = newColumn[i];
	}
}

Board.prototype.getRow = function(r) {
	return this.boardMatrix.slice(4 * r, 4 + 4 * r)
}

Board.prototype.insertRow = function(m, r, newRow) {
	m.splice.apply(m, [4 * r, 4].concat(newRow));
}

Board.prototype.deadBoard = function() {
	if (!this.boardFull()) {return false; }
	var temp = this.boardMatrix.slice();
	this.move(0);
	if (!compareMatrices(temp, this.boardMatrix)) { return false; }
	this.move(1);
	if (!compareMatrices(temp, this.boardMatrix)) { return false; }
	this.move(2);
	if (!compareMatrices(temp, this.boardMatrix)) { return false; }
	this.move(3);
	if (!compareMatrices(temp, this.boardMatrix)) { return false; }
	return true;
}

Board.prototype.printMatrix = function(m) {
	console.log('---');
	console.log(m.slice(0,4));
	console.log(m.slice(4,8));
	console.log(m.slice(8,12));
	console.log(m.slice(12,16));
}
//----- Board Class end -----//