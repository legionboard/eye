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
		window.location.href = 'index.html';
	});
	throw new Error("The ID of the change is not given.");
}
// ID of the change
var id = getURLParameter('id');
// The array containing the teachers names
var teachers = {};
// The authentication key
var authKey = getAuthenticationKey();
if (authKey != null && authKey != '') {
	getTeachers();
}
else {
	// Show key form
	$('#keyForm').show();
	// Hide changes form
	$('#changeForm').hide();
}

// Submit form by pressing enter
$('input').keypress(function(event) {
    if (event.which == 13) {
        event.preventDefault();
        $('form').submit();
    }
});

initializeDatePicker();

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
	if ($('#changeForm').is(':hidden')) {
		if (username.length != 0 && password.length != 0) {
			getTeachers();
		}
		else {
			// Show key form
			$('#keyForm').show();
			scrollTo('#keyForm');
			sweetAlert('Ups...', 'Bitte überprüfe, ob Du alle Felder ausgefüllt hast!', 'error');
		}
	}
	else {
		// Get type
		var type = $('input[name="type"]:checked').val();
		// Get teacher
		var teacher = [];
		$(':checkbox:checked').each(function(i) {
			teacher[i] = $(this).val();
		});
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
			scrollTo('#changeForm');
			// Hide key form
			$('#keyForm').hide();
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
					editChange(null, startingDate, startingHour, endingDate, endingHour, coveringTeacher, type, text, reason, privateText);
				}
				for(var i = 0; i < teacher.length; i++) {
					editChange(teacher[i], startingDate, startingHour, endingDate, endingHour, coveringTeacher, type, text, reason, privateText);
				}
			}
		}
	}
});

function editChange(teacher, startingDate, startingHour, endingDate, endingHour, coveringTeacher, type, text, reason, privateText) {
	$.ajax({
		url: appConfig['apiRoot'] + '/changes/' + id,
		data: {
			k: authKey,
			teacher: teacher,
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
			window.location.href = 'index.html';
		});
	})
	.fail(function(jqXHR, textStatus, errorThrown) {
		console.log('Updating change failed.');
		console.log(jqXHR);
		switch (jqXHR.status) {
			case 401:
				// Show key form
				$('#keyForm').show();
				scrollTo('#keyForm');
				// Hide changes form
				$('#changeForm').hide();
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

function getTeachers() {
	// Hide form
	$('form').hide();
	// Get teachers
	$.getJSON(appConfig['apiRoot'] + '/teachers?k=' + authKey)
	.done(function() {
		// Show form
		$('form').show();
	})
	.success(function(data) {
		addTeachers(data);
		// Hide key form
		$("#keyForm").hide();
		// Show changes form
		$("#changeForm").show();
		scrollTo("#changeForm");
		drawTeachers();
		getChange();
	})
	.fail(function(jqXHR, textStatus, errorThrown) {
		console.log('Getting teachers failed.');
		console.log(jqXHR);
		switch (jqXHR.status) {
			case 401:
				// Show key form
				$("#keyForm").show();
				scrollTo("#keyForm");
				// Hide changes form
				$("#changeForm").hide();
				localStorage.removeItem("authKey");
				deleteCookie('authKey');
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

function getChange() {
	// Get change
	$.getJSON(appConfig['apiRoot'] + '/changes/' + id + '?k=' + authKey)
	.success(function(data) {
		insert(data[0]);
	})
	.fail(function(jqXHR, textStatus, errorThrown) {
		console.log('Getting change failed.');
		console.log(jqXHR);
		switch (jqXHR.status) {
			case 401:
				// Show key form
				$("#keyForm").show();
				scrollTo("#keyForm");
				// Hide changes form
				$("#changeForm").hide();
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
	}
	for (var key in teachers) {
		var teacherId = teachers[key][0];
		var teacherName = teachers[key][1];
		var row = '<li>' +
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
