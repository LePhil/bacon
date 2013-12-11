﻿define('dataservice', ['jquery', 'core'], function ($) {

	var dataservice = {
		entry: {
			getAll: function() {
				return $.getJSON('entries');
			},
			get: function(id) {
				return $.getJSON('entry/' + id);
			},
			post: function(title, url) {
				$.post("entry", { title: title, url: url });
			},
			vote: function(id, direction){
				$.post("entry/" + id + "/" + direction);
			}
		},
        comment: {
            post: function(id, comment){
            	console.log( "post on comment" );
                $.post("entry/" + id + "/comment", {text: comment})
            }
        },
		user: {
			loggedInUser: undefined,
			checkLoggedIn: function(){
				var that = this;
				if (!!this.loggedInUser) { 
					$.event.trigger({ type: "login", name: loggedInUser });
					return; 
				}
				
				$.getJSON("login", function(data){
					if (typeof(data) == "string" && data !== "") {
						that.loggedInUser = data;
						$.event.trigger({ type: "login", name: data });
					} else {
						$.event.trigger({ type: "logout" });
					}
				});
			},
			login: function(username, password) {
				$.post("login", { name: username, password: password }, function(success){
					if (success === true) {
						$.event.trigger({ type: "login", name: username });
					} else {
						$.event.trigger({ type: "login-failed" });
					}
				});
			},
			logout: function() {
				$.post("logout", function(data) { 
					$.event.trigger({ type: "logout" }); 
				});
			},
			register: function( username, password ) {
				$.post("register", {name: username, password: password }, function(success) {
					$.event.trigger({ type: "register-" + (success ? "success" : "failed") });
				});
			}
		}
	}

	return dataservice;
});
