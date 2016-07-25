/*
 * @author	Nico Alt
 * @date	16.03.2016
 *
 * See the file "LICENSE" for the full license governing this code.
 */
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

$('.datepicker').datepicker({
	format: 'dd.mm.yyyy',
	language: "de",
	daysOfWeekHighlighted: '1,2,3,4,5',
	autoclose: true,
	todayHighlight: true
});

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
			// Format to ISO 8601
			startingDate = startingDate.substring(6, 10) + '-' + startingDate.substring(3, 5) + '-' + startingDate.substring(0, 2);
			endingDate = endingDate.substring(6, 10) + '-' + endingDate.substring(3, 5) + '-' + endingDate.substring(0, 2);
			if ((new Date(startingDate)) > (new Date(endingDate))) {
				sweetAlert('Ups...', 'Der Start muss vor dem Ende sein.', 'error');
			}
			else {
				if (teacher.length == 0) {
					createChange(null, startingDate, startingHour, endingDate, endingHour, coveringTeacher, type, text, reason, privateText);
				}
				for(var i = 0; i < teacher.length; i++) {
					createChange(teacher[i], startingDate, startingHour, endingDate, endingHour, coveringTeacher, type, text, reason, privateText);
				}
			}
		}
	}
});

function createChange(teacher, startingDate, startingHour, endingDate, endingHour, coveringTeacher, type, text, reason, privateText) {
	$.post(appConfig['apiRoot'] + '/changes',
	{
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
	})
	.success(function(data) {
		sweetAlert({
			title: 'Hinzugefügt!',
			text: 'Die Änderung wurde erfolgreich hinzugefügt.',
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
		console.log('Creating change failed.');
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
		var row = '<li>' +
					'<input id="teacherCheck_' + teachers[key][0] + '" name="teacherCheck" value="' + teachers[key][0] + '" type="checkbox">' +
					'<label for="teacherCheck_' + teachers[key][0] + '">' + teachers[key][1] + '</label>' +
					'</li>';
		$("#teacherDrop ul").append(row);
	}
	for (var key in teachers) {
		var row = '<li>' +
					'<input id="coveringTeacherCheck_' + teachers[key][0] + '" name="coveringTeacherCheck" value="' + teachers[key][0] + '" type="radio">' +
					'<label for="coveringTeacherCheck_' + teachers[key][0] + '">' + teachers[key][1] + '</label>' +
					'</li>';
		$("#coveringTeacherDrop ul").append(row);
	}
}
