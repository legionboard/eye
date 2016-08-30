/*
 * @author	Nico Alt
 * @date	27.07.2016
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
	throw new Error("The ID of the course is not given.");
}
var id = getURLParameter('id');
handleAuthenticationKey(getCourse);
handleSimpleInformationForm(editCourse);

function editCourse(name, archived) {
	$.ajax({
		url: appConfig['apiRoot'] + '/courses/' + id,
		data: {
			k: getAuthenticationKey(),
			name: name,
			archived: archived
		},
		type: 'PUT'
	})
	.success(function(data) {
		sweetAlert({
			title: 'Geändert!',
			text: 'Der Kurs wurde erfolgreich geändert.',
			type: 'success'
		},
		function() {
			window.location.href = 'show.html';
		});
	})
	.fail(function(jqXHR, textStatus, errorThrown) {
		console.log('Updating course failed.');
		console.log(jqXHR);
		switch (jqXHR.status) {
			case 401:
				deleteAuthenticationKey();
				$("#authenticationForm").show();
				scrollTo("#authenticationForm");
				sweetAlert("Ups...", "Bitte überprüfe Deine Anmeldedaten.", "error");
				break;
			default:
				sweetAlert('Ups...', 'Es gab einen Fehler. Bitte versuche es später erneut.', 'error');
		}
	});
}

function getCourse() {
	$("#authenticationForm").hide();
	$.getJSON(appConfig['apiRoot'] + '/courses/' + id + '?k=' + getAuthenticationKey())
	.success(function(data) {
	$("#informationForm").show();
		$('#name').val(data[0]['name']);
		$('#archived').prop('checked', (data[0]['archived']) ? true : false);
	})
	.fail(function(jqXHR, textStatus, errorThrown) {
		console.log('Getting courses failed.');
		console.log(jqXHR);
		switch (jqXHR.status) {
			case 401:
				deleteAuthenticationKey();
				$("#authenticationForm").show();
				scrollTo("#authenticationForm");
				sweetAlert("Ups...", "Bitte überprüfe Deine Anmeldedaten.", "error");
				break;
			default:
				sweetAlert("Ups...", "Es gab einen Fehler. Bitte versuche es später erneut.", "error");
		}
	});
}
