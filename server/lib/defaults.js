AcroSettingsDefaults = {
	beginner: {
		categoryTimeout: 30000,
		acronymTimeout: 120000,
		votingTimeout: 45000,
		endOfRoundTimeout: 20000,
		hallOfFameTimeout: 60000,
		winnerPoints: 2,
		votedPoints: 1,
		votedForWinnerPoints: 1,
		notVotedNegativePoints: 1,
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
		winnerPoints: 2,
		votedPoints: 1,
		votedForWinnerPoints: 1,
		notVotedNegativePoints: 1,
		minAcroLength: 3,
		maxAcroLength: 7,
		endGamePoints: 15
	}
};

DefaultLobbies = [
	{
		name: "acro_expert",
		displayName: "Experts",
		type: "acrofever",
		players: [],
		config: AcroSettingsDefaults.expert,
		currentGame: null,
		official: true
	},
	{
		name: "acro_beginner",
		displayName: "Beginners",
		type: "acrofever",
		players: [],
		config: AcroSettingsDefaults.beginner,
		games: [],
		currentGame: null,
		official: true
	}
];