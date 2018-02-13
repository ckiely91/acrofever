import React, { Component } from "react";
import PropTypes from "prop-types";
import Meteor from "react-native-meteor";
import { FlatList, KeyboardAvoidingView, Dimensions } from "react-native";
import {
  View,
  Text,
  ListItem,
  Left,
  Body,
  Thumbnail,
  Icon,
  Item,
  Input,
  Toast
} from "native-base";
import moment from "moment";
import { debounce } from "lodash";

import { displayName, profilePicture, getUserById } from "../../helpers";

import { lobbyChatStyles as styles } from "./styles";

const SingleChat = ({
  user,
  icon,
  timestamp,
  summary,
  detail,
  userObj
}) => {
  let thumb;
  if (user) {
    thumb = <Thumbnail small source={{ uri: profilePicture(userObj, 100) }} />
  } else {
    thumb = <Icon name="information-circle" style={styles.icon} />;
  }

  return (
    <ListItem style={styles.listItem}>
      <Left style={styles.listItemLeft}>
        {thumb}
      </Left>
      <Body>
        <View style={styles.listItemBody}>
          <Text style={styles.listItemHeader}>{user ? displayName(userObj) : summary}</Text>
          <Text note style={styles.timeText}>{moment(timestamp).fromNow()}</Text>
        </View>
        {detail && <Text note style={styles.detailText}>{detail}</Text>}
      </Body>
    </ListItem>
  );
}

class LobbyChat extends Component {
  static propTypes = {
    lobbyId: PropTypes.string.isRequired,
    chats: PropTypes.array.isRequired,
    users: PropTypes.array.isRequired,
    getMoreChats: PropTypes.func.isRequired
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
  
  onScroll = debounce(({ nativeEvent }) => {
    const windowHeight = Dimensions.get('window').height,
      height = nativeEvent.contentSize.height,
      offset = nativeEvent.contentOffset.y;

    if ((windowHeight + offset) >= height && !this.isRefreshing){
      this.props.getMoreChats();

      // Give it a few seconds to fetch
      setTimeout(() => (this.isRefreshing = false), 2000);
    }
  }, 300)

  render() {
    return (
      <KeyboardAvoidingView style={{ flex: 1 }} keyboardVerticalOffset={88} behavior="padding">
        <FlatList
          inverted
          onScroll={(evt) => { evt.persist(); this.onScroll(evt) }}
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
