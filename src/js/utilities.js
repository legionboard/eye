/*
 * @author	Nico Alt
 * @date	16.03.2016
 *
 * See the file "LICENSE" for the full license governing this code.
 */
var title = appConfig['title'];
setTitle();
var version = '0.2.3';
setVersion();
// Prevent caching in ajax calls
$.ajaxSetup({ cache: false });
// Show loader when first Ajax request is started
$(document).ajaxStart(function() {
	$('.loader').show();
});
// Hide loader when last Ajax request finished
$(document).ajaxStop(function() {
	$('.loader').hide();
});

/*
 * Authentication key
 */
function deleteAuthenticationKey() {
	localStorage.removeItem("authKey");
	deleteCookie('authKey');
}
function getAuthenticationKey() {
	if (isLocalStorageNameSupported()) {
		try {
			var authKey = localStorage.authKey;
			if (authKey !== undefined && authKey.length !== 0) {
				return authKey;
			}
			authKey = getCookie('authKey');
			if (authKey !== undefined && authKey.length !== 0) {
				setAuthenticationKey(authKey);
			}
			return authKey;
		}
		catch (error) {
			console.log(error);
		}
	}
	return getCookie('authKey');
}

function setAuthenticationKey(authKey) {
	if (isLocalStorageNameSupported()) {
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

function handleAuthenticationKey(callback) {
	var authKey = getAuthenticationKey();
	if (authKey !== undefined && authKey.length !== 0) {
		callback();
	}
	$('#authenticationForm form').on('submit', function(e) {
		// Prevent default action
		e.preventDefault();
		// Get username
		var username = $('#username').val().trim().toLowerCase();
		// Get password
		var password = $('#password').val().trim();
		// Check if fields are not empty
		if (username.length !== 0 && password.length !== 0) {
			authKey = getHash(username, password);
			setAuthenticationKey(authKey);
			callback();
		}
		else {
			// Show authentication form
			$("#authenticationForm").show();
			// Hide table
			$("table").hide();
			sweetAlert("Ups...", "Bitte überprüfe, ob Du alle Felder ausgefüllt hast!", "error");
		}
	});
}

/*
 * Cookies
 */

function setCookie(cname, cvalue) {
	var d = new Date();
	var exdays = 1000;
	d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 100000));
	var expires = "expires=" + d.toUTCString();
	document.cookie = cname + "=" + cvalue + "; " + expires;
}

function getCookie(cname) {
	var name = cname + "=";
	var ca = document.cookie.split(';');
	for (var i = 0; i < ca.length; i++) {
		var c = ca[i];
		while (c.charAt(0) == ' ') {
			c = c.substring(1);
		}
		if (c.indexOf(name) == 0) {
			return c.substring(name.length, c.length);
		}
	}
	return '';
}

function deleteCookie(cname) {
	document.cookie = cname + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC";
}

function isLocalStorageNameSupported() {
    var testKey = 'testAuthKey';
    var testContent = 'abcdef0123456789';
    try {
        localStorage.setItem(testKey, testContent);
        return testKey in localStorage && localStorage[testKey];
    }
    catch (error) {
        console.log(error);
        return false;
    }
}

/*
 * Dates
 */

/**
 * Format from dd.mm.yyyy to yyyy-mm-dd (ISO 8601)
 */
function formatToISO(date) {
	return date.substring(6, 10) + '-' + date.substring(3, 5) + '-' + date.substring(0, 2);
}

/**
 * Format from yyyy-mm-dd (ISO 8601) to dd.mm.yyyy
 */
function formatToLocal(date) {
	return date.substring(8, 10) + "." + date.substring(5, 7) + "." + date.substring(2, 4);
}

/**
 * Format from yyyy-mm-dd (ISO 8601) to dd.mm.yyyy (with leading zeros being deleted)
 */
function formatToShortLocal(date) {
	date =
		date.substring(8, 10).replace(/^0+/, '') +
		"." +
		date.substring(5, 7).replace(/^0+/, '') +
		"." +
		date.substring(2, 4);
	return date;
}

