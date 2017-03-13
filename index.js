//socket.io tutorial base
var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var userNumber = 0;	
var port = process.env.PORT || 3000;

app.use(express.static(__dirname + '/public'));


io.on('connection', function(socket){
  console.log('a user connected');
  socket.on('disconnect', function(){
	  console.log('user disconnected');
  });
  
  socket.on('chat message', function(msg){
	  console.log('message: ' + msg);
	  
	  //timestamp
	  var date = new Date();
	  var hours = date.getHours()% 12||12;
	  var time = hours + ":" + date.getMinutes();
	  msg = time + " " + msg;
	  
	  io.emit('chat message',msg);
  });
  

});


http.listen(port,function(){
	console.log('listening on port', port);
});