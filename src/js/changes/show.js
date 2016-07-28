/*
 * @author	Nico Alt
 * @date	16.03.2016
 *
 * See the file "LICENSE" for the full license governing this code.
 */
// The array containing the teachers names
var teachers = {};
// The array containing the courses names
var courses = {};
// The authentication key
var authKey = getAuthenticationKey();
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
		setAuthenticationKey(authKey);
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
			setAuthenticationKey(authKey);
		}
		if (startByIsNotEmpty && endByIsNotEmpty) {
			startBy = formatToISO(startBy);
			endBy = formatToISO(endBy);
			if ((new Date(startBy)) > (new Date(endBy))) {
				sweetAlert("Ups...", "Der Start muss vor dem Ende sein.", "error");
			}
			else {
				getChanges(startBy, endBy, teacher);
			}
		}
		else if (startByIsNotEmpty) {
			startBy = formatToISO(startBy);
			getChanges(startBy, null, teacher);
		}
		else if (endByIsNotEmpty) {
			endBy = formatToISO(endBy);
			getChanges(null, endBy, teacher);
		}

	}
});

initializeDatePicker();
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
		getCourses();
	})
	.fail(function(jqXHR, textStatus, errorThrown) {
		if (jqXHR.status == 404) {
			// Having no teachers is fine as changes do not need to reference one
			getCourses();
		}
		else {
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
			else {
				sweetAlert("Ups...", "Es gab einen Fehler. Bitte versuche es später erneut.", "error");
			}
		}
	});
}
function getCourses() {
	// Hide authentication form
	$("#authForm").hide();
	// Get courses
	$.getJSON(appConfig['apiRoot'] + '/courses?k=' + authKey)
	.success(function(data) {
		addCourses(data);
		drawCourses();
		getChanges();
	})
	.fail(function(jqXHR, textStatus, errorThrown) {
		if (jqXHR.status == 404) {
			// Having no courses is fine as changes do not need to reference one
			getChanges();
		}
		else {
			console.log('Getting courses failed.');
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
			else {
				sweetAlert("Ups...", "Es gab einen Fehler. Bitte versuche es später erneut.", "error");
			}
		}
	});
}

