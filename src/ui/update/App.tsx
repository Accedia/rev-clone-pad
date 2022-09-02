import React, { useEffect, useState } from 'react';
import { createStyles, Box, MantineProvider, Text } from '@mantine/core';
import Indicator from './components/Indicator';
import useIpcRenderer from '../shared/useIpcRenderer';
import { Channel, UpdateStatus, UPDATE_STATUS_MESSAGES } from '../../shared/enums';

const useStyles = createStyles(() => ({
  root: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '8px'
  },
}));

const App: React.FC = () => {
  const { classes } = useStyles();
  const renderer = useIpcRenderer();
  const [progress, setProgress] = useState<number>(0);
  const [status, setStatus] = useState<UpdateStatus>(UpdateStatus.Downloading);

  useEffect(() => {
    renderer.on<UpdateStatus>(Channel.UpdateStatusChanged, (status) => setStatus(status));
    renderer.on<number>(Channel.DownloadPercentChanged, (value) => setProgress(value));
  }, []);

  return (
    <MantineProvider withNormalizeCSS>
      <Box className={classes.root}>
        <Indicator status={status} value={progress} />
        <Text size="xs">{UPDATE_STATUS_MESSAGES[status]}</Text>
      </Box>
    </MantineProvider>
  );
};

export default App;
