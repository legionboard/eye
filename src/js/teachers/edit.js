/*
 * @author	Nico Alt
 * @date	16.03.2016
 *
 * See the file "LICENSE" for the full license governing this code.
 */
if (getURLParameter('id') == null || getURLParameter('id') == '') {
	sweetAlert({
		title: "Ups...",
		text: "Es gab einen Fehler. Bitte versuche es später erneut.",
		type: "error",
		closeOnCancel: false
	},
	function() {
		window.location.href = 'showTeachers.html';
	});
	throw new Error("The ID of the teacher is not given.");
}
// ID of the teacher
var id = getURLParameter('id');
// The authentication key
var authKey = getAuthenticationKey();
if (authKey != null && authKey != '') {
	// Hide key form
	$("#keyForm").hide();
	// Show teacher field
	$("#teacherField").show();
	getTeacher();
}
else {
	// Show key form
	$("#keyForm").show();
	// Hide teacher field
	$("#teacherField").hide();
	scrollTo("#keyForm");
}
$('form').on('submit', function(e) {
	// Prevent default action
	e.preventDefault();
	// Get username
	var username = $('#username').val().trim().toLowerCase();
	// Get password
	var password = $('#password').val().trim();
	// Check if fields are not empty
	if (username.length != 0 && password.length != 0) {
		authKey = getHash(username, password);
		setAuthenticationKey(authKey);
	}
	if ($('#teacherField').is(':hidden')) {
		if (username.length != 0 && password.length != 0) {
			// Hide key form
			$("#keyForm").hide();
			// Show teacher field
			$("#teacherField").show();
			getTeacher();
		}
		else {
			// Show key form
			$('#keyForm').show();
			scrollTo('#keyForm');
			// Hide teacher field
			$("#teacherField").hide();
			sweetAlert('Ups...', 'Bitte überprüfe, ob Du alle Felder ausgefüllt hast!', 'error');
		}
	}
	else {
		var name = $('#name').val().trim();
		var archived = $('#archived').is(':checked');
		if (name.length != 0) {
			editTeacher(name, archived);
		}
		else {
			sweetAlert("Ups...", "Du musst einen Namen für den Lehrer angeben.", "error");
		}
	}
});

function editTeacher(name, archived) {
	$.ajax({
		url: appConfig['apiRoot'] + '/teachers/' + id,
		data: {
			k: authKey,
			name: name,
			archived: archived
		},
		type: 'PUT'
	})
	.success(function(data) {
		sweetAlert({
			title: 'Geändert!',
			text: 'Der Lehrer wurde erfolgreich geändert.',
			type: 'success'
		},
		function() {
			window.location.href = 'showTeachers.html';
		});
	})
	.fail(function(jqXHR, textStatus, errorThrown) {
		console.log('Updating teacher failed.');
		console.log(jqXHR);
		switch (jqXHR.status) {
			case 401:
				// Show key form
				$('#keyForm').show();
				scrollTo('#keyForm');
				// Hide teacher field
				$("#teacherField").hide();
				// Delete key from local storage/cookies
				localStorage.removeItem('authKey');
				deleteCookie('authKey');
				authKey = null;
				sweetAlert('Ups...', 'Bitte überprüfe Deine Anmeldedaten.', 'error');
				break;
			default:
				sweetAlert('Ups...', 'Es gab einen Fehler. Bitte versuche es später erneut.', 'error');
		}
	});
}

function getTeacher() {
	// Hide form
	$('form').hide();
	$.getJSON(appConfig['apiRoot'] + '/teachers/' + id + '?k=' + authKey)
	.done(function() {
		// Show form
		$('form').show();
	})
	.success(function(data) {
		$('#name').val(data[0]['name']);
		$('#archived').prop('checked', (data[0]['archived'] == 'true') ? true : false);
	})
	.fail(function(jqXHR, textStatus, errorThrown) {
		console.log('Getting teachers failed.');
		console.log(jqXHR);
		switch (jqXHR.status) {
			case 401:
				// Show key form
				$("#keyForm").show();
				scrollTo("#keyForm");
				// Hide teacher field
				$("#teacherField").hide();
				localStorage.removeItem("authKey");
				deleteCookie('authKey');
				authKey = null;
				sweetAlert("Ups...", "Bitte überprüfe Deine Anmeldedaten.", "error");
				break;
			default:
				sweetAlert("Ups...", "Es gab einen Fehler. Bitte versuche es später erneut.", "error");
		}
	});
}