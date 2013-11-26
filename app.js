// Import dependencies
var express = require('express'),
routes = require('./routes'),
// api = require('./routes/api'),
http = require('http'),
path = require('path');


var app = module.exports = express();


// environment configuration 
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.static(path.join(__dirname, 'public')));
app.use(app.router);

// Dev environment config
if (app.get('env') === 'development') {
  app.use(express.errorHandler());
}

// ROUTES
app.get('/', routes.index);

// API ROUTES
app.post('/scrub', api.postXls);


// START SERVER
http.createServer(app).listen(app.get('port'), function () {
  console.log('Express server listening on port ' + app.get('port'));
});
