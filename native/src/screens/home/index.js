import React, { Component } from "react";
import PropTypes from "prop-types";
import { View, StatusBar, Image } from "react-native";
import { Container, Button, Text, H3, Thumbnail } from "native-base";
import Meteor, { createContainer } from "react-native-meteor";

import AcrofeverBG from "../../components/AcrofeverBG";
import AcrofeverLogo from "../../../assets/acrofever-logo-new.png";
import styles from "./styles";

import { displayName, profilePicture } from "../../helpers";

class Home extends Component {
  static propTypes = {
    user: PropTypes.object.isRequired
  };

  render() {
    return (
      <Container>
        <StatusBar />
        <AcrofeverBG>
          <View style={styles.logoContainer}>
            <Image source={AcrofeverLogo} style={styles.logo} />
          </View>
          <View
            style={{
              alignItems: "center",
              marginBottom: 50,
              backgroundColor: "transparent"
            }}
          >
            {/* <H3 style={styles.betaText}>Mobile Beta</H3> */}
            <View
              style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                marginTop: 30
              }}
            >
              <Thumbnail
                small
                source={{ uri: profilePicture(this.props.user, 100) }}
                style={{ marginRight: 10 }}
              />
              <Text style={styles.text}>{displayName(this.props.user)}</Text>
            </View>
          </View>
          <View style={{ marginBottom: 80 }}>
            <Button
              style={styles.button}
              onPress={() => this.props.navigation.navigate("DrawerOpen")}
            >
              <Text style={styles.buttonText}>Lets Go!</Text>
            </Button>
          </View>
        </AcrofeverBG>
      </Container>
    );
  }
}

export default createContainer(
  () => ({
    user: Meteor.user()
  }),
  Home
);
