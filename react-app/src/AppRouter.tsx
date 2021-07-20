import React from "react";
import { Route, Switch, BrowserRouter } from "react-router-dom";
import Controls from "./pages/Controls";
import Main from "./pages//Main";

const AppRouter: React.FC = () => {
  return (
    <BrowserRouter>
      <Switch>
        <Route path="/" exact>
          <Main />
        </Route>
        <Route path="/controls">
          <Controls />
        </Route>
      </Switch>
    </BrowserRouter>
  );
};

export default AppRouter;
