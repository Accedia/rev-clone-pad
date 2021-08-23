import React from "react";
import { Header, Icon, Segment } from "semantic-ui-react";
import Settings from "./Settings";

import "./app.css";
import Controls from "./Controls";

const Homepage: React.FC = () => {
  return (
    <div className="homepage-container">
      <Segment.Group raised>
        <Header as="h2" attached="top" size="medium">
          Input Info
        </Header>
        <Segment attached color="blue">
          <Controls />
        </Segment>
      </Segment.Group>
      <Segment.Group raised>
        <Header as="h2" attached="top" size="medium">
          Settings
        </Header>
        <Segment attached color="grey" className="settings-segment">
          <Settings />
        </Segment>
      </Segment.Group>
    </div>
  );
};

export default Homepage;
