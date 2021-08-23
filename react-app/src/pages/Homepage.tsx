import React from "react";
import { Header, Icon, Segment } from "semantic-ui-react";
import Settings from "./Settings";

import "./app.css";
import Controls from "./Controls";

const Homepage: React.FC = () => {
  return (
    <div className="homepage-container">
      <Header as="h2" attached="top" size="medium">
        <Icon name="sliders horizontal" />
        Controls
      </Header>
      <Segment attached color="blue">
        <Controls />
      </Segment>
      <Header as="h2" attached="top" size="medium">
        <Icon name="settings" />
        Configuration
      </Header>
      <Segment attached color="grey">
        <Settings />
      </Segment>
    </div>
  );
};

export default Homepage;
