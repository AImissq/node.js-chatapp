//import	s
var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var port = process.env.PORT || 3000;

app.use(express.static(__dirname + '/public'));

//nicknames
var userNumber = 1;
var nicknames = [];

//message history
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
	//first thing done, after adding chat log if any, by every client
	socket.on('adduser', function(){
		//store username
		myName = userNumber ++;
		var nickname = "user" + myName;
		socket.nickname = nickname;
		nicknames.push(nickname);
		
		//io.socket.emit('updateuserlist', nicknames);
		
	});
	
	//broadcast messages
	socket.on('chat message', function(data){
		console.log('message: ' + data);
		  
		  
		//get timestamp and format it
		var date = new Date();
		var hours = date.getHours()
		var ampm = (hours >= 12) ? "PM" : "AM";
		hours = hours% 12||12;
		var minutes =date.getMinutes();
		minutes = (minutes <10) ? "0" + minutes:minutes;
		var time = "(" + hours + ":" + minutes + ampm + ")";
		
		var messageAsArray = data.split(" ");
		data = time  + " " + socket.nickname + ": " + data;
		
		listOfMessages.push(data);
		
		//check if user entered change nick command, if so change nick, otherwise send message
		
		if (messageAsArray[0] === "/nick")
		{
			if(nicknames.indexOf(messageAsArray[1])	== -1)
			{
				nicknames[ nicknames.indexOf(socket.nickname)] = messageAsArray[1]//update list with new nickname
				socket.nickname=messageAsArray[1];
				
			}
			
			else
			{
				data = "Error: Username already taken, pick a different one.";
				io.emit('chat message', data) ;
			}
		}
		
		else
		{	//send regular message
			io.emit('chat message', data) ;
		}
		
		
		
  });
});


http.listen(port,function()
{
	console.log('listening on port', port);
});

