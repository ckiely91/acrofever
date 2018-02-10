import * as Expo from "expo";
import React, { Component } from "react";
import PropTypes from "prop-types";
import Meteor, { createContainer } from "react-native-meteor";
import { Root } from "native-base";

import App from "../App";
import LoginSignup from "../screens/loginsignup";
import { startTimesync } from "../timesync";

const host = "192.168.0.16:3000";
const protocol = "http";

Meteor.connect(`ws://${host}/websocket`);

class Setup extends Component {
  static propTypes = {
    user: PropTypes.object,
    loggingIn: PropTypes.bool.isRequired
  };

  static defaultProps = {
    user: null
  };

  constructor() {
    super();
    this.state = {
      isReady: false
    };
  }

  componentWillMount() {
    this.loadFonts();
    startTimesync(`${protocol}://${host}/timesync`, 20000);
  }

  async loadFonts() {
    await Expo.Font.loadAsync({
      Roboto: require("native-base/Fonts/Roboto.ttf"),
      Roboto_medium: require("native-base/Fonts/Roboto_medium.ttf"),
      Ionicons: require("@expo/vector-icons/fonts/Ionicons.ttf")
    });
    this.setState({ isReady: true });
  }

  render() {
    if (!this.state.isReady) {
      return <Expo.AppLoading />;
    }

    if (!this.props.user) {
      return <Root><LoginSignup loggingIn={this.props.loggingIn} /></Root>;
    }

    return <App />;
  }
}

export default createContainer(() => {
  return {
    user: Meteor.user(),
    loggingIn: Meteor.loggingIn()
  }
}, Setup);
