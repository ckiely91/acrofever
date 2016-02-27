const LobbyManager = {
	addSystemMessage(lobbyId, summary, icon, detail) {
		let feedEvent = {
			timestamp: new Date(),
			summary: summary
		};

		if (lobbyId)
			feedEvent.lobbyId = lobbyId;

		if (icon)
			feedEvent.icon = icon;
		else
			feedEvent.icon = "info";

		if (detail)
			feedEvent.detail = detail;

		if (lobbyId) {
			LobbyFeed.insert(feedEvent);
			Lobbies.update(lobbyId, {$currentDate: {lastUpdated: true}});
		} else {
			GlobalFeed.insert(feedEvent);
		}
	}
};

export default LobbyManager;