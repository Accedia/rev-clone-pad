import React, { useEffect, useMemo, useState } from 'react';
import { Box, Button, Center, createStyles, Loader, Text } from '@mantine/core';
import useIpcRenderer from '../../shared/useIpcRenderer';
import { Channel, UpdateStatus, UPDATE_STATUS_MESSAGES } from '../../../shared/enums';

const useStyles = createStyles(() => ({
  root: {
    display: 'flex',
    justifyContent: 'space-between',
    backgroundColor: '#ffffdd',
    padding: '5px 10px',
    height: '30px',
    boxSizing: 'border-box',
  },
  button: {
    padding: '5px',
    height: '20px',
    fontSize: '11px',
    textTransform: 'uppercase',
  },
}));

const StatusBar: React.FC = () => {
  const { classes } = useStyles();
  const renderer = useIpcRenderer();
  const [version, setVersion] = useState<string>('');
  const [status, setStatus] = useState<UpdateStatus>(UpdateStatus.UpdatesAvailable);

  useEffect(() => {
    renderer.on<string>(Channel.VersionUpdated, (version) => setVersion(version));
    renderer.on<UpdateStatus>(Channel.UpdateStatusChanged, (status) => setStatus(status));
  }, []);

  const onUpdateClicked = () => {
    // TODO: Confirmation modal
    renderer.sendMessage(Channel.UpdateAccepted);
  };

  const statusAction = useMemo((): JSX.Element | null => {
    switch (status) {
      case UpdateStatus.Checking:
        return <Loader color="yellow" size={20} />;
      case UpdateStatus.UpdatesAvailable:
        return (
          <Button className={classes.button} size="xs" color="yellow" onClick={onUpdateClicked}>
            Update
          </Button>
        );
      default:
        return null;
    }
  }, [status]);

  return (
    <>
      <Box className={classes.root}>
        <Center>
          <Text size="xs" mr={5}>
            <b>REV Clone Pad v{version}</b>
          </Text>
          <Text size="xs">{UPDATE_STATUS_MESSAGES[status]}</Text>
        </Center>
        {statusAction}
      </Box>
    </>
  );
};

export default StatusBar;
