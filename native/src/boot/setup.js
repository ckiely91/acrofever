import * as Expo from "expo";
import React, { Component } from "react";
import PropTypes from "prop-types";
import Meteor, { createContainer } from "react-native-meteor";
import { Root } from "native-base";
import { Platform } from "react-native";
import Sentry from "sentry-expo";

import App from "../App";
import LoginSignup from "../screens/loginsignup";
import { startTimesync } from "../timesync";

import { fonts } from "../styles/base";

import env from "../env";

Meteor.connect(`ws://${env.host}/websocket`);

Sentry.enableInExpoDevelopment = true;
Sentry.config(
  "https://558ee9c279d14a7a9798208f9511c04c:df9b198b53c24cc49ec9fcb182a10f61@sentry.io/301656"
).install();

Expo.AdMobInterstitial.setAdUnitID(
  Platform.OS === "ios"
    ? env.adMobInterstitialIDIOS
    : env.adMobInterstitialIDAndroid
);
if (env.env === "dev") {
  Expo.AdMobInterstitial.setTestDeviceID("EMULATOR");
}

class Setup extends Component {
  static propTypes = {
    user: PropTypes.object,
    loggingIn: PropTypes.bool.isRequired
  };

  static defaultProps = {
    user: null
  };

  constructor(props) {
    super(props);
    this.state = {
      isReady: false,
      initialLoggingIn: props.loggingIn
    };
  }

  componentWillMount() {
    this.loadFonts();
    startTimesync(
      `${env.protocol}://${env.host}/timesync`,
      20000,
      env.timesyncEnabled
    );
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.loggingIn === false && this.state.initialLoggingIn) {
      this.setState({ initialLoggingIn: false });
    }
    if (nextProps.user && !this.props.user) {
      Sentry.setUserContext({ id: nextProps.user.id });
    }
  }

  async loadFonts() {
    await Expo.Font.loadAsync({
      [fonts.pacifico]: require("../../assets/fonts/Pacifico-Regular.ttf"),
      [fonts.openSans
        .regular]: require("../../assets/fonts/OpenSans-Regular.ttf"),
      [fonts.openSans
        .italic]: require("../../assets/fonts/OpenSans-Italic.ttf"),
      [fonts.openSans.light]: require("../../assets/fonts/OpenSans-Light.ttf"),
      [fonts.openSans
        .lightItalic]: require("../../assets/fonts/OpenSans-LightItalic.ttf"),
      [fonts.openSans.bold]: require("../../assets/fonts/OpenSans-Bold.ttf"),
      [fonts.openSans
        .boldItalic]: require("../../assets/fonts/OpenSans-BoldItalic.ttf"),
      [fonts.roboto.regular]: require("native-base/Fonts/Roboto.ttf"),
      [fonts.roboto.medium]: require("native-base/Fonts/Roboto_medium.ttf"),
      [fonts.ionicons]: require("@expo/vector-icons/fonts/Ionicons.ttf")
    });
    this.setState({ isReady: true });
  }

  render() {
    if (
      !this.state.isReady ||
      (!this.props.user && this.state.initialLoggingIn)
    ) {
      return <Expo.AppLoading />;
    }

    if (!this.props.user) {
      return (
        <Root>
          <LoginSignup />
        </Root>
      );
    }

    return <App />;
  }
}

export default createContainer(() => {
  return {
    user: Meteor.user(),
    loggingIn: Meteor.loggingIn()
  };
}, Setup);
