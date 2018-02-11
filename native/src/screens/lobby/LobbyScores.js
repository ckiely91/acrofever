import React, { Component } from "react";
import PropTypes from "prop-types";
import {
  Content,
  Text,
  List,
  ListItem,
  Left,
  Body,
  Right,
  Thumbnail,
  Badge
} from "native-base";

import { getUserById, profilePicture, displayName } from "../../helpers";
import { lobbyScoresStyles as styles } from "./styles";

const LobbyScoreItem = ({ id, user, score, active }) => {
  const pic = profilePicture(user, 100);
  const name = displayName(user);

  return (
    <ListItem style={active ? styles.listItem : { ...styles.listItem, ...styles.disabledItem}}>
      <Left style={{ flex: 0 }}>
        <Thumbnail small source={{ uri: pic }} />
      </Left>
      <Body>
        <Text style={styles.text}>{name}</Text>
      </Body>
      <Right>
        <Badge style={styles.badge}>
          <Text style={styles.scoreText}>{score}</Text>
        </Badge>
      </Right>
    </ListItem>
  )
};

class LobbyScores extends Component {
  static propTypes = {
    scores: PropTypes.object.isRequired,
    users: PropTypes.array.isRequired,
    players: PropTypes.array.isRequired
  };

  sortedScores() {
    let scores = [];

    for (let userId in this.props.scores) {
      if (this.props.scores.hasOwnProperty(userId)) {
        let active = (this.props.players && this.props.players.indexOf(userId) > -1);
        scores.push({
          id: userId,
          score: this.props.scores[userId],
          active: active
        });
      }
    }

    scores = scores.sort((a, b) => {
      return b.score - a.score;
    });

    return scores;
  }

  render() {
    return (
      <Content>
        <List>
          {this.sortedScores().map(score => (
            <LobbyScoreItem 
              key={score.id} 
              user={getUserById(this.props.users, score.id)} 
              active={this.props.players.indexOf(score.id) > -1}
              {...score} 
            />
          ))}
        </List>
      </Content>
    );
  }
}

export default LobbyScores;
