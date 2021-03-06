//Begin servo/hand stuff
const five = require("johnny-five");

var board1 = new five.Board({ port: "COM*" });
var board2 = new five.Board({ port: "COM*" });

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

const unitRev = 50000;
const width = 0;
const height = 0;
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
	if (delta < 0 && servo.isRight) servo.cw();
	else if (delta < 0) servo.ccw();
	else if (servo.isRight) servo.ccw();
	else servo.cw();
	setTimeout(() => {
		servo.stop();
		console.log("we have moved!");
	}, time);
}

function clenchFinger(servo, level) {
	if (servo.backwards) level = 2-level;
	if (level == 0) {
		servo.max();
	} else if (level == 1) {
		servo.center();
	} else {
		servo.min();
	}
}

function clenchFist(hand, level) {
	clenchFinger(hand.index, level);
	clenchFinger(hand.middle, level);
	clenchFinger(hand.ring, level);
	clenchFinger(hand.pinky, level);
	clenchFinger(hand.thumb, level);
}

function moveTo(hand, x, y) {
	var rightDelta = -1*getLength(hand.RC) + getLength2(x, y, true);
	var leftDelta = -1*getLength(hand.LC) + getLength2(x, y, false);
	
	//Do something with the deltas.
	adjLength(hand.RC, rightDelta);
	adjLength(hand.LC, leftDelta);

	//Update the values
	hand.RC.posX = x;
	hand.RC.posY = y;

	hand.LC.posX = x;
	hand.LC.posY = y;
}

let leftHand = new Object(), rightHand = new Object();

//let Data = require("../signbot-data/data");

board1.on("ready", () => {
	console.log("MEGA is ready!");
  
  //Receiving commands from parent process (signbot-hear)
  // if(process.send)
  //   process.on('message', function(msg){
  //     let values = Data.getAllFingers(msg);
  //     let servos = [leftHand.thumb, leftHand.index, leftHand.middle, leftHand.ring, leftHand.pinky,
  //     rightHand.thumb, rightHand.index, rightHand.middle, rightHand.ring, rightHand.pinky];
  //     for(let i = 0; i < 10; i++)
  //       if(values[i] > 1.5)
  //         clenchFinger(servos[i], 2);
  //       else if(values[i] < 0.5)
  //         clenchFinger(servos[i], 0);
  //       else
  //         clenchFinger(servos[i], 1);
  //   });
  // //Otherwise receive commands from keypresses.
  // else {
    process.stdin.resume();
    process.stdin.setEncoding("utf-8");
    process.stdin.setRawMode(true);

    process.stdin.on("keypress", (ch, k) => {
		if (!k) return;

		if (k.name === 'q') {
			console.log("quitting");
			process.exit();
		} else if (k.name === 'up') {
			//moveTo(rightHand, rightHand.RC.posX, rightHand.RC.posY +0.01);
			moveTo(leftHand, leftHand.RC.posX, leftHand.RC.posY + 0.01);
			console.log("up");
		} else if (k.name === 'left') {		
			//moveTo(rightHand, rightHand.RC.posX-0.01, rightHand.RC.posY);
			moveTo(leftHand, leftHand.RC.posX-0.01, leftHand.RC.posY);	
			console.log("left");
		} else if (k.name === 'right') {
			//moveTo(rightHand, rightHand.RC.posX+0.01, rightHand.RC.posY);
			moveTo(leftHand, leftHand.RC.posX+	0.01, leftHand.RC.posY);	
			console.log("right");
		} else if (k.name === 'down'){
			//moveTo(rightHand, rightHand.RC.posX, rightHand.RC.posY - 0.01);
			moveTo(leftHand, leftHand.RC.posX, leftHand.RC.posY - 0.01);
			console.log("down");
		} else if (k.name === "space") {
			//clenchFist(leftHand, 3);
			clenchFist(rightHand, 3);
			console.log("space");
		} else if (k.name === "j") {
			//clenchFist(leftHand, 0);
			clenchFist(rightHand, 0);
			console.log("j");
		}
	});
  //}
	//Data will be an array of ternaries, representing the 
	//position of each finger. LTR: left pinky -> right pinky

	//Set up all the servos
	leftHand.LC = new five.Servo.Continuous(3);
	leftHand.RC = new five.Servo.Continuous(4);
	leftHand.thumb = new five.Servo(5);
	leftHand.index = new five.Servo(6);
	leftHand.middle = new five.Servo(7);
	leftHand.ring = new five.Servo(8);
	leftHand.pinky = new five.Servo(9);

	leftHand.pinky.backwards = true;
	leftHand.ring.backwards = true;
	leftHand.middle.backwards = true;
	leftHand.index.backwards = false;
	leftHand.thumb.backwards = true;

	// rightHand.LC = new five.Servo.Continuous(7);
	// rightHand.RC = new five.Servo.Continuous(8);
	// rightHand.thumb = new five.Servo(52);
	// rightHand.index = new five.Servo(50);
	// rightHand.middle = new five.Servo(11);
	// rightHand.ring = new five.Servo(12);
	// rightHand.pinky = new five.Servo(13);

	rightHand.pinky.backwards = false;
	rightHand.ring.backwards = false;
	rightHand.middle.backwards = false;
	rightHand.index.backwards = true;
	rightHand.thumb.backwards = true;

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
});

board2.on("ready", () => {
	console.log("UNO is ready!");
	//Data will be an array of ternaries, representing the 
	//position of each finger. LTR: left pinky -> right pinky

	//Set up all the servos
	rightHand.thumb = new five.Servo(52);
	rightHand.index = new five.Servo(50);

	rightHand.index.backwards = true;
	rightHand.thumb.backwards = true;

	rightHand.RC.posX = 0;
	rightHand.RC.posY = 0;
	rightHand.RC.isRight = true;
});