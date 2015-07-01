// status of this version 6: images - all works.  
//TODO
// -figure out animation - 
// -documentation
// 
//board constants and variables:
var origx = 50;	// placement of board
var origy = 50;
var SMALLDISPLAY = 800;
var windowWidth;

var boardx = 61;	// array size for board for large display
var boardy = 21;
var bpix = 20;		//  board "pixel"

///////////////////////////
var energy = 60;	// snake starts with 60 energy units
var bug_eu = 25;	// 25 energy units for eating bug
var egg_eu = 15;	// 15 energy units for eating egg

var prevX, prevY;

var BLANK = 0;
var SNAKE = 1;
var EGG = 2;
var BUG = 3;
var GAMEOVER = 4;
var ONE_EU = 1;
var LEFT = 0;
var RIGHT = 1;
var UP = 2;
var DOWN = 3;
var bx, by;
var gameOn = true;
var score = 0;
var dotcolor = ["#00ff00","#000000","#ffff00","#0000ff"];
var boardInfo = [];
var sounds = [];
var message = "";
var ctrX,ctrY;

///////////////////////////////////////////////////////
// using canvas element

// get id of game_canvas and context once.
var game_canvas;		// set in init
var infoBox,direction;

/*  make snake square where snake was, process snake movement */
function snakeDot(){ 
		switch (direction) {	//update value of current position - bx and by
			case LEFT:
				bx = (bx > 0 ? bx-1 : boardx-1);
				break;
			case RIGHT:
				bx = (bx < boardx -1  ? bx+1 : 0);
				break;
			case UP:
				by = (by > 0 ? by-1  : boardy-1);
				break;
			case DOWN:
				by = (by < boardy-1 ? by+1 : 0);
				break;
		}
		gameOn = testPosition(bx,by); 
		infoBox.innerHTML = (message + "energy units = " + energy + ",  score = " + score);
		message = "";
		if (gameOn === true) {
 			drawItem(bx, by,SNAKE);
		}
		else {
			gameOver();
		}
		score += 1;
		play_sound(SNAKE);

}
function gameOver() {
	var game_context = game_canvas.getContext("2d");
	play_sound(GAMEOVER);
	game_context.save();
	game_context.translate((ctrX*bpix),(ctrY*bpix) + 40);
	game_context.rotate(-20* Math.PI/180);
	game_context.font = "120px Verdana";	
	game_context.fillStyle = 'yellow';	
	game_context.textAlign = "center";
	game_context.fillText("GAME OVER!",0,0);
	game_context.restore();
}

/* ******* Draw Rect - this used to draw egg and bug as well as snake.  
				now just draws snake body.  leaving in 'as is' to show multi functions ***************************/
function drawRect(xx,yy,type){
	var game_context = game_canvas.getContext("2d");
	game_context.fillStyle = dotcolor[type];
	game_context.fillRect(xx*bpix, yy*bpix, bpix, bpix);
	game_context.fillStyle = dotcolor[SNAKE]; //reset color to SNAKE
}
/* ********draw image  of snake (facing different directions) and food **********************/
function drawItem(xx,yy,type){
	/* use css to move place item */
	var item_context,elemCtx;
	var game_context = game_canvas.getContext("2d");
	switch (type){
		case SNAKE: 
			drawRect(prevX,prevY,SNAKE);	// draw previous square as color
			// which head direction?
			switch (direction) {
				case RIGHT:
					item_context = document.getElementById("snakeObjR");
					break;
				case LEFT:
					item_context = document.getElementById("snakeObjL");
					break;
				case DOWN:
					item_context = document.getElementById("snakeObjD");
					break;
				case UP:
					item_context = document.getElementById("snakeObjU");
					break;
			}
			prevX = xx;					// set prevX and prevY for later
			prevY = yy;
			break;
		case BUG:
			item_context = document.getElementById("bugObj");
			break;
		case EGG:
			item_context = document.getElementById("eggObj");
			break;
	}
	game_context.drawImage(item_context,xx*bpix,yy*bpix);
}
/* ************** Refresh food after being eaten - new one randomly placed - NOT on snake *****/
function refreshFood(foodType) {
	var x,y;
	var i, j, k = 0;
	var avail = [];
	var idx;
	for (i = 0 ; i< boardx ; i++) {		//inefficient - should just remove available position rather 
		for (j = 0 ; j < boardy ; j++) {
			if (boardInfo[i][j] === BLANK) {
				avail.push([i,j]);
			}
		}
	}
	idx = Math.floor((Math.random() * avail.length) + 1) -1 ;  //pick random number from available spaces
	x = avail[idx][0];
	y = avail[idx][1];
	boardInfo[x][y] = foodType;
//	drawItem(x*bpix,y*bpix,foodType);
	drawItem(x,y,foodType);

	play_sound(foodType);
}
/* ****************  Test new position to handle if have hit food or snake or is ok **************/
function testPosition(xx,yy) {
	if (boardInfo[xx][yy] === SNAKE || energy === 0) {
		//game over...
		return (false);
	}
	if (boardInfo[xx][yy] === EGG ) {		// if position has egg, add egg energy units
		energy += egg_eu;
		message = ("egg eaten, 15 eu added!     ");
		refreshFood(EGG);					//make new egg
	}
	else if (boardInfo[xx][yy] === BUG) {		// if position has bug, add bug energy units
		energy += bug_eu;
		message = ("bug eaten, 25 eu added!     ");
		refreshFood(BUG);						// make new bug
	}
	else {
		message ="";
		energy -= ONE_EU;						//spend one unit
	}
	boardInfo[xx][yy] = SNAKE;
	return (true);
}
/* *******************************initialize game board **********************/
function init() {

	game_canvas = document.getElementById("gameboard");
	windowWidth = $(window).width();
	windowWidth = window.screen.availWidth;
	/* window.alert("availWidth:" +  windowWidth); */
	if (windowWidth <= SMALLDISPLAY) {		/* test for small display and make gameboard full size*/
		boardx = Math.floor(windowWidth/bpix);
		boardy = Math.floor(($(window).height()-10)/bpix);
		boardy = Math.floor((window.screen.availHeight-10)/bpix);
		origx = origy = 0;
	}
	game_canvas.width =  boardx * bpix;		//note that game_canvas.width is different
	game_canvas.height = boardy * bpix;		//  from game_canvas.style.width  !! which magnifies!!
	//If you want to have the visual size be the same as the pixel size, 
	//never set the styles, only the attributes. 
	game_canvas.style.top =  origy + "px";		// MUST HAVE "px"!!!
	game_canvas.style.left = origx + "px";

	var game_context = game_canvas.getContext("2d");
	game_context.clearRect(0,0,game_canvas.width,game_canvas.height);
	
	//create 2d array of board & initialize
	for (var i = 0 ; i < boardx ; i++) {
		var columns = [];
		for (var j = 0 ; j < boardy ; j++) {
			columns[j] = BLANK;
		}
		boardInfo[i] = columns;
	}

	prevX = ctrX = bx = Math.floor(boardx/2);		//put in center to start
	prevY = ctrY = by = Math.floor(boardy/2);
	boardInfo[bx][by] = SNAKE;
	//draw first snake point with image
	direction = UP;
	drawItem(bx, by, SNAKE);
	
	refreshFood(EGG);
	refreshFood(BUG);
	infoBox = document.getElementById("infoObject");	// for text on page

//  addEventListener(event_type, event_handler, capture)  
//		event_type is "keypress" or "mouseover"
//		event_handler is name of function to call for the event
//		capture is boolean.  set to false means don't want to capture any other events			
		 
//	document.addEventListener('keydown',snakeDot,false);  - commenting out to use jquery instead
}

