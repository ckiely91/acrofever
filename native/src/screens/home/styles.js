import { Dimensions, Platform } from "react-native";
import * as base from "../../styles/base";

const deviceHeight = Dimensions.get("window").height;

export default {
  logoContainer: {
    flex: 1,
    marginTop: deviceHeight / 8,
    marginBottom: 30
  },
  logo: {
    position: "absolute",
    left: Platform.OS === "android" ? 40 : 50,
    top: Platform.OS === "android" ? 35 : 60,
    width: 280,
    height: 70
  },
  logoText: {
    ...base.logo
  },
  betaText: {
    ...base.text,
    fontSize: 16
  },
  text: {
    ...base.text
  },
  button: {
    ...base.buttonPrimary,
    alignSelf: "center"
  },
  buttonText: {
    ...base.buttonPrimaryText
  }
};
