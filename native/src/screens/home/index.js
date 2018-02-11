import React, { Component } from "react";
import { View, StatusBar } from "react-native";
import { Container, Button, Text, H3 } from "native-base";

import AcrofeverBG from "../../components/AcrofeverBG";
import styles from "./styles";

class Home extends Component {
  render() {
    return (
      <Container>
        <StatusBar />
        <AcrofeverBG>
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
        </AcrofeverBG>
      </Container>
    );
  }
}

export default Home;
