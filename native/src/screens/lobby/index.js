import React, { Component } from "react";
import Meteor, { createContainer } from "react-native-meteor";
import PropTypes from "prop-types";
import Sentry from "sentry-expo";
import { uniq as _uniq, difference as _difference } from "lodash";
import { StatusBar } from "react-native";
import {
  Container,
  Text,
  Icon,
  Footer,
  FooterTab,
  Button,
  Badge,
  Toast
} from "native-base";
import StandardHeader from "../../components/StandardHeader";
import LobbyGame from "./LobbyGame";
import LobbyChat from "./LobbyChat";
import LobbyScores from "./LobbyScores";
import LobbySettings from "./LobbySettings";

import { colors } from "../../styles/base";
import styles from "./styles";
import AcrofeverBG from "../../components/AcrofeverBG";

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
    lobbyId: PropTypes.string.isRequired,
    lobbyName: PropTypes.string.isRequired,
    lobby: PropTypes.object,
    chats: PropTypes.array.isRequired,
    game: PropTypes.object,
    users: PropTypes.array.isRequired,
    user: PropTypes.object,
    getMoreChats: PropTypes.func.isRequired
  };

  constructor(props) {
    super(props);
    this.state = {
      currentTab: "game",
      newChats: 0,
      joinLeaveLoading: false
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

  isInLobby = () => {
    return (this.props.lobby && this.props.lobby.players && this.props.lobby.players.indexOf(this.props.user._id) > -1);
  }

  joinOrLeaveLobby = () => {
    this.setState({ joinLeaveLoading: true });
    const isInLobby = this.isInLobby();
    Meteor.call('joinOrLeaveOfficialLobby', this.props.lobby._id, !isInLobby, (err) => {
      this.setState({ joinLeaveLoading: false });
      if (err) {
        Sentry.captureException(new Error("error in joinOrLeaveOfficialLobby: " + err.message));
        Toast.show({
          type: "danger",
          text: isInLobby ? "Failed to leave lobby" : "Failed to join lobby",
          position: "bottom",
          buttonText: "Okay",
          duration: 5000
        });
      }
    });
  }

  switchTab = (tab) => {
    const newState = { currentTab: tab };
    if (tab === "chat") {
      newState.newChats = 0;
    }
    this.setState(newState);
  }

  numPlayers = () => {
    const num = this.props.lobby ? this.props.lobby.players.length : 0;
    if (num === 1) {
      return `1 player`;
    }

    return `${num} players`;
  }

  render() {
    let content;
    switch(this.state.currentTab) {
      case "game":
        content = <LobbyGame lobby={this.props.lobby} game={this.props.game} user={this.props.user} users={this.props.users} />;
        break;
      case "chat":
        content = <LobbyChat lobbyId={this.props.lobbyId} chats={this.props.chats} users={this.props.users} getMoreChats={this.props.getMoreChats} />;
        break;
      case "scores":
        content = <LobbyScores scores={this.props.game ? this.props.game.scores : {}} users={this.props.users} players={this.props.lobby.players || []} />;
        break;
      case "settings":
      default:
        content = <LobbySettings {...this.props.lobby.config} />;
    }

    return (
      <Container>
        <StatusBar barStyle="light-content" backgroundColor={colors.red} />
        <StandardHeader 
          goBack 
          navigation={this.props.navigation} 
          title={this.props.lobbyName}
          subtitle={this.numPlayers()}
          rightContent={(
            <Button 
              transparent
              disabled={this.state.joinLeaveLoading}
              onPress={this.joinOrLeaveLobby}
            >
              <Text style={styles.headerButtonText}>{this.isInLobby() ? "Leave" : "Join"}</Text>
            </Button>
          )}
        />
        <AcrofeverBG>
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
                <Icon name="information-circle" />
                <Text>Info</Text>
              </Button>
            </FooterTab>
          </Footer>
        </AcrofeverBG>
      </Container>
    );
  }
}

const LobbyContainer = createContainer(({ lobbyId, feedLimit }) => {
  Meteor.subscribe("lobbies");
  Meteor.subscribe("lobbyFeed", lobbyId, feedLimit);
  let playerIds = [];

  const data = { 
    lobby: Meteor.collection("lobbies").findOne(lobbyId),
    chats: Meteor.collection("lobbyFeed").find({ lobbyId }, { sort: { timestamp: -1 } }),
    user: Meteor.user()
  }

  if (data.lobby) {
    Meteor.subscribe("currentGame", data.lobby.currentGame);
    data.game = Meteor.collection("games").findOne(data.lobby.currentGame);
    playerIds = playerIds.concat(data.lobby.players);

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

export default class extends Component {
  static propTypes = {
    navigation: PropTypes.object.isRequired
  };

  state = {
    feedLimit: 20
  };

  componentWillReceiveProps(nextProps) {
    if (nextProps.navigation.state.params.id !== this.props.navigation.state.params.id) {
      this.setState({ feedLimit: 20 });
    }
  }

  getMoreChats = () => {
    if (this.state.feedLimit <= 180) {
      this.setState(state => ({ feedLimit: state.feedLimit + 20 }));
    }
  }
  
  render() {
    return (
      <LobbyContainer
        navigation={this.props.navigation}
        lobbyId={this.props.navigation.state.params.id}
        lobbyName={this.props.navigation.state.params.name}
        getMoreChats={this.getMoreChats} 
        feedLimit={this.state.feedLimit} 
      />
    )
  }
}