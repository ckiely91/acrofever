import React, { Component } from "react";
import Meteor, { createContainer } from "react-native-meteor";
import PropTypes from "prop-types";
import { uniq as _uniq, difference as _difference } from "lodash";
import {
  Container,
  Content,
  Text,
  List, 
  ListItem,
  Icon,
  Body, 
  Right,
  Footer,
  FooterTab,
  Button,
  Badge
} from "native-base";
import StandardHeader from "../../components/StandardHeader";
import LobbyGame from "./LobbyGame";
import LobbyChat from "./LobbyChat";
import LobbyScores from "./LobbyScores";
import LobbySettings from "./LobbySettings";

const getUserChatIds = (chats) => {
  const ids = [];
  chats.forEach((c) => {
    if (c.user) {
      ids.push(c._id);
    }
  });
  return ids;
}

class Lobby extends Component {
  static propTypes = {
    lobby: PropTypes.object,
    chats: PropTypes.array.isRequired,
    game: PropTypes.object,
    users: PropTypes.array.isRequired
  };

  constructor(props) {
    super(props);
    this.state = {
      currentTab: "game",
      newChats: 0
    }
  }

  componentWillReceiveProps(nextProps) {
    if (this.state.currentTab !== "chat" && this.props.chats.length > 0) {
      const curChatIds = getUserChatIds(this.props.chats);
      const nextChatIds = getUserChatIds(nextProps.chats);
      const diff = _difference(nextChatIds, curChatIds);
      if (diff.length > 0) {
        this.setState(state => ({
          newChats: state.newChats + diff.length
        }));
      }
    }
  }

  switchTab = (tab) => {
    const newState = { currentTab: tab };
    if (tab === "chat") {
      newState.newChats = 0;
    }
    this.setState(newState);
  }

  render() {
    console.log("lobbyProps", this.props);

    const { id: lobbyId, name: lobbyName } = this.props.navigation.state.params;

    let content;
    switch(this.state.currentTab) {
      case "game":
        content = <LobbyGame />;
        break;
      case "chat":
        content = <LobbyChat lobbyId={lobbyId} chats={this.props.chats} users={this.props.users} />;
        break;
      case "scores":
        content = <LobbyScores scores={this.props.game ? this.props.game.scores : {}} users={this.props.users} />;
        break;
      case "settings":
      default:
        content = <LobbySettings {...this.props.lobby.config} />;
    }

    return (
      <Container>
        <StandardHeader navigation={this.props.navigation} title={lobbyName} />
        {content}
        <Footer>
          <FooterTab>
            <Button vertical active={this.state.currentTab === "game"} onPress={() => this.switchTab("game")}>
              <Icon name="flash" />
              <Text>Game</Text>
            </Button>
            <Button vertical active={this.state.currentTab === "scores"} onPress={() => this.switchTab("scores")}>
              <Icon active name="list" />
              <Text>Scores</Text>
            </Button>
            <Button badge={(this.state.newChats > 0)} vertical active={this.state.currentTab === "chat"} onPress={() => this.switchTab("chat")}>
              {(this.state.newChats > 0) && <Badge><Text>{this.state.newChats}</Text></Badge>}
              <Icon name="chatbubbles" />
              <Text>Chat</Text>
            </Button>
            <Button vertical active={this.state.currentTab === "settings"} onPress={() => this.switchTab("settings")}>
              <Icon name="settings" />
              <Text>Settings</Text>
            </Button>
          </FooterTab>
        </Footer>
      </Container>
    );
  }
}

export default createContainer(({ navigation }) => {
  const lobbyId = navigation.state.params.id;
  Meteor.subscribe("lobbies");
  Meteor.subscribe("lobbyFeed", lobbyId, 20);
  let playerIds = [];

  const data = { 
    lobby: Meteor.collection("lobbies").findOne(lobbyId),
    chats: Meteor.collection("lobbyFeed").find({ lobbyId }, { sort: { timestamp: -1 } })
  }

  if (data.lobby) {
    Meteor.subscribe("currentGame", data.lobby.currentGame);
    data.game = Meteor.collection("games").findOne(data.lobby.currentGame);

    if (data.game && data.game.scores) {
      playerIds = playerIds.concat(Object.keys(data.game.scores));
    }
  }

  if (data.chats) {
    data.chats.forEach((chat) => {
      if (chat.user) {
        playerIds.push(chat.user);
      }
    });
  }

  playerIds = _uniq(playerIds);
  Meteor.subscribe("otherPlayers", playerIds);
  data.users = Meteor.collection("users").find({ _id: { $in: playerIds } });

  return data;
}, Lobby);