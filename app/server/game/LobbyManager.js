LobbyManager = {};

LobbyManager.addSystemMessage = function(lobbyId, summary, icon, detail) {
	var feedEvent = {
		lobbyId: lobbyId,
		timestamp: new Date(),
		summary: summary,
	}

	if (icon)
		feedEvent.icon = icon;
	else
		feedEvent.icon = "info"

	if (detail)
		feedEvent.detail = detail;

	LobbyFeed.insert(feedEvent);
	Lobbies.update(lobbyId, {$currentDate: {lastUpdated: true}});
}