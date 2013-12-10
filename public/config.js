// Set the require.js configuration for your application.
require.config({
	// This config is dependent on the init.js file
	deps: ["init"],
	
	paths: {
		jquery: 'Libs/jquery-2.0.3',
		doT: 'Libs/doT/doT',
		bootstrap: 'Libs/bootstrap/js/bootstrap.min',
		sammy: 'Libs/sammy',
		'socket.io': '/socket.io/socket.io'
	}
});