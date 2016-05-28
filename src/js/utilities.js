/*
 * @author	Nico Alt
 * @date	16.03.2016
 *
 * See the file "LICENSE" for the full license governing this code.
 */
var title = appConfig['title'];
setTitle();
var version = '0.1.2';
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
