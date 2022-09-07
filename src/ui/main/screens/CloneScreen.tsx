import React, { useEffect, useState } from 'react';
import { Box, createStyles, SimpleGrid, Text } from '@mantine/core';
import { useDisabledByOperation } from '../hooks';
import { ActionBar, CopyField, ForgettableInfoBar, StatusBar } from '../components';
import useIpcRenderer from '../../useIpcRenderer';
import { Forgettable } from '../../../shared/models';
import { Channel, LaborType, PartType } from '../../../shared/enums';

const useStyles = createStyles((theme) => ({
  root: {
    height: '100vh',
    boxSizing: 'border-box',
  },
  body: {
    padding: theme.spacing.sm,
    display: 'flex',
    flexDirection: 'column',
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

  return (
    <Box className={classes.root}>
      <StatusBar />
      <Box className={classes.body}>
        <ForgettableInfoBar forgettable={forgettable} />
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
        <ActionBar setForgettable={setForgettable} />
      </Box>
    </Box>
  );
};

export default CloneScreen;
