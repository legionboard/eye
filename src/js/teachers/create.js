/*
 * @author	Nico Alt
 * @date	16.03.2016
 *
 * See the file "LICENSE" for the full license governing this code.
 */
// The authentication key
var authKey = getAuthenticationKey();
if (authKey != null && authKey != '') {
	// Hide key form
	$("#keyForm").hide();
}
else {
	// Show key form
	$("#keyForm").show();
	scrollTo("#keyForm");
}
// On submit of the form
$('form').on('submit', function(e) {
	// Prevent default action
	e.preventDefault();
	// Get teacher name
	var name = $('#name').val().trim();
	if (authKey == null || authKey == '') {
		// Get username
		var username = $('#username').val().trim().toLowerCase();
		// Get password
		var password = $('#password').val().trim();
		// Check if fields are not empty
		if (username.length != 0 && password.length != 0) {
			authKey = getHash(username, password);
			setAuthenticationKey(authKey);
		}
		else {
			sweetAlert("Ups...", "Bitte überprüfe, ob Du alle Felder ausgefüllt hast!", "error");
		}
	}
	if (name.length != 0) {
		createTeacher(name);
	}
	else {
		sweetAlert("Ups...", "Du musst einen Namen für den Lehrer angeben.", "error");
	}
});

function createTeacher(name) {
	$.post(appConfig['apiRoot'] + '/teachers',
	{
		k: authKey,
		name: name
	})
	.success(function(data) {
		// Hide key form
		$("#keyForm").hide();
		sweetAlert({
			title: "Hinzugefügt!",
			text: "Der Lehrer wurde erfolgreich hinzugefügt.",
			type: "success"
		},
		function() {
			$('#name').val('');
		});
	})
	.fail(function(jqXHR, textStatus, errorThrown) {
		// Hide key form
		$("#keyForm").hide();
		console.log('Creating teacher failed.');
		console.log(jqXHR);
		switch (jqXHR.status) {
			case 401:
				// Show key form
				$("#keyForm").show();
				scrollTo("#keyForm");
				// Delete key from local storage/cookies
				localStorage.removeItem("authKey");
				deleteCookie('authKey');
				authKey = null;
				sweetAlert("Ups...", "Bitte überprüfe Deine Anmeldedaten.", "error");
				break;
			case 400:
				if (($.parseJSON(jqXHR.responseText))['error'][0]['code'] == 301) {
					sweetAlert("Ups...", "Der Lehrer existiert bereits.", "error");
					break;
				}
			default:
				sweetAlert("Ups...", "Es gab einen Fehler. Bitte versuche es später erneut.", "error");
		}
	});
}
