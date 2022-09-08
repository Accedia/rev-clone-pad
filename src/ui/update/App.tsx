import React, { useEffect, useState } from 'react';
import { createStyles, MantineProvider, Text, Group, MantineTheme } from '@mantine/core';
import Indicator from './components/Indicator';
import useIpcRenderer from '../useIpcRenderer';
import { Channel, UpdateStatus, UPDATE_STATUS_MESSAGES } from '../../shared/enums';

const extractBorderColor = (theme: MantineTheme, status: UpdateStatus): string => {
  switch (status) {
    case UpdateStatus.Downloading:
      return theme.colors.blue[6];
    case UpdateStatus.Error:
      return theme.colors.red[6];
    default:
      return theme.colors.teal[6];
  }
};

const useStyles = createStyles((theme, status: UpdateStatus) => ({
  root: {
    display: 'flex',
    justifyContent: 'flex-start',
    boxShadow: `inset 8px 0 ${extractBorderColor(theme, status)}`,
  },
  text: {
    maxWidth: 165,
  }
}));

const App: React.FC = () => {
  const renderer = useIpcRenderer();
  const [progress, setProgress] = useState<number>(0);
  const [status, setStatus] = useState<UpdateStatus>(UpdateStatus.Downloading);
  const { classes } = useStyles(status);

  useEffect(() => {
    renderer.on<UpdateStatus>(Channel.UpdateStatusChanged, (status) => setStatus(status));
    renderer.on<number>(Channel.DownloadPercentChanged, (value) => setProgress(value));
  }, []);

  return (
    <MantineProvider withNormalizeCSS>
      <Group className={classes.root} spacing={3} p="xs">
        <Indicator status={status} value={progress} />
        <Text className={classes.text} size="xs">{UPDATE_STATUS_MESSAGES[status]}</Text>
      </Group>
    </MantineProvider>
  );
};

export default App;
