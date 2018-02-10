import React, { Component } from "react";
import { View, StatusBar } from "react-native";
import { Container, Button, Text, H3 } from "native-base";

import ImageBackgroundRepeat from "../../components/ImageBackgroundRepeat";
import styles from "./styles";

const launchscreenBg = require("../../../assets/acro-bg-pattern.png");

class Home extends Component {
  render() {
    return (
      <Container>
        <StatusBar />
        <ImageBackgroundRepeat source={launchscreenBg} style={styles.imageContainer}>
          <View style={styles.logoContainer}>
            <Text style={styles.logoText}>Acrofever!</Text>
          </View>
          <View
            style={{
              alignItems: "center",
              marginBottom: 50,
              backgroundColor: "transparent"
            }}
          >
            <H3 style={styles.text}>Mobile Alpha</H3>
          </View>
          <View style={{ marginBottom: 80 }}>
            <Button
              style={styles.button}
              onPress={() => this.props.navigation.navigate("DrawerOpen")}
            >
              <Text style={styles.buttonText}>Lets Go!</Text>
            </Button>
          </View>
        </ImageBackgroundRepeat>
      </Container>
    );
  }
}

export default Home;
