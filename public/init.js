(function () {
    requirejs.config({
    	paths: {
    		jquery: 'Libs/jquery-2.0.3',
    		doT: 'Libs/doT/doT',
    		bootstrap: 'Libs/bootstrap/js/bootstrap.min',
    		sammy: 'Libs/sammy',
    		'socket.io': '/socket.io/socket.io'
    	}
    });
})();

define(['ui', 'jquery', 'sammy', 'socket.io', 'dataservice'], function(ui, $, sammy, io, dataservice) {

	ui.init();

	var socket = io.connect('http://localhost:4731');
	socket.on('message', function(message){
		console.log('websocket', message.action);
	});

	var app = sammy("body", function(){

		this.get("#/", function(context){ context.log("entries"); ui.showEntries();	});
		this.post("#/login", function(context){ context.log("login"); ui.login(); });
		this.post("#/logout", function(context){ context.log("logout"); ui.logout(); });
		this.get("#/register", function(context){ context.log("register"); ui.showRegistration(); });
		this.post("#/register", function(context){ ui.register(); });
		this.get("#/submit", function(context){ context.log("submit"); ui.showSubmitEntry(); });
		this.post("#/entry", function(context){ context.log("post entry"); ui.postEntry(); this.redirect("#/"); });
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
