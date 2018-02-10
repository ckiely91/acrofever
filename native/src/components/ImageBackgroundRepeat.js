import React from "react";
import PropTypes from "prop-types";
import { View, Image, Dimensions } from "react-native"

const ImageBackgroundRepeat = ({ source, imgWidth, children }) => {
  const winWidth = Dimensions.get("window").width;
  const images = [];

  for (let i = 0; i < Math.ceil(winWidth / imgWidth); i++) {
    images.push((
      <Image key={i} source={source} />
    ));
  }

  return (
    <View style={{ flex: 1, flexDirection: "column" }}>
      {images}
      <View style={{ position: "absolute", top: 0, bottom: 0, left: 0, right: 0 }}>
        {children}
      </View>
    </View>
  )
};

ImageBackgroundRepeat.propTypes = {
  // source: PropTypes.string.isRequired,
  imgWidth: PropTypes.number,
  children: PropTypes.any.isRequired
};

ImageBackgroundRepeat.defaultProps = {
  imgWidth: 7
};

export default ImageBackgroundRepeat;
