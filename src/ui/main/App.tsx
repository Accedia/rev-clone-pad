import React from 'react';
import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import { MantineProvider } from '@mantine/core';
import CloneScreen from './screens/CloneScreen';

const App: React.FC = () => {
  return (
    <MantineProvider withNormalizeCSS>
      <Router>
        <Routes>
          <Route path="/" element={<CloneScreen />} />
          <Route path="/help" element={<CloneScreen />} />
        </Routes>
      </Router>
    </MantineProvider>
  );
};

export default App;
