import * as base from "../../styles/base";

export default {
  logoContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  },
  logo: {
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
