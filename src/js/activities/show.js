/*
 * @author	Nico Alt
 * @date	01.08.2016
 *
 * See the file "LICENSE" for the full license governing this code.
 */
// The authentication key
var authKey = getAuthenticationKey();
if (authKey !== undefined && authKey.length !== 0) {
	getActivities();
}
$('form').on('submit', function(e) {
	// Prevent default action
	e.preventDefault();
	// Get username
	var username = $('#username').val().trim().toLowerCase();
	// Get password
	var password = $('#password').val().trim();
	// Check if fields are not empty
	if (username.length !== 0 && password.length !== 0) {
		authKey = getHash(username, password);
		setAuthenticationKey(authKey);
		getActivities();
	}
	else {
		// Show authentication form
		$("#authenticationForm").show();
		// Hide table
		$("table").hide();
		sweetAlert("Ups...", "Bitte überprüfe, ob Du alle Felder ausgefüllt hast!", "error");
	}
});

function getActivities() {
	// Hide authentication form
	$("#authenticationForm").hide();
	$.getJSON(appConfig['apiRoot'] + '/activities?k=' + authKey)
	.success(function(data) {
		// Hide 404 message
		$("#404message").hide();
		// Show table
		$("table").show();
		// Clear table
		$("table tbody").remove();
		// Add table body
		$("table").append("<tbody />");
		drawTable(data);
	})
	.fail(function(jqXHR, textStatus, errorThrown) {
		console.log('Getting activities failed.');
		console.log(jqXHR);
		switch (jqXHR.status) {
			case 401:
				// Show authentication form
				$("#authenticationForm").show();
				// Hide table
				$("table").hide();
				deleteCookie('authKey');
				localStorage.removeItem("authKey");
				authKey = null;
				sweetAlert("Ups...", "Bitte überprüfe Deine Anmeldedaten.", "error");
				break;
			case 404:
				// Hide table
				$("table").hide();
				// Show 404 message
				$("#404message").show();
				scrollTo('.jumbotron');
				break;
			default:
				sweetAlert("Ups...", "Es gab einen Fehler. Bitte versuche es später erneut.", "error");
		}
	});
}

function drawTable(data) {
	data.reverse();
	for (var i = 0; i < data.length; i++) {
		drawRow(data[i]);
	}
	// Hide border-bottom of last table row
	$('table').find('tr:visible:last').css("border-bottom", "none");
}

function drawRow(rowData) {
	var row = $("<tr />");
	row.append($("<td data-label='Benutzer'>" + rowData.user + "</td>"));
	row.append($("<td data-label='Aktion'>" + formatAction(rowData.action) + "</td>"));
	row.append($("<td data-label='Ressource'>" + formatAffectedResource(rowData.affectedResource) + "</td>"));
	row.append($("<td data-label='Objekt'>" + rowData.affectedID + "</td>"));
	row.append($("<td data-label='Zeit'>" + formatToFullLocal(rowData.time) + "</td>"));
	$("table tbody").append(row);
}

function formatAction(action) {
	switch(action) {
		case '0':
			return 'Hinzufügung';
		case '1':
			return 'Aktualisierung';
		case '2':
			return 'Löschung';
		default:
			return 'Unbekannt';
	}
}

function formatAffectedResource(affectedResource) {
	switch(affectedResource) {
		case 'changes':
			return 'Änderungen';
		case 'courses':
			return 'Kurse';
		case 'teachers':
			return 'Lehrer';
		default:
			return 'Unbekannt';
	}
}
