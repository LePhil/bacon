define('ui', ['dataservice', 'jquery', 'doT', 'sammy', 'core', 'bootstrap'], function(dataservice, $, doT, sammy){

	var templates = {};
	templates.link = doT.template($("#template-link").text());
	templates.message = doT.template($("#template-message").text());
	templates.comment = doT.template($("#template-comment").text());

	function showError(message) {
		$("#content").prepend($(templates.message(message)).addClass("alert-danger"));
	}

	function showMessage(message) {
		var msg = $(templates.message(message)).addClass("alert-info");
		$("#content").prepend(msg);	
		setTimeout(function(){ msg.remove(); }, 5000); // autoremove after 5s
	}

	function hideAll() {
		$("#content > .alert").remove();
		$("#content > div").addClass("hidden");
	}

	function show(what) {
		$(what).removeClass("hidden");
	}

	function initLoginArea(ui) {
		$(document).on("login", function(user) {
			ui.user = user;
			$("#submitLink").attr("href", "#/submit").removeClass("disabled");
			$("#nav-login").hide();
			$("#nav-logout").show();
		});

		$(document).on("login-failed", function(){
			showError("Login failed");
		})
		
		$(document).on("logout", function (){
			$("#submitLink").removeAttr("href").addClass("disabled");
			$("#nav-login").show();
			$("#nav-logout").hide();
		});

		dataservice.user.checkLoggedIn();
	}

	function initRegisterArea(ui){
		$(document).on("register-success", function(){
			console.log("registration successful");
			sammy("body").trigger("register-success");
			showMessage("Registration successful!")
		});

		$(document).on("register-failed", function(){
			console.log("registration failed");
			showError("Registration failed! User exists or didn't provide username and password");
		});
	}

	function renderEntries(entries) {
		$("#entries").empty();

		$.each(entries, function(index, entry) {
			$("#entries").append(templates.link(entry));
		});

		$("a[id|=link-vote]").click(function(){
			var linkId = $(this).attr("id");
			var matches = linkId.match(/link-vote-(up|down)-(\d+)/);
			$.post("entry/" + matches[2] + "/" + matches[1], function(){
				$.getJSON("entry/" + matches[2], function(data){
					$("#link-rating-" + matches[2]).text(data.rating.value);
				});
			});
		});
	}

	var ui = {
		showEntries: function(){
			hideAll();
			dataservice.entry.getAll().then(function(data){
				renderEntries(data);
				show("#entries");
			});
		},
		showRegistration: function(){
			hideAll();
			show("#registration");
		},
		showSubmitEntry: function(){
			hideAll();
			show("#submitEntry");
			$("#submitEntry form input[type='text']").val('');
		},
		showEntry: function(id){
			hideAll();
			$("#showEntry").empty();
			show("#showEntry");

			dataservice.entry.get(id).then(function(link) {
				$("#showEntry").append(templates.link(link)).append("<p/>");

				var renderChildren = function(parentId, comment){
					console.log("renderChildren", parentId, comment, $("comment-children-" + parentId));
					$("#comment-children-" + parentId).append(templates.comment(comment));
					$(comment.comments).each(function(index, child){ renderChildren(comment.id, child); });
				};

				$(link.comments).each(function(index, comment){
					console.log("link.comments each", comment, !!comment);
					$("#showEntry").append(templates.comment(comment));
					$(comment.comments).each(function(index, child){ renderChildren(comment.id, child); });
				});
			});
			
		},
		login: function() {
			dataservice.user.login($("#login_name").val(), $("#login_password").val());
			$('.dropdown.open .dropdown-toggle').dropdown('toggle');
		},
		logout: function(){
			dataservice.user.logout();
		},
		register: function() {
			dataservice.user.register($("#register_name").val(), $("#register_password").val());
		},
		postEntry: function() {
			dataservice.entry.post($("#entry_title").val(), $("#entry_url").val());
		},
		init: function(){
			initLoginArea(this);
			initRegisterArea(this);

			$("#register-form").submit(function(e) {
				dataservice.user.register($("#register_name").val(), $("#register_password").val());
				e.preventDefault();
			});

		}
	};

	return ui;

});
