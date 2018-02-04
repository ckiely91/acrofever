import React, { Component } from "react";
import PropTypes from "prop-types";
import Meteor from "react-native-meteor";
import { ScrollView, KeyboardAvoidingView } from "react-native";
import {
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

    return <Icon name="information" />
  }

  render() {
    return (
      <ListItem avatar>
        <Left>
          {this.thumbOrIcon()}
        </Left>
        <Body>
          <Text>{this.props.user ? displayName(this.props.userObj) : this.props.summary}</Text>
          <Text note>{this.props.detail}</Text>
        </Body>
        <Right>
          <Text note>{moment(this.props.timestamp).fromNow()}</Text>
        </Right>
      </ListItem>
    );
  }
}

class LobbyChatList extends Component {
  static propTypes = {
    chats: PropTypes.array.isRequired,
    users: PropTypes.array.isRequired
  };

  componentDidMount() {
    this.scrollView.scrollToEnd();
  }

  componentDidUpdate(prevProps) {
    this.scrollView.scrollToEnd();
  }

  render() {
    return (
      <ScrollView style={{ flex: 1 }} ref={ref => (this.scrollView = ref)}>
        <List>
          {this.props.chats.slice().reverse().map((chat) => (
            <SingleChat key={chat._id} userObj={getUserById(this.props.users, chat.user)} {...chat} />
          ))}
        </List>
      </ScrollView>
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
      <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
        <LobbyChatList chats={this.props.chats} users={this.props.users} />
        <Item regular>
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
