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
	throw new Error("The ID of the teacher is not given.");
}
var id = getURLParameter('id');
handleAuthenticationKey(getTeacher);
handleSimpleInformationForm(editTeacher);

function editTeacher(name, archived) {
	$.ajax({
		url: appConfig['apiRoot'] + '/teachers/' + id,
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
			text: 'Der Lehrer wurde erfolgreich geändert.',
			type: 'success'
		},
		function() {
			window.location.href = 'show.html';
		});
	})
	.fail(function(jqXHR, textStatus, errorThrown) {
		console.log('Updating teacher failed.');
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

function getTeacher() {
	$("#authenticationForm").hide();
	$.getJSON(appConfig['apiRoot'] + '/teachers/' + id + '?k=' + getAuthenticationKey())
	.success(function(data) {
		$("#informationForm").show();
		$('#name').val(data[0]['name']);
		$('#archived').prop('checked', (data[0]['archived']) ? true : false);
	})
	.fail(function(jqXHR, textStatus, errorThrown) {
		console.log('Getting teachers failed.');
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
