/*
 * @author	Nico Alt
 * @date	16.03.2016
 *
 * See the file "LICENSE" for the full license governing this code.
 */
// The array containing the courses names
var courses = {};
// The array containing the teachers names
var teachers = {};

handleAuthenticationKey(getCourses);
initializeDatePicker();

// Submit information form by pressing enter
$('#informationForm input').keypress(function(event) {
    if (event.which == 13) {
        event.preventDefault();
        $('#informationForm form').submit();
    }
});

$('#informationForm form').on('submit', function(e) {
	// Prevent default action
	e.preventDefault();
	// Get type
	var type = $('input[name="type"]:checked').val();
	// Get teacher
	var teacher = [];
	$('#teacherDrop input:checked').each(function(i) {
		teacher[i] = $(this).val();
	});
	// Get course
	var course = $('input[name="courseCheck"]:checked').val();
	// Get covering teacher
	var coveringTeacher = $('input[name="coveringTeacherCheck"]:checked').val();
	// Get starting date
	var startingDate = $('#startingDate').val().trim();
	// Get starting hour
	var startingHour = $('#startingHour').val().trim();
	// Get ending date
	var endingDate = $('#endingDate').val().trim();
	// Get ending hour
	var endingHour = $('#endingHour').val().trim();
	// Get text
	var text = $('#text').val().trim();
	// Get reason
	var reason = $('input[name="reason"]:checked').val();
	// Get privateText
	var privateText = $('#privateText').val().trim();

	if (type == null || startingDate.length == 0 || endingDate.length == 0 ||
		(type == 1 && coveringTeacher == null) ||
		(type == 2 && text.length == 0)) {
		scrollTo('#informationForm');
		console.log(true);
		sweetAlert('Ups...', 'Bitte überprüfe, ob Du alle Felder ausgefüllt hast!', 'error');
	}
	else {
		// Convert e.g. 4 to 04 but keep e.g. 12 like it is
		if (startingHour.length == 1) {
			startingHour = '0' + startingHour;
		}
		if (endingHour.length == 1) {
			endingHour = '0' + endingHour;
		}
		startingDate = formatToISO(startingDate);
		endingDate = formatToISO(endingDate);
		if ((new Date(startingDate)) > (new Date(endingDate))) {
			sweetAlert('Ups...', 'Der Start muss vor dem Ende sein.', 'error');
		}
		else {
			createChanges(teacher, course, startingDate, startingHour, endingDate, endingHour, coveringTeacher, type, text, reason, privateText);
		}
	}
});

function createChanges(teacher, course, startingDate, startingHour, endingDate, endingHour, coveringTeacher, type, text, reason, privateText) {
	// Array of from requests returned deferred objects
	var deferreds = [];
	if (teacher.length != 0) {
		$.each(teacher, function(index, id){
			$.ajaxSetup({
				async: false
			});
			deferreds.push(
				$.post(appConfig['apiRoot'] + '/changes',
					{
						k: getAuthenticationKey(),
						teacher: id,
						course: course,
						startingDate: startingDate,
						startingHour: startingHour,
						endingDate: endingDate,
						endingHour: endingHour,
						coveringTeacher: coveringTeacher,
						type: type,
						text: text,
						reason: reason,
						privateText: privateText
					})
			);
		});
	}
	else {
		deferreds.push(
			$.post(appConfig['apiRoot'] + '/changes',
				{
					k: getAuthenticationKey(),
					course: course,
					startingDate: startingDate,
					startingHour: startingHour,
					endingDate: endingDate,
					endingHour: endingHour,
					coveringTeacher: coveringTeacher,
					type: type,
					text: text,
					reason: reason,
					privateText: privateText
				})
		);
	}
	$.when.apply($, deferreds).then(function(){
		sweetAlert({
			title: 'Hinzugefügt!',
			text: 'Die Änderungen wurden erfolgreich hinzugefügt.',
			type: 'success'
		},
		function() {
			// Clear fields
			$('#startingDate').val('');
			$('#startingHour').val('');
			$('#endingDate').val('');
			$('#endingHour').val('');
			$('#text').val('');
			$('#privateText').val('');
			location.reload();
		});
	})
	.fail(function(jqXHR, textStatus, errorThrown) {
		console.log('Creating changes failed.');
		console.log(jqXHR);
		switch (jqXHR.status) {
			case 401:
				deleteAuthenticationKey();
				$('#authenticationForm').show();
				scrollTo('#authenticationForm');
				$('#informationForm').hide();
				sweetAlert('Ups...', 'Bitte überprüfe Deine Anmeldedaten.', 'error');
				break;
			default:
				sweetAlert('Ups...', 'Es gab einen Fehler. Bitte versuche es später erneut.', 'error');
		}
	});
}

