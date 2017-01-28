//Server stuff
const http = require("http");
const port = 3000;

const handler = (req, resp) => {
	console.log(req.url);
	resp.end("This is the webpage");
}

const server = http.createServer(handler);

server.listen(port, (err) => {
	if (err) console.log("something's not right...");
	console.log("server listening on port " + port);
});

//Begin servo/hand stuff
const five = require("johnny-five");

var board = new five.Board();

//A hand is comprised of 2 NC and 5 C.

/* PINOUTS:
	0 - 6: Left Hand:
		0: Left Continuous
		1: Right Continuous
		2: Thumb
		3: Index finger
		4: Middle finger
		5: Ring finger
		6: Pinky finger

	7- 13: Right Hand:
		7: Left continuous
		8: Right continuous
		9: Thumb
		10: Middle finger
		11: Index finger
		12: Ring finger
		13: Pinky finger
*/

const unitRev = 50;
const width = 10;
const height = 2;
const maxX = 1;
const maxY = 1;
const minX = -1;

var key = require("keypress");

key(process.stdin);

function getLength(servo) {
	if (servo.isRight) {
		return Math.sqrt(Math.pow(maxX - (servo.posX + width), 2) + Math.pow(maxY - (servo.posY + height), 2));
	}
	return Math.sqrt(Math.pow((servo.posX - width) - minX, 2) + Math.pow(maxY - (servo.posY + height), 2));
}

function getLength2(x, y, isRight) {
	if (isRight) {
		return Math.sqrt(Math.pow(maxX - (x + width), 2) + Math.pow(maxY - (y + height), 2));
	}
	return Math.sqrt(Math.pow((x - width) - minX, 2) + Math.pow(maxY - (y + height), 2));
}

function adjLength(servo, delta) {
	if (delta == 0) return;
	var time = Math.abs(delta*unitRev);
	if (delta > 0) servo.cw();
	else servo.ccw();
	setTimeout(() => {
		servo.stop();
		console.log("we have moved!");
	}, time);
}

function clenchFinger(servo, level) {
	if (level == 1) {
		servo.max()
	} else if (level == 2) {
		servo.center()
	} else {
		servo.min();
	}
}

function clenchFist(hand) {
	clenchFinger(hand.thumb, 3);
	clenchFinger(hand.index, 3);
	clenchFinger(hand.middle, 3);
	clenchFinger(hand.ring, 3);
	clenchFinger(hand.pinky, 3);
}

function moveTo(hand, x, y) {
	var rightDelta = getLength(hand.RC) - getLength2(x, y, true);
	var leftDelta = getLength(hand.LC) - getLength2(x, y, false);
	
	//Do something with the deltas.
	adjLength(hand.RC, rightDelta);
	adjLength(hand.LC, leftDelta);

	//Update the values
	hand.RC.posX = x;
	hand.RC.posY = y;

	hand.LC.posX = x;
	hand.LC.posY = y;
}

var leftHand = new Object();
var rightHand = new Object();

board.on("ready", () => {
	console.log("board is ready!");

	process.stdin.resume();
	process.stdin.setEncoding("utf-8");
	process.stdin.setRawMode(true);

	process.stdin.on("keypress", (ch, k) => {
		if (!k) return;

		if (k.name === 'q') {
			console.log("quitting");
			process.exit();
		} else if (k.name === 'up') {
			rightHand.pinky.center();
			console.log("up");
		} else if (k.name === 'left') {
			rightHand.pinky.min();
			console.log("left");
		} else if (k.name === 'right') {
			rightHand.pinky.max();
			console.log("right");
		} else {
			console.log(k.name);
		}
	})

	//Data will be an array of ternaries, representing the 
	//position of each finger. LTR: left pinky -> right pinky

	//Set up all the servos
	leftHand.LC = new five.Servo.Continuous(0);
	leftHand.RC = new five.Servo.Continuous(1);
	leftHand.thumb = new five.Servo(2);
	leftHand.index = new five.Servo(3);
	leftHand.middle = new five.Servo(4);
	leftHand.ring = new five.Servo(5);
	leftHand.pinky = new five.Servo(6);

	rightHand.LC = new five.Servo.Continuous(7);
	rightHand.RC = new five.Servo.Continuous(8);
	rightHand.thumb = new five.Servo(9);
	rightHand.index = new five.Servo(10);
	rightHand.middle = new five.Servo(11);
	rightHand.ring = new five.Servo(12);
	rightHand.pinky = new five.Servo(13);

	leftHand.LC.posX = 0;
	leftHand.LC.posY = 0;
	leftHand.LC.isRight = false;
	leftHand.RC.posX = 0;
	leftHand.RC.posY = 0;
	leftHand.RC.isRight = true;

	rightHand.LC.posX = 0;
	rightHand.LC.posY = 0;
	rightHand.LC.isRight = false;
	rightHand.RC.posX = 0;
	rightHand.RC.posY = 0;
	rightHand.RC.isRight = true;	

	moveTo(leftHand, 0.1, 0.1);
	moveTo(leftHand, 0.1, 0.1);

});