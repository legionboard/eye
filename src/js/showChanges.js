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
if (authKey != null && authKey != '') {
	getTeachers();
}
// Toggle view switch
var viewMode = '';
if (getURLParameter('view') == 'expert') {
	viewMode = 'expert';
	if (typeof(Storage) !== "undefined") {
		try {
			localStorage.viewMode = viewMode;
		}
		catch (error) {
			console.log(error);
		}
	}
	else {
		setCookie('viewMode', viewMode);
	}
}
if (getURLParameter('view') == 'default') {
	localStorage.removeItem('viewMode');
	deleteCookie('viewMode');
}
if (typeof(Storage) !== "undefined") {
	try {
		viewMode = localStorage.viewMode;
	}
	catch (error) {
		console.log(error);
	}
}
else {
	viewMode = getCookie('viewMode');
}
if (viewMode != 'expert') {
	$('#viewDefault').hide();
	$('#viewExpert').show();
}
// On submit of the form
$('#authForm form').on('submit', function(e) {
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
		$("#authForm").show();
		// Hide changes table
		$("#changesTable").hide();
		sweetAlert("Ups...", "Bitte überprüfe, ob Du alle Felder ausgefüllt hast!", "error");
	}
});
// On submit of the form
$('#changesForm').on('submit', function(e) {
	// Prevent default action
	e.preventDefault();
	// Get startBy day
	var startBy = $('#startBy').val().trim();
	// Get endBy day
	var endBy = $('#endBy').val().trim();
	// Get teacher
	var teacher = [];
	$(':checkbox:checked').each(function(i) {
		teacher[i] = $(this).val();
	});
	if (startBy != null && startBy.length != 0) {
		var startByIsNotEmpty = true;
	}
	if (endBy != null && endBy.length != 0) {
		var endByIsNotEmpty = true;
	}
	if (startByIsNotEmpty || endByIsNotEmpty) {
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
		}
		if (startByIsNotEmpty && endByIsNotEmpty) {
			// Format to ISO 8601
			startBy = startBy.substring(6, 10) + '-' + startBy.substring(3, 5) + '-' + startBy.substring(0, 2);
			endBy = endBy.substring(6, 10) + '-' + endBy.substring(3, 5) + '-' + endBy.substring(0, 2);
			if ((new Date(startBy)) > (new Date(endBy))) {
				sweetAlert("Ups...", "Der Start muss vor dem Ende sein.", "error");
			}
			else {
				getChanges(startBy, endBy, teacher);
			}
		}
		else if (startByIsNotEmpty) {
			// Format to ISO 8601
			startBy = startBy.substring(6, 10) + '-' + startBy.substring(3, 5) + '-' + startBy.substring(0, 2);
			getChanges(startBy, null, teacher);
		}
		else if (endByIsNotEmpty) {
			// Format to ISO 8601
			endBy = endBy.substring(6, 10) + '-' + endBy.substring(3, 5) + '-' + endBy.substring(0, 2);
			getChanges(null, endBy, teacher);
		}

	}
});

$('.datepicker').datepicker({
	format: "dd.mm.yyyy",
	todayBtn: "linked",
	language: "de",
	daysOfWeekHighlighted: "1,2,3,4,5",
	autoclose: true,
	todayHighlight: true
});
$('#startByPicker').datepicker('update', "0");
$('#endByPicker').datepicker('update', "+7d");

function getTeachers() {
	// Hide authentication form
	$("#authForm").hide();
	// Get teachers
	$.getJSON(appConfig['apiRoot'] + '/teachers?k=' + authKey)
	.success(function(data) {
		addTeachers(data);
		drawTeachers();
		getChanges();
	})
	.fail(function(jqXHR, textStatus, errorThrown) {
		console.log('Getting teachers failed.');
		console.log(jqXHR);
		if (jqXHR.status == 401) {
			// Show authentication form
			$("#authForm").show();
			// Hide changes table
			$("#changesTable").hide();
			localStorage.removeItem("authKey");
			deleteCookie('authKey');
			authKey = null;
			sweetAlert("Ups...", "Bitte überprüfe Deine Anmeldedaten.", "error");
		}
		else if (jqXHR.status == 404) {
			sweetAlert("Ups...", "Es gibt keine Lehrer.", "error");
		}
		else {
			sweetAlert("Ups...", "Es gab einen Fehler. Bitte versuche es später erneut.", "error");
		}
	});
}

