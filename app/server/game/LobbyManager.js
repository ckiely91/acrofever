LobbyManager = {};

LobbyManager.addLobbyFeedSystemMessage = function(lobbyId, summary, icon, message) {
	var feedEvent = {
		lobbyId: lobbyId,
		timestamp: new Date(),
		summary: summary,
		type: 'SYSTEM_CHAT_EVENT'
	}

	if (message)
		feedEvent.detail = message;

	LobbyFeed.insert(feedEvent);
	Lobbies.update(lobbyId, {$currentDate: {lastUpdated: true}});
}