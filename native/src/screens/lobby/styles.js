import * as base from "../../styles/base";

export const lobbyGameStyles = {
  text: {
    ...base.text
  },
  italicText: {
    ...base.text,
    fontFamily: base.fonts.openSans.lightItalic
  },
  listItem: {
    height: 60
  },
  gameInfoHeader: {
    padding: 10,
    backgroundColor: base.colors.white
  },
  gameInfoHeaderText: {
    ...base.text,
    fontFamily: base.fonts.openSans.lightItalic,
    fontSize: 14
  },
  countdownText: {
    ...base.text,
    fontFamily: base.fonts.openSans.bold,
    fontSize: 20,
    color: base.colors.black
  },
  acronymText: {
    ...base.text,
    fontFamily: base.fonts.openSans.bold,
    fontSize: 20
  },
  categoryText: {
    ...base.text,
    fontFamily: base.fonts.openSans.lightItalic
  },
  multilineText: {
    ...base.text,
    paddingBottom: 10
  },
  acroInfoText: {
    ...base.text,
    fontFamily: base.fonts.openSans.lightItalic,
    marginTop: 10,
    padding: 10
  },
  phaseHeader: {
    ...base.text,
    fontSize: 20,
    marginTop: 10,
    marginLeft: 10,
    marginRight: 10,
    marginBottom: 5
  },
  badge: {
    backgroundColor: base.colors.black
  },
  scoreText: {
    ...base.text,
    color: base.colors.white
  },
  resultsRow: {
    flex: 1, 
    flexDirection: "column", 
    padding: 10,
    borderBottomColor: base.colors.lightgrey,
    borderBottomWidth: 1
  },
  resultsRowHeader: {
    flex: 1, 
    flexDirection: "row", 
    alignItems: "center"
  },
  resultsRowThumbnail: {
    marginRight: 10
  },
  resultsRowNameContainer: {
    marginRight: 10
  },
  resultsRowName: {
    ...base.text,
    fontSize: 16
  },
  resultsRowNameIcon: {
    fontSize: 16
  },
  resultsRowNameAccolades: {
    ...base.text,
    fontFamily: base.fonts.openSans.lightItalic
  },
  resultsRowVotes: {
    marginLeft: "auto", 
    marginRight: 15
  },
  resultsRowVotesText: {
    ...base.text,
    fontSize: 16
  },
  resultsRowVotesIcon: {
    fontSize: 18
  }
};

export const lobbyScoresStyles = {
  text: {
    ...base.text
  },
  badge: {
    backgroundColor: base.colors.black
  },
  scoreText: {
    ...base.text,
    color: base.colors.white
  },
  listItem: {
    backgroundColor: base.colors.white,
    height: 60
  },
  disabledItem: {
    opacity: 0.5
  }
};

export const lobbyChatStyles = {
  text: {
    ...base.text
  },
  detailText: {
    ...base.noteText,
    fontSize: 14,
    lineHeight: 16,
    marginTop: 5,
    marginLeft: 0
  },
  timeText: {
    ...base.noteText,
    fontSize: 12,
    marginLeft: "auto"
  },
  listItem: {
    backgroundColor: base.colors.white,
    paddingRight: 10,
    marginLeft: 0
  },
  listItemLeft: {
    flex: 0, 
    marginLeft: 0, 
    width: 60, 
    alignSelf: "flex-start", 
    justifyContent: "center"
  },
  listItemBody: {
    flexDirection: "row"
  },
  listItemHeader: {
    flex: 1, 
    paddingRight: 5
  },
  icon: {
    width: 36,
    fontSize: 36,
    textAlign: "center",
    color: base.colors.mediumgrey
  }
};

export default {
  headerButtonText: {
    color: base.colors.white
  },
  text: {
    ...base.text
  },
  listItem: {
    backgroundColor: base.colors.white
  }
};