function getChanges(startBy, endBy, teacher) {
	startBy = (startBy != null) ? startBy : 'now';
	endBy = (endBy != null) ? endBy : 'i1w';
	if (teacher != null && teacher[0] == null) {
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

// Teacher IDs of archived ones
var archivedTeachers;
function addTeachers(data) {
	archivedTeachers = {};
	for (var i = 0; i < data.length; i++) {
		// Do not add if teacher is archived
		if (data[i].archived == 'true') {
			archivedTeachers[data[i].id] = true;
		}
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
		if (!archivedTeachers[sortable[key][0]]) {
			var teacherId = sortable[key][0];
			var teacherName = sortable[key][1];
			var row = '<li>' +
						'<input id="teacherCheck_' + teacherId + '" name="teacherCheck" value="' + teacherId + '" type="checkbox">' +
						'<label for="teacherCheck_' + teacherId + '">' + teacherName + '</label>' +
						'</li>';
			$("#teacherDrop ul").append(row);
		}
	}
}

// Courses IDs of archived ones
var archivedCourses;
function addCourses(data) {
	archivedCourses = {};
	for (var i = 0; i < data.length; i++) {
		// Do not add if course is archived
		if (data[i].archived == 'true') {
			archivedCourses[data[i].id] = true;
		}
		addCourse(data[i]);
	}
}

function addCourse(data) {
	courses[data.id] = data.name;
}

function drawCourses() {
	var sortable = [];
	for (var key in courses) {
		if (courses.hasOwnProperty(key)) {
			sortable.push([key, courses[key]]);
		}
	}
	sortable.sort(function(a, b) {
		var x = a[1].toLowerCase();
		var y = b[1].toLowerCase();
		return x < y ? -1 : x > y ? 1 : 0;
	});
	for (var key in sortable) {
		if (!archivedCourses[sortable[key][0]]) {
			var courseId = sortable[key][0];
			var courseName = sortable[key][1];
			var row = '<li>' +
						'<input id="courseCheck_' + courseId + '" name="courseCheck_" value="' + courseId + '" type="checkbox">' +
						'<label for="courseCheck_' + courseId + '">' + courseName + '</label>' +
						'</li>';
			$("#courseDrop ul").append(row);
		}
	}
}

// Column "teacher" is empty
var teacherIsEmpty;
// Column "course" is empty
var courseIsEmpty;
// Column "text" is empty
var textIsEmpty;
// Column "covering teacher" is empty
var coveringTeacherIsEmpty;
// Column "private text" is empty
var privateTextIsEmpty;
// Array index numbers of double changes (changes with same data except teacher/course)
var doubles;
// Changes IDs that are shown within other changes
var alreadyShown;
// If Heart uses an old MySQL version, edited is not working
var editedIsWorking;

function drawTable(data) {
	// Sort alphabetically by teacher name
	data.sort(function(a, b) {
		if (teachers[a.teacher] < teachers[b.teacher]) {
			return -1;
		}
		if (teachers[a.teacher] > teachers[b.teacher]) {
			return 1;
		}
		return 0;
	});
	// Sort ascending by hour
	data.sort(function(a, b) {
		if (a.startingHour < b.startingHour) {
			return -1;
		}
		if (a.startingHour > b.startingHour) {
			return 1;
		}
		return 0;
	});
	// Sort ascending by date
	data.sort(function(a, b) {
		var dateA = new Date(a.startingDate);
		var dateB = new Date(b.startingDate);
		return dateA - dateB;
	});
	doubles = {};
	alreadyShown = {};
	// Find doubles (changes with same data except teacher/course)
	for (var left = 0; left < data.length; left++) {
		for (var right = left + 1; right < data.length; right++) {
			// Temporary left array
			var leftArray = data[left];
			// Temporary right array
			var rightArray = data[right];
			// Don't mark as duplicate if teacher or course is empty
			if (leftArray.teacher == '-' || rightArray.teacher == '-' || leftArray.course == '-' || rightArray.course == '-') {
				continue;
			}
			// Data on left side
			var leftData =
				leftArray.startingDate +
				leftArray.startingHour +
				leftArray.endingDate +
				leftArray.endingHour +
				leftArray.type +
				leftArray.coveringTeacher +
				leftArray.text +
				leftArray.reason +
				leftArray.privateText;
			// Data on right side
			var rightData =
				rightArray.startingDate +
				rightArray.startingHour +
				rightArray.endingDate +
				rightArray.endingHour +
				rightArray.type +
				rightArray.coveringTeacher +
				rightArray.text +
				rightArray.reason +
				rightArray.privateText;
			// If left side data equals right side data
			if (leftData === rightData) {
				alreadyShown[rightArray.id] = true;
				// Link left side change ID to right side index number
				if (doubles[leftArray.id] == null) {
					doubles[leftArray.id] = right.toString();
					continue;
				}
				doubles[leftArray.id] += "," + right;
			}
		}
	}
	teacherIsEmpty = true;
	courseIsEmpty = true;
	textIsEmpty = true;
	coveringTeacherIsEmpty = true;
	privateTextIsEmpty = true;
	editedIsWorking = false;
	for (var i = 0; i < data.length; i++) {
		if (!alreadyShown[data[i].id]) {
			drawRow(data[i], data);
		}
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
	// Show hours only when available
	if (data[0].startingHour == '-' || data[0].endingHour == '-') {
		$(".tableHours").hide();
	}
	// Show added only when available
	if (data[0].added == '-') {
		$(".tableAdded").hide();
	}
	// Show edited only when available
	$(".tableEdited").show();
	if (data[0].edited == '-' || !editedIsWorking) {
		$(".tableEdited").hide();
	}
	// Show teacher only when it is not empty
	$(".tableTeacher").show();
	if (teacherIsEmpty) {
		$(".tableTeacher").hide();
	}
	// Show course only when it is not empty
	$(".tableCourse").show();
	if (courseIsEmpty) {
		$(".tableCourse").hide();
	}
	// Show covering teacher only when it is not empty
	$(".tableCoveringTeacher").show();
	if (coveringTeacherIsEmpty) {
		$(".tableCoveringTeacher").hide();
	}
	// Show private text only when it is not empty
	$(".tablePrivateText").show();
	if (privateTextIsEmpty) {
		$(".tablePrivateText").hide();
	}
	// Show text only when it is not empty
	$(".tableText").show();
	if (textIsEmpty) {
		$(".tableText").hide();
	}
	// Hide last border-bottom of each table row
	$('#changesTable tr').find('td:visible:last').css("border-bottom", "none");
	// Hide border-bottom of last table row
	$('#changesTable').find('tr:visible:last').css("border-bottom", "none");
	scrollTo('#changesTable');
}

function drawRow(rowData, allData) {
	var row = $("<tr />");
	var teacher = '-';
	if (rowData.teacher != '0') {
		teacherIsEmpty = false;
		teacher = teachers[rowData.teacher];
		// Append other teachers with same data
		if (rowData.id in doubles) {
			doubles[rowData.id].split(',').forEach(function(entry) {
				teacher += "; " + teachers[allData[entry].teacher];
			});
		}
	}
	var course = '-';
	if (rowData.course != '0' && rowData.course != null) {
		courseIsEmpty = false;
		course = courses[rowData.course];
		// Append other courses with same data
		if (rowData.id in doubles) {
			doubles[rowData.id].split(',').forEach(function(entry) {
				course += "; " + courses[allData[entry].course];
			});
		}
	}
	var type = "Ausfall";
	if (rowData.type == 1) {
		type = "Vertretung";
	}
	if (rowData.type == 2) {
		type = "Information";
	}
	var coveringTeacher = "-";
	if (rowData.coveringTeacher != 0) {
		coveringTeacherIsEmpty = false;
		coveringTeacher = teachers[rowData.coveringTeacher];
	}
	var text = "-";
	if (rowData.text != '') {
		textIsEmpty = false;
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
		privateTextIsEmpty = false;
		privateText = rowData.privateText;
	}
	// Hide hour if it's 00
	var startingHour = rowData.startingHour;
	// Hide hour if it's 20
	var endingHour = rowData.endingHour;
	var hours = '-';
	if (startingHour != '' || endingHour != '') {
		if (startingHour != '' && endingHour == '') {
			hours = 'Ab ' + startingHour.replace(/^0+/, '') + '. Std.';
		}
		if (startingHour == '' && endingHour != '') {
			hours = 'Bis ' + endingHour.replace(/^0+/, '') + '. Std.';
		}
		if (startingHour != '' && endingHour != '') {
			hours = startingHour.replace(/^0+/, '') + '. - ' + endingHour.replace(/^0+/, '') + '. Std.';
		}
	}
	var startBy =
		getWeekDay(rowData.startingDate) + ', ' +
		formatToShortLocal(rowData.startingDate);
	var endBy =
		getWeekDay(rowData.endingDate) + ', ' +
		formatToShortLocal(rowData.endingDate);
	var added = '-';
	// Only show added if change contains no doubles
	if (rowData.added != '-' && !(rowData.id in doubles)) {
		added = formatToFullLocal(rowData.added);
	}
	var edited = '-';
	// Only show edited if change contains no doubles
	if (rowData.edited != '-' && !(rowData.id in doubles) && rowData.edited != "0000-00-00 00:00:00") {
		editedIsWorking = true;
		edited = formatToFullLocal(rowData.edited);
	}
	$("#changesTable tbody").append(row);
	row.append($("<td data-label='Lehrer' class='tableTeacher'>" + teacher + "</td>"));
	row.append($("<td data-label='Kurs' class='tableCourse'>" + course + "</td>"));
	row.append($("<td data-label='Start'>" + startBy + "</td>"));
	row.append($("<td data-label='Ende'>" + endBy + "</td>"));
	row.append($("<td data-label='Stunden' class='tableHours'>" + hours + "</td>"));
	row.append($("<td data-label='Typ'>" + type + "</td>"));
	row.append($("<td data-label='Text' class='tableText'>" + text + "</td>"));
	row.append($("<td data-label='Vertretender Lehrer' class='tableCoveringTeacher'>" + coveringTeacher + "</td>"));
	row.append($("<td data-label='Grund' class='tableReason'>" + reason + "</td>"));
	row.append($("<td data-label='Privater Text' class='tablePrivateText'>" + privateText + "</td>"));
	row.append($("<td data-label='Erstellt' class='expertViewOnly tableAdded'>" + added + "</td>"));
	row.append($("<td data-label='Aktualisiert' class='expertViewOnly tableEdited'>" + edited + "</td>"));
	row.append($("<td data-label='Aktion' class='expertViewOnly'><a href='javascript:void(0)' onclick='editChange(" + rowData.id + ");'>[B]</a> <a href='javascript:void(0)' onclick='deleteChange(" + rowData.id + ");'>[L]</a></td>"));
}

function editChange(id) {
	window.location.href = '../changes/edit.html?id=' + id;
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
