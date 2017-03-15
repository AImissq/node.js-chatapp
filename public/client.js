jQuery(function($){
	var socket=io.connect();
	var $messageForm = $('form');
	var $messageBox = $('#m');
	var $chat = $('#messages');
	var $users = $('#usernames');
	var $currentUserName = $('#usernameIndicator');
	var myUsername;
	var myNickColor = 000000;
	
	//add new user
	socket.on('connect',function(){
		socket.emit('adduser',function(data){
			myUsername = data;
			$currentUserName.html('<h2>' + myUsername + '</h2>');
		});
		
	});
	
	//chat history
	socket.on('addchatlog', function(listOfMessages){
		for (var i = 0; i <listOfMessages.length; i ++)
		{
			$chat.append($('<li>').text(listOfMessages[i])) ;
		}
	});
	
	//list of online users
	socket.on('updateusers', function(nicknames){
		var html = '';
		for (var i = 0; i <nicknames.length; i ++)
		{
			html += nicknames[i] + '<br>';
		}			
		$users.html(html);
	});
	
	//user sends message
	$messageForm.submit(function(e){
		e.preventDefault();
		
		var messageAsArray = $messageBox.val().split(" ");
		
		//if message is nickchange
		if(messageAsArray[0]=== "/nick" && messageAsArray.length>1)
		{
			socket.emit('changenickname', messageAsArray[1], function(data){
				if(!data){
					$chat.append($('<li>').text("Error: Username already taken.")) ;
				}
				
				//set private username to new username
				else{
					myUsername = data;
					$currentUserName.html('<h2>' + myUsername + '</h2>');
				}
			});
		}
		
		//if change nickname color
		else if(messageAsArray[0]=== "/nickcolor" && messageAsArray.length>1)
		{
			socket.emit('changenicknameColor', messageAsArray[1]);
			myNickColor = messageAsArray[1];
		}
		
		//if regular message
		else{
			socket.emit('message',{type: 'chat', message:$messageBox.val(), nickColor: myNickColor} );
		}
		$messageBox.val('');
		
	});
	
	//message function
	//depending on type of message, and who sent it, colouring, and bold will be different.
	socket.on('message', function(data){
		if (data.type === 'chat'){
			//if current user sent it
			if(data.nickname === myUsername){
				$chat.append($('<li>').html((data.timestamp  + " " + data.nickname.fontcolor(myNickColor) + ": " + data.message).bold())); 
			}
			else{
				$chat.append($('<li>').html(data.timestamp  + " " + data.nickname.fontcolor(data.nickColor) + ": " + data.message)); 
			}
		}
		
		else if (data.type ==='notice'){
			$chat.append($('<li>').html(data.message.fontcolor("ff0000"))) ;
		}
		
	});
	
	
});
	