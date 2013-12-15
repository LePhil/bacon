require(['jquery', 'ui', 'socket.io', 'sammy', 'dataservice'],
function( $, ui, io, sammy, dataservice ) {


	ui.init();

	var socket = io.connect('http://localhost:4731');
	socket.on('message', function(message){
		console.log('websocket', message.action);
	});

	var app = sammy("body", function(){

		// Sammy's rules:
		this.get("#/", 			            function(){ ui.showEntries(); });
		this.get("#/register", 	            function(){ ui.showRegistration(); });
		this.get("#/submit", 	            function(){ ui.showSubmitEntry(); });
		this.get("#/entry/:id",             function(){ var id = this.params['id']; ui.showEntry(id); });

		this.post("#/login", 	            function(){ ui.login();  });
		this.post("#/logout", 	            function(){ ui.logout();  });
		this.post("#/register",             function(){ ui.register(); });
        this.post("#/entry", 	            function(){ ui.postEntry(); this.redirect("#/"); });
        this.post("#/entry/:id/comment",    function(){ var id = this.params['id']; ui.postComment(id, "entry");ui.showEntry(id); });
        this.post("#/comment/:id/comment",  function(){ var id = this.params['id']; ui.postComment(id, "comment"); ui.showComments();  });

		this.bind("register-success",		function() { this.redirect("#/"); });
	});

	// Start the app
	app.run("#/");

    $.support.cors = true;
    $.ajaxSetup({
        cache: false
    });
});