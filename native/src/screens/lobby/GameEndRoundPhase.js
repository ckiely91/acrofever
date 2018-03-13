import React, { Component } from "react";
import PropTypes from "prop-types";

import {
  View,
  Thumbnail,
  Text,
  Icon,
  Badge
} from "native-base";

import { getUserById, profilePicture, displayName } from "../../helpers";

import { lobbyGameStyles as styles } from "./styles";

const EndRoundPlayerCard = ({
  user,
  accolades,
  winner,
  acro,
  numVotes,
  numPoints
}) => (
  <View style={styles.resultsRow}>
    <View style={styles.resultsRowHeader}>
      <Thumbnail small source={{ uri: profilePicture(user, 150) }} style={styles.resultsRowThumbnail} />
      <View style={styles.resultsRowNameContainer}>
        <Text style={styles.resultsRowName}>
          {winner && <Icon name="star" style={styles.resultsRowNameIcon} />}&nbsp;
          {displayName(user)}
        </Text>
        {accolades.length > 0 && <Text style={styles.resultsRowNameAccolades}>{accolades.join(", ")}</Text>}
      </View>
      <View style={styles.resultsRowVotes}>
        <Text style={styles.resultsRowText}>
          <Icon active name="thumbs-up" style={styles.resultsRowVotesIcon} /> {numVotes}
        </Text>
      </View>
      <View>
        <Badge style={styles.badge}>
          <Text style={styles.scoreText}>{numPoints < 0 ? "-" : "+"}{numPoints}</Text>
        </Badge>
      </View>
    </View>
    <View style={{ marginTop: 10 }}>
      {acro ? (
        <Text style={styles.text}>{acro}</Text>
      ) : (
        <Text style={styles.italicText}>No acro submitted</Text>
      )}
    </View>
  </View>
);

EndRoundPlayerCard.propTypes = {
  user: PropTypes.object,
  accolades: PropTypes.array.isRequired,
  acro: PropTypes.string,
  numVotes: PropTypes.number,
  numPoints: PropTypes.number
};

export class RoundResults extends Component {
  static propTypes = {
    title: PropTypes.string.isRequired,
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
      const winner = playerId === this.props.currentRound.winner;
      if (winner) {
        accolades.push("Round winner");
      }

      if (playerObj.submission && playerObj.timeLeft > fastestTimeLeft) {
        fastestTimeLeft = playerObj.timeLeft;
        fastestSubmitter = playerId;
      }

      roundAcros.push({
        ...playerObj,
        accolades,
        winner,
        playerId
      });
    }

    for (let i = 0; i < roundAcros.length; i++) {
      if (roundAcros[i].playerId === fastestSubmitter) {
        roundAcros[i].accolades.push("Fastest submitter");
        break;
      }
    }

    roundAcros.sort((a, b) => (RoundResults.totalPoints(b) - RoundResults.totalPoints(a)));

    return roundAcros;
  }
  
  render() {
    return (
      <View>
        {this.props.title.length > 0 && <Text style={styles.phaseHeader}>{this.props.title}</Text>}
        {this.roundAcros().map(a => (
          <EndRoundPlayerCard
            key={a.playerId}
            user={getUserById(this.props.users, a.playerId)}
            winner={a.winner}
            accolades={a.accolades}
            acro={a.submission ? a.submission.acro : null}
            numVotes={a.votes}
            numPoints={RoundResults.totalPoints(a)}
          />
        ))}
      </View>
    );
  }
}

const GameEndRoundPhase = ({ currentRound, users, userId }) => (
  <View>
    <RoundResults title="Round results" currentRound={currentRound} users={users} userId={userId} />
  </View>
);

GameEndRoundPhase.propTypes = {
  currentRound: PropTypes.object.isRequired,
  users: PropTypes.array.isRequired,
  userId: PropTypes.string.isRequired
};

export default GameEndRoundPhase;
