import React, { CSSProperties, useEffect, useMemo, useState } from 'react';
import { Box, Button, Center, createStyles, Loader, Text } from '@mantine/core';
import useIpcRenderer from '../../useIpcRenderer';
import { Channel, UpdateStatus, UPDATE_STATUS_MESSAGES } from '../../../shared/enums';
import ConfirmationModal from './ConfirmationModal';

type FontWeight = CSSProperties['fontWeight'];

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
  const [status, setStatus] = useState<UpdateStatus>(UpdateStatus.UpdatesAvailable);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [version, setVersion] = useState<string>('');

  useEffect(() => {
    renderer.on<string>(Channel.VersionUpdated, (version) => setVersion(version));
    renderer.on<UpdateStatus>(Channel.UpdateStatusChanged, (status) => setStatus(status));
  }, []);

  const onModalClose = (): void => {
    setModalOpen(false);
  };

  const onUpdateClicked = (): void => {
    setModalOpen(true);
  };

  const messageWeight = useMemo((): FontWeight => {
    return status === UpdateStatus.NoUpdates ? 'normal' : 'bold';
  }, [status]);

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
          <Text size="xs" weight={messageWeight} mr={5}>
            REV Clone Pad v{version}
          </Text>
          <Text size="xs" weight={messageWeight}>
            {UPDATE_STATUS_MESSAGES[status]}
          </Text>
        </Center>
        {statusAction}
      </Box>
      <ConfirmationModal opened={modalOpen} onClose={onModalClose} />
    </>
  );
};

export default StatusBar;
