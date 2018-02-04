import React, { Component } from "react";
import PropTypes from "prop-types";
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
    console.log("lobbies", this.props.lobbies);
    return (
      <Container>
        <StandardHeader navigation={this.props.navigation} title="Lobbies" />
        <Content>
          <List>
            {this.props.lobbies.map(lobby => (
              <ListItem key={lobby._id} icon onPress={() => this.goToLobby(lobby)}>
                <Body>
                  <Text>{lobby.displayName}</Text>
                </Body>
                <Right>
                  {lobby.players.length > 0 ? (
                    <Text>{lobby.players.length} online</Text>
                  ) : (
                    <Text style={{ fontStyle: "italic" }}>No players</Text>
                  )}
                  <Icon name="arrow-forward" />
                </Right>
              </ListItem>
            ))}
          </List>
        </Content>
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
