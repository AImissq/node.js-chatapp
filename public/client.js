/*$(function () {
	var socket = io.connect('http://localhost:3000');
	
	
	socket.on('connect',function(){
		socket.emit('adduser');
	});
	
	socket.on('addchatlog', function(listOfMessages){
		for (var i = 0; i <listOfMessages.length; i ++)
		{
			$('#messages').append($('<li>').text(listOfMessages[i])) ;
		}
	});
	
	$('form').submit(function(){
	
		socket.emit('message', $('#m').val());
		$('#m').val('');
		return false;
		
	});
	
	socket.on('message', function(data){
		$('#messages').append($('<li>').text(data)) ;
	});
	
	
});*/

jQuery(function($){
	var socket=io.connect();
	var $messageForm = $('form');
	var $messageBox = $('#m');
	var $chat = $('#messages');
	var myUsername;
	//add new user
	socket.on('connect',function(){
		socket.emit('adduser',function(data){
			myUsername = data;
		});
	});
	
	socket.on('addchatlog', function(listOfMessages){
		for (var i = 0; i <listOfMessages.length; i ++)
		{
			$chat.append($('<li>').text(listOfMessages[i])) ;
		}
	});
	
	$messageForm.submit(function(e){
		e.preventDefault();
		
		var messageAsArray = $messageBox.val().split(" ");
		
		//if message is nickchange
		if(messageAsArray[0]=== "/nick")
		{
			socket.emit('changenickname', messageAsArray[1], function(data){
				if(!data){
					$chat.append($('<li>').text("Error: Username already taken.")) ;
				}
			});
		}
		
		//if regular message
		else{
			socket.emit('message', $messageBox.val());
		}
		$messageBox.val('');
		
	});
	
	//message function
	//depending on type of message, and who sent it, colouring, and bold will be different.
	socket.on('message', function(data){
		if (data.type === 'chat'){
			//if current user sent it
			if(data.nickname === myUsername){
				$chat.append($('<li>').html((data.timestamp  + " " + data.nickname + ": " + data.message).bold())); 
			}
			else{
				$chat.append($('<li>').text(data.timestamp  + " " + data.nickname + ": " + data.message)); 
			}
		}
		
		else if (data.type ==='notice'){
			$chat.append($('<li>').text(data.message)) ;
		}
		
	});
});
