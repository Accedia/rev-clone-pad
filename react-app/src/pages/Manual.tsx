import axios from 'axios';
import Markdown from 'markdown-to-jsx';
import React, { useEffect, useState } from 'react';
import { Icon, Loader, Message, Segment } from 'semantic-ui-react';

interface ManualProps {}

const Manual: React.FC<ManualProps> = () => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [value, setValue] = useState<string>();

  useEffect(() => {
    const fetch = async () => {
      const result = await axios.get<{ text: string }>(
        'http://dev.fit-portal.com/api/fit-ccc-input-automation-text'
      );
      setValue(result.data.text);
      setIsLoading(false);
    };

    fetch();
  }, []);

  return (
    <div className="markdown-container">
      <Message info attached="top">
        <Icon name="question" />
        FIT CCC Input Automation Manual
      </Message>
      <Segment raised attached className="markdown-preview">
        {isLoading ? <Loader active inline="centered" /> : <Markdown>{value || ''}</Markdown>}
      </Segment>
      <Message warning attached="bottom">
        <Icon name="info" />
        For more information contact FIT Administrator
      </Message>
    </div>
  );
};

export default Manual;
