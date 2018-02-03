import React, { Component } from "react";
import Meteor from "react-native-meteor";

import { Image } from "react-native";
import {
  Container,
  Content,
  List,
  ListItem,
  Left,
  Text
} from "native-base";

import styles from "./styles";

const listData = [
  {
    name: "Home",
    route: "Home"
  },
  {
    name: "Other",
    route: "Other"
  },
  {
    name: "Log out",
    onPress: () => Meteor.logout()
  }
];

const drawerCover = require("../../../assets/drawer-cover.png");
const drawerImage = require("../../../assets/logo-kitchen-sink.png");
class SideBar extends Component {
  render() {
    return (
      <Container>
        <Content
          bounces={false}
          style={{ flex: 1, backgroundColor: "#fff" }}
        >
          <Image source={drawerCover} style={styles.drawerCover} />
          <Image square style={styles.drawerImage} source={drawerImage} />
          <List 
            dataArray={listData} 
            renderRow={data => (
              <ListItem
                button
                noBorder
                onPress={data.onPress || (() => this.props.navigation.navigate(data.route))}
              >
                <Left>
                  <Text style={styles.text}>{data.name}</Text>
                </Left>
              </ListItem>
            )}
          />
        </Content>
      </Container>
    );
  }
}

export default SideBar;
