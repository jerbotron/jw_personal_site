var express = require('express');
var app = express();
var server = require('http').createServer(app);
var port = process.env.PORT || 8080;

server.listen(8080, function(){
  console.log('Starting server - listening on port :8080');
});

// Routing
app.use(express.static(__dirname + '/public'));
