import React, { Component } from "react";
import PropTypes from "prop-types";
import { StatusBar } from "react-native";
import {
  Container,
  Content,
  Text,
  List, 
  ListItem,
  Icon,
  Body, 
  Right
} from "native-base";
import StandardHeader from "../../components/StandardHeader";
import Meteor, { createContainer } from "react-native-meteor";
import AcrofeverBG from "../../components/AcrofeverBG";

import styles from "./styles";

class LobbyList extends Component {
  static propTypes = {
    navigation: PropTypes.object.isRequired,
    lobbies: PropTypes.array.isRequired
  }

  goToLobby = (lobby) => {
    this.props.navigation.navigate("Lobby", {
      id: lobby._id,
      name: lobby.displayName
    });
  }

  render() {
    return (
      <Container>
        <StatusBar />
        <StandardHeader navigation={this.props.navigation} title="Lobbies" />
        <AcrofeverBG>
          <Content>
            <List>
              {this.props.lobbies.map(lobby => (
                <ListItem 
                  key={lobby._id} 
                  icon
                  style={styles.listItem}
                  onPress={() => this.goToLobby(lobby)}
                >
                  <Body>
                    <Text>{lobby.displayName}</Text>
                  </Body>
                  <Right>
                    {lobby.players.length > 0 ? (
                      <Text style={styles.text}>{lobby.players.length} online</Text>
                    ) : (
                      <Text style={styles.textItalic}>No players</Text>
                    )}
                    <Icon name="arrow-forward" />
                  </Right>
                </ListItem>
              ))}
            </List>
          </Content>
        </AcrofeverBG>
      </Container>
    );
  }
}

export default createContainer(() => {
  Meteor.subscribe("lobbies");
  return {
    lobbies: Meteor.collection("lobbies").find()
  }
}, LobbyList);
