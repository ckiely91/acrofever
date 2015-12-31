LobbyManager = {};

LobbyManager.addSystemMessage = function(lobbyId, title, icon, message) {
	var setObj = {
		lobbyId: lobbyId,
		type: 'system',
		timestamp: new Date(),
		title: title
	}

	if (icon)
		setObj.icon = icon;

	if (message)
		setObj.message = message;

	LobbyChat.insert(setObj);
	Lobbies.update(lobbyId, {$currentDate: {lastUpdated: true}});
}