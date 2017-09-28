var express = require('express'), app = express();
var bodyParser = require('body-parser');
var port = process.env.PORT || 8082;
var mongoose = require('mongoose');
var dbUrl = 'mongodb://localhost:27017/angular_mongodb';
var router = express.Router();

// Body parser for POST request
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Serve static file
app.use(express.static(__dirname + '/public'));

require('./routes')(app, router);




mongoose.connect(dbUrl);
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));// pass in cb as 2nd arg
db.once('open', function () {
    // Connection successful, start server
    var listener = app.listen(port, function () {
        console.log('listen @ port ' + listener.address().port);
    });
});
