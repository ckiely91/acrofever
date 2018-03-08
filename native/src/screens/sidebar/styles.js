import { Platform, Dimensions } from "react-native";
const deviceHeight = Dimensions.get("window").height;
const deviceWidth = Dimensions.get("window").width;

import * as base from "../../styles/base";

export default {
  content: {
    flex: 1,
    backgroundColor: base.colors.black
  },
  drawerCover: {
    alignSelf: "stretch",
    height: deviceHeight / 4.5,
    width: null,
    position: "relative",
    marginBottom: 10
  },
  drawerImage: {
    position: "absolute",
    left: Platform.OS === "android" ? deviceWidth / 10 : deviceWidth / 9,
    top: Platform.OS === "android" ? deviceHeight / 11 : deviceHeight / 10,
    width: 200,
    height: 50,
    resizeMode: "cover"
  },
  text: {
    ...base.text,
    color: base.colors.white,
    marginLeft: 20
  },
  list: base.colors.red
};
