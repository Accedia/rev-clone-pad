import React, { CSSProperties, useEffect, useMemo, useState } from 'react';
import { Box, Button, Center, createStyles, Group, Loader, Modal, Text } from '@mantine/core';
import useIpcRenderer from '../../useIpcRenderer';
import { Channel, UpdateStatus, UPDATE_STATUS_MESSAGES } from '../../../shared/enums';

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
  modal: {
    padding: '8px !important',
    display: 'flex',
    flexDirection: 'column',
    maxWidth: '231px',
  },
}));

const StatusBar: React.FC = () => {
  const { classes } = useStyles();
  const renderer = useIpcRenderer();
  const [version, setVersion] = useState<string>('');
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [status, setStatus] = useState<UpdateStatus>(UpdateStatus.UpdatesAvailable);

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

  const onUpdateAccepted = (): void => {
    renderer.sendMessage(Channel.UpdateAccepted);
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
      <Modal
        classNames={{ modal: classes.modal }}
        opened={modalOpen}
        onClose={onModalClose}
        withCloseButton={false}
        size="xs"
        centered
      >
        <Box>
          <Text weight="bold" size="sm" mb={20}>
            If you have cloned a forgettable, you need to do it again after the update is complete,
            as all clone data will be lost.
          </Text>
          <Group position="apart">
            <Button size="xs" color="red" onClick={onModalClose}>
              CANCEL
            </Button>
            <Button size="xs" onClick={onUpdateAccepted}>
              CONTINUE
            </Button>
          </Group>
        </Box>
      </Modal>
    </>
  );
};

export default StatusBar;
