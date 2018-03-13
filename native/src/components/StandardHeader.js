import React from "react";
import {
  Header,
  Title,
  Subtitle,
  Button,
  Icon,
  Left,
  Right,
  Body
} from "native-base";

import * as base from "../styles/base";

const styles = {
  header: {
    backgroundColor: base.colors.red
  },
  icon: {
    color: base.colors.white
  },
  title: {
    color: base.colors.white
  },
  subtitle: {
    color: base.colors.white
  }
}

const StandardHeader = ({ navigation, title, subtitle, rightContent, goBack }) => (
  <Header style={styles.header} hasSubtitle={!!subtitle} noShadow>
    <Left>
      <Button
        transparent
        onPress={goBack ? () => navigation.goBack() : () => navigation.navigate("DrawerOpen")}
      >
        <Icon name={goBack ? "arrow-back" : "ios-menu"} style={styles.icon} />
      </Button>
    </Left>
    <Body>
      <Title style={styles.title}>{title}</Title>
      {subtitle && <Subtitle style={styles.subtitle}>{subtitle}</Subtitle>}
    </Body>
    <Right>{rightContent}</Right>
  </Header>
);

export default StandardHeader;
