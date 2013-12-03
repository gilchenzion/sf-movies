var request = require('request');
var mongoose = require('mongoose');

var mongourl = process.env.MONGOLAB_URI || 
  process.env.MONGOHQ_URL || 
  'mongodb://localhost/loc';
mongoose.connect(mongourl);
var db = mongoose.connection;

var locSchema = mongoose.Schema({
	title: String,
	release_year: String,
	locations: { type: String, default: '' },
	fun_facts: { type: String, default: '' },
	production_company: String,
	distributor: { type: String, default: '' },
	director: String,
	writer: String,
	actor_1: { type: String, default: '' },
	actor_2: { type: String, default: '' },
	actor_3: { type: String, default: '' },
	lat: { type: Number, default: 200 },
	lon: { type: Number, default: 200 },
	uid: { type: String, unique: true}
});

var Loc = db.model('Location', locSchema);
var id;

exports.getMovies = function(req,res) {
	var movies = 'http://data.sfgov.org/resource/yitu-d5am.json';
	request(movies, function(err, result) {
		var r = JSON.parse(result.body);
		for(var i = 0; i < r.length; i++) {
			var newLoc = new Loc(r[i]);
			//create a unique ID to be tested against
			newLoc.uid = r[i].title + "-" + r[i].locations;
			//add if new ID
			newLoc.save();
		}
	});

	Loc.find({}, function(err, result) {
		if(err) {
			return handleError(err);
		} else {
			return res.send(result)
		}
	})
};

exports.saveMovie = function(req, res) {
	var save = req.body;
	delete save["_id"];
	Loc.update({uid: req.body.uid}, save, function(err, doc) {
		if(err) {
			console.log("err" + err);
		}
		res.send(doc);
	});
};

