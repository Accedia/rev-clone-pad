import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Badge, Box, Button, createStyles, SimpleGrid, Space, Text } from '@mantine/core';
import { IconAlertCircle, IconCheck } from '@tabler/icons';
import { CopyField } from '../components';
import { useDisabledByOperation } from '../hooks';
import useIpcRenderer from '../../shared/useIpcRenderer';
import { Channel, LaborType, OperationType, PartType } from '../../../shared/enums';
import { Forgettable } from '../../../shared/models';

const useStyles = createStyles((theme) => ({
  root: {
    padding: theme.spacing.sm,
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    boxSizing: 'border-box',
  },
  topRow: {
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    paddingBottom: theme.spacing.sm,
    borderBottom: `1px dashed ${theme.colors.gray[4]}`,
  },
  topText: {
    fontSize: 11,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  space: {
    flexGrow: 1,
  },
  alert: {
    borderRadius: 4,
    marginTop: theme.spacing.sm,
    padding: theme.spacing.xs,
    fontWeight: 'bold',
  },
  grid: {
    gap: 0,
    columnGap: 24,
  },
  sectionHeader: {
    color: 'white',
    backgroundColor: theme.colors.indigo[7],
    padding: '5px 10px',
    borderRadius: '4px',
    fontSize: '13px',
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  actions: {
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
    flexGrow: 1,
  },
  red: {
    color: theme.colors.red[6],
  },
  green: {
    color: theme.colors.green[6],
  },
  alignEnd: {
    alignSelf: 'flex-end',
  },
}));

const CloneScreen: React.FC = () => {
  const renderer = useIpcRenderer();
  const { classes, cx } = useStyles();
  const [forgettable, setForgettable] = useState<Forgettable | null>(null);
  const isDisabled = useDisabledByOperation(forgettable);

  useEffect(() => {
    renderer.on<Forgettable>(Channel.ForgettableCloned, (forgettable) =>
      setForgettable(forgettable)
    );
  }, []);

  const warning = useMemo((): string => {
    const systems = forgettable?.unsupportedSystems || [];
    return systems.length ? `Do not use in systems: [${systems.join(', ')}]` : '';
  }, [forgettable?.unsupportedSystems]);

  return (
    <Box className={classes.root}>
      <Box className={classes.topRow}>
        <Text className={classes.topText}>Cloned item: </Text>
        <Space className={classes.space} />
        <Badge color="teal" variant="filled" radius="sm" mr="sm">
          Operation: {forgettable?.operation || OperationType.NONE}
        </Badge>
        <Badge color="teal" variant="filled" radius="sm">
          Group: {forgettable?.groupName || 'N/A'}
        </Badge>
      </Box>
      <Alert
        color={warning ? 'red' : 'green'}
        classNames={{
          root: classes.alert,
          message: warning ? classes.red : classes.green,
        }}
        icon={warning ? <IconAlertCircle size={18} /> : <IconCheck size={18} />}
      >
        {warning || 'Can be used in all systems!'}
      </Alert>
      <CopyField
        label="Description"
        value={forgettable?.description}
        disabled={isDisabled('description')}
      />
      <SimpleGrid pt="sm" cols={2} className={classes.grid}>
        <Text className={classes.sectionHeader}>Labor</Text>
        <Text className={classes.sectionHeader}>Part</Text>
        <CopyField
          label="Labor Hours"
          value={forgettable?.laborHours.toString()}
          disabled={isDisabled('laborHours')}
        />
        <CopyField
          label="Part Price"
          value={forgettable?.partPrice.toFixed(2)}
          disabled={isDisabled('partPrice')}
        />
        <CopyField
          label="Labor Type"
          value={forgettable?.laborType || LaborType.None}
          disabled={isDisabled('laborType')}
        />
        <CopyField
          label="Part Type"
          value={forgettable?.partType || PartType.None}
          disabled={isDisabled('partType')}
        />
        <Text className={cx(classes.sectionHeader, classes.alignEnd)}>Refinish</Text>
        <CopyField
          label="Quantity"
          value={forgettable?.quantity.toString()}
          disabled={isDisabled('quantity')}
        />
        <CopyField
          label="Paint Hours"
          value={forgettable?.paintHours.toString()}
          disabled={isDisabled('paintHours')}
        />
        <CopyField
          label="Part Number"
          value={forgettable?.partNumber}
          disabled={isDisabled('partNumber')}
        />
      </SimpleGrid>
      <CopyField
        label="Line Note"
        value={forgettable?.lineNote}
        disabled={isDisabled('lineNote')}
        textArea
      />
      <Box className={classes.actions}>
        <Button mt="sm" size="xs" onClick={() => console.log('Hello')}>
          DONE
        </Button>
      </Box>
    </Box>
  );
};

export default CloneScreen;
