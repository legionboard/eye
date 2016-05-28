/*
 * @author	Nico Alt
 * @date	16.03.2016
 *
 * See the file "LICENSE" for the full license governing this code.
 */
// The array containing the teachers names
var teachers = {};
// The authentication key
var authKey = '';
if (typeof(Storage) !== "undefined") {
	try {
		authKey = localStorage.authKey;
	}
	catch (error) {
		console.log(error);
	}
}
else {
	authKey = getCookie('authKey');
}
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
		if (typeof(Storage) !== "undefined") {
			try {
				localStorage.authKey = authKey;
			}
			catch (error) {
				console.log(error);
			}
		}
		else {
			setCookie('authKey', authKey);
		}
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
		addTeachers(data);
		// Hide authentication form
		$("#divForm").hide();
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
				sweetAlert("Ups...", "Es gibt keine Lehrer.", "error");
				break;
			default:
				sweetAlert("Ups...", "Es gab einen Fehler. Bitte versuche es später erneut.", "error");
		}
	});
}

function addTeachers(data) {
	for (var i = 0; i < data.length; i++) {
		teachers[data[i].id] = data[i].name;
	}
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
	var added =
		rowData.added.substring(8, 10) +
		"." +
		rowData.added.substring(5, 7) +
		"." +
		rowData.added.substring(0, 4) +
		" " +
		rowData.added.substring(11, 19);
	var edited =
		rowData.edited.substring(8, 10) +
		"." +
		rowData.edited.substring(5, 7) +
		"." +
		rowData.edited.substring(0, 4) +
		" " +
		rowData.edited.substring(11, 19);
	$("#teachersTable tbody").append(row);
	row.append($("<td data-label='Name' class='tableTeacher'>" + name + "</td>"));
	row.append($("<td data-label='Erstellt'>" + added + "</td>"));
	row.append($("<td data-label='Aktualisiert'>" + edited + "</td>"));
	if (rowData.id != 1) {
		row.append($("<td data-label='Aktion'><a href='javascript:void(0)' onclick='editTeacher(" + rowData.id + ");'>[B]</a> <a href='javascript:void(0)' onclick='deleteTeacher(" + rowData.id + ");'>[L]</a></td>"));
	}
	else {
		row.append($("<td data-label='Aktion'>-</td>"));
	}

}

function editTeacher(id) {
	window.location.href = 'editTeacher.html?id=' + id;
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
