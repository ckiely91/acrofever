checkValidChatString = Match.Where(function(value) {
	check(value, String);
	return (0 < value.length && value.length < 300);
});