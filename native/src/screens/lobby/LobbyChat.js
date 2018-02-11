import React, { Component } from "react";
import PropTypes from "prop-types";
import Meteor from "react-native-meteor";
import { ScrollView, FlatList, KeyboardAvoidingView } from "react-native";
import {
  View,
  Text,
  List,
  ListItem,
  Left,
  Body,
  Right,
  Thumbnail,
  Icon,
  Item,
  Input,
  Toast
} from "native-base";
import moment from "moment";

import { displayName, profilePicture, getUserById } from "../../helpers";

import { lobbyChatStyles as styles } from "./styles";

class SingleChat extends Component {
  static propTypes = {
      user: PropTypes.string,
      icon: PropTypes.string,
      timestamp: PropTypes.instanceOf(Date).isRequired,
      summary: PropTypes.string,
      detail: PropTypes.string,
      userObj: PropTypes.object
  };

  thumbOrIcon = () => {
    if (this.props.user) {
      return <Thumbnail small source={{ uri: profilePicture(this.props.userObj, 100) }} />
    }

    return <Icon name="information-circle" style={styles.icon} />
  }

  render() {
    return (
      <ListItem style={styles.listItem}>
        <Left style={styles.listItemLeft}>
          {this.thumbOrIcon()}
        </Left>
        <Body>
          <View style={styles.listItemBody}>
            <Text style={styles.listItemHeader}>{this.props.user ? displayName(this.props.userObj) : this.props.summary}</Text>
            <Text note style={styles.timeText}>{moment(this.props.timestamp).fromNow()}</Text>
          </View>
          {this.props.detail && <Text note style={styles.detailText}>{this.props.detail}</Text>}
        </Body>
      </ListItem>
    );
  }
}

class LobbyChatList extends Component {
  static propTypes = {
    chats: PropTypes.array.isRequired,
    users: PropTypes.array.isRequired
  };

  render() {
    return (
      <View style={{ flex: 1 }}>
        <FlatList
          inverted
          data={this.props.chats}
          keyExtractor={chat => chat._id}
          renderItem={({ item }) => <SingleChat userObj={getUserById(this.props.users, item.user)} {...item} />}
        />
      </View>
    );
  }
}

class LobbyChat extends Component {
  static propTypes = {
    lobbyId: PropTypes.string.isRequired,
    chats: PropTypes.array.isRequired,
    users: PropTypes.array.isRequired
  }

  state = {
    chatMessage: ""
  }

  sendChatMessage = () => {
    if (this.state.chatMessage === "") return;
    Meteor.call('addLobbyFeedChat', this.props.lobbyId, this.state.chatMessage, (err) => {
      if (err) {
        console.log("error sending chat", err);
        Toast.show({
          type: "danger",
          text: "Failed to send message",
          position: "bottom",
          buttonText: "Okay",
          duration: 5000
        })
      } else {
        this.setState({ chatMessage: "" });
      }
    });
  }

  render() {
    return (
      <KeyboardAvoidingView style={{ flex: 1 }} keyboardVerticalOffset={88} behavior="padding">
        <FlatList
          inverted
          style={{ flex: 1 }}
          data={this.props.chats}
          keyExtractor={chat => chat._id}
          renderItem={({ item }) => <SingleChat userObj={getUserById(this.props.users, item.user)} {...item} />}
        />
        <Item regular style={{ marginLeft: 0 }}>
          <Icon active name="quote"/>
          <Input 
            placeholder="Send chat message"
            value={this.state.chatMessage} 
            onChangeText={chatMessage => this.setState({ chatMessage })}
            onSubmitEditing={this.sendChatMessage}
          />
        </Item>
      </KeyboardAvoidingView>
    );
  }
}

export default LobbyChat;
