import { Alert, Badge, Box, createStyles, Space, Text } from '@mantine/core';
import { IconAlertCircle, IconCheck } from '@tabler/icons';
import React, { useMemo } from 'react';
import { Forgettable } from '../../../shared/models';
import { OperationType } from '../../../shared/enums';

interface ForgettableInfoBarProps {
  forgettable: Forgettable | null;
}

const useStyles = createStyles((theme) => ({
  info: {
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    paddingBottom: theme.spacing.sm,
    borderBottom: `1px dashed ${theme.colors.gray[4]}`,
  },
  infoText: {
    fontSize: 11,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  space: {
    flexGrow: 1,
  },
  alert: {
    borderRadius: '4px',
    marginTop: theme.spacing.sm,
    padding: '4px',
  },
  alertIcon: {
    height: '16px',
    width: '16px',
    marginRight: '6px',
  },
  alertWrapper: {
    display: 'flex',
    alignItems: 'center',
  },
  alertMessage: {
    fontSize: '13px',
    fontWeight: 'bold',
  },
  red: {
    color: theme.colors.red[6],
  },
  green: {
    color: theme.colors.green[6],
  },
}));

const ForgettableInfoBar: React.FC<ForgettableInfoBarProps> = ({ forgettable }) => {
  const { classes, cx } = useStyles();

  const warning = useMemo((): string => {
    if (!forgettable) {
      return 'No forgettable loaded in REV Clone Pad!';
    }

    const systems = forgettable?.unsupportedSystems || [];
    return systems.length ? `Do not use in systems: [${systems.join(', ')}]` : '';
  }, [forgettable?.unsupportedSystems]);

  return (
    <>
      <Box className={classes.info}>
        <Text className={classes.infoText}>Cloned item: </Text>
        <Space className={classes.space} />
        {forgettable ? (
          <>
            <Badge color="teal" variant="filled" radius="sm" mr="sm">
              Operation: {forgettable?.operation || OperationType.NONE}
            </Badge>
            <Badge color="teal" variant="filled" radius="sm">
              Group: {forgettable?.groupName.replace(/\(.+\)/, '') || 'N/A'}
            </Badge>
          </>
        ) : (
          <Badge color="red" variant="filled" radius="sm" mr="sm">
            N/A
          </Badge>
        )}
      </Box>
      <Alert
        color={warning ? 'red' : 'green'}
        classNames={{
          root: classes.alert,
          icon: classes.alertIcon,
          wrapper: classes.alertWrapper,
          message: cx(classes.alertMessage, warning ? classes.red : classes.green),
        }}
        icon={warning ? <IconAlertCircle size={16} /> : <IconCheck size={16} />}
      >
        {warning || 'Can be used in all systems!'}
      </Alert>
    </>
  );
};

export default ForgettableInfoBar;
