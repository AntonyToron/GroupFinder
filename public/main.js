var app = angular.module("app", ["ngRoute", "firebase", "ui.bootstrap"]);

app.controller("MainController", function($scope, $location, $firebaseObject, $firebaseAuth, $http) {
	$("#login").on("click", function(event) {
		$("#loginScreen").hide();
		$("#mainDisplay").show();
	})


	$scope.selectedTab = 0;
	$(".navbar-tab").on("click", function(event) {
		$(".nav").find(".active").removeClass("active");
		$(this).parent().addClass("active");

		// Hide the previous tab
		$("div[index='" + $scope.selectedTab + "']").hide();


		switch (this.attributes.index.nodeValue) {
			case "0": // dashboard
				$scope.selectedTab = 0;
				break;
			case "1": // lookup
				$scope.selectedTab = 1;
				break;
			case "2": // create
				$scope.selectedTab = 2;
				break;
			case "3": // your groups
				$scope.selectedTab = 3;
				break;
		}


		// Show new tab
		$("div[index='" + $scope.selectedTab + "']").show();
	});

	// Dropdown navigation
	$(".dropdown-item").on("click", function(event) {
		$(".nav").find(".active").removeClass("active");

		// Hide the previous tab
		$("div[index='" + $scope.selectedTab + "']").hide();

		switch (this.attributes.index.nodeValue) {
			case "4": // profile
				$scope.selectedTab = 4;
				break;
			case "5": // settings
				$scope.selectedTab = 5;
				break;
		}

		// Show new tab
		$("div[index='" + $scope.selectedTab + "']").show();
	});

	// $("#outline-star").on("click", function(event) {
	// 	console.log("starred");
	// })

	$scope.starred = function() {
		if ($("#outline-star").hasClass("fa-star-o")) {
			$("#outline-star").removeClass("fa-star-o");
			$("#outline-star").addClass("fa-star");
			$("#outline-star").addClass("icon-d");
		}
		else {
			$("#outline-star").addClass("fa-star-o");
			$("#outline-star").removeClass("fa-star");
			$("#outline-star").removeClass("icon-d");
		}
	}

	$scope.checked = function() {
		if ($("#checkmark").hasClass("check-plain")) {
			$("#checkmark").removeClass("check-plain");
			$("#checkmark").addClass("check-checked");
		}
		else {
			$("#checkmark").addClass("check-plain");
			$("#checkmark").removeClass("check-checked");
		}
	}

	$scope.questioned = function() {
		if ($("#questionmark").hasClass("question-question")) {
			$("#questionmark").removeClass("question-question");
			$("#questionmark").addClass("question-questioned");
		}
		else {
			$("#questionmark").addClass("question-question");
			$("#questionmark").removeClass("question-questioned");
		}
	}

	var ref = firebase.database().ref();



	$scope.admin = false;
	// download the data into a local object
	$scope.data = $firebaseObject(ref);
	// console.log wont work here (asynchronous call)
	
	var syncObject = $firebaseObject(ref);
	// sync object with three-way data binding (two-way binding + also to database)
	syncObject.$bindTo($scope, "data"); // bind to scope

	var auth = $firebaseAuth();
	var admin = firebase.auth().currentUser;

	$scope.name = "";
	$scope.url = null;

	$scope.usersData = [];

	$scope.emails = {};
	$scope.displayNames = [];
	$scope.names = ['Antony', 'Toron'];
	$scope.invitedFriends = {};
	$scope.blacklistedFriends = {};

	$scope.inviteable = ['Antony', 'Toron'];
	$scope.blacklistable = ['Antony', 'Toron'];

	$scope.groups = {};
	$scope.yourGroups = {};
	$scope.searchGroupsArray = [];
	$scope.searchYourGroupsArray = [];
	$scope.classes = ['COS 333',
	'COS 340',
	'ELE 203',

	];

	// Load in all of the data when a user is logged in
	$scope.loadData = function(user) {
		console.log("Your data is being loaded!");
		$scope.getGroups(user);
		$scope.getUsers(user);
	}

	$scope.getGroups = function(user) {
		var database = firebase.database(); // need to do this multiple times because if you log in and create two users at the same time doesnt update dynamically !
		firebase.database().ref('/groups').once('value').then(function(snapshot) {
			var groups = snapshot.val();
			for (var group in groups) {
				$scope.searchGroupsArray.push(groups[group]) // inefficient right now
				if (groups[group]['uid'] == user.uid)
					$scope.searchYourGroupsArray.push(groups[group]);
			}
			$scope.groups = groups;
			$scope.yourGroups = groups;

			// Then add listener for more changes after this
			var emailsRef = firebase.database().ref('groups').on('value', function(snapshot) {
				var groups = snapshot.val();
				$scope.searchGroupsArray = [];
				$scope.searchYourGroupsArray = [];
				for (var group in groups) {
					$scope.searchGroupsArray.push(groups[group]) // inefficient right now
					if (groups[group]['uid'] == user.uid)
						$scope.searchYourGroupsArray.push(groups[group]);
				}

				$scope.groups = groups;
				$scope.yourGroups = groups; // GOOD SOLUTION
			});
		});
	};

	$scope.getUsers = function(user) {	
		// Reference to the database service
		var database = firebase.database(); // need to do this multiple times because if you log in and create two users at the same time doesnt update dynamically !
		firebase.database().ref('/users-keys').once('value').then(function(snapshot) {
			var users = snapshot.val();
			for (var user in users) {
				$scope.usersData.push(users[user])
				$scope.displayNames.push(users[user].name)
				// $scope.emails.push(users[user].email);
				// $scope.emails.push(users[user].email); // push the emails into email array
				// $scope.emails[users[user].email] = true;
			}
		})
		// Then add listener for more changes after this
		var emailsRef = firebase.database().ref('emails').on('value', function(snapshot) {
			$scope.emails = snapshot.val();
		});
	}

	firebase.auth().onAuthStateChanged(function(user) {
		if (user) {
			// User is signed in
			console.log("Signed in!");
			if (user.uid == "78BiXlWHsIPpKaBJkz3xECDJuwz1") {
				$scope.admin = true;
				$("#admin").show();
			}

			$scope.url = user.photoURL;
			$scope.name = user.displayName;
			var loginScreen = document.getElementById("login");
			angular.element(loginScreen).hide();

			var e = document.getElementById("display_name");
			angular.element(e).text("Welcome " + $scope.name);
			// var thumbnail = document.getElementById("thumbnail");
			// angular.element(e).attr('src', $scope.url);
			// console.log($scope.url);
			var header = document.getElementById("header");
			var image = document.getElementById("thumbnail-image");
			if ($scope.url != null)  {// FIX THIS (picture gets added multiple times)
				angular.element(image).attr("src", "" + $scope.url);
				// angular.element(header).append('<img id ="thumbnail-image" class="img-thumbnail navbar-right"  style="height: 50px" src="' + $scope.url + '" />');
			}
			else {
				angular.element(image).attr("src", "anonymous_user.png"); // get rid of any pending images in url

			}


			// Load the data
			$scope.loadData(user);

			// Show the display
			var elem = document.getElementById("display");
			angular.element(elem).fadeIn(); // could just be show

			// Change the html
			$location.path("/dashboard"); /* NOTE: fix this!! not adding properly */
			// Hide the previous tab
			$("div[index='" + $scope.selectedTab + "']").hide();
			$("div[index='0']").show();
			$scope.selectedTab = 0;

			$(".nav").find(".active").removeClass("active");
			$("#mainTab").addClass("active");


			/* Reset all of the variables */
			$scope.usersData = [];
			$scope.emails = {};
			$scope.displayNames = [];
			$scope.names = ['Antony', 'Toron'];
			$scope.invitedFriends = {};
			$scope.blacklistedFriends = {};
			$scope.inviteable = ['Antony', 'Toron'];
			$scope.blacklistable = ['Antony', 'Toron'];
			$scope.groups = {};
			$scope.yourGroups = {};
			$scope.searchGroupsArray = [];
			$scope.searchYourGroupsArray = [];
		} else {
			// No user is signed in
			console.log("Not signed in");

			var elem = document.getElementById("display");
			angular.element(elem).hide();

			var loginScreen = document.getElementById("login");
			angular.element(loginScreen).fadeIn("slow");

			// $location.path("/login");
		}
	});



	$scope.clickFunction = function() {
		console.log("clicked");
	}

	// var inviteFriend = document.getElementById("invite_friend");
	$scope.onInvite = function($item, $model, $label) {
		// console.log($item);
		$scope.invitedFriends[$item] = {
			name: $item
		};

		var index = $scope.inviteable.indexOf($item);
		if (index > -1)
			$scope.inviteable.splice(index, 1);
		var index = $scope.blacklistable.indexOf($item);
		if (index > -1)
			$scope.blacklistable.splice(index, 1);

		// delete $scope.inviteable[$item];
		// delete $scope.blacklistable[$item];


		$("#invite_friends").val("");
	}
	$scope.onBlacklist = function($item, $model, $label) {
		// console.log($item);
		$scope.blacklistedFriends[$item] = {
			name: $item
		};

		var index = $scope.inviteable.indexOf($item);
		if (index > -1)
			$scope.inviteable.splice(index, 1);
		var index = $scope.blacklistable.indexOf($item);
		if (index > -1)
			$scope.blacklistable.splice(index, 1);
		// delete $scope.inviteable[$item];
		// delete $scope.blacklistable[$item];


		$("#blacklist_friends").val("");
	}

	$scope.deleteInvitedFriend = function(name) {
		// var index = $scope.invitedFriends.indexOf(name);
		// if (index > -1)
		// 	$scope.invitedFriends.splice(index, 1);
		
		delete $scope.invitedFriends[name];

		$scope.inviteable.push(name);
		$scope.blacklistable.push(name);
	}

	$scope.deleteBlacklistedFriend = function(name) {

		// var index = $scope.blacklistedFriends.indexOf(name);
		// if (index > -1)
		// 	$scope.blacklistedFriends.splice(index, 1);
		delete $scope.blacklistedFriends[name];

		$scope.blacklistable.push(name);
		$scope.inviteable.push(name);

	}

	$scope.privateGroupShow = function() {
		if(!$("#private_group").is(":visible")) {
			$("#private_group").show();
		}
	}
	$scope.privateGroupHide = function() {
		if($("#private_group").is(":visible")) {
			$("#private_group").hide();
		}
	}
	 

	var group = document.getElementById("public_group");
	angular.element(group).click(function() {
		console.log(clicked)
	})

	$("#public_group").click(function() {
		console.log("clicked");
	});

	$scope.print = function() {
		console.log("Hey");
	}


	/* Create a new group */
	$(function() {
		$("#submitGroup").submit(function(event) {
			event.preventDefault();
			// console.log($(this).serialize());
			// console.log("Hello");

			var name = $("#group_name_field").val();
			var className = $("#group_class_field").val();
			var location = $("#location").val();
			var details = $("#details_field").val();
			var publicGroup = $("input[name=radio]:checked").val();
			var blacklist = $scope.blacklistedFriends;
			var invited = $scope.invitedFriends;
			var admin = firebase.auth().currentUser;
			var uid = admin.uid;
			if (admin == null || admin == undefined)
				admin = "testUser";


			var group = {
				// admin: admin,
				uid: admin.uid,
				email: admin.email,
				adminName: admin.displayName,
				name: name,
				class: className,
				location: location,
				details: details,
				groupType: publicGroup,
				blacklist: blacklist,
				invited: invited
			}

			var newPostKey = firebase.database().ref().child('groups').push().key;

			var updates = {};
			// updates['/groups/' + newPostKey] = postData;
			updates['/groups/' + name] = group; // + '/' + newPostKey

			// Update user dict structure
			// $scope.emails[email] = true;

			return firebase.database().ref().update(updates);


			// var publicGroup = $("$publicGroupRadio");
			// console.log(publicGroup);

		});
	});

	$scope.deleteYourGroup = function(name, className, location) {
		var postKey = firebase.database().ref().child('groups').child(name).remove();
	}



	$(function () {
	    $('[data-toggle="popover"]').popover()
	    $('#popoverData').popover();
		$('#popoverOption').popover({ trigger: "hover" });

	})

	$scope.userDict = {};

	$scope.checkIfUserExists = function(userId) { // not used anymore?
		var postKey;
		firebase.database().ref('/users-keys/' + userId).once('value').then(function(snapshot) {
			postKey = snapshot.val();
			if (postKey != null)
				return true
			return false
		})

		// firebase.database().ref('/users/' + postKey).once('value').then(function(snapshot) {
		// 	// var username = snapshot.val().username;
		// 	console.log(snapshot)
		// 	var exists = (snapshot.val() !== null);
		// 	console.log(snapshot.val());
		// 	return exists;
		// });
	}

	$scope.addUser = function(uid, email, name, photoURL) {
		var postData = {
			email: email,
			name: name,
			friends: 0,
			friends_list: ["Johnny", "Bill"]

		};

		var newPostKey = firebase.database().ref().child('users').push().key;

		var updates = {};
		updates['/users/' + newPostKey] = postData;
		updates['/users-keys/' + uid] = postData; // + '/' + newPostKey


		var emailAsKey = $scope.emailAsKey(email);
		updates['/emails/' + emailAsKey] = true; // note this is using email as key (this might end up being wrong sometimes)

		// Update user dict structure
		$scope.emails[email] = true;

		return firebase.database().ref().update(updates);
	}

	$scope.displayNameAsKey = function(name) {
		return name.replace(/\./g, ',');
	}


	$scope.deleteCurrentUser = function() {
		var user = firebase.auth().currentUser;
		var uid = user.uid;
		var email = user.email;
		var emailAsKey = $scope.emailAsKey(email);


		// Delete the user's information in the database
		var newPostKey = firebase.database().ref().child('users-keys').child(uid).remove();
		var postKey = firebase.database().ref().child('emails').child(emailAsKey).remove();

		user.delete().then(function() {
			console.log("Successfully Deleted");

			delete $scope.emails[email]; // might be inefficient!

			// var newPostKey = firebase.database().ref().child('users-keys').child(uid).remove();
			// var postKey = firebase.database().ref().child('emails').child(emailAsKey).remove();

		}, function(error) {	
			console.log(error);
		});
	}

	// var userId = firebase.auth().currentUser.uid;
	

	$scope.credential = null;

	$scope.facebookSignin = function() {
		var provider = new firebase.auth.FacebookAuthProvider();
			provider.setCustomParameters({
		  'display': 'popup',
		  // 'scope': "user_friends"
		});
		provider.addScope('user_friends');
		// provider.addScope('user_birthday')

		
		firebase.auth().signInWithPopup(provider).then(function(result) {
		  // This gives you a Facebook Access Token. You can use it to access the Facebook API.
		  var token = result.credential.accessToken;
		  $http.get("https://graph.facebook.com/v2.0/me?fields=friends&access_token="+token).then(function(value) {
		  	console.log(value.data.friends.data);
		  });
		  $http.get("https://graph.facebook.com/v2.0/me?fields=education&access_token="+token).then(function(value) {
		  	console.log(value.data);
		  	// $('display').append("<img src=" + )
		  });
		  $http.get("https://graph.facebook.com/v2.0/me?fields=location&access_token="+token).then(function(value) {
		  	console.log(value.data);
		  	// $('display').append("<img src=" + )
		  });
		  $http.get("https://graph.facebook.com/v2.0/me?fields=about&access_token="+token).then(function(value) {
		  	console.log(value.data);
		  	// $('display').append("<img src=" + )
		  });



		  // The signed-in user info.
		  var user = result.user;
		  // console.log(token);
		  var email = user.email;
			var photoURL = user.photoURL;
			var name = user.displayName;
			var uid = user.uid;
			var emailAsKey = $scope.emailAsKey(email);
			// var exists = $scope.checkIfUserExists(emailAsKey);
			// console.log(exists);
			// console.log(email);

			// add to array
			var postKey;
			var emailAsKey = $scope.emailAsKey(email);
			firebase.database().ref('/emails/' + emailAsKey).once('value').then(function(snapshot) {
				postKey = snapshot.val();
				var exists;
				if (postKey != null)
					exists = true
				else 
					exists = false


				if ($scope.newUser == true) { // trying to create a new user
					if (!exists) { // user doesn't exist yet
						$scope.addUser(uid, email, name, photoURL); // no more email as key
					}
					else { // user already exists when trying to create a new user
						console.log("A user already exists with this email!")
					}
				}
				else { // trying to log in
					if (!exists) {
						$scope.addUser(uid, email, name, photoURL);
					}
					else {
						// 
					}
				}

			})
		}).catch(function(error) {
		  // Handle Errors here.
		  var errorCode = error.code;
		  var errorMessage = error.message;
		  // The email of the user's account used.
		  var email = error.email;
		  // The firebase.auth.AuthCredential type that was used.
		  var credential = error.credential;


		  if (errorCode === 'auth/account-exists-with-different-credential') {
		  	console.log("account already exists");

		  	// $("facebookButton").tooltip('show');
		  	
		  }
		  else {
		  	console.log(errorCode);
		  	console.log(errorMessage);
		  	console.log(error);
		  }

		});
		// firebase.auth().signInWithRedirect(provider);
	};
	$scope.signout = function() {
		firebase.auth().signOut().then(function() {
			console.log("Signout successful!");
		}, function(error) {
			console.log("Signout failed");
		});
	}


	$scope.newUser = false;

	$scope.expandLogin = function() {
		var element = document.getElementById("name");
		if (angular.element(element).is(':visible')) {
			angular.element(element).hide();
			var el = document.getElementById("submitButton");
			angular.element(el).text("Login");
			$scope.newUser = false;
		}
		else {
			angular.element(element).show();
			var el = document.getElementById("submitButton");
			angular.element(el).text("Sign up");
			$scope.newUser = true;
		}
	}

	$scope.emailAsKey = function(email) {
		var encrypted = "";
		for (var i = 0; i < email.length; i++) {
			encrypted += "" + email.charCodeAt(i);
		}
		console.log("Email as key" + encrypted)
		return encrypted;
		// return email.replace(/\./g, ',');
	}


	/* Login as new user */
	var el = document.getElementById("submitForm");
	angular.element(el).submit(function(event) {
		event.preventDefault();
		var email = angular.element(document.getElementById("username")).val();
		var password = angular.element(document.getElementById("password")).val(); 
		var name = angular.element(document.getElementById("name")).val(); 

		var emailAsKey = $scope.emailAsKey(email);

		var postKey; // FIX THIS: THIS IS CHECKING BY EMAILASKEYRIGHT NOW
		var exists;
		var emailAsKey = $scope.emailAsKey(email);
		firebase.database().ref('/emails/' + emailAsKey).once('value').then(function(snapshot) {
			if (snapshot.val() != null)
				exists = true;
			else
				exists = false;

			if ($scope.newUser == true) { // trying to create a new user
					if (!exists) { // user doesn't exist yet
						firebase.auth().createUserWithEmailAndPassword(email, password).then(function(user) {

							// FIX: ADD THE NEW UPDATE TO THE ARRAY OF ALL USERS!
							$scope.addUser(user.uid, email, name, user.photoURL);


							user.updateProfile({
								displayName: name
							}).then(function() {

							}, function(error) {

							});
							// var errorCode = error.code;
							// var errorMessage = error.message;
							// console.log(error);
						}, function(error) {
							console.log(error);
						});
					}
					else { // user already exists when trying to create a new user
						console.log("A user already exists with this email!")
					}
				}
				else { // trying to log in
					if (!exists) {
						console.log("You don't have an account yet! Click new user.")
					}
					else {
						firebase.auth().signInWithEmailAndPassword(email, password).catch(function(error) {
						  // Handle Errors here.
						  var errorCode = error.code;
						  var errorMessage = error.message;
						  console.log(error);
						});
					}
				}
		});

	});

	$scope.signOut = function() {
	    var auth2 = gapi.auth2.getAuthInstance();
	    auth2.signOut().then(function () {
	      console.log('User signed out.');
	    });
	  }
	
	$scope.updateCourses = function() {
		console.log("You are trying to update courses");

		// var x = new XMLHttpRequest();
		// x.open("GET", "http://etcweb.princeton.edu/webfeeds/places/", true);
		// x.onreadstatechange = function() {
		// 	if (x.readyState == 4 && x.status == 200) {
		// 		var doc = x.responseXML;
		// 		console.log(doc);
		// 	}
		// }
		// x.send(null);
	}
})