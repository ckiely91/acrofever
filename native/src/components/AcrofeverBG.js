import React from "react";
import ImageBackgroundRepeat from "./ImageBackgroundRepeat";

const launchscreenBg = require("../../assets/acro-bg-pattern.png");

const styles = {
  flex: 1,
  width: null,
  height: null,
  backgroundColor: "#FFF"
};

const AcrofeverBG = ({ style, children }) => (
  <ImageBackgroundRepeat 
    source={launchscreenBg}
    imgHeight={300}
    imgWidth={300}
    style={{ ...styles, ...style }
  }>
    {children}
  </ImageBackgroundRepeat>
);

export default AcrofeverBG;
