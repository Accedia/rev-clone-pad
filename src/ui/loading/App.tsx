import React, { useEffect, useState } from 'react';
import { createStyles, Box, MantineProvider, Loader, Text } from '@mantine/core';
import { Progress } from './components';
import useIpcRenderer from '../shared/useIpcRenderer';
import { Channel, UpdateStatus, UPDATE_STATUS_MESSAGES } from '../../shared/enums';

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
  const renderer = useIpcRenderer();
  const [status, setStatus] = useState<UpdateStatus>(UpdateStatus.Checking);
  const [progress, setProgress] = useState<number>(0);

  useEffect(() => {
    renderer.on<UpdateStatus>(Channel.UpdateStatusChanged, (status) => {
      console.log(status);
      setStatus(status)
    });
    renderer.on<number>(Channel.DownloadPercentChanged, (value) => setProgress(value));
  }, []);

  return (
    <MantineProvider withNormalizeCSS>
      <Box className={classes.root}>
        {status === UpdateStatus.Checking ? (
          <Box className={classes.loaderContainer}>
            <Loader size={80} />
          </Box>
        ) : (
          <Progress value={progress} />
        )}
        <Text size="md">{UPDATE_STATUS_MESSAGES[status]}</Text>
      </Box>
    </MantineProvider>
  );
};

export default App;
