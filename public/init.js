require(['jquery', 'ui', 'socket.io', 'sammy', 'dataservice'],
function( $, ui, io, sammy, dataservice ) {


	ui.init();

	var socket = io.connect('http://localhost:4731');
	socket.on('message', function(message){
		console.log('websocket', message.action);
	});

	var app = sammy("body", function(){

		// Sammy rules:
		this.get("#/", 			function(context){ ui.showEntries(); context.log("entries"); });
		this.post("#/login", 	function(context){ ui.login(); context.log("login"); });
		this.post("#/logout", 	function(context){ ui.logout(); context.log("logout"); });
		this.get("#/register", 	function(context){ ui.showRegistration(); context.log("register"); });
		this.post("#/register", function(context){ ui.register(); });
		this.get("#/submit", 	function(context){ ui.showSubmitEntry(); context.log("submit"); });
		this.post("#/entry", 	function(context){ ui.postEntry(); this.redirect("#/"); context.log("post entry"); });
		this.get("#/entry/:id", function(context) { var id = this.params['id']; context.log("show entry", id); ui.showEntry(id); });

		this.bind("register-success", function() {
			this.redirect("#/");
		})
	});

	app.run("#/");

	console.log( dataservice.entry.getAll() );

    $.support.cors = true;
    //TODO create db service
    //window.data = $.fn.DataService();  //exist till the site is changed
    //sessionStorage.dataService = $.fn.DataService();  //stores data for one session
    //localStorage.dataService = $.fn.DataService();  //stores data with no expiration date
    
    $.ajaxSetup({
        cache: false
    });
});