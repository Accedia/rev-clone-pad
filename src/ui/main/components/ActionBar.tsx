import React, { Dispatch, SetStateAction, useState } from 'react';
import { Button, createStyles, Group } from '@mantine/core';
import { IconHelp } from '@tabler/icons';
import HelpModal from './HelpModal';
import useIpcRenderer from '../../useIpcRenderer';
import { Channel } from '../../../shared/enums';
import { Forgettable } from '../../../shared/models';

interface ActionBarProps {
  setForgettable: Dispatch<SetStateAction<Forgettable>>;
}

const useStyles = createStyles(() => ({
  icon: {
    marginRight: '4px',
  },
}));

const ActionBar: React.FC<ActionBarProps> = ({ setForgettable }) => {
  const { classes } = useStyles();
  const renderer = useIpcRenderer();
  const [modalOpen, setModalOpen] = useState<boolean>(false);

  const onModalOpen = (): void => {
    setModalOpen(true);
  };

  const onModalClose = (): void => {
    setModalOpen(false);
  };

  const onForgettableClear = (): void => {
    setForgettable(null);
  };

  const onApplicationClosed = (): void => {
    renderer.sendMessage(Channel.AppClosed);
  };

  return (
    <>
      <Group position="apart" mt="sm">
        <Button
          size="xs"
          classNames={{
            leftIcon: classes.icon,
          }}
          leftIcon={<IconHelp size={18} />}
          onClick={onModalOpen}
        >
          HELP
        </Button>
        <Group spacing="xs">
          <Button size="xs" variant="outline" onClick={onForgettableClear}>
            CLEAR
          </Button>
          <Button size="xs" onClick={onApplicationClosed}>
            CLOSE
          </Button>
        </Group>
      </Group>
      <HelpModal opened={modalOpen} onClose={onModalClose} />
    </>
  );
};

export default ActionBar;
