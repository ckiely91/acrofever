import * as base from "../../styles/base";

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
    // alignItems: "flex-start",
    // justifyContent: "flex-start",
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
    color: base.colors.lightgrey
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