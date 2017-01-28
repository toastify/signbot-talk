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

var key = require("keypress");

key(process.stdin);


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
			console.log("upright");
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

	//Attempt to rotate the pinky servo
	//rightHand.pinky.sweep();
});