function getChanges(startBy, endBy, teacher) {
	startBy = (startBy != null) ? startBy : getISODate(0);
	endBy = (endBy != null) ? endBy : getISODate(7);
	if (teacher != null && teacher[0] != null) {
		teacher = teacher.join(',') + ',1';
	}
	else {
		teacher = null;
	}
	// Get changes
	$.getJSON(appConfig['apiRoot'] + '/changes?k=' + authKey + '&startBy=' + startBy + '&endBy=' + endBy + ((teacher != null) ? ('&teachers=' + teacher) : ''))
	.success(function(data) {
		// Hide authentication form
		$("#authForm").hide();
		// Show changes table
		$("#changesTable").show();
		// Clear table
		$("#changesTable tbody").remove();
		// Add table body
		$("#changesTable").append("<tbody />");
		// Show changes form
		$("#changesForm").show();
		drawTable(data);
	})
	.fail(function(jqXHR, textStatus, errorThrown) {
		console.log('Getting changes failed.');
		console.log(jqXHR);
		if (jqXHR.status == 401) {
			// Show authentication form
			$("#authForm").show();
			// Hide changes table
			$("#changesTable").hide();
			localStorage.removeItem("authKey");
			deleteCookie('authKey');
			authKey = null;
			sweetAlert("Ups...", "Bitte überprüfe Deine Anmeldedaten.", "error");
		}
		else if (jqXHR.status == 404) {
			// Show changes form
			$("#changesForm").show();
			sweetAlert("Ups...", "Für Deinen Filter gibt es keine Änderungen.", "error");
		}
		else {
			sweetAlert("Ups...", "Es gab einen Fehler. Bitte versuche es später erneut.", "error");
		}
	});
}

function addTeachers(data) {
	for (var i = 0; i < data.length; i++) {
		addTeacher(data[i]);
	}
}

function addTeacher(data) {
	teachers[data.id] = data.name;
}

function drawTeachers() {
	var sortable = [];
	for (var key in teachers) {
		if (teachers.hasOwnProperty(key)) {
			sortable.push([key, teachers[key]]);
		}
	}
	sortable.sort(function(a, b) {
		var x = a[1].toLowerCase();
		var y = b[1].toLowerCase();
		return x < y ? -1 : x > y ? 1 : 0;
	});
	for (var key in sortable) {
		if (sortable[key][0] == '1') {
			continue;
		}
		var row = '<li>' +
					'<input id="teacherCheck_' + sortable[key][0] + '" name="teacherCheck" value="' + sortable[key][0] + '" type="checkbox">' +
					'<label for="teacherCheck_' + sortable[key][0] + '">' + sortable[key][1] + '</label>' +
					'</li>';
		$("#teacherDrop ul").append(row);
	}
}

function drawTable(data) {
	data.sort(function(a, b) {
		var dateA = new Date(a.startBy.substring(0, 10));
		var dateB = new Date(b.startBy.substring(0, 10));
		// Sort by date ascending
		return dateA - dateB;
	});
	for (var i = 0; i < data.length; i++) {
		drawRow(data[i]);
	}
	// Show actions only when requested
	if (viewMode != 'expert') {
		$(".expertViewOnly").hide();
	}
	// Show reason only when available
	if (data[0].reason == '-') {
		$(".tableReason").hide();
	}
	// Show privateText only when available
	if (data[0].privateText == '-') {
		$(".tablePrivateText").hide();
	}
	// Hide last border-bottom of each table row
	$('#changesTable tr').find('td:visible:last').css("border-bottom", "none");
	// Hide border-bottom of last table row
	$('#changesTable').find('tr:visible:last').css("border-bottom", "none");
	scrollTo('#changesTable');
}

