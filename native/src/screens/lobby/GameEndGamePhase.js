import React, { Component } from "react";
import PropTypes from "prop-types";
import { sample } from "lodash";

import ScrollableTabView, { DefaultTabBar } from "react-native-scrollable-tab-view";

import {
  View,
  Text,
  H2,
  Card,
  CardItem,
  Left,
  Thumbnail,
  Body,
  Icon,
  Right,
  Tabs,
  Tab,
  Badge
} from "native-base";

import { RoundResults } from "./GameEndRoundPhase";
import { getUserById, profilePicture, displayName } from "../../helpers";

import { lobbyGameStyles as styles} from "./styles";
import { colors, fonts } from "../../styles/base";

const EndGamePlayerCard = ({
  user,
  numVotes,
  score,
  winner,
  bestAcro,
  fastestSubmitter
}) => (
  <View style={{ ...styles.resultsRow }}>
    <View style={styles.resultsRowHeader}>
      <Thumbnail small source={{ uri: profilePicture(user, 150) }} style={styles.resultsRowThumbnail} />
      <View style={styles.resultsRowNameContainer}>
        <Text style={styles.resultsRowName}>
          {winner && <Icon active name="star" style={styles.resultsRowNameIcon} />}&nbsp;
          {displayName(user)}
        </Text>
        {fastestSubmitter && <Text style={styles.resultsRowNameAccolades}>Fastest average submitter</Text>}
      </View>
      <View style={styles.resultsRowVotes}>
        <Text style={styles.resultsRowText}>
          <Icon active name="thumbs-up" style={styles.resultsRowVotesIcon} /> {numVotes}
        </Text>
      </View>
      <View>
        <Badge style={styles.badge}>
          <Text style={styles.scoreText}>{score}</Text>
        </Badge>
      </View>
    </View>
  </View>
);

class GameEndGamePhase extends Component {
  static propTypes = {
    currentRound: PropTypes.object.isRequired,
    rounds: PropTypes.array.isRequired,
    scores: PropTypes.object.isRequired,
    winner: PropTypes.string.isRequired,
    users: PropTypes.array.isRequired,
    userId: PropTypes.string.isRequired
  };

  gameResults() {
    const resultsObj = {};

    const scorePlayerIds = Object.keys(this.props.scores);
    for (let i = 0; i < scorePlayerIds.length; i++) {
      const playerId = scorePlayerIds[i];
      resultsObj[playerId] = {
        playerId,
        score: this.props.scores[playerId],
        winner: this.props.winner === playerId,
        totalTimeLefts: 0,
        avgTimeLeft: 0,
        submissions: 0,
        highestVotes: 1,
        totalVotes: 0,
        bestAcros: []
      };
    }

    for (let i = 0; i < this.props.rounds.length; i++) {
      const round = this.props.rounds[i];
      const roundPlayerIds = Object.keys(round.players);
      for (let j = 0; j < roundPlayerIds.length; j++) {
        const playerId = roundPlayerIds[j];

        if (!resultsObj[playerId]) {
          continue;
        }
        const playerObj = round.players[playerId];

        resultsObj[playerId].totalVotes += playerObj.votes;
        const thisBestAcro = {
          id: playerId,
          acro: playerObj.submission ? playerObj.submission.acro : '',
          category: round.category,
          acronym: round.acronym,
          votes: playerObj.votes
        };

        if (playerObj.votes > resultsObj[playerId].highestVotes) {
          resultsObj[playerId].bestAcros = [thisBestAcro];
          resultsObj[playerId].highestVotes = playerObj.votes;
        } else if (playerObj.votes === resultsObj[playerId].highestVotes) {
          resultsObj[playerId].bestAcros.push(thisBestAcro);
        }

        if (playerObj.submission) {
          resultsObj[playerId].totalTimeLefts += playerObj.submission.timeLeft;
          resultsObj[playerId].submissions++;
          resultsObj[playerId].avgTimeLeft = resultsObj[playerId].totalTimeLefts / resultsObj[playerId].submissions;
        }
      }
    }

    let fastestTime = 0;
    let fastestSubmitter = null

    const gameResults = scorePlayerIds.map((playerId) => {
      if (resultsObj[playerId].avgTimeLeft > fastestTime) {
        fastestTime = resultsObj[playerId].avgTimeLeft;
        fastestSubmitter = playerId;
      }
      if (resultsObj[playerId].bestAcros.length > 0) {
        resultsObj[playerId].bestAcro = sample(resultsObj[playerId].bestAcros);
      }
      return resultsObj[playerId];
    });

    for (let i = 0; i < gameResults.length; i++) {
      if (gameResults[i].playerId === fastestSubmitter) {
        gameResults[i].fastestSubmitter = true;
        break;
      }
    }

    gameResults.sort((a, b) => (b.score - a.score));
    
    return gameResults;
  }

  render() {
    return (
      <View>
        <ScrollableTabView
          tabBarTextStyle={{ fontFamily: fonts.openSans.regular, fontSize: 16 }}
          tabBarActiveTextColor={colors.red}
          tabBarInactiveTextColor={colors.grey}
          tabBarUnderlineStyle={{ backgroundColor: colors.red }}
          renderTabBar={() => <DefaultTabBar />}
        >
          <View tabLabel="Game results">
            {this.gameResults().map(res => (
              <EndGamePlayerCard 
                key={res.playerId}
                user={getUserById(this.props.users, res.playerId)}
                numVotes={res.totalVotes}
                score={res.score}
                winner={res.winner}
                bestAcro={res.bestAcro}
                fastestSubmitter={res.fastestSubmitter}
              />
            ))}
          </View>
          <View tabLabel="Last round results">
            <RoundResults title="" currentRound={this.props.currentRound} users={this.props.users} userId={this.props.userId} />
          </View>
        </ScrollableTabView>
      </View>
    );
  }
}

export default GameEndGamePhase;
