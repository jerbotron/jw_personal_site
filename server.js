var express = require('express');
var app = express();
var server = require('http').createServer(app);
var port = process.env.PORT || 8080;

var nodemailer = require('nodemailer');
var smtpTransport = require("nodemailer-smtp-transport")
var PUBNUB = require('pubnub');
var fs = require('fs');

/////////////
// Routing //

// Serve static pages
app.use(express.static(__dirname + '/public'));

// nodemailer init 
var transport = nodemailer.createTransport(smtpTransport({
    host: 'smtp.gmail.com',
    secureConnection: false, // use SSL
    port: 587, // port for secure SMTP
    auth: {
        user: '***',
        pass: '***'
    }   
}));

// Contact Me Email Handler
app.get('/send',function(req, res) {
    var message = "Phone number: " + req.query.phone + "\nEmail: " + req.query.email + "\n\n" + req.query.message;
    var mailOptions={
    	from: '"' + req.query.name + '" <' + req.query.email + '>',
        to: 'wyjeremy@gmail.com',
        subject: "jerwng.com Inquiry",
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

// Start server
server.listen(8080, function(){
  console.log('Starting server - listening on port :8080');
});

/////////////////////////////////////
// Connect 4 Demo Server Functions //

// Initialize PubNub
var pubnub = PUBNUB.init({
    publish_key    : '***',
    subscribe_key  : '***',
    uuid: 'SERVER',
    error: function (error) {
        console.log('PubNub Error:', error);
    }
})

// Constant Declarations
var CHNLS = {
    LOBBY : "lobby",
    GAME  : "game"
};

var PLAYER_COLORS = {
    RED     : "red",
    YELLOW  : "yellow"
}

var MSG = {
   ACK            : 'ack',
   REQUEST_JOIN   : 'request_join',
   JOIN_SUCCESS   : 'join_success',
   JOIN_FAIL      : 'join_fail',
   PLAYER_LEFT    : 'player_left',
   START_GAME     : 'start_game',
   FINISHED_TURN  : 'finished_turn',
   LEAVE_GAME     : 'leave_game',
   GAME_OVER      : 'game_over'
};

// Available player colors to be assigned to calling clients
var available_player_colors = ['red', 'yellow'];
var active_players = {};
var playerToGoFirst = PLAYER_COLORS.RED;

// Subscribe to LOBBY channel and GAME channel

///////////////////
// LOBBY Channel //
pubnub.subscribe({
    channel  : CHNLS.LOBBY,
    message  : function(m) {
        handleLobbyRequests(m);
    },
    presence : function(m) {
        // On timeout, if timed out player was an active player, 
        // replenenish their player color
        console.log("presence: " + m.action + " , occupancy: " + m.occupancy);
        if ((m.action === "timeout" || m.action === "leave") && active_players.hasOwnProperty(m.uuid)) 
        {
            handleLeaveRequest(m.uuid, active_players[m.uuid]);
        }
    },
    connect  : function(m) {
        console.log("SERVER > LOBBY channel connected to PubNub Cloud");
    }
});

//////////////////
// GAME Channel //
pubnub.subscribe({
    channel : CHNLS.GAME,
    message : handleGameRequests,
    connect : function(m) {
        console.log("SERVER > GAME channel connected to PubNub Cloud");
    }
});

function publishMessage(channelName, message) {
    pubnub.publish({
        channel : channelName,
        message : message
    });
};

function handleLobbyRequests(message) {
    /*
        Allow server to handle client requests to join/leave game
        * If there are still existing player colors to give out,
          publish them to client upon REQUEST_JOIN
        * Push player color back to server container when a client
          sends LEAVE_GAME request
        * If there are no more available game slots, then send back
          JOIN_FAIL message to client
    */
    switch (message.msg) {
        case MSG.REQUEST_JOIN: {
            handleJoinRequest(message.uuid); // player uuid
            break;
        }
    }
};

function handleGameRequests(message) {
    switch (message.msg) {
        case MSG.GAME_OVER: {
            // If both players are still in the game, start the game after 1 second
            if (available_player_colors.length === 0) {
                setTimeout(startGame, 1000);
            }
            break;
        }
        case MSG.LEAVE_GAME: {
            // player uuid, player color
            handleLeaveRequest(message.uuid, message.playerColor);
            break;
        }
    }
};

function printActivePlayers() {
    console.log("player colors remaining: [" + available_player_colors + "]");
    for (var player in active_players) {
        if (active_players.hasOwnProperty(player)) {
            console.log(player + ": " + active_players[player]);
        }
    }
};

function replenishPlayerColor(playerColor) {
    console.log("player_color on leave = " + playerColor);
    // if not found, add to available_player_colors pool
    if (available_player_colors.indexOf(playerColor) == -1) {
        if (playerColor === PLAYER_COLORS.RED)
            available_player_colors.unshift(playerColor);
        else
            available_player_colors.push(playerColor);
    }
};

function handleJoinRequest(userId) {
    if (available_player_colors.length > 0) {
        var playerColor = available_player_colors.shift();
        active_players[userId] = playerColor;
        publishMessage(CHNLS.LOBBY, {msg : MSG.JOIN_SUCCESS, uuid : userId, playerColor : playerColor});

        // If both players have joined the game, start the game
        if (available_player_colors.length === 0) {
            startGame();
        }
    } 
    else {
        publishMessage(CHNLS.LOBBY, {msg : MSG.JOIN_FAIL, uuid : userId});
    }
    printActivePlayers();
};

function startGame() {
    // find the userId of the playerToGoFirst
    for (var userId in active_players) {
        if (active_players[userId] === playerToGoFirst) {
            publishMessage(CHNLS.GAME, {msg : MSG.START_GAME, playerStart : userId});
            // alternate which player gets to go first each round
            playerToGoFirst = (playerToGoFirst === PLAYER_COLORS.RED) ? PLAYER_COLORS.YELLOW : PLAYER_COLORS.RED;
            break;
        }
    }
}

function handleLeaveRequest(userId, playerColor) {
    console.log("player uuid on leave = " + userId);
    printActivePlayers();
    // re-gain player color of the player that left
    replenishPlayerColor(playerColor);
    delete active_players[userId];
    printActivePlayers();
    // Let other player know that their opponent has left the game
    publishMessage(CHNLS.GAME, {msg : MSG.PLAYER_LEFT, uuid : userId});
    // TODO: update lobby info
};