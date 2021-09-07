import React from 'react';
import { Route, Switch, HashRouter as Router } from 'react-router-dom';
import BlockOverlay from './pages/BlockOverlay';
import Controls from './pages/Controls';
import Homepage from './pages/Homepage';
import LoadingPage from './pages/LoadingPage';

const AppRouter: React.FC = () => {
  return (
    <Router>
      <Switch>
        <Route path="/" exact>
          <Homepage />
        </Route>
        <Route path="/controls">
          <Controls />
        </Route>
        <Route path="/loading">
          <LoadingPage />
        </Route>
        <Route path="/block-overlay">
          <BlockOverlay />
        </Route>
      </Switch>
    </Router>
  );
};

export default AppRouter;
