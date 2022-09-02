import React from 'react';
import { IconHelp } from '@tabler/icons';
import { Box, Button, createStyles } from '@mantine/core';

const useStyles = createStyles(() => ({
  root: {
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    flexGrow: 1,
  },
  icon: {
    marginRight: '4px'
  }
}));

const ActionBar: React.FC = () => {
  const { classes } = useStyles();

  return (
    <Box className={classes.root} mt="sm">
      <Button
        size="xs"
        classNames={{
          leftIcon: classes.icon,
        }}
        leftIcon={<IconHelp size={18} />}
        onClick={() => console.log('Hello')}
      >
        HELP
      </Button>
      <Button size="xs" onClick={() => console.log('Hello')}>
        DONE
      </Button>
    </Box>
  );
};

export default ActionBar;
