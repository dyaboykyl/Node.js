/**
 * Exercise 3: Create an HTTP web server
 */

import { readFile } from 'fs/promises';
import { createServer } from 'http';

function loadFile(req, res) {
	let fileName;
	switch (req.url) {
		case '/':
			fileName = 'index.html';
			break;
		case '/index.js':
			res.setHeader('Content-Type', 'text/javascript')
			fileName = 'index.js';
			break;
		case '/style.css':
			res.setHeader('Content-Type', 'text/css')
			fileName = 'style.css';
			break;
		default:
			throw Error(`URL not recognized: ${req.url}`);
	}
	console.log(`URL: ${req.url} Filename: ${fileName}`)
	return readFile(fileName);
}

async function respond(req, res) {
	const file = await loadFile(req, res);
	res.write(file);
}

//create a server
let server = createServer(async function (req, res) {
	try {
		await respond(req, res);
	} catch (err) {
		console.error(`Error: `, err)
		res.statusCode = 500;
		res.write("Unable to serve html")
	}

	res.end();
});

server.listen(3000); // The server starts to listen on port 3000
