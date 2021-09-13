import axios from 'axios';
import Markdown from 'markdown-to-jsx';
import React, { useEffect, useState } from 'react';
import { Icon, Message, Segment } from 'semantic-ui-react';

interface ManualProps {}

const Manual: React.FC<ManualProps> = () => {
  const [value, setValue] = useState<string>();

  useEffect(() => {
    const fetch = async () => {
      const result = await axios.get<{ text: string }>(
        'http://dev.fit-portal.com/api/fit-ccc-input-automation-text'
      );
      setValue(result.data.text);
    };

    fetch();
  }, []);

  return (
    <div className="markdown-container">
      <Message info attached="top">
        <Icon name="question" />
        FIT CCC Input Automation Manual
      </Message>
      <Segment raised attached="bottom">
        <Markdown>{value || ''}</Markdown>
      </Segment>
    </div>
  );
};

export default Manual;
