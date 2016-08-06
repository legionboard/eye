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
handleAuthenticationKey(getTeachers);
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
	$('#teacherDrop input:checked').each(function(i) {
		teacher[i] = $(this).val();
	});
	// Get course
	var course = [];
	$('#courseDrop input:checked').each(function(i) {
		course[i] = $(this).val();
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
			setAuthenticationKey(getHash(username, password));
		}
		if (startByIsNotEmpty && endByIsNotEmpty) {
			startBy = formatToISO(startBy);
			endBy = formatToISO(endBy);
			if ((new Date(startBy)) > (new Date(endBy))) {
				sweetAlert("Ups...", "Der Start muss vor dem Ende sein.", "error");
			}
			else {
				getChanges(startBy, endBy, teacher, course);
			}
		}
		else if (startByIsNotEmpty) {
			startBy = formatToISO(startBy);
			getChanges(startBy, null, teacher, course);
		}
		else if (endByIsNotEmpty) {
			endBy = formatToISO(endBy);
			getChanges(null, endBy, teacher, course);
		}

	}
});
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

initializeDatePicker();
$('#startByPicker').datepicker('update', "0");
$('#endByPicker').datepicker('update', "+7d");

function getTeachers() {
	// Hide authentication form
	$("#authenticationForm").hide();
	// Get teachers
	$.getJSON(appConfig['apiRoot'] + '/teachers?k=' + getAuthenticationKey())
	.success(function(data) {
		addTeachers(data);
		drawTeachers();
		getCourses();
	})
	.fail(function(jqXHR, textStatus, errorThrown) {
		if (jqXHR.status == 404) {
			$("#teacherDrop").hide();
			// Having no teachers is fine as changes do not need to reference one
			getCourses();
		}
		else {
			console.log('Getting teachers failed.');
			console.log(jqXHR);
			if (jqXHR.status == 401) {
				// Show authentication form
				$("#authenticationForm").show();
				// Hide changes table
				$("table").hide();
				localStorage.removeItem("authKey");
				deleteCookie('authKey');
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
	$("#authenticationForm").hide();
	// Get courses
	$.getJSON(appConfig['apiRoot'] + '/courses?k=' + getAuthenticationKey())
	.success(function(data) {
		addCourses(data);
		drawCourses();
		getChanges();
	})
	.fail(function(jqXHR, textStatus, errorThrown) {
		if (jqXHR.status == 404) {
			$("#courseDrop").hide();
			// Having no courses is fine as changes do not need to reference one
			getChanges();
		}
		else {
			console.log('Getting courses failed.');
			console.log(jqXHR);
			if (jqXHR.status == 401) {
				// Show authentication form
				$("#authenticationForm").show();
				// Hide changes table
				$("table").hide();
				localStorage.removeItem("authKey");
				deleteCookie('authKey');
				sweetAlert("Ups...", "Bitte überprüfe Deine Anmeldedaten.", "error");
			}
			else {
				sweetAlert("Ups...", "Es gab einen Fehler. Bitte versuche es später erneut.", "error");
			}
		}
	});
}

function getChanges(startBy, endBy, teacher, course) {
	startBy = (startBy != null) ? startBy : 'now';
	endBy = (endBy != null) ? endBy : 'i1w';
	if (teacher != null && teacher[0] == null) {
		teacher = null;
	}
	// Get changes
	$.getJSON(appConfig['apiRoot'] + '/changes?k=' + getAuthenticationKey() + '&startBy=' + startBy + '&endBy=' + endBy + ((teacher != null) ? ('&teachers=' + teacher) : '') + ((course != null) ? ('&courses=' + course) : ''))
	.success(function(data) {
		// Hide authentication form
		$("#authenticationForm").hide();
		// Hide 404 message
		$("#404message").hide();
		// Show changes table
		$("table").show();
		// Clear table
		$("table tbody").remove();
		// Add table body
		$("table").append("<tbody />");
		// Show changes form
		$("#changesForm").show();
		drawTable(data);
	})
	.fail(function(jqXHR, textStatus, errorThrown) {
		console.log('Getting changes failed.');
		console.log(jqXHR);
		if (jqXHR.status == 401) {
			// Show authentication form
			$("#authenticationForm").show();
			// Hide changes table
			$("table").hide();
			localStorage.removeItem("authKey");
			deleteCookie('authKey');
			sweetAlert("Ups...", "Bitte überprüfe Deine Anmeldedaten.", "error");
		}
		else if (jqXHR.status == 404) {
			// Hide changes table
			$("table").hide();
			// Show changes form
			$("#changesForm").show();
			// Show 404 message
			$("#404message").show();
			scrollTo('.jumbotron');
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
	$("#teacherDrop").show();
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
	$("#courseDrop").show();
}

// If a column has content, the key with the name of the column is set to true
var columnHasContent;
// Array index numbers of double changes (changes with same data except teacher/course)
var doubles;
// Changes IDs that are shown within other changes
var alreadyShown;

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
				leftArray.course +
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
				rightArray.course +
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
	columnHasContent = {};
	for (var i = 0; i < data.length; i++) {
		if (!alreadyShown[data[i].id]) {
			drawRow(data[i], data);
		}
	}
	// Show actions only when requested
	if (viewMode != 'expert') {
		$(".expertViewOnly").hide();
	}
	// Show columns only when available
	$(".tableReason").show();
	if (!columnHasContent['reason']) {
		$(".tableReason").hide();
	}
	$(".tablePrivateText").show();
	if (!columnHasContent['privateText']) {
		$(".tablePrivateText").hide();
	}
	$(".tableAdded").show();
	if (!columnHasContent['added']) {
		$(".tableAdded").hide();
	}
	$(".tableEdited").show();
	if (!columnHasContent['edited']) {
		$(".tableEdited").hide();
	}
	$(".tableTeacher").show();
	if (!columnHasContent['teacher']) {
		$(".tableTeacher").hide();
	}
	$(".tableCourse").show();
	if (!columnHasContent['course']) {
		$(".tableCourse").hide();
	}
	$(".tableHours").show();
	if (!columnHasContent['hours']) {
		$(".tableHours").hide();
	}
	$(".tableCoveringTeacher").show();
	if (!columnHasContent['coveringTeacher']) {
		$(".tableCoveringTeacher").hide();
	}
	$(".tableText").show();
	if (!columnHasContent['text']) {
		$(".tableText").hide();
	}
	// Hide last border-bottom of each table row
	$('table tr').find('td:visible:last').css("border-bottom", "none");
	// Hide border-bottom of last table row
	$('table').find('tr:visible:last').css("border-bottom", "none");
	scrollTo('table');
}

function drawRow(rowData, allData) {
	var row = $("<tr />");
	var teacher = '-';
	if (rowData.teacher != '0') {
		columnHasContent['teacher'] = true;
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
		columnHasContent['course'] = true;
		course = courses[rowData.course];
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
		columnHasContent['coveringTeacher'] = true;
		coveringTeacher = teachers[rowData.coveringTeacher];
	}
	var text = "-";
	if (rowData.text != '') {
		columnHasContent['text'] = true;
		text = rowData.text;
	}
	var reason = '-';
	if (rowData.reason == '0') {
		columnHasContent['reason'] = true;
		reason = 'Krank';
	}
	if (rowData.reason == '1') {
		columnHasContent['reason'] = true;
		reason = 'Dienstlich';
	}
	if (rowData.reason == '2') {
		columnHasContent['reason'] = true;
		reason = 'Beurlaubt';
	}
	var privateText = '-';
	if (rowData.privateText != '-' && rowData.privateText != '') {
		columnHasContent['privateText'] = true;
		privateText = rowData.privateText;
	}
	// Hide hour if it's 00
	var startingHour = rowData.startingHour;
	// Hide hour if it's 20
	var endingHour = rowData.endingHour;
	var hours = '-';
	if (startingHour != '' || endingHour != '') {
		columnHasContent['hours'] = true;
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
		columnHasContent['added'] = true;
		added = formatToFullLocal(rowData.added);
	}
	var edited = '-';
	// Only show edited if change contains no doubles
	if (rowData.edited != '-' && !(rowData.id in doubles) && rowData.edited != "0000-00-00 00:00:00") {
		columnHasContent['edited'] = true;
		edited = formatToFullLocal(rowData.edited);
	}
	var ids = rowData.id;
	if (rowData.id in doubles) {
		doubles[rowData.id].split(',').forEach(function(entry) {
			ids += "," + allData[entry].id;
		});
	}
	$("table tbody").append(row);
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
	var actionRow = "<td data-label='Aktion' class='expertViewOnly'>" +
						// Hide edit if change contain doubles
						"<a href='javascript:void(0)' onclick='editChange(" + rowData.id + ");'" + ((rowData.id in doubles) ? "hidden" : "") + ">" +
							"<img alt='Edit' src='../images/circle-edit.png'>" +
						"</a>" +
						"<a href='javascript:void(0)' onclick='deleteChanges(\"" + ids + "\");'>" +
							"<img alt='Delete' src='../images/circle-delete.png'>" +
						"</a>" +
					"</td>";
	row.append($(actionRow));
}

function editChange(id) {
	window.location.href = '../changes/edit.html?id=' + id;
}

function deleteChanges(ids) {
	sweetAlert({
		title: "Bist Du Dir sicher?",
		text: 'Willst Du diese Änderungen wirklich löschen?',
		type: "warning",
		showCancelButton: true,
		confirmButtonColor: "#DD6B55",
		confirmButtonText: "Löschen!",
		closeOnConfirm: false
	},
	function() {
		ids = ids.split(',');
		// Array of from requests returned deferred objects
		var deferreds = [];
		// For each ID
		$.each(ids, function(index, id){
			deferreds.push(
				// Request DELETE of ID
				$.ajax({
					url: appConfig['apiRoot'] + '/changes/' + id + '?k=' + getAuthenticationKey(),
					type: 'DELETE',
					async: false
				})
			);
		});
		$.when.apply($, deferreds).then(function(){
			sweetAlert({
				title: "Gelöscht!",
				text: "Die Änderungen wurden erfolgreich gelöscht.",
				type: "success"
			},
			function() {
				location.reload();
			});
		})
		.fail(function(jqXHR, textStatus, errorThrown) {
			console.log('Deleting changes failed.');
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
