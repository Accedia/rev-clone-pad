import React from 'react';
import { MantineProvider } from '@mantine/core';
import CloneScreen from './screens/CloneScreen';

const App: React.FC = () => {
  return (
    <MantineProvider withNormalizeCSS>
      <CloneScreen />
    </MantineProvider>
  );
};

export default App;
