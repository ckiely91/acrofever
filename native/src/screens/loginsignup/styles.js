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
    top: Platform.OS === "android" ? -70 : -95,
    width: 280,
    height: 70
  },
  text: {
    ...base.text
  },
  formContainer: {
    marginBottom: 30,
    padding: 20
  },
  form: {
    marginBottom: 20
  },
  buttonPrimary: {
    ...base.buttonPrimary,
    marginBottom: 10
  },
  buttonPrimaryText: {
    ...base.buttonPrimaryText
  },
  buttonSecondary: {
    ...base.buttonSecondary,
    marginBottom: 10
  },
  buttonSecondaryText: {
    ...base.buttonSecondaryText
  },
  smallLinkText: {
    fontSize: 12,
    textAlign: "center"
  }
};
