import React, { Component, PureComponent } from "react";
import Meteor from "react-native-meteor";
import PropTypes from "prop-types";
import { get as _get } from "lodash";
import { ScrollView } from "react-native";
import {
  View,
  Content,
  Spinner,
  Text,
  Button,
  Item,
  Left,
  Body,
  Right,
  Toast,
  Card,
  CardItem,
  H2,
  Thumbnail
} from "native-base";
import moment from "moment";

import GameCategoryPhase from "./GameCategoryPhase";
import GameAcroPhase from "./GameAcroPhase";
import GameVotingPhase from "./GameVotingPhase";
import GameEndRoundPhase from "./GameEndRoundPhase";
import GameEndGamePhase from "./GameEndGamePhase";

import { now } from "../../timesync";
import { getUserById, profilePicture, displayName } from "../../helpers";

const GameViewSwitcher = ({ lobby, game, users, user }) => {
  const currentRound = game.rounds[game.currentRound - 1];
  const currentUserIsInRound = !!currentRound.players[user._id];

  switch(game.currentPhase) {
    case "category":
      return (
        <GameCategoryPhase
          gameId={game._id}
          currentRound={currentRound}
          userId={user._id}
          categoryChooserUser={getUserById(users, currentRound.categoryChooser)}
        />
      );
    case "acro":
      return (
        <GameAcroPhase
          gameId={game._id}
          currentUserIsInRound={currentUserIsInRound}
          submittedAcro={_get(currentRound, `players.${user._id}.submission.acro`)}
        />
      );
    case "voting":
      return (
        <GameVotingPhase
          gameId={game._id}
          userId={user._id}
          currentUserIsInRound={currentUserIsInRound}
          currentRound={currentRound}
        />
      );
    case "endround":
      return (
        <GameEndRoundPhase
          currentRound={currentRound}
          users={users}
          userId={user._id}
        />
      );
    case "endgame":
      return (
        <GameEndGamePhase
          currentRound={currentRound}
          rounds={game.rounds}
          scores={game.scores}
          winner={game.gameWinner}
          users={users}
          userId={user._id}
        />
      );
    default:
      return (
        <View><Text>Phase not implemented</Text></View>
      );
  }
}

class GameInfoHeader extends PureComponent {
  static propTypes = {
    lobbyId: PropTypes.string.isRequired,
    gameActive: PropTypes.bool.isRequired,
    newGameStarting: PropTypes.bool.isRequired,
    currentPhase: PropTypes.string,
    acronym: PropTypes.array,
    category: PropTypes.string,
    hideAcroInCategoryPhase: PropTypes.bool
  };

  state = {
    componentUpdateBool: false,
    currentPhase: null,
    acronym: null,
    category: null,
    hideAcroInCategoryPhase: false
  }

  componentDidMount() {
    this.componentUpdateInterval = setInterval(() => {
      this.setState(state => ({ componentUpdateBool: !state.componentUpdateBool }));
    }, 500);
  }

  componentWillUnmount() {
    clearInterval(this.componentUpdateInterval);
  }

  timeDiff = () => {
    let diff = moment(this.props.countdownTime).diff(now());
    if (diff < 0) diff = 0;

    return moment(diff).format("m:ss");
  }

  render() {
    let statusText;
    let countdown;
    let showAcronym = false;
    let showCategory = false;

    if (this.props.gameActive) {
      statusText = "Game in progress";
      countdown = this.timeDiff();
      switch (this.props.currentPhase) {
        case "category":
          if (!this.props.hideAcroInCategoryPhase) {
            showAcronym = true;
          }
          break;
        case "acro":
        case "voting":
        case "endround":
          showAcronym = true;
          showCategory = true;
          break;
        default:
      }
    } else if (this.props.newGameStarting) {
      statusText = "New game starting soon";
      countdown = this.timeDiff();
    } else {
      statusText = "Waiting for players";
    }

    return (
      <View>
        <Item>
          <Left><Text>{statusText}</Text></Left>
          <Body><Text>{countdown}</Text></Body>
        </Item>
        {showAcronym && (
          <Item>
            <Text>
              {(this.props.acronym || []).join(". ") + "."}
              {showCategory && " - " + this.props.category}
            </Text>
          </Item>
        )}
      </View>
    )
  }
}

const LobbyPlayerList = ({ playerIds, users }) => (
  <Card>
    {playerIds.length > 0 ? playerIds.map((playerId) => {
      const user = getUserById(users, playerId);
      return (
        <CardItem key={playerId}>
          <Left>
            <Thumbnail source={{ uri: profilePicture(user, 100) }} />
            <Body>
              <Text>{displayName(user)}</Text>
              <Text note>Additional note here...</Text>
            </Body>
          </Left>
        </CardItem>
      );
    }) : (
      <CardItem>
        <Text note>No players in lobby</Text>
      </CardItem>
    )}
  </Card>
);

class LobbyGame extends Component {
  static propTypes = {
    game: PropTypes.object,
    lobby: PropTypes.object,
    user: PropTypes.object,
    users: PropTypes.array.isRequired
  };

  render() {
    if (!this.props.lobby || !this.props.game) {
      return <Content><Spinner /></Content>;
    }

    return (
      <View style={{ flex: 1 }}>
        <GameInfoHeader
          lobbyId={this.props.lobby._id}
          gameActive={this.props.game.active}
          newGameStarting={this.props.lobby.newGameStarting}
          countdownTime={this.props.game.active ? this.props.game.endTime : this.props.lobby.endTime}
          currentPhase={this.props.game.currentPhase}
          acronym={_get(this.props.game, `rounds.${this.props.game.currentRound - 1}.acronym`)}
          category={_get(this.props.game, `rounds.${this.props.game.currentRound - 1}.category`)}
          hideAcroInCategoryPhase={this.props.lobby.config.hideAcroInCategoryPhase}
        />
        <ScrollView style={{ flex: 1 }}>
          {this.props.game.active ? (
            <GameViewSwitcher
              game={this.props.game}
              lobby={this.props.lobby}
              user={this.props.user}
              users={this.props.users}
            />
          ) : (
            <View style={{ padding: 10 }}>
              <H2>Players in lobby</H2>
              <LobbyPlayerList playerIds={this.props.lobby.players} users={this.props.users} />
            </View>
          )}
        </ScrollView>
      </View>
    );
  }
}

export default LobbyGame;
