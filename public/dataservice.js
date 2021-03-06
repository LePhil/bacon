﻿define('dataservice', ['jquery', 'core'], function ($) {

	var dataservice = {
		entry: {
			getAll: function() {
				return $.getJSON('entries');
			},
			get: function(id) {
				return $.getJSON( 'entry/' + id );
			},
			post: function( title, url ) {
				$.post("entry", { title: title, url: url });
			},
			vote: function( id, direction ) {
				$.post("entry/" + id + "/" + direction);
			},
			canUpVote: function( id ) {
				return this.get( id ).rating._hasUpVoted();
			}
		},
        comment: {
            post: function( id, root, comment ){
                $.post(root + "/" + id + "/comment", {text: comment})
            },
            vote: function( id, direction ){
                $.post("comment/" + id + "/" + direction);
            }
        },
		user: {
			loggedInUser: undefined,
			isLoggedIn: function() {
				return this.loggedInUser != undefined;
			},
			checkLoggedIn: function(){
				var that = this;
				if ( !!this.loggedInUser) { 
					$.event.trigger({ type: "login", name: loggedInUser });
					return; 
				}
				
				$.getJSON("login", function( username ){
					if (typeof( username ) == "string" && username !== "") {
						// Login
						that.loggedInUser = username;
						$.event.trigger({ type: "login", name: username });
					} else {
						// Logout
						$.event.trigger({ type: "logout" });
					}
				});
			},
			login: function( username, password ) {
				$.post("login", { name: username, password: password }, function( success ){
					if ( success === true ) {
						this.loggedInUser = username;
						$.event.trigger({ type: "login", name: username });
					} else {
						$.event.trigger({ type: "login-failed" });
					}
				});
			},
			logout: function() {
				$.post("logout", function( data ) { 
					this.loggedInUser = undefined;
					$.event.trigger({ type: "logout" });
				});
			},
			register: function( username, password ) {
				$.post("register", {name: username, password: password }, function( success ) {
					$.event.trigger({ type: "register-" + ( success ? "success" : "failed") });
				});
			}
		}
	}

	return dataservice;

});
