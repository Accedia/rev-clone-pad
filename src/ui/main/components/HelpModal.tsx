import React from 'react';
import { createStyles, Image, List, Modal, Text } from '@mantine/core';

interface HelpModalProps {
  opened: boolean;
  onClose: () => void;
}

const useStyles = createStyles((theme) => ({
  title: {
    fontSize: theme.fontSizes.sm,
    fontWeight: 'bold',
  },
  paragraph: {
    fontSize: theme.fontSizes.sm,
    marginBottom: theme.spacing.sm,
  },
  image: {
    marginTop: 6,
  },
}));

const HelpModal: React.FC<HelpModalProps> = ({ opened, onClose }) => {
  const { classes } = useStyles();

  return (
    <Modal
      title="REV Clone Pad Help"
      classNames={{ title: classes.title }}
      opened={opened}
      onClose={onClose}
      centered
    >
      <Text className={classes.paragraph}>
        In order to populate the clipboard fields, you first need to clone a forgettable inside REV
        Clone Pad.
      </Text>
      <List size="sm" spacing={6} mb='xs'>
        <List.Item>
          In Portal, navigate to <b>Estimatics → Select Estimate</b>
        </List.Item>
        <List.Item>
          Select an estimate and click <b>Enhance Estimate</b>
        </List.Item>
        <List.Item>
          Click on <b>Generals</b> or <b>Specifics</b>
        </List.Item>
        <List.Item>Select the forgettables that you want to clone</List.Item>
        <Image className={classes.image} src="assets/checkbox-select.png" />
        <List.Item>
          Navigate to the <b>Review / Commit</b> tab
        </List.Item>
        <List.Item>Click on the clone button</List.Item>
        <Image className={classes.image} src="assets/clone-button.png" />
        <List.Item>
          Forgettable data will be cloned into REV Clone Pad, so you can transfer it to CCC using
          the clipboard.
        </List.Item>
      </List>
    </Modal>
  );
};

export default HelpModal;