function getCourses() {
	$("#authenticationForm").hide();
	// Get courses
	$.getJSON(appConfig['apiRoot'] + '/courses?k=' + getAuthenticationKey())
	.success(function(data) {
		getTeachers();
		addCourses(data);
		drawCourses();
	})
	.fail(function(jqXHR, textStatus, errorThrown) {
		console.log('Getting courses failed.');
		console.log(jqXHR);
		switch (jqXHR.status) {
			case 401:
				deleteAuthenticationKey();
				$('#authenticationForm').show();
				scrollTo('#authenticationForm');
				sweetAlert("Ups...", "Bitte überprüfe Deine Anmeldedaten.", "error");
				break;
			case 404:
				$("#courseDiv").hide();
				getTeachers();
				break;
			default:
				sweetAlert("Ups...", "Es gab einen Fehler. Bitte versuche es später erneut.", "error");
		}
	});
}

function getTeachers() {
	// Get teachers
	$.getJSON(appConfig['apiRoot'] + '/teachers?k=' + getAuthenticationKey())
	.success(function(data) {
		$("#informationForm").show();
		scrollTo("#informationForm");
		addTeachers(data);
		drawTeachers();
	})
	.fail(function(jqXHR, textStatus, errorThrown) {
		console.log('Getting teachers failed.');
		console.log(jqXHR);
		switch (jqXHR.status) {
			case 401:
				deleteAuthenticationKey();
				$('#authenticationForm').show();
				scrollTo('#authenticationForm');
				sweetAlert("Ups...", "Bitte überprüfe Deine Anmeldedaten.", "error");
				break;
			case 404:
				$("#informationForm").show();
				scrollTo("#informationForm");
				$("#teacherDiv").hide();
				break;
			default:
				sweetAlert("Ups...", "Es gab einen Fehler. Bitte versuche es später erneut.", "error");
		}
	});
}

function addCourses(data) {
	for (var i = 0; i < data.length; i++) {
		// Do not add if course is archived
		if (data[i].archived == 'true') {
			continue;
		}
		courses[data[i].id] = data[i].name;
	}
}

function drawCourses() {
	var sortable=[];
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
	courses = sortable;
	for (var key in courses) {
		var courseId = courses[key][0];
		var courseName = courses[key][1];
		var row = '<li>' +
					'<input id="courseCheck_' + courseId + '" name="courseCheck" value="' + courseId + '" type="radio">' +
					'<label for="courseCheck_' + courseId + '">' + courseName + '</label>' +
					'</li>';
		$("#courseDrop ul").append(row);
	}
}

function addTeachers(data) {
	for (var i = 0; i < data.length; i++) {
		// Do not add if teacher is archived
		if (data[i].archived == 'true') {
			continue;
		}
		teachers[data[i].id] = data[i].name;
	}
}

function drawTeachers() {
	var sortable=[];
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
	teachers = sortable;
	for (var key in teachers) {
		var teacherId = teachers[key][0];
		var teacherName = teachers[key][1];
		var row = '<li>' +
					'<input id="teacherCheck_' + teacherId + '" name="teacherCheck" value="' + teacherId + '" type="checkbox">' +
					'<label for="teacherCheck_' + teacherId + '">' + teacherName + '</label>' +
					'</li>';
		$("#teacherDrop ul").append(row);
		row = '<li>' +
					'<input id="coveringTeacherCheck_' + teacherId + '" name="coveringTeacherCheck" value="' + teacherId + '" type="radio">' +
					'<label for="coveringTeacherCheck_' + teacherId + '">' + teacherName + '</label>' +
					'</li>';
		$("#coveringTeacherDrop ul").append(row);
	}
}
