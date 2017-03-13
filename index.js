//import	s
var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var port = process.env.PORT || 3000;

app.use(express.static(__dirname + '/public'));

//nicknames
var userNumber = 1;
var nicknames = {};
var listOfMessages = [];

io.on('connection', function(socket)
{
	socket.emit('addchatlog', listOfMessages);
	//log messages
	console.log('a user connected');
	socket.on('disconnect', function(){
		console.log('user disconnected');
	});
  
	//add users
	socket.on('adduser', function(){
		//store username
		myName = userNumber ++;
		var nickname = "user" + myName;
		socket.nickname = nickname;
		nicknames[nickname] = nickname;
		
		//io.socket.emit('updateuserlist', nicknames);
		
	});
	
	//broadcast messages
	socket.on('chat message', function(data){
		console.log('message: ' + data);
		  
		//timestamp
		var date = new Date();
		var hours = date.getHours()
		var ampm = (hours >= 12) ? "PM" : "AM";
		hours = hours% 12||12;
		var minutes =date.getMinutes();
		minutes = (minutes <10) ? "0" + minutes:minutes;
		var time = hours + ":" + minutes;
		
		data = "(" + time + ampm + ")" + " " + socket.nickname + ": " + data;
		
		listOfMessages.push(data);
		
		io.emit('chat message', data) ;
  });
});


http.listen(port,function()
{
	console.log('listening on port', port);
});

