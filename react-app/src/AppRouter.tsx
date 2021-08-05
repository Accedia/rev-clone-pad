import React from "react";
import { Route, Switch, HashRouter as Router } from "react-router-dom";
import Controls from "./pages/Controls";
import Main from "./pages/Main";
import LoadingPage from "./pages/LoadingPage";

const AppRouter: React.FC = () => {
  return (
    <Router>
      <Switch>
        <Route path="/" exact>
          <Main />
        </Route>
        <Route path="/controls">
          <Controls />
        </Route>
        <Route path="/loading">
          <LoadingPage />
        </Route>
      </Switch>
    </Router>
  );
};

export default AppRouter;
