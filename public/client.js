$(function () {
	var socket = io.connect('http://localhost:3000');
	socket.emit('adduser');
	$('form').submit(function(){
	
		socket.emit('chat message', $('#m').val());
		$('#m').val('');
		return false;
		
	});
	
	socket.on('chat message', function(data){
		$('#messages').append($('<li>').text(data)) ;
	});
	
	socket.on('addchatlog', function(listOfMessages){
		for (var i = 0; i <listOfMessages.length; i ++)
		{
			$('#messages').append($('<li>').text(listOfMessages[i])) ;
		}
	});
});