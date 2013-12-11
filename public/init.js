require(['jquery', 'ui', 'socket.io', 'sammy', 'dataservice'],
function( $, ui, io, sammy, dataservice ) {


	ui.init();

	var socket = io.connect('http://localhost:4731');
	socket.on('message', function(message){
		console.log('websocket', message.action);
	});

	var app = sammy("body", function(){

		// Sammy rules:
		this.get("#/", 			            function(context){ ui.showEntries(); context.log("entries"); });
		this.post("#/login", 	            function(context){ ui.login(); context.log("login"); });
		this.post("#/logout", 	            function(context){ ui.logout(); context.log("logout"); });
		this.get("#/register", 	            function(context){ ui.showRegistration(); context.log("register"); });
		this.post("#/register",             function(context){ ui.register(); });
		this.get("#/submit", 	            function(context){ ui.showSubmitEntry(); context.log("submit"); });
        this.post("#/entry", 	            function(context){ ui.postEntry(); this.redirect("#/"); context.log("post entry"); });
        this.post("#/entry/:id/comment",    function(context){ var id = this.params['id']; ui.postComment(id); context.log("post comment"); ui.showEntry(id); });
		this.get("#/entry/:id",             function(context){ var id = this.params['id']; context.log("show entry", id); ui.showEntry(id); });
//        this.get("#/comment/:id/up",        function(context){ var id = this.params['id']; ui.voteCommentUp(id), this.redirect("#/entry/0"); context.log("vote comment up"); });

		this.bind("register-success", function() { this.redirect("#/"); });
	});

	// Start the app
	app.run("#/");

    $.support.cors = true;
    $.ajaxSetup({
        cache: false
    });
});