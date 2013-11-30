var request = require('request');

exports.getMovies = function(req,res) {
	var movies = 'http://data.sfgov.org/resource/yitu-d5am.json';
	request(movies, function(err, result) {
		res.send(result.body);
	});
}