/* ******************************SOUND *************************/
function play_sound(type) {
	switch(type){
		case SNAKE:	
			document.getElementById('snakeSound').play();
			break; 
		case EGG: 
			document.getElementById('eggSound').play();
			break; 
		case BUG: 			
			document.getElementById('bugSound').play();
			break; 
		case GAMEOVER:
			document.getElementById('gameOverSound').play();
			break;
	}
}
/* ***************************where things start******************************/
$(document).ready(function() {
	window.onload = init;
	// for touch events and mouseclicks
	$("#gameboard").click(function(e){
		var touchX = (e.pageX - this.offsetLeft)/bpix;
		var touchY = (e.pageY - this.offsetTop)/bpix;
		var deltaX = touchX - ctrX;			// base direction on where touch is relative to center
		var deltaY = touchY - ctrY;
		if (Math.abs(deltaX) > Math.abs(deltaY)) {
			direction = (deltaX > 0) ? RIGHT : LEFT; 
		}
		else {
			direction = (deltaY > 0) ? DOWN : UP; 
		}
		switch(direction) {
			case LEFT:
				console.log("LEFT");
				break;
			case RIGHT:
				console.log("RIGHT");
				break;
			case UP:
				console.log("UP");
				break;
			case DOWN:
				console.log("DOWN");
		};
		if (gameOn) {
			snakeDot();
		}
	});
	/* ** couldn't get swipe to NOT SCROLL *
	$(document).swipe( { swipeLeft:function(){direction = LEFT;snakeDot();	console.log("swipe");
}, allowPageScroll:"none"} );
	$(document).swipe( { swipeRight:function(){direction = RIGHT;snakeDot();	console.log("swipe");}, allowPageScroll:"none"} );
	$(document).swipe( { swipeUp:function(){direction = UP;snakeDot();	console.log("swipe");}, allowPageScroll:"none"} );
	$(document).swipe( { swipeDown:function(){direction = DOWN;snakeDot();	console.log("swipe");}, allowPageScroll:"none"} );
*/
	/* these sort of work.  up down have problem.... */
	//$.event.special.swipe.scrollSupressionThreshold = 1;

	$(document).on("swipeup",function() {	//UP doesn't work
		direction = UP;
		snakeDot();
		console.log("swipeup");
	} );
	$(document).on("swipedown",function() {	// down doesn't work
		direction = DOWN;
		snakeDot();
		console.log("swipedown");

	}    );
	$(document).on("swiperight",function() {
		console.log("swiperight");
		direction = RIGHT;
		snakeDot();
	}    );
	$(document).on("swipeleft",function() {
		direction = LEFT;
		snakeDot();
		console.log("swipeleft");

	}); 
	/* */
	$(document).keyup(function (e) {
		// test if key is left, right, up, down
		var keyCode = e.keyCode || e.which,
        arrow = {left: 37,  right: 39, down: 40, up: 38}; /*a=left, l=right, c=down, u=up*/
		var process = true;
		switch (keyCode) {
			case arrow.left:
				direction = LEFT;
				break;
			case arrow.right:
				direction = RIGHT;
				break;
			case arrow.up:
				direction = UP;
				break;
			case arrow.down:
				direction = DOWN;
				break;
			default: {		/* ignore other keys */
				process = false;
			}
		};
		if (process && gameOn) {
			snakeDot();
		}
	});

	//prevent arrow keys from scrolling
	window.addEventListener("keydown", function(e) {
		// space and arrow keys
		if([32, 37, 38, 39, 40].indexOf(e.keyCode) > -1) {
			e.preventDefault();
		}
	}, false);
});
		/*  set up for: qwertyuiop[]   - any key on top row   */
		/* set down for : zxcvbnm,./  :  any key on bottom row  */
		/* set left for  any key left of "g" *
		set right for any key right of h */

