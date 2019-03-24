const express = require('express');
const path = require('path');
var bodyParser = require('body-parser');

const mongo = require('mongodb');
const ObjectID = mongo.ObjectID;
const MongoClient = mongo.MongoClient;

const uri = 'mongodb+srv://admin:admin@mycluster-oopjw.gcp.mongodb.net/test?retryWrites=true';
const client = new MongoClient(uri, { useNewUrlParser: true });

const root = path.join(__dirname, '/public');

client.connect((err) => {
	if (err) throw err;
	console.log(err);
	const collection = client.db('test').collection('properties');

	const app = express();
	const port = process.env.PORT || 8080;

	const fields = {
		projection: {
			StreetAddress: true,
			City: true,
			State: true,
			Latitude: true,
			Longitude: true,
			Note: true,
			Keywords: true,
			Image: true,

			MSSubClass: true,
			MSZoning: true,
			LotArea: true,
			EstSalePrice: true,

			Utilities: true,
			Heating: true,
			Electrical: true,
			GrLivArea: true,
			GarageType: true,
			PavedDrive: true,
			MiscFeature: true,

			MoneyRaised: true,
			PeopleInvested: true,
			RequestedValue: true
		}
	};

	app.use(bodyParser.json());

	app.use(express.static(root));

	app.get('/', (req, res) => {
		res.sendFile('index.html', { root: root });
	});

	app.get('/user', (req, res) => {
		res.sendFile(path.join(__dirname, '/public', 'user.html'));
	});

	app.get('/landowner', (req, res) => {
		res.sendFile(path.join(__dirname, '/public', 'landowner.html'));
	});

	app.get('/api/properties/', (req, res) => {
		const limit = req.query.count || 5;
		const sort = req.query.sort || { MSZoning: 1, PeopleInvested: -1 };
		const query = req.query.query || {};

		if ('_id' in query) {
			for (key in query._id) {
				query._id[key] = query._id[key].map((obj) => ObjectID(obj));
			}
		}

		query['MSZoning'] = {
			$in: [ 'A', 'C (all)', 'FV', 'I', 'RH', 'RL', 'RP', 'RM' ]
		};

		query['MSZoning'] = {
			$in: [ 'C (all)' ]
		};

		total = [];
		collection.find(query, fields).sort(sort).limit(limit).toArray((err, docs) => {
			query['MSZoning'] = {
				$in: [ 'FV' ]
			};

			total = total.concat(docs);

			collection.find(query, fields).sort(sort).limit(limit).toArray((err, docs) => {
				query['MSZoning'] = {
					$in: [ 'RH' ]
				};

				total = total.concat(docs);

				collection.find(query, fields).sort(sort).limit(limit).toArray((err, docs) => {
					query['MSZoning'] = {
						$in: [ 'RP' ]
					};

					total = total.concat(docs);

					collection.find(query, fields).sort(sort).limit(limit).toArray((err, docs) => {
						query['MSZoning'] = {
							$in: [ 'RM' ]
						};

						total = total.concat(docs);

						collection.find(query, fields).sort(sort).limit(limit).toArray((err, docs) => {
							query['MSZoning'] = {
								$in: [ 'RL' ]
							};

							total = total.concat(docs);

							collection.find(query, fields).sort(sort).limit(limit).toArray((err, docs) => {
								total = total.concat(docs);

								if (err) return res.json({ data: err });
								return res.json({ data: total });
							});
						});
					});
				});
			});
		});
	});

	app.get('/api/properties/:id', (req, res) => {
		var query = { _id: ObjectID(req.params.id) };
		collection.findOne(query, fields, (err, docs) => {
			if (err) return res.json({ data: err });
			return res.json({ data: docs });
		});
	});

	app.post('/api/properties/update', (req, res) => {
		var query = { _id: ObjectID(req.body.id) };
		var newvalues = {
			$set: {
				MoneyRaised: req.body.money,
				PeopleInvested: req.body.number
			}
		};
		collection.updateOne(query, newvalues, function(err, docs) {
			if (err) return res.json({ data: err });
			return res.json({ data: docs });
		});
	});

	const server = app.listen(port, () => {
		const serverHost = 'localhost'; //server.address().address;
		const serverPort = server.address().port;

		console.log(`Example app listening at http://${serverHost}:${serverPort}`);
	});
});
