import React, { Component } from "react";
import PropTypes from "prop-types";

import {
  View,
  H2,
  Card,
  CardItem,
  Left,
  Thumbnail,
  Body,
  Text,
  Button,
  Icon,
  Right
} from "native-base";

import { getUserById, profilePicture, displayName } from "../../helpers";

const EndRoundPlayerCard = ({
  user,
  accolades,
  acro,
  numVotes,
  numPoints
}) => (
  <Card>
    <CardItem>
      <Left>
        <Thumbnail source={{ uri: profilePicture(user, 150) }} />
        <Body>
          <Text>{displayName(user)}</Text>
          {accolades.length > 0 && <Text note>{accolades.join(", ")}</Text>}
        </Body>
      </Left>
    </CardItem>
    <CardItem body>
      {acro ? (
        <Text>{acro}</Text>
      ) : (
        <Text style={{ fontStyle: "italic" }}>No acro submitted</Text>
      )}
    </CardItem>
    <CardItem>
      <Left>
        <Icon active name="thumbs-up" />
        <Text>{numVotes} votes</Text>
      </Left>
      <Right>
        <Text>{numPoints < 0 ? "-" : "+"}{numPoints}</Text>
      </Right>
      </CardItem>
  </Card>
);

EndRoundPlayerCard.propTypes = {
  user: PropTypes.object,
  accolades: PropTypes.array.isRequired,
  acro: PropTypes.string,
  numVotes: PropTypes.number,
  numPoints: PropTypes.number
};

class GameEndRoundPhase extends Component {
  static propTypes = {
    currentRound: PropTypes.object.isRequired,
    users: PropTypes.array.isRequired,
    userId: PropTypes.string.isRequired
  }

  static totalPoints(results) {
    return results.votePoints + results.votedForWinnerPoints - results.notVotedNegativePoints + results.winnerPoints;
  }
  
  roundAcros() {
    const roundAcros = [];
    const playerIds = Object.keys(this.props.currentRound.players);

    let fastestSubmitter;
    let fastestTimeLeft = 0;

    for (let i = 0; i < playerIds.length; i++) {
      const playerId = playerIds[i];
      const playerObj = this.props.currentRound.players[playerId];
      const accolades = [];
      if (playerId === this.props.currentRound.winner) {
        accolades.push("Round winner");
      }

      if (playerObj.submission && playerObj.timeLeft > fastestTimeLeft) {
        fastestTimeLeft = playerObj.timeLeft;
        fastestSubmitter = playerId;
      }

      roundAcros.push({
        ...playerObj,
        accolades,
        playerId
      });
    }

    for (let i = 0; i < roundAcros.length; i++) {
      if (roundAcros[i].playerId === fastestSubmitter) {
        roundAcros[i].accolades.push("Fastest submitter");
        break;
      }
    }

    roundAcros.sort((a, b) => (GameEndRoundPhase.totalPoints(b) - GameEndRoundPhase.totalPoints(a)));

    return roundAcros;
  }
  
  render() {
    return (
      <View style={{ padding: 10 }}>
        <H2>Round results</H2>
        {this.roundAcros().map(a => (
          <EndRoundPlayerCard
            key={a.playerId}
            user={getUserById(this.props.users, a.playerId)}
            accolades={a.accolades}
            acro={a.submission ? a.submission.acro : null}
            numVotes={a.votes}
            numPoints={GameEndRoundPhase.totalPoints(a)}
          />
        ))}
      </View>
    );
  }
}

export default GameEndRoundPhase;