function drawRow(rowData) {
	var days = ['So','Mo','Di','Mi','Do','Fr','Sa'];
	var row = $("<tr />");
	var teacher = teachers[rowData.teacher];
	var type = "Ausfall";
	if (rowData.type == 1) {
		type = "Vertretung";
	}
	if (rowData.type == 2) {
		type = "Information";
	}
	var coveringTeacher = "-";
	if (rowData.coveringTeacher != 0) {
		coveringTeacher = teachers[rowData.coveringTeacher];
	}
	var text = "-";
	if (rowData.text != '') {
		text = rowData.text;
	}
	var reason = '-';
	if (rowData.reason == '0') {
		reason = 'Krank';
	}
	if (rowData.reason == '1') {
		reason = 'Dienstlich';
	}
	if (rowData.reason == '2') {
		reason = 'Beurlaubt';
	}
	var privateText = '-';
	if (rowData.privateText != '-' && rowData.privateText != '') {
		privateText = rowData.privateText;
	}
	// Hide hour if it's 00
	var startByHour = (rowData.startBy.substring(11, 13) != '00') ? (" - " + rowData.startBy.substring(11, 13).replace(/^0+/, '') + ". Std") : '';
	// Hide hour if it's 20
	var endByHour = '';
	if (rowData.endBy.substring(11, 13) != '20') {
		// Don't trim leading zeros if there are only zeros
		if (rowData.endBy.substring(11, 13) == '00') {
			endByHour = " - " + rowData.endBy.substring(11, 13) + ". Std";
		}
		else {
			endByHour = " - " + rowData.endBy.substring(11, 13).replace(/^0+/, '') + ". Std";
		}
	}
	var startBy =
		days[(new Date(rowData.startBy.substring(0, 10))).getDay()] + ', ' +
		rowData.startBy.substring(8, 10).replace(/^0+/, '') +
		"." +
		rowData.startBy.substring(5, 7).replace(/^0+/, '') +
		"." +
		rowData.startBy.substring(2, 4) +
		startByHour;
	var endBy =
		days[(new Date(rowData.endBy.substring(0, 10))).getDay()] + ', ' +
		rowData.endBy.substring(8, 10).replace(/^0+/, '') +
		"." +
		rowData.endBy.substring(5, 7).replace(/^0+/, '') +
		"." +
		rowData.endBy.substring(2, 4) +
		endByHour;
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
	$("#changesTable tbody").append(row);
	row.append($("<td data-label='Lehrer' class='tableTeacher'>" + teacher + "</td>"));
	row.append($("<td data-label='Start'>" + startBy + "</td>"));
	row.append($("<td data-label='Ende'>" + endBy + "</td>"));
	row.append($("<td data-label='Typ'>" + type + "</td>"));
	row.append($("<td data-label='Text'>" + text + "</td>"));
	row.append($("<td data-label='Vertretender Lehrer'>" + coveringTeacher + "</td>"));
	row.append($("<td data-label='Grund' class='tableReason'>" + reason + "</td>"));
	row.append($("<td data-label='Privater Text' class='tablePrivateText'>" + privateText + "</td>"));
	row.append($("<td data-label='Erstellt' class='expertViewOnly'>" + added + "</td>"));
	row.append($("<td data-label='Aktualisiert' class='expertViewOnly'>" + edited + "</td>"));
	row.append($("<td data-label='Aktion' class='expertViewOnly'><a href='javascript:void(0)' onclick='editChange(" + rowData.id + ");'>[B]</a> <a href='javascript:void(0)' onclick='deleteChange(" + rowData.id + ");'>[L]</a></td>"));
}

function editChange(id) {
	window.location.href = 'editChange.html?id=' + id;
}

function deleteChange(id) {
	sweetAlert({
		title: "Bist Du Dir sicher?",
		text: 'Willst Du diese Änderung wirklich löschen?',
		type: "warning",
		showCancelButton: true,
		confirmButtonColor: "#DD6B55",
		confirmButtonText: "Löschen!",
		closeOnConfirm: false
	},
	function() {
		$.ajax({
			url: appConfig['apiRoot'] + '/changes/' + id + '?k=' + authKey,
			type: 'DELETE'
		})
		.success(function(data, textStatus, xhr) {
			sweetAlert({
				title: "Gelöscht!",
				text: "Die Änderung wurde gelöscht.",
				type: "success"
			},
			function() {
				location.reload();
			});
		})
		.fail(function(jqXHR, textStatus, errorThrown) {
			console.log('Deleting change failed.');
			console.log(jqXHR);
			switch (jqXHR.status) {
				case 401:
					sweetAlert("Ups...", "Du bist nicht dazu berechtigt, Änderungen zu löschen.", "error");
					break;
				default:
					sweetAlert("Ups...", "Es gab einen Fehler. Bitte versuche es später erneut.", "error");
			}
		});
	});
}
