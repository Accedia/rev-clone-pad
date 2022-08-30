import React, { useEffect, useMemo, useState } from 'react';
import {
  createStyles,
  Box,
  MantineProvider,
  Loader,
  Text,
} from '@mantine/core';
import { Progress } from './components';

enum UpdateState {
  Checking = 'checking',
  Downloading = 'downloading',
  Installing = 'installing',
  Error = 'error',
}

const useStyles = createStyles(() => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loaderContainer: {
    padding: 8,
  },
}));

const App: React.FC = () => {
  const { classes } = useStyles();
  const [state, setState] = useState<UpdateState>(UpdateState.Checking);
  const [progress, setProgress] = useState<number>(0);

  useEffect(() => {
    setTimeout(() => {
      setState(UpdateState.Downloading);
      setInterval(() => {
        if (progress < 100) {
          setProgress((progress) => progress + 1);
        }
      }, 50);
    }, 1500);
  }, []);

  const statusText = useMemo((): string => {
    switch (state) {
      case UpdateState.Checking:
        return 'Checking for updates...';
      case UpdateState.Downloading:
        return 'Downloading latest version...';
      case UpdateState.Installing:
        return 'Installing latest version...';
      case UpdateState.Error:
        return 'Oops! Something went wrong while updating.';
    }
  }, [state]);

  return (
    <MantineProvider withNormalizeCSS>
      <Box className={classes.root}>
        {state === UpdateState.Checking ? (
          <Box className={classes.loaderContainer}>
            <Loader size={80} />
          </Box>
        ) : (
          <Progress value={progress} />
        )}
        <Text size='md'>{statusText}</Text>
      </Box>
    </MantineProvider>
  );
};

export default App;
