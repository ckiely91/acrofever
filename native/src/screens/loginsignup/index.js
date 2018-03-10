import React, { Component } from "react";
import Meteor from "react-native-meteor";
import { Alert, View, KeyboardAvoidingView, StatusBar, Linking, ImageBackground } from "react-native";
import { 
  Container,
  Form,
  Item,
  Input,
  Button,
  Text,
  Spinner,
  Toast
} from "native-base";

import AcrofeverBG from "../../components/AcrofeverBG";
import AcrofeverLogo from "../../../assets/acrofever-logo-new.png";

import styles from "./styles";

class LoginSignup extends Component {
  state = {
    username: "",
    password: ""
  }

  login = () => {
    this.setState({ loggingIn: true });
    Meteor.loginWithPassword(this.state.username, this.state.password, (err) => {
      if (err) {
        Toast.show({
          type: "warning",
          text: "Incorrect username or password entered",
          position: "bottom",
          buttonText: "Okay",
          duration: 5000
        });
        this.setState({ loggingIn: false });
      }
    });
  }

  signup = () => {
    Alert.alert(
      "Sign up on acrofever.com",
      `Signing up must currently be done at acrofever.com. Create a new account there and then re-open the app to sign in. Third party services (such as Facebook, Google and Twitter) are not yet supported on mobile.`,
      [
        { text: 'Go to acrofever.com', onPress: () => Linking.openURL("https://acrofever.com")},
        { text: "Dismiss" }
      ]
    );
  }

  showSigninHelpMsg = () => {
    Alert.alert(
      "Not yet supported",
      `Signing in with third party services is not yet supported on the mobile app.
If you have previously signed up with Facebook, Google, or Twitter, log in to acrofever.com and set a password on your account.`,
      [
        { text: 'Go to acrofever.com', onPress: () => Linking.openURL("https://acrofever.com")},
        { text: "Dismiss" }
      ]
    );
  }

  render() {
    return (
      <Container>
        <StatusBar />
        <AcrofeverBG>
          <KeyboardAvoidingView behavior="padding" style={{ flex: 1, justifyContent: "flex-end" }}>
            <View style={styles.formContainer}>
              <ImageBackground source={AcrofeverLogo} style={styles.logo} />
              <Form style={styles.form}>
                <Item>
                  <Input
                    style={styles.text}
                    placeholder="Username/email"
                    onChangeText={(username) => this.setState({ username })}
                    value={this.state.username} 
                    onSubmitEditing={this.login}
                  />
                </Item>
                <Item>
                  <Input
                    style={styles.text}
                    placeholder="Password"
                    secureTextEntry 
                    onChangeText={(password) => this.setState({ password })}
                    value={this.state.password}
                    onSubmitEditing={this.login}
                  />
                </Item>
              </Form>
              <Button 
                block
                style={styles.buttonPrimary}
                disabled={this.state.loggingIn} 
                onPress={this.login}
              >
                {this.state.loggingIn ? (
                  <Spinner color="white" />
                ) : (
                  <Text style={styles.buttonPrimaryText}>Log in</Text>
                )}
              </Button>
              <Button block light style={styles.buttonSecondary} onPress={this.signup}>
                <Text style={styles.buttonSecondaryText}>Sign up</Text>
              </Button>
              <Button transparent onPress={this.showSigninHelpMsg}>
                <Text style={styles.smallLinkText}>Trying to sign in with Facebook, Google or Twitter?</Text>
              </Button>
            </View>
          </KeyboardAvoidingView>
        </AcrofeverBG>
      </Container>
    );
  }
}

export default LoginSignup;
