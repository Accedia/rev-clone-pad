import React, { useState } from 'react';
import { IconHelp } from '@tabler/icons';
import { Button, createStyles, Group, Modal } from '@mantine/core';

const useStyles = createStyles(() => ({
  icon: {
    marginRight: '4px',
  },
}));

const ActionBar: React.FC = () => {
  const { classes } = useStyles();
  const [modalOpen, setModalOpen] = useState<boolean>(false);

  const onModalOpen = (): void => {
    setModalOpen(true);
  };

  const onModalClose = (): void => {
    setModalOpen(false);
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
        <Button size="xs" onClick={() => console.log('Hello')}>
          DONE
        </Button>
      </Group>
      <Modal opened={modalOpen} onClose={onModalClose} withCloseButton={false} centered>
        Im the modal fuck you
      </Modal>
    </>
  );
};

export default ActionBar;
