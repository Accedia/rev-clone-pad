import React, { useMemo } from 'react';
import { IconCheck, IconCircleX } from '@tabler/icons';
import { Center, Loader, RingProgress, Text, ThemeIcon } from '@mantine/core';
import { UpdateStatus } from '../../../shared/enums';
import { UPDATE_STATUS_COLOR } from '../../../shared/enums/update-status';

interface IndicatorProps {
  status: UpdateStatus;
  value: number;
}

const Indicator: React.FC<IndicatorProps> = ({ status, value }) => {
  const progressProps = useMemo(
    () => ({
      size: 55,
      thickness: 5,
      sections: [{ value, color: UPDATE_STATUS_COLOR[status] }],
    }),
    [status, value]
  );

  switch (status) {
    case UpdateStatus.Downloading: {
      return (
        <RingProgress
          label={
            <Text color="blue" weight={700} align="center" size="xs">
              {value}%
            </Text>
          }
          {...progressProps}
        />
      );
    }
    case UpdateStatus.Installing: {
      return (
        <RingProgress
          label={
            <Center>
              <Loader color="teal" variant="dots" size={15} />
            </Center>
          }
          {...progressProps}
        />
      );
    }
    case UpdateStatus.Error: {
      return (
        <RingProgress
          label={
            <Center>
              <ThemeIcon color="red" variant="light" radius="xl" size="md">
                <IconCircleX size={15} />
              </ThemeIcon>
            </Center>
          }
          {...progressProps}
        />
      );
    }
    default: {
      return (
        <RingProgress
          label={
            <Center>
              <ThemeIcon color="teal" variant="light" radius="xl" size="md">
                <IconCheck size={15} />
              </ThemeIcon>
            </Center>
          }
          {...progressProps}
        />
      );
    }
  }
};

export default Indicator;