/**
 * Format from yyyy-mm-dd HH-MM-SS (ISO 8601) to dd.mm.yyyy HH-MM-SS
 */
function formatToFullLocal(date) {
	return date.substring(8, 10) + "." + date.substring(5, 7) + "." + date.substring(0, 4) + " " + date.substring(11, 19);
}

/**
 * Returns short form of weekday (Mo, Di, ..)
 */
function getWeekDay(date) {
	date = new Date(date);
	var days = ['So','Mo','Di','Mi','Do','Fr','Sa'];
	return days[date.getDay()];
}

/**
 * Returns long form of weekday (Montag, Dienstag, ..)
 */
function getFullWeekDay(date) {
	date = new Date(date);
	var days = ['Sonntag','Montag','Dienstag','Mittwoch','Donnerstag','Freitag','Samstag'];
	return days[date.getDay()];
}

/**
 * Returns true if date is in the current week
 */
function isInCurrentWeek(dateString) {
	var date = new Date(dateString);

	var today = new Date();
	today.setHours(0);
	today.setMinutes(0);
	today.setSeconds(0);
	var dayOfWeek = today.getDay();
	var diffToLastMonday = today.getDate() - dayOfWeek + (dayOfWeek == 0 ? -6 : 1);
	var diffToNextSunday = today.getDate() - dayOfWeek + (dayOfWeek == 0 ? 0 : 7);

	var lastMonday = new Date(today.setDate(diffToLastMonday));
	var nextSunday = new Date(today.setDate(diffToNextSunday));
	return date >= lastMonday && date <= nextSunday;
}

/*
 * Hashing
 */

function getHash(username, password) {
	var shaObj = new jsSHA("SHA-256", "TEXT");
	shaObj.update(username + '//' + password);
	return shaObj.getHash("HEX");
}

/*
 * Miscellaneous
 */
function initializeDatePicker() {
	$('.datepicker').datepicker({
		format: "dd.mm.yyyy",
		todayBtn: "linked",
		language: "de",
		daysOfWeekHighlighted: "1,2,3,4,5",
		autoclose: true,
		todayHighlight: true
	});
}

function scrollTo(element) {
	$('html, body').animate({ scrollTop: ($(element).offset().top) - 55}, 'slow');
}

function getURLParameter(sParam) {
	var sPageURL = window.location.search.substring(1);
	var sURLVariables = sPageURL.split('&');
	for (var i = 0; i < sURLVariables.length; i++) {
		var sParameterName = sURLVariables[i].split('=');
		if (sParameterName[0] == sParam) {
			return sParameterName[1];
		}
	}
}

function getISODate(dayOffSet) {
	var d = new Date();
	d.setDate(d.getDate() + dayOffSet);
	var day = d.getDate().toString();
	day = (2 - day.length > 0) ? new Array(2 + 1 - day.length).join('0') + day : day;
	var month = (d.getMonth() + 1).toString();
	month = (2 - month.length > 0) ? new Array(2 + 1 - month.length).join('0') + month : month;
	var year = d.getFullYear();
	var date = year + '-' + month + '-' + day;
	return date;
}

function logout() {
	localStorage.removeItem("authKey");
	deleteCookie('authKey');
	localStorage.removeItem("filteredTeachers");
	deleteCookie('filteredTeachers');
	localStorage.removeItem("filteredCourses");
	deleteCookie('filteredCourses');
}

function setTitle() {
	var origTit = document.title;
	var space = origTit.length > 0 ? ' - ' : '';
	document.title = origTit + space + title;
	$('.title').text(title);
}

function setVersion() {
	$('.versionParagraph').show();
	$('.version').text(version);
}

function handleSimpleInformationForm(callback) {
	$('#informationForm form').on('submit', function(e) {
		// Prevent default action
		e.preventDefault();
		// Get name
		var name = $('#name').val().trim();
		var archived = $('#archived').is(':checked');
		if (name.length != 0) {
			callback(name, archived);
		}
		else {
			sweetAlert("Ups...", "Du musst einen Namen angeben.", "error");
		}
	});
}

function showInformationForm() {
	$("#authenticationForm").hide();
	$("#informationForm").show();
}
