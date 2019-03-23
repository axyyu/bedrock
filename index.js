const express = require('express');
const path = require('path');

const MongoClient = require('mongodb').MongoClient;

const uri = 'mongodb+srv://admin:admin@mycluster-oopjw.gcp.mongodb.net/test?retryWrites=true';
const client = new MongoClient(uri, { useNewUrlParser: true });

const root = path.join(__dirname, '/public');

client.connect((err) => {
	if (err) throw err;
	const collection = client.db('bedrock').collection('properties');

	const app = express();
	const port = process.env.PORT || 8080;

	app.use(express.static(root));

	app.get('/', (req, res) => {
		res.sendFile('index.html', { root: root });
	});

	app.get('/user', (req, res) => {
		res.sendFile(path.join(__dirname, '/public', 'user.html'));
	});

	app.get('/api/', (req, res) => {});

	const server = app.listen(port, () => {
		const serverHost = 'localhost'; //server.address().address;
		const serverPort = server.address().port;

		console.log(`Example app listening at http://${serverHost}:${serverPort}`);
	});
});
