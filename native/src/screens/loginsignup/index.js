import React, { Component } from "react";
import Meteor from "react-native-meteor";
import PropTypes from "prop-types";
import { ImageBackground, View } from "react-native";
import { 
  Container,
  Form,
  Item,
  Input,
  Label,
  Button,
  Text,
  Spinner
} from "native-base";

import styles from "./styles";

const launchscreenBg = require("../../../assets/splash-720x1280.png");

class LoginSignup extends Component {
  static propTypes = {
    loggingIn: PropTypes.bool.isRequired
  }

  state = {
    username: "",
    password: ""
  }

  login = () => {
    Meteor.loginWithPassword(this.state.username, this.state.password, (err) => {
      if (err) {
        console.log("error logging in", err);
      }
    });
  }

  render() {
    return (
      <Container>
        <ImageBackground source={launchscreenBg} style={styles.imageContainer}>
          <View>
            <Form>
              <Item floatingLabel>
                <Label>Username/email</Label>
                <Input
                  onChangeText={(username) => this.setState({ username })}
                  value={this.state.username} 
                  onSubmitEditing={this.login}
                />
              </Item>
              <Item floatingLabel>
                <Label>Password</Label>
                <Input 
                  secureTextEntry 
                  onChangeText={(password) => this.setState({ password })}
                  value={this.state.password}
                  onSubmitEditing={this.login}
                />
              </Item>
            </Form>
            <Button 
              block 
              disabled={this.props.loggingIn} 
              onPress={this.login}
            >
              {this.props.loggingIn ? (
                <Spinner color="black" />
              ) : (
                <Text>Log in</Text>
              )}
            </Button>
            <Button block light><Text>Sign up</Text></Button>
          </View>
        </ImageBackground>
      </Container>
    );
  }
}

export default LoginSignup;
