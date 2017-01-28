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

const five = require("johnny-five");

var board = new five.Board();

board.on("ready", () => {
	console.log("board is ready!");

	var servo = new five.Servo(13);
	servo.sweep();
});