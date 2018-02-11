import React from "react";
import PropTypes from "prop-types";
import { View, Image, Dimensions } from "react-native"

const ImageBackgroundRepeat = ({ style, source, imgWidth, imgHeight, children }) => {
  const { width: winWidth, height: winHeight } = Dimensions.get("window");
  const images = [];

  for (let i = 0; i < Math.ceil(winHeight / imgHeight); i++) {
    const imgRowImgs = [];
    for (let j = 0; j < Math.ceil(winWidth / imgWidth); j++) {
      imgRowImgs.push((
        <Image key={j} source={source} style={{ height: imgHeight}} />
      ));
    }
    images.push((
      <View key={i} style={{ flexDirection: "row" }}>
        {imgRowImgs}
      </View>
    ));
  }

  return (
    <View style={{ flex: 1, flexDirection: "column", ...style }}>
      {images}
      <View style={{ position: "absolute", top: 0, bottom: 0, left: 0, right: 0 }}>
        {children}
      </View>
    </View>
  )
};

ImageBackgroundRepeat.propTypes = {
  imgWidth: PropTypes.number.isRequired,
  imgHeight: PropTypes.number.isRequired,
  children: PropTypes.any.isRequired
};

export default ImageBackgroundRepeat;
