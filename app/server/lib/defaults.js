AcroSettingsDefaults = {
  beginner: {
    categoryTimeout: 30000,
    acronymTimeout: 120000,
    votingTimeout: 45000,
    endOfRoundTimeout: 30000,
    hallOfFameTimeout: 120000,
    winnerPoints: 2,
    votedPoints: 1,
    votedForWinnerPoints: 1,
    notVotedNegativePoints: 1,
    minAcroLength: 3,
    maxAcroLength: 7,
    endGamePoints: 25
  },
  expert: {
    categoryTimeout: 30000,
    acronymTimeout: 60000,
    votingTimeout: 30000,
    endOfRoundTimeout: 30000,
    hallOfFameTimeout: 120000,
    winnerPoints: 2,
    votedPoints: 1,
    votedForWinnerPoints: 1,
    notVotedNegativePoints: 1,
    minAcroLength: 3,
    maxAcroLength: 7,
    endGamePoints: 25
  }
};

DefaultLobbies = [
  {
    name: "acro_expert",
    displayName: "Experts (fast rounds)",
    type: "acrofever",
    players: [],
    config: AcroSettingsDefaults.expert,
    currentGame: null,
    official: true
  },
  {
    name: "acro_beginner",
    displayName: "Clean",
    type: "acrofever",
    players: [],
    config: AcroSettingsDefaults.beginner,
    games: [],
    currentGame: null,
    official: true
  },
  {
    name: "acro_general",
    displayName: "General",
    type: "acrofever",
    players: [],
    config: AcroSettingsDefaults.beginner,
    games: [],
    currentGame: null,
    official: true
  }
];
