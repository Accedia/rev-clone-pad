import React from "react";
import { Button, Header, Icon, Popup, Segment } from "semantic-ui-react";
import Settings from "./Settings";

import "./app.css";
import Controls from "./Controls";

const Homepage: React.FC = () => {
  const [isSettingsCollapsed, setIsSettingsCollapsed] = React.useState(true);

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
          <Popup
            inverted
            content={`${isSettingsCollapsed ? "Show" : "Hide"} settings`}
            trigger={
              <Button
                floated="right"
                basic
                icon={`caret ${isSettingsCollapsed ? "down" : "up"}`}
                size="tiny"
                onClick={() => setIsSettingsCollapsed(!isSettingsCollapsed)}
              />
            }
          />
        </Header>
        <Segment
          attached
          color="grey"
          className={`settings-segment settings-body ${isSettingsCollapsed ? "hidden" : ""}`}
        >
          <Settings />
        </Segment>
      </Segment.Group>
    </div>
  );
};

export default Homepage;
