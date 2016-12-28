export const checkValidChatString = Match.Where(function(value) {
	check(value, String);
	return (0 < value.length && value.length < 300);
});

export const emailAddressRegex = /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;

export const checkValidEmail = Match.Where(function(string) {
	check(string, String);
	return emailAddressRegex.test(string);
});