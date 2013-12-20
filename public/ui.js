define('ui', [
	'dataservice',
	'jquery',
	'doT',
	'sammy',
	'translations',
	'core',
	'bootstrap'
], function( dataservice, $, doT, sammy, i18n){

	var tmplts = {
			"link": 		doT.template($("#template-link").text()),
			"notification": doT.template($("#template-notification").text()),
			"addComment": 	doT.template($("#template-addComment").text()),
			"comment": 		doT.template($("#template-comment").text())
		},
		language="en-US";


	// Get language from the navigator
	language =  navigator.language || navigator.userLanguage;

	var ui = {
		// Show just one entry
		showEntry: function(id){
			hideAllNotifications();
			$("#showEntry").empty();
            $("#addComment").empty();
			show("#showEntry");

			dataservice.entry.get( id ).then(function( link ) {
				link.single = true;
				$("#showEntry").append( tmplts.link( link ) ).append("<p/>");

                $("a[id|=link-vote]").click(function( e ){
                    e.preventDefault();
                    vote( $( this ).attr("id"), "#showEntry" );
                    return false;
                });

                $("#addComment").append( tmplts.addComment({root: "entry", id: id}) );
                ui.renderComments( link );
			});
            
			// Show on login
			$(document).on("login", function() {
				show("#addComment");
				show(".reply");
			});
			// hide on logout
			$(document).on("logout", function() {
				hide("#addComment");
				hide(".reply");
			});

			dataservice.user.checkLoggedIn();
		},
		// Show all entries
		showEntries: function(){
			hideAllNotifications();
			dataservice.entry.getAll().then(function( data ){
				renderEntries( data );
				show("#entries");
			});
		},
		showSubmitEntry: function(){
			hideAllNotifications();
			show("#submitEntry");
			$("#submitEntry form input[type='text']").val('');
		},
		showRegistration: function(){
			hideAllNotifications();
			show("#registration");
		},
        showComments: function(){
            var linkId = $(".link").data("id");
            dataservice.entry.get(linkId).then(function(link) {
                ui.renderComments(link);
            });
        },
        renderComments: function( link ){
            $('.comment').remove();

            var renderChildren = function( parentId, comment ){
                $("#comment-children-" + parentId).append( tmplts.comment(comment));
                $(comment.comments).each(function( index, child ){ renderChildren( comment.id, child ); });
            };

            $(link.comments).each(function( index, comment ){
                $("#addComment").after( tmplts.comment( comment ));
                $( comment.comments ).each(function(index, child){ renderChildren( comment.id, child ); });
            });

        	$(".reply").on('click', function( e ){
                e.preventDefault();
                var id = $( this ).data("id");
                $( this ).after( tmplts.addComment({ root: "comment", id: id}) );
                $( this ).remove();
            });

            $(".commentVoteUp").on('click', function( e ){
                e.preventDefault();
                var commentID = $( this ).data('id');
                ui.voteCommentUp( link.id, commentID );

                $(this).toggleClass("voted");
                $(".commentVoteDown").toggleClass( "voted", false );
                // TODO
            });
            $(".commentVoteDown").on('click', function( e ){
                e.preventDefault();
                var commentID = $( this ).data('id');
                ui.voteCommentDown( link.id, commentID );

                $(this).toggleClass("voted");
                $(".commentVoteUp").toggleClass( "voted", false );
                // TODO
            });
        },
		login: function() {
			dataservice.user.login(
				$("#login_name").val(),
				$("#login_password").val()
			);

			// Hide loginArea
			$('.dropdown.open .dropdown-toggle').dropdown('toggle');
		},
		logout: function(){
			dataservice.user.logout();
		},
		register: function() {
			var name = $("#register_name").val(),
				pw = $("#register_password").val();

			// none must be empty	
			if ( name !== "" && name !== null &&
				 pw !== ""   && pw !== null  ) {
				dataservice.user.register( name, pw );
			} else {
				showNotification( i18n[language]["username-and-password-empty"] );
			}
		},
		postEntry: function() {
			dataservice.entry.post(
				$("#entry_title").val(),
				$("#entry_url").val()
			);
		},

        postComment: function(id, root){
            var value = $( "#commentField-" + root + "-" + id ).val();

            if( value ){
                $( "#commentField-" + root + "-" + id ).val("");
                dataservice.comment.post(id, root, value);
            }
        },

        voteCommentUp: function( linkId, commentId ){
            dataservice.comment.vote( commentId, "up" );
            var link = dataservice.entry.get( linkId ).then(function( link ) {
                ui.renderComments( link );
            });
        },

        voteCommentDown: function( linkId, commentId ){
            dataservice.comment.vote( commentId, "down" );
            var link = dataservice.entry.get( linkId ).then(function( link ) {
                ui.renderComments( link );
            });
        },

		init: function(){
			initLoginArea( this );
			initRegisterArea( this );

			$("#register-form").submit(function( e ) {
				dataservice.user.register($("#register_name").val(), $("#register_password").val());
				e.preventDefault();
			});

		}
	};

	function initLoginArea( ui ) {
		// Show "Submit Link" and Logout buttons, hide login button
		$(document).on("login", function( user ) {
			ui.user = user;
			$("#submitLink").attr("href", "#/submit").removeClass("disabled");
			$("#nav-login").hide();
			$("#nav-logout").show();

			adaptToLogin();
		});
		
		$(document).on("logout", function (){
			$("#submitLink").removeAttr("href").addClass("disabled");
			$("#nav-login").show();
			$("#nav-logout").hide();
			
			adaptToLogin();
		});

		$(document).on("login-failed", function(){
			showError( i18n[language]["login-failed"] );
		})

		dataservice.user.checkLoggedIn();
	}

	function initRegisterArea(){
		// Failed?
		$(document).on("register-failed", function(){
			showError( i18n[language]["register-failed"] );
		});

		// Succeeded?
		$(document).on("register-success", function(){
			sammy("body").trigger("register-success");
			showNotification( i18n[language]["register-success"] );
		});
	}

	function renderEntries( entries ) {
		$("#entries").empty();

		$.each(entries, function( index, entry ) {
			$("#entries").append( tmplts.link( entry ) );
		});

		$("a[id|=link-vote]").click(function( e ){
			e.preventDefault();
			vote( $( this ).attr("id"), "#entries" );
			return false;
		});
	}

	function vote( linkID, container ) {
		var linkFragments = linkID.match(/link-vote-(up|down)-(\d+)/),
			direction = linkFragments[1],
			entryID = linkFragments[2];
		$.post("entry/" + entryID + "/" + direction, function(){
			$.getJSON("entry/" + entryID, function( data ){
				$( container + " #link-rating-" + entryID ).text( data.rating.value );
			});
		});
	}

	// Helpers
	function showError( alert ) {	
		$("#content").prepend(
			$( tmplts.notification( alert ) ).addClass("alert-danger")
		);
	}

	function showNotification( message ) {
		var messageElement = $( tmplts.notification( message ) ).addClass("alert-info");
		$("#content").prepend( messageElement );
	}
	function hideAllNotifications() {
		// remove alerts from DOM and hide the notification area
		$("#content > .alert").remove();
		$("#content > div").addClass("hidden");
	}
	
	function hide( el ) { $( el ).toggleClass( "hidden", true ); }
	function show( el ) { $( el ).toggleClass( "hidden", false ); }

	function adaptToLogin() {
		if (!!dataservice.user.loggedInUser) {
			// Logged in: enable vote-buttons
			console.log("logged in", dataservice.user.loggedInUser);
			$(".votingContainer a").toggleClass( "notLoggedIn", false );
		} else {
			console.log( "not logged in", dataservice.user.loggedInUser );
			$(".votingContainer a").toggleClass( "notLoggedIn", true );
		}
	}

	return ui;
});
