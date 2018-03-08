import React, { Component } from "react";
import { View, StatusBar, ImageBackground } from "react-native";
import { Container, Button, Text, H3 } from "native-base";

import AcrofeverBG from "../../components/AcrofeverBG";
import AcrofeverLogo from "../../../assets/acrofever-logo-new.png";
import styles from "./styles";

class Home extends Component {
  render() {
    return (
      <Container>
        <StatusBar />
        <AcrofeverBG>
          <View style={styles.logoContainer}>
            <ImageBackground source={AcrofeverLogo} style={styles.logo} />
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
        </AcrofeverBG>
      </Container>
    );
  }
}

export default Home;
