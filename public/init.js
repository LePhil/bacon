require(['jquery', 'ui', 'socket.io', 'sammy', 'dataservice'],
function( $, ui, io, sammy, dataservice ) {

	var socket = io.connect('http://localhost:4731');
	socket.on('message', function( message ){
		console.log( 'websocket:', message.action );
	});


	// Sammy's rules:
	var app = sammy( "body", function(){
		// GET
		this.get("#/", 			            function(){ ui.showEntries(); });
		this.get("#/register", 	            function(){ ui.showRegistration(); });
		this.get("#/submit", 	            function(){ ui.showSubmitEntry(); });
		this.get("#/entry/:id",             function(){ var id = this.params['id']; ui.showEntry(id); });

		// POST
		this.post("#/login", 	            function(){ ui.login();  });
		this.post("#/logout", 	            function(){ ui.logout();  });
		this.post("#/register",             function(){ ui.register(); });
        this.post("#/entry", 	            function(){ ui.postEntry(); this.redirect("#/"); });
        this.post("#/entry/:id/comment",    function(){ var id = this.params['id']; ui.postComment(id, "entry"); ui.showEntry(id); });
        this.post("#/comment/:id/comment",  function(){ var id = this.params['id']; ui.postComment(id, "comment"); ui.showComments();  });

		this.bind("register-success",		function() { this.redirect("#/"); });
	} );

	// Start the app at the main entry point
	app.run("#/");

	// init UI
	ui.init();

    $.support.cors = true;
    $.ajaxSetup({
        cache: false
    });
});