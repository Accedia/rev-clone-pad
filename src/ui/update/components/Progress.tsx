import React, { useMemo } from 'react';
import { Center, ThemeIcon, RingProgress, Text } from '@mantine/core';
import { IconCheck } from '@tabler/icons';

interface ProgressProps {
  value: number;
}

const Progress: React.FC<ProgressProps> = ({ value = 0 }) => {
  const sections = useMemo(() => {
    const color = value >= 100 ? 'teal' : 'blue';
    return [{ value, color }];
  }, [value]);

  return value < 100 ? (
    <RingProgress
      size={98}
      thickness={10}
      sections={sections}
      label={
        <Text color='blue' weight={700} align='center' size='xl'>
          {value}%
        </Text>
      }
    />
  ) : (
    <RingProgress
      size={98}
      thickness={10}
      sections={sections}
      label={
        <Center>
          <ThemeIcon color='teal' variant='light' radius='xl' size='xl'>
            <IconCheck size={22} />
          </ThemeIcon>
        </Center>
      }
    />
  );
};

export default Progress;
