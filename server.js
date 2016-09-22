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
    	user: '***',
    	pass: '***'
 	}	
}));

// Routing
// Serve static pages
app.use(express.static(__dirname + '/public'));
// Contact me email script
app.get('/send',function(req,res){
    var message = "Phone number: " + req.query.phone + "\nEmail: " + req.query.email + "\n\n" + req.query.message;
    var mailOptions={
    	from: '"' + req.query.name + '" <' + req.query.email + '>',
        to: 'wyjeremy@gmail.com',
        subject: "Contact Me Inquiry",
        text: message
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
