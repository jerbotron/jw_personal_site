var express = require('express');
var nodemailer = require('nodemailer');
var smtpTransport = require("nodemailer-smtp-transport")
var app = express();
var server = require('http').createServer(app);
var port = process.env.PORT || 8080;

var transport = nodemailer.createTransport(smtpTransport({
	host: 'smtp.gmail.com',
	secureConnection: false, // use SSL
	port: 587, // port for secure SMTP
	auth: {
    	user: 'jer.wang25@gmail.com',
    	pass: 'peprallytestuser'
 	}	
}));

// Routing
// Serve static pages
app.use(express.static(__dirname + '/public'));
// Contact me email script
app.get('/send',function(req,res){
    var mailOptions={
    	from: '"' + req.query.name + '" <' + req.query.email + '>',
        to: 'wyjeremy@gmail.com',
        subject: "Contact Me Inquiry",
        text: req.query.message,
        html: req.query.message
    }
    console.log(mailOptions);
    transport.sendMail(mailOptions, function(error, response){
     if (error){
     	console.log(error);
     	res.end("error");
     } else {
     	console.log("Message sent");
     	res.end("sent");
     }
});
});

server.listen(8080, function(){
  console.log('Starting server - listening on port :8080');
});
