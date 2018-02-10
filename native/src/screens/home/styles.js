import { Dimensions } from "react-native";
import * as base from "../../styles/base";

const deviceHeight = Dimensions.get("window").height;

export default {
  imageContainer: {
    flex: 1,
    width: null,
    height: null
  },
  logoContainer: {
    flex: 1,
    marginTop: deviceHeight / 8,
    marginBottom: 30
  },
  logoText: {
    ...base.logo
  },
  text: {
    ...base.text,
    bottom: 6,
    marginTop: 5
  },
  button: {
    ...base.buttonPrimary,
    alignSelf: "center"
  },
  buttonText: {
    ...base.buttonPrimaryText
  }
};
