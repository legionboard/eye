/*
 * @author	Nico Alt
 * @date	27.07.2016
 *
 * See the file "LICENSE" for the full license governing this code.
 */
// The array containing the courses names
var courses = {};
handleAuthenticationKey(getCourses);

function getCourses() {
	// Hide authentication form
	$("#authenticationForm").hide();
	$.getJSON(appConfig['apiRoot'] + '/courses?k=' + getAuthenticationKey())
	.success(function(data) {
		// Hide authentication form
		$("#authenticationForm").hide();
		// Hide 404 message
		$("#404message").hide();
		// Show table
		$("table").show();
		// Clear table
		$("table tbody").remove();
		// Add table body
		$("table").append("<tbody />");
		drawTable(data);
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
				$("#404message").show();
				scrollTo('.jumbotron');
				break;
			default:
				sweetAlert("Ups...", "Es gab einen Fehler. Bitte versuche es später erneut.", "error");
		}
	});
}

// If a column has content, the key with the name of the column is set to true
var columnHasContent;
function drawTable(data) {
	data.sort(function(a, b) {
		var nameA = a.name.toLowerCase();
		var nameB = b.name.toLowerCase();
		// Sort string ascending
		if (nameA < nameB) {
			return -1;
		}
		if (nameA > nameB) {
			return 1;
		}
		return 0;
	});
	columnHasContent = {};
	for (var i = 0; i < data.length; i++) {
		drawRow(data[i]);
	}
	$(".tableAdded").show();
	if (!columnHasContent['added']) {
		$(".tableAdded").hide();
	}
	$(".tableEdited").show();
	if (!columnHasContent['edited']) {
		$(".tableEdited").hide();
	}
	// Hide border-bottom of last table row
	$('table').find('tr:visible:last').css("border-bottom", "none");
}

function drawRow(rowData) {
	var row = $("<tr />");
	var name = rowData.name;
	var archived = rowData.archived;
	if (archived) {
		archived = '\u2713';
	}
	else {
		archived = '\u2717';
	}
	var added = '-';
	// Only show added if change contains no doubles
	if (rowData.added != '-') {
		columnHasContent['added'] = true;
		added = formatToFullLocal(rowData.added);
	}
	var edited = '-';
	// Only show edited if change contains no doubles
	if (rowData.edited != '-') {
		columnHasContent['edited'] = true;
		edited = formatToFullLocal(rowData.edited);
	}
	$("table tbody").append(row);
	row.append($("<td data-label='Name'>" + name + "</td>"));
	row.append($("<td data-label='Archiviert'>" + archived + "</td>"));
	row.append($("<td data-label='Erstellt' class='tableAdded'>" + added + "</td>"));
	row.append($("<td data-label='Aktualisiert' class='tableEdited'>" + edited + "</td>"));
	row.append($("<td data-label='Aktion'><a href='javascript:void(0)' onclick='editCourse(" + rowData.id + ");'><img alt='Edit' src='../images/circle-edit.png'></a> <a href='javascript:void(0)' onclick='deleteCourse(" + rowData.id + ");'><img alt='Delete' src='../images/circle-delete.png'></a></td>"));
}

function editCourse(id) {
	window.location.href = '../courses/edit.html?id=' + id;
}

function deleteCourse(id) {
	sweetAlert({
		title: "Bist Du Dir sicher?",
		text: 'Willst Du diesen Kurs wirklich löschen?',
		type: "warning",
		showCancelButton: true,
		confirmButtonColor: "#DD6B55",
		confirmButtonText: "Löschen!",
		closeOnConfirm: false
	},
	function() {
		$.ajax({
			url: appConfig['apiRoot'] + '/courses/' + id + '?k=' + getAuthenticationKey(),
			type: 'DELETE'
		})
		.success(function(data, textStatus, xhr) {
			sweetAlert({
				title: "Gelöscht!",
				text: "Der Kurs wurde gelöscht.",
				type: "success"
			},
			function() {
				location.reload();
			});
		})
		.fail(function(jqXHR, textStatus, errorThrown) {
			console.log('Deleting course failed.');
			console.log(jqXHR);
			switch (jqXHR.status) {
				case 401:
					sweetAlert("Ups...", "Du bist nicht dazu berechtigt, Kurse zu löschen.", "error");
					break;
				case 400:
					if (($.parseJSON(jqXHR.responseText))['error'][0]['code'] == 2401) {
						sweetAlert("Ups...", "Der Kurs ist noch mit einer Änderung verknüpft.", "error");
						break;
					}
				default:
					sweetAlert("Ups...", "Es gab einen Fehler. Bitte versuche es später erneut.", "error");
			}
		});
	});
}
