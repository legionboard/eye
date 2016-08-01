/*
 * @author	Nico Alt
 * @date	16.03.2016
 *
 * See the file "LICENSE" for the full license governing this code.
 */
// The authentication key
var authKey = getAuthenticationKey();
if (authKey != null && authKey.length != 0) {
	getTeachers();
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
		getTeachers();
	}
	else {
		// Show authentication form
		$("#divForm").show();
		// Hide teachers table
		$("#teachersTable").hide();
		sweetAlert("Ups...", "Bitte überprüfe, ob Du alle Felder ausgefüllt hast!", "error");
	}
});

function getTeachers() {
	// Hide authentication form
	$("#divForm").hide();
	$.getJSON(appConfig['apiRoot'] + '/teachers?k=' + authKey)
	.success(function(data) {
		// Hide authentication form
		$("#divForm").hide();
		// Hide 404 message
		$("#404message").hide();
		// Show teachers table
		$("#teachersTable").show();
		// Clear table
		$("#teachersTable tbody").remove();
		// Add table body
		$("#teachersTable").append("<tbody />");
		drawTable(data);
	})
	.fail(function(jqXHR, textStatus, errorThrown) {
		console.log('Getting teachers failed.');
		console.log(jqXHR);
		switch (jqXHR.status) {
			case 401:
				// Show authentication form
				$("#divForm").show();
				// Hide teachers table
				$("#teachersTable").hide();
				deleteCookie('authKey');
				localStorage.removeItem("authKey");
				authKey = null;
				sweetAlert("Ups...", "Bitte überprüfe Deine Anmeldedaten.", "error");
				break;
			case 404:
				// Hide teachers table
				$("#teachersTable").hide();
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
	data.sort(function(a, b) {
		var nameA = a.name.toLowerCase();
		var nameB = b.name.toLowerCase();
		// Sort string ascending
		if (nameA < nameB) {
			return -1;
		}
		if (nameA > nameB) {
			return 1;
		}
		return 0;
	});
	for (var i = 0; i < data.length; i++) {
		drawRow(data[i]);
	}
	// Hide border-bottom of last table row
	$('#teachersTable').find('tr:visible:last').css("border-bottom", "none");
}

function drawRow(rowData) {
	var row = $("<tr />");
	var name = rowData.name;
	var archived = rowData.archived;
	if (archived == 'true') {
		archived = '\u2713';
	}
	else {
		archived = '\u2717';
	}
	// Only show added if change contains no doubles
	if (rowData.added != '-') {
		added = formatToFullLocal(rowData.added);
	}
	var edited = '-';
	// Only show edited if change contains no doubles
	if (rowData.edited != '-') {
		edited = formatToFullLocal(rowData.edited);
	}
	$("#teachersTable tbody").append(row);
	row.append($("<td data-label='Name' class='tableTeacher'>" + name + "</td>"));
	row.append($("<td data-label='Archiviert'>" + archived + "</td>"));
	row.append($("<td data-label='Erstellt'>" + added + "</td>"));
	row.append($("<td data-label='Aktualisiert'>" + edited + "</td>"));
	row.append($("<td data-label='Aktion'><a href='javascript:void(0)' onclick='editTeacher(" + rowData.id + ");'><img alt='Edit' src='../images/circle-edit.png'></a> <a href='javascript:void(0)' onclick='deleteTeacher(" + rowData.id + ");'><img alt='Delete' src='../images/circle-delete.png'></a></td>"));

}

function editTeacher(id) {
	window.location.href = '../teachers/edit.html?id=' + id;
}

function deleteTeacher(id) {
	sweetAlert({
		title: "Bist Du Dir sicher?",
		text: 'Willst Du diesen Lehrer wirklich löschen?',
		type: "warning",
		showCancelButton: true,
		confirmButtonColor: "#DD6B55",
		confirmButtonText: "Löschen!",
		closeOnConfirm: false
	},
	function() {
		$.ajax({
			url: appConfig['apiRoot'] + '/teachers/' + id + '?k=' + authKey,
			type: 'DELETE'
		})
		.success(function(data, textStatus, xhr) {
			sweetAlert({
				title: "Gelöscht!",
				text: "Der Lehrer wurde gelöscht.",
				type: "success"
			},
			function() {
				location.reload();
			});
		})
		.fail(function(jqXHR, textStatus, errorThrown) {
			console.log('Deleting teacher failed.');
			console.log(jqXHR);
			switch (jqXHR.status) {
				case 401:
					sweetAlert("Ups...", "Du bist nicht dazu berechtigt, Lehrer zu löschen.", "error");
					break;
				case 400:
					if (($.parseJSON(jqXHR.responseText))['error'][0]['code'] == 402) {
						sweetAlert("Ups...", "Der Lehrer ist noch mit einer Änderung verknüpft.", "error");
						break;
					}
				default:
					sweetAlert("Ups...", "Es gab einen Fehler. Bitte versuche es später erneut.", "error");
			}
		});
	});
}
