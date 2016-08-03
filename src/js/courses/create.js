/*
 * @author	Nico Alt
 * @date	27.07.2016
 *
 * See the file "LICENSE" for the full license governing this code.
 */
handleAuthenticationKey(showInformationForm);
handleSimpleInformationForm(createCourse);

function createCourse(name) {
	$.post(appConfig['apiRoot'] + '/courses',
	{
		k: getAuthenticationKey(),
		name: name
	})
	.success(function(data) {
		$("#authenticationForm").hide();
		sweetAlert({
			title: "Hinzugefügt!",
			text: "Der Kurs wurde erfolgreich hinzugefügt.",
			type: "success"
		},
		function() {
			$('#name').val('');
		});
	})
	.fail(function(jqXHR, textStatus, errorThrown) {
		$("#authenticationForm").hide();
		console.log('Creating course failed.');
		console.log(jqXHR);
		switch (jqXHR.status) {
			case 401:
				deleteAuthenticationKey();
				$("#authenticationForm").show();
				scrollTo("#authenticationForm");
				sweetAlert("Ups...", "Bitte überprüfe Deine Anmeldedaten.", "error");
				break;
			case 400:
				if (($.parseJSON(jqXHR.responseText))['error'][0]['code'] == 2301) {
					sweetAlert("Ups...", "Der Kurs existiert bereits.", "error");
					break;
				}
			default:
				sweetAlert("Ups...", "Es gab einen Fehler. Bitte versuche es später erneut.", "error");
		}
	});
}
