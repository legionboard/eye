/*
 * @author	Nico Alt
 * @date	16.03.2016
 *
 * See the file "LICENSE" for the full license governing this code.
 */
handleAuthenticationKey(showInformationForm);
handleSimpleInformationForm(createTeacher);

function createTeacher(name) {
	$.post(appConfig['apiRoot'] + '/teachers',
	{
		k: getAuthenticationKey(),
		name: name
	})
	.success(function(data) {
		$("#authenticationForm").hide();
		sweetAlert({
			title: "Hinzugefügt!",
			text: "Der Lehrer wurde erfolgreich hinzugefügt.",
			type: "success"
		},
		function() {
			$('#name').val('');
		});
	})
	.fail(function(jqXHR, textStatus, errorThrown) {
		$("#authenticationForm").hide();
		console.log('Creating teacher failed.');
		console.log(jqXHR);
		switch (jqXHR.status) {
			case 401:
				deleteAuthenticationKey();
				$("#authenticationForm").show();
				scrollTo("#authenticationForm");
				sweetAlert("Ups...", "Bitte überprüfe Deine Anmeldedaten.", "error");
				break;
			case 400:
				if (($.parseJSON(jqXHR.responseText))['error'][0]['code'] == 301) {
					sweetAlert("Ups...", "Der Lehrer existiert bereits.", "error");
					break;
				}
			default:
				sweetAlert("Ups...", "Es gab einen Fehler. Bitte versuche es später erneut.", "error");
		}
	});
}
