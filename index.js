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
//var nicknameColor = 000000;

//message history
var listOfMessages = [];

io.on('connection', function(socket)
{
	//log messages
	console.log('a user connected');
	
  
  
	//add user
	//first thing done
	socket.on('adduser', function(callback)
	{
		//create store username
		myName = userNumber ++;
		var nickname = "user" + myName;
		socket.nickname = nickname;
		nicknames.push(nickname);
		
		//add to user list and tell clients to update their html
		io.emit('updateusers', nicknames);
		
		//update chat log if any messages
		socket.emit('addchatlog', listOfMessages);
		
		socket.broadcast.emit('message', {type: 'notice' , message: "Notice: " + socket.nickname + " has connected to server"});
		socket.emit('message', {type:'notice', message: "You have connected."})
		
		
		callback(socket.nickname);
		
	});
	
	socket.on('reconnectuser', function(data)
	{
		socket.nickname = data.nickname;
		
		//add reconnect user to list
		nicknames.push(data.nickname);
		
		//add to user list and tell clients to update their html
		io.emit('updateusers', nicknames);
		
		//update chat log if any messages
		socket.emit('addchatlog', listOfMessages);
		
		socket.broadcast.emit('message', {type: 'notice' , message: "Notice: " + socket.nickname + " has reconnected to server"});
		socket.emit('message', {type:'notice', message: "You have reconnected."})
	});
	
	//broadcast messages
	socket.on('message', function(data)
	{
		console.log('message: ' + data.message);
		
		var time = getCurrentTime();
		
		//data = time  + " " + socket.nickname + ": " + data;
		
		//add message to log list
		listOfMessages.push(time  + " " + socket.nickname + ": " + data.message);
		
		//send regular message
		io.emit('message', {type: 'chat', nickname: socket.nickname, message:data.message, timestamp: time, nickColor: data.nickColor}) ;
		
	});
	
	//check if user entered change nick command, if so change nick, otherwise send message
	socket.on('changenickname',function(data,callback)
	{
		//if nickname already taken, callback false to display error message
		if(nicknames.indexOf(data)!= -1)
		{
			callback(false);
		}
		
		//else change nickname
		else
		{	
			callback(data);
			var oldnickname =socket.nickname;
			nicknames[ nicknames.indexOf(socket.nickname)] = data;//update list with new nickname
			socket.nickname=data;
			
			//add to user list and tell clients to update their html
			io.emit('updateusers', nicknames);
			
			//notice message
			io.emit('message', {type: 'notice' , message:"Notice: " + oldnickname + " changed nickname to " + socket.nickname}) ;
		}
		
	});
	
	//change nickname color 
	socket.on('changenicknameColor', function(data)
	{
		//notice message
		io.emit('message', {type: 'notice' , message:"Notice: " + socket.nickname + " changed nickname color to " + data}) ;		
	});
	
	//if user disconnects
	socket.on('disconnect', function(){
		console.log('user disconnected');
		if(!socket.nickname) 
			return;	
		nicknames.splice(nicknames.indexOf(socket.nickname), 1);
		io.emit('updateusers', nicknames);
		io.emit('message', {type: 'notice' , message: "Notice: " + socket.nickname + " has disconnected from server"});
		
	});
});

//gets current time and returns in (hh:mm am/pm) format
function getCurrentTime(){
	//get timestamp and format it
		var date = new Date();
		var hours = date.getHours()
		var ampm = (hours >= 12) ? "PM" : "AM";
		hours = hours% 12||12;
		var minutes =date.getMinutes();
		minutes = (minutes <10) ? "0" + minutes:minutes;
		return "(" + hours + ":" + minutes + ampm + ")";
}

http.listen(port,function()
{
	console.log('listening on port', port);
});

