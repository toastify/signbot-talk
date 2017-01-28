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