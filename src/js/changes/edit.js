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
		window.location.href = 'show.html';
	});
	throw new Error("The ID of the change is not given.");
}
var id = getURLParameter('id');
// The array containing the courses names
var courses = {};
// The array containing the teachers names
var teachers = {};

handleAuthenticationKey(getCourses);
initializeDatePicker();

// Submit form by pressing enter
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
		$('#authenticationForm').hide();
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
			if (teacher.length == 0) {
				editChange(null, course, startingDate, startingHour, endingDate, endingHour, coveringTeacher, type, text, reason, privateText);
			}
			for(var i = 0; i < teacher.length; i++) {
				editChange(teacher[i], course, startingDate, startingHour, endingDate, endingHour, coveringTeacher, type, text, reason, privateText);
			}
		}
	}
});

function editChange(teacher, course, startingDate, startingHour, endingDate, endingHour, coveringTeacher, type, text, reason, privateText) {
	$.ajax({
		url: appConfig['apiRoot'] + '/changes/' + id,
		data: {
			k: getAuthenticationKey(),
			teacher: teacher,
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
		},
		type: 'PUT'
	})
	.success(function(data) {
		sweetAlert({
			title: 'Geändert!',
			text: 'Die Änderung wurde erfolgreich bearbeitet.',
			type: 'success'
		},
		function() {
			window.location.href = 'show.html';
		});
	})
	.fail(function(jqXHR, textStatus, errorThrown) {
		console.log('Updating change failed.');
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
		getChange();
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
				$("#teacherDiv").hide();
				getChange();
				break;
			default:
				sweetAlert("Ups...", "Es gab einen Fehler. Bitte versuche es später erneut.", "error");
		}
	});
}

function getChange() {
	// Get change
	$.getJSON(appConfig['apiRoot'] + '/changes/' + id + '?k=' + getAuthenticationKey())
	.success(function(data) {
		insert(data[0]);
		$("#informationForm").show();
		scrollTo("#informationForm");
	})
	.fail(function(jqXHR, textStatus, errorThrown) {
		console.log('Getting change failed.');
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
				sweetAlert("Ups...", "Es gab einen Fehler. Bitte versuche es später erneut.", "error");
		}
	});
}

function addCourses(data) {
	for (var i = 0; i < data.length; i++) {
		// Do not add if course is archived
		if (data[i].archived) {
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

function insert(data) {
	// Set type
	var type = data['type'];
	if (type == '0' || type == '1' || type == '2') {
		document.getElementById('type_' + type).checked = true;
		$('#type_' + type).parent().addClass('active');
	}
	else {
		sweetAlert("Ups...", "Es gab einen Fehler. Bitte versuche es später erneut.", "error");
	}
	// Set teacher
	var teacher = data['teacher'];
	if (teacher != 0) {
		document.getElementById('teacherCheck_' + teacher).checked = true;
		$('#teacherCheck_' + teacher).parent().addClass('active');
		var teacherName = teachers.filter(function(obj) {
				return obj[0] == teacher;
			})[0][1];
		$("#teacherDrop button").text(teacherName);
	}
	// Set covering teacher
	var coveringTeacher = data['coveringTeacher'];
	if (coveringTeacher != 0) {
		document.getElementById('coveringTeacherCheck_' + coveringTeacher).checked = true;
		$('#coveringTeacherCheck_' + coveringTeacher).parent().addClass('active');
		var teacherName = teachers.filter(function(obj) {
				return obj[0] == coveringTeacher;
			})[0][1];
		$("#coveringTeacherDrop button").text(teacherName);
	}
	// Set starting date
	var startingDate = data['startingDate'];
	$('#startingDate').val(startingDate.substring(8, 10) + '.' + startingDate.substring(5, 7) + '.' + startingDate.substring(0, 4));
	// Set starting hour
	$('#startingHour').val(data['startingHour']);
	// Set ending date
	var endingDate = data['endingDate'];
	$('#endingDate').val(endingDate.substring(8, 10) + '.' + endingDate.substring(5, 7) + '.' + endingDate.substring(0, 4));
	// Set ending hour
	$('#endingHour').val(data['endingHour']);
	// Set text
	$('#text').val(data['text']);
	// Set reason
	var reason = data['reason'];
	if (reason == '0' || reason == '1' || reason == '2') {
		document.getElementById('reason_' + reason).checked = true;
		$('#reason_' + reason).parent().addClass('active');
	}
	else if (reason != '' && reason != '-') {
		sweetAlert("Ups...", "Es gab einen Fehler. Bitte versuche es später erneut.", "error");
	}
	// Set privateText
	var privateText = data['privateText'];
	if (privateText != '-') {
		$('#privateText').val(privateText);
	}
}
