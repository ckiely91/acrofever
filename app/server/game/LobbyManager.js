LobbyManager = {};

LobbyManager.addSystemMessage = function(lobbyId, summary, icon, detail) {
	var feedEvent = {
		timestamp: new Date(),
		summary: summary,
	}

	if (lobbyId)
		feedEvent.lobbyId = lobbyId;

	if (icon)
		feedEvent.icon = icon;
	else
		feedEvent.icon = "info"

	if (detail)
		feedEvent.detail = detail;

	if (lobbyId) {
		LobbyFeed.insert(feedEvent);
		Lobbies.update(lobbyId, {$currentDate: {lastUpdated: true}});
	} else {
		GlobalFeed.insert(feedEvent);
	}
}