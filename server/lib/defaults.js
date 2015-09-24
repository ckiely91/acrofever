AcroSettingsDefaults = {
	beginner: {
		categoryTimeout: 30000,
		acronymTimeout: 120000,
		votingTimeout: 45000,
		endOfRoundTimeout: 20000,
		hallOfFameTimeout: 60000,
		winnerPoints: 3,
		votedForWinnerPoints: 1,
		minAcroLength: 3,
		maxAcroLength: 7,
		endGamePoints: 15
	},
	expert: {
		categoryTimeout: 30000,
		acronymTimeout: 120000,
		votingTimeout: 45000,
		endOfRoundTimeout: 20000,
		hallOfFameTimeout: 60000,
		winnerPoints: 3,
		votedForWinnerPoints: 1,
		minAcroLength: 3,
		maxAcroLength: 7,
		endGamePoints: 15
	}
};

OfficialLobbyDefaults = [
	{
		name: "acro_expert",
		displayName: "Experts",
		game: "Acrofever",
		owner: Meteor.settings.adminId,
		players: [],
		config: AcroSettingsDefaults.expert,
		games: []
	},
	{
		name: "acro_beginner",
		displayName: "Beginners",
		game: "Acrofever",
		owner: Meteor.settings.adminId,
		players: [],
		config: AcroSettingsDefaults.beginner,
		games: []
	}
];