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
    marginBottom: 30
  },
  logoText: {
    ...base.logo
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
