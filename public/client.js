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
		//no cookie, so first time
		var cookieValue = getCookie("username");
		
		if(cookieValue === "")
		{
			socket.emit('adduser',function(data)
			{
				myUsername = data;
				$currentUserName.html('<h2>' + myUsername + '</h2>');
				
				//set the cookie
				setCookie("username", myUsername, 100);
			});
		}
		//cookie already exists, reconnect
		else
		{
			myUsername=cookieValue;
			$currentUserName.html('<h2>' + myUsername + '</h2>');
			socket.emit('reconnectuser',{nickname:myUsername});
			
			var cookieValue = getCookie("nicknamecolor")
			//if user set nicknamecolor
			if (cookieValue !== "")
				myNickColor = cookieValue;
		}
		
		
	});
	
	//chat history
	socket.on('addchatlog', function(listOfMessages){
		for (var i = 0; i <listOfMessages.length; i ++)
		{	
			$chat.append($('<li>').text(listOfMessages[i])) ;
			updateScroll();
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
		  var url = "https://veeda-8bc58.firebaseio.com";

var firebaseRef = new Firebase(url);
firebaseRef.set({Year:"22"});
		var messageAsArray = $messageBox.val().split(" ");
		
		//if there is text
		if(messageAsArray.length>0)
		{	
			//if message is nickchange
			if(messageAsArray[0]=== "/nick" && messageAsArray.length>1)
			{
				socket.emit('changenickname', messageAsArray[1], function(data){
					if(!data){
						$chat.append($('<li>').text("Error: Username already taken.")) ;
						updateScroll();
					}
					
					//set private username to new username
					else{
						myUsername = data;
						$currentUserName.html('<h2>' + myUsername + '</h2>');
						
						//set the cookie, overwrites previous.
						setCookie("username", myUsername, 100)
					}
				});
			}
			
			//if change nickname color
			else if(messageAsArray[0]=== "/nickcolor" && messageAsArray.length>1)
			{
				socket.emit('changenicknameColor', messageAsArray[1]);
				myNickColor = messageAsArray[1];
				
				setCookie("nicknamecolor", messageAsArray[1], 100)
			}
			
			//if regular message
			else if(messageAsArray[0].charAt(0)!= '/'){
				socket.emit('message',{type: 'chat', message:$messageBox.val(), nickColor: myNickColor} );
			}
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
				updateScroll();
			}
			else{
				$chat.append($('<li>').html(data.timestamp  + " " + data.nickname.fontcolor(data.nickColor) + ": " + data.message)); 
				updateScroll();
			}
		}
		
		else if (data.type ==='notice'){
			$chat.append($('<li>').html(data.message.fontcolor("ff0000"))) ;
			updateScroll();
		}
		
	});
	
	
});

function updateScroll(){
    var myDiv = document.getElementById("messageArea");
    myDiv.scrollTop = myDiv.scrollHeight;
}

//https://www.w3schools.com/js/js_cookies.asp
function setCookie(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
    var expires = "expires="+d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

function getCookie(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for(var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}
