import React, { PureComponent } from "react";
import PropTypes from "prop-types";
import {
  Content,
  Text,
  List,
  ListItem,
  Body,
  Right
} from "native-base";
import moment from "moment";

import styles from "./styles";

class LobbySettings extends PureComponent {
  static propTypes = {
    timeouts: PropTypes.object,
    acronymTimeout: PropTypes.number,
    votingTimeout: PropTypes.number,
    winnerPoints: PropTypes.number,
    votedPoints: PropTypes.number,
    votedForWinnerPoints: PropTypes.number,
    notVotedNegativePoints: PropTypes.number,
    endGamePoints: PropTypes.number
  };

  render() {
    const data = [
      {
        name: "Acro phase time",
        value: this.props.timeouts ? "Auto" : moment(this.props.acronymTimeout).format('m:ss')
      },
      {
        name: "Voting phase time",
        value: this.props.timeouts ? "Auto" : moment(this.props.votingTimeout).format('m:ss')
      },
      {
        name: "Points for round winner",
        value: this.props.winnerPoints
      },
      {
        name: "Points for each vote received",
        value: this.props.votedPoints
      },
      {
        name: "Points for voting for winning Acro",
        value: this.props.votedForWinnerPoints
      },
      {
        name: "Penalty for submitting without voting",
        value: -this.props.notVotedNegativePoints
      },
      {
        name: "Points needed to win game",
        value: this.props.endGamePoints
      }
    ];

    return (
      <Content padded>
        <List>
          {data.map(d => (
            <ListItem key={d.name} style={styles.listItem}>
              <Body>
                <Text style={styles.text}>{d.name}</Text>
              </Body>
              <Right>
                <Text style={styles.text}>{d.value}</Text>
              </Right>
            </ListItem>
          ))}
        </List>
      </Content>
    );
  }
}

export default LobbySettings;
