import React from 'react';
import { Box, Button, createStyles, Group, Modal, Text, ThemeIcon } from '@mantine/core';
import useIpcRenderer from '../../useIpcRenderer';
import { Channel } from '../../../shared/enums';
import { IconCheck, IconInfoCircle, IconX } from '@tabler/icons';

interface ConfirmationModalProps {
  opened: boolean;
  onClose: () => void;
}

const useStyles = createStyles((theme) => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
    overflow: 'hidden',
  },
  body: {
    display: 'flex',
    alignItems: 'center',
    padding: theme.spacing.md,
    paddingTop: 22,
    borderBottom: `1px solid ${theme.colors.gray[4]}`,
    boxShadow: `inset 0 8px 0 0px ${theme.colors.blue[6]}`,
  },
  actions: {
    padding: 8,
    backgroundColor: '#f5f5f5',
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 4,
  },
  text: {
    fontSize: 13,
  },
  icon: {
    marginRight: 6,
  },
  cancelBtn: {
    '&:hover': {
      backgroundColor: 'white',
    },
  },
}));

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ opened, onClose }) => {
  const { classes } = useStyles();
  const renderer = useIpcRenderer();

  const onUpdateAccepted = (): void => {
    renderer.sendMessage(Channel.UpdateAccepted);
  };

  return (
    <Modal opened={opened} onClose={onClose} withCloseButton={false} size="sm" padding={0} centered>
      <Box className={classes.root}>
        <Box className={classes.body}>
          <ThemeIcon variant="light" size={35} radius="xl" mr="md">
            <IconInfoCircle size={25} />
          </ThemeIcon>
          <Box>
            <Text className={classes.text} mb={4}>
              The application needs to restart to apply the latest updates. All cloned data will be
              lost. You will need to clone your forgettable / rememberable again after the restart.
            </Text>
            <Text className={classes.text} weight="bold">
              Do you want to continue?
            </Text>
          </Box>
        </Box>
        <Group className={classes.actions} spacing="xs" position="right">
          <Button
            size="xs"
            variant="outline"
            uppercase
            className={classes.cancelBtn}
            classNames={{ leftIcon: classes.icon }}
            leftIcon={<IconX size={15} />}
            onClick={onClose}
          >
            No
          </Button>
          <Button
            size="xs"
            uppercase
            classNames={{ leftIcon: classes.icon }}
            leftIcon={<IconCheck size={15} />}
            onClick={onUpdateAccepted}
          >
            Yes
          </Button>
        </Group>
      </Box>
    </Modal>
  );
};

export default ConfirmationModal;
