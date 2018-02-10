import React from "react";
import {
  Header,
  Title,
  Button,
  Icon,
  Left,
  Right,
  Body
} from "native-base";

const StandardHeader = ({ navigation, title, rightContent, goBack }) => (
  <Header>
    <Left>
      <Button
        transparent
        onPress={goBack ? () => navigation.goBack() : () => navigation.navigate("DrawerOpen")}
      >
        <Icon name={goBack ? "arrow-back" : "ios-menu"} />
      </Button>
    </Left>
    <Body>
      <Title>{title}</Title>
    </Body>
    <Right>{rightContent}</Right>
  </Header>
);

export default StandardHeader;
