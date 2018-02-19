import React, { Component } from "react";
import PropTypes from "prop-types";
import Meteor from "react-native-meteor";

import { get as _get } from "lodash";

import {
  View,
  Text,
  ListItem,
  CheckBox,
  Body
} from "native-base";

import { lobbyGameStyles as styles } from "./styles";
import { colors } from "../../styles/base";

class GameVotingPhase extends Component {
  static propTypes = {
    gameId: PropTypes.string.isRequired,
    currentRound: PropTypes.object.isRequired,
    currentUserIsInRound: PropTypes.bool.isRequired,
    userId: PropTypes.string.isRequired
  }

  static getPlayerVoteFromCurrentRound = (currentRound, userId) => {
    return  _get(currentRound, `players.${userId}.vote`, null);
  }

  isMounted = true;

  constructor(props) {
    super(props);

    this.state = {
      votedFor: GameVotingPhase.getPlayerVoteFromCurrentRound(props.currentRound, props.userId)
    };
  }

  componentWillReceiveProps(nextProps) {
    const curVote = GameVotingPhase.getPlayerVoteFromCurrentRound(this.props.currentRound, this.props.userId);
    const nextVote = GameVotingPhase.getPlayerVoteFromCurrentRound(nextProps.currentRound, nextProps.userId);

    if (curVote !== nextVote) {
      this.setState({ votedFor: nextVote });
    }
  }

  componentWillUnmount() {
    this.isMounted = false;
  }

  getAcros = () => {
    const acros = [];
    const playerIds = Object.keys(this.props.currentRound.players);

    for (let i = 0; i < playerIds.length; i++) {
      if (playerIds[i] === this.props.userId) {
        continue;
      }
      const playerObj = this.props.currentRound.players[playerIds[i]];
      if (playerObj.submission) {
        acros.push({ id: playerIds[i], acro: playerObj.submission.acro });
      }
    }

    return acros;
  }

  voteForAcro = (id) => {
    const prevVotedFor = this.state.votedFor;
    this.setState({ votedFor: id });

    Meteor.call("acrofeverVoteForAcro", this.props.gameId, id, (err) => {
      if (err) {
        console.log("error voting for acro, setting to previous state", err);
        this.setState({ votedFor: prevVotedFor });
      }
    });
  }

  render() {
    const acros = this.getAcros();

    return (
      <View>
        <Text style={styles.phaseHeader}>
          {this.props.currentUserIsInRound ? "Pick your favourite acro" : "Players are picking their favourite acro"}
        </Text>
        {acros.map(a => (
          <ListItem key={a.id} onPress={this.props.currentUserIsInRound ? () => this.voteForAcro(a.id) : null}>
            {this.props.currentUserIsInRound && <CheckBox checked={a.id === this.state.votedFor} color={colors.red} />}
            <Body>
              <Text style={styles.text}>{a.acro}</Text>
            </Body>
          </ListItem>
        ))}
      </View>
    );
  }
}

export default GameVotingPhase;
