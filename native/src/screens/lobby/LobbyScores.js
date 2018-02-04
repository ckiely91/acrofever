import React, { Component } from "react";
import PropTypes from "prop-types";
import {
  Content,
  Text,
  List,
  ListItem,
  Left,
  Body,
  Right
} from "native-base";

import { getUserById, profilePicture, displayName } from "../../helpers";

const LobbyScoreItem = ({ id, score, active }) => {
  const user = getUserById(id);
  const pic = profilePicture(user, 100);
  const name = displayName(user);

  return (
    <ListItem avatar>
      <Left>
        <Thumbnail small source={{ uri: pic }} />
      </Left>
      <Body>
        <Text>{name}</Text>
      </Body>
      <Right>
        {score.score}
      </Right>
    </ListItem>
  )
};

class LobbyScores extends Component {
  static propTypes = {
    scores: PropTypes.object.isRequired,
    users: PropTypes.array.isRequired
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
          {this.sortedScores().map(score => <LobbyScoreItem key={score.id} {...score} />)}
        </List>
      </Content>
    );
  }
}

export default LobbyScores;
