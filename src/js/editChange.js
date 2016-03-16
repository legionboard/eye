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
var authKey = '';
if (typeof(Storage) !== 'undefined') {
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
		if (typeof(Storage) !== 'undefined') {
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
		// Get startBy day
		var startByDay = $('#startByDay').val().trim();
		// Get startBy hour
		var startByHour = $('#startByHour').val().trim();
		// Get endBy day
		var endByDay = $('#endByDay').val().trim();
		// Get endBy hour
		var endByHour = $('#endByHour').val().trim();
		// Get text
		var text = $('#text').val().trim();
		// Get reason
		var reason = $('input[name="reason"]:checked').val();
		// Get privateText
		var privateText = $('#privateText').val().trim();

		if (type == null || teacher.length == 0 || startByDay.length == 0 || endByDay.length == 0 ||
			(type == 1 && coveringTeacher == null) ||
			(type == 2 && text.length == 0)) {
			scrollTo('#changeForm');
			// Hide key form
			$('#keyForm').hide();
			sweetAlert('Ups...', 'Bitte überprüfe, ob Du alle Felder ausgefüllt hast!', 'error');
		}
		else {
			if (startByHour.length == 0) {
				startByHour = '0';
			}
			if (endByHour.length == 0) {
				endByHour = '20';
			}
			// Convert e.g. 4 to 04 but keep e.g. 12 like it is
			startByHour = (2 - startByHour.length > 0) ? new Array(2 + 1 - startByHour.length).join('0') + startByHour : startByHour;
			endByHour = (2 - endByHour.length > 0) ? new Array(2 + 1 - endByHour.length).join('0') + endByHour : endByHour;
			// Format to ISO 8601
			startByDay = startByDay.substring(6, 10) + '-' + startByDay.substring(3, 5) + '-' + startByDay.substring(0, 2);
			endByDay = endByDay.substring(6, 10) + '-' + endByDay.substring(3, 5) + '-' + endByDay.substring(0, 2);
			if ((new Date(startByDay)) > (new Date(endByDay))) {
				sweetAlert('Ups...', 'Der Start muss vor dem Ende sein.', 'error');
			}
			else {
				var startBy = startByDay + 'T' + startByHour;
				var endBy = endByDay + 'T' + endByHour;
				for(var i = 0; i < teacher.length; i++) {
					editChange(teacher[i], startBy, endBy, coveringTeacher, type, text, reason, privateText);
				}
			}
		}
	}
});

function editChange(teacher, startBy, endBy, coveringTeacher, type, text, reason, privateText) {
	$.ajax({
		url: appConfig['apiRoot'] + '/changes/' + id,
		data: {
			k: authKey,
			teacher: teacher,
			startBy: startBy,
			endBy: endBy,
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
			text: 'Die Änderung wurde erfolgreich geändert.',
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
	// Get teachers
	$.getJSON(appConfig['apiRoot'] + '/teachers?k=' + authKey)
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

function insert(data) {
	// Set type
	if (data['type'] == '0' || data['type'] == '1' || data['type'] == '2') {
		document.getElementById('type_' + data['type']).checked = true;
		$('#type_' + data['type']).parent().addClass('active');
	}
	else {
		sweetAlert("Ups...", "Es gab einen Fehler. Bitte versuche es später erneut.", "error");
	}
	// Set teacher
	document.getElementById('teacherCheck_' + data['teacher']).checked = true;
	$('#teacherCheck_' + data['teacher']).parent().addClass('active');
	var teacherName = teachers.filter(function(obj) {
			return obj[0] == data['teacher'];
		})[0][1];
	$("#teacherDrop button").text(teacherName);
	// Set covering teacher
	if (data['coveringTeacher'] != 0) {
		document.getElementById('coveringTeacherCheck_' + data['coveringTeacher']).checked = true;
		$('#coveringTeacherCheck_' + data['coveringTeacher']).parent().addClass('active');
		var teacherName = teachers.filter(function(obj) {
				return obj[0] == data['coveringTeacher'];
			})[0][1];
		$("#coveringTeacherDrop button").text(teacherName);
	}
	// Set startBy
	var startBy = data['startBy'];
	// Day
	$('#startByDay').val(startBy.substring(8, 10) + '.' + startBy.substring(5, 7) + '.' + startBy.substring(0, 4));
	// Hour
	if (startBy.substring(11, 13) != '00') {
		$('#startByHour').val(startBy.substring(11, 13));
	}
	// Set endBy
	var endBy = data['endBy'];
	// Day
	$('#endByDay').val(endBy.substring(8, 10) + '.' + endBy.substring(5, 7) + '.' + endBy.substring(0, 4));
	// Hour
	if (endBy.substring(11, 13) != '20') {
		$('#endByHour').val(endBy.substring(11, 13));
	}
	// Set text
	$('#text').val(data['text']);
	// Set reason
	if (data['reason'] == '0' || data['reason'] == '1' || data['reason'] == '2') {
		document.getElementById('reason_' + data['reason']).checked = true;
		$('#reason_' + data['reason']).parent().addClass('active');
	}
	else if (data['reason'] != '' && data['reason'] != '-') {
		sweetAlert("Ups...", "Es gab einen Fehler. Bitte versuche es später erneut.", "error");
	}
	// Set privateText
	if (data['privateText'] != '-') {
		$('#privateText').val(data['privateText']);
	}
}
