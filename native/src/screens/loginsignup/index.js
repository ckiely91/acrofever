import React, { Component } from "react";
import Meteor, { Accounts } from "react-native-meteor";
import {
  Alert,
  View,
  KeyboardAvoidingView,
  StatusBar,
  Linking,
  Image
} from "react-native";
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
    email: "",
    password: "",
    confirmPassword: "",
    signupMode: false
  };

  login = () => {
    this.setState({ loggingIn: true });
    if (this.state.signupMode) {
      if (this.state.password !== this.state.confirmPassword) {
        Toast.show({
          type: "warning",
          text: "Passwords do not match",
          position: "bottom",
          buttonText: "Okay",
          duration: 5000
        });
        this.setState({ loggingIn: false });
        return;
      }

      const { username, email, password } = this.state;

      Accounts.createUser({ username, email, password }, err => {
        if (err) {
          console.log(err);
          if (err.error === "email-not-verified") {
            Toast.show({
              type: "success",
              text:
                "Successfully registered. Check your email for instructions on verifying your account.",
              position: "bottom",
              buttonText: "Okay",
              duration: 10000
            });
            this.setState({ signupMode: false });
          } else {
            Toast.show({
              type: "warning",
              text: err.reason,
              position: "bottom",
              buttonText: "Okay",
              duration: 5000
            });
          }
        }

        this.setState({ loggingIn: false });
      });
      return;
    }

    Meteor.loginWithPassword(this.state.username, this.state.password, err => {
      if (err) {
        console.log(err);
        Toast.show({
          type: "warning",
          text: err.reason,
          position: "bottom",
          buttonText: "Okay",
          duration: 5000
        });
        this.setState({ loggingIn: false });
      }
    });
  };

  signup = () => {
    Alert.alert(
      "Sign up on acrofever.com",
      `Signing up must currently be done at acrofever.com. Create a new account there and then re-open the app to sign in. Third party services (such as Facebook, Google and Twitter) are not yet supported on mobile.`,
      [
        {
          text: "Go to acrofever.com",
          onPress: () => Linking.openURL("https://acrofever.com")
        },
        { text: "Dismiss" }
      ]
    );
  };

  showSigninHelpMsg = () => {
    Alert.alert(
      "Not yet supported",
      `Signing in with third party services is not yet supported on the mobile app.
If you have previously signed up with Facebook, Google, or Twitter, log in to acrofever.com and set a password on your account.`,
      [
        {
          text: "Go to acrofever.com",
          onPress: () => Linking.openURL("https://acrofever.com")
        },
        { text: "Dismiss" }
      ]
    );
  };

  render() {
    return (
      <Container>
        <StatusBar />
        <AcrofeverBG>
          <KeyboardAvoidingView
            behavior="padding"
            style={{ flex: 1, justifyContent: "flex-end" }}
          >
            <View style={styles.formContainer}>
              <View
                style={{
                  justifyContent: "center",
                  alignItems: "center",
                  marginBottom: 20
                }}
              >
                <Image
                  source={AcrofeverLogo}
                  style={{ width: 280, height: 70 }}
                />
              </View>
              <View>
                <Form style={styles.form}>
                  <Item>
                    <Input
                      style={styles.text}
                      placeholder={
                        this.state.signupMode ? "Username" : "Username/email"
                      }
                      onChangeText={username => this.setState({ username })}
                      value={this.state.username}
                      onSubmitEditing={this.login}
                    />
                  </Item>
                  {this.state.signupMode && (
                    <Item>
                      <Input
                        style={styles.text}
                        placeholder="Email address"
                        keyboardType="email-address"
                        onChangeText={email =>
                          this.setState({ email: email.toLowerCase() })
                        }
                        value={this.state.email}
                        onSubmitEditing={this.login}
                      />
                    </Item>
                  )}
                  <Item>
                    <Input
                      style={styles.text}
                      placeholder="Password"
                      secureTextEntry
                      onChangeText={password => this.setState({ password })}
                      value={this.state.password}
                      onSubmitEditing={this.login}
                    />
                  </Item>
                  {this.state.signupMode && (
                    <Item>
                      <Input
                        style={styles.text}
                        placeholder="Confirm password"
                        secureTextEntry
                        onChangeText={confirmPassword =>
                          this.setState({ confirmPassword })
                        }
                        value={this.state.confirmPassword}
                        onSubmitEditing={this.login}
                      />
                    </Item>
                  )}
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
                    <Text style={styles.buttonPrimaryText}>
                      {this.state.signupMode ? "Sign up" : "Log in"}
                    </Text>
                  )}
                </Button>
                <Button
                  block
                  light
                  style={styles.buttonSecondary}
                  onPress={() =>
                    this.setState(state => ({ signupMode: !state.signupMode }))
                  }
                >
                  <Text style={styles.buttonSecondaryText}>
                    {this.state.signupMode ? "Log in" : "Sign up"}
                  </Text>
                </Button>
                <Button transparent onPress={this.showSigninHelpMsg}>
                  <Text style={styles.smallLinkText}>
                    Trying to sign in with Facebook, Google or Twitter?
                  </Text>
                </Button>
              </View>
            </View>
          </KeyboardAvoidingView>
        </AcrofeverBG>
      </Container>
    );
  }
}

export default LoginSignup;
