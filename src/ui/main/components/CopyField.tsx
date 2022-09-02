import React, { useEffect } from 'react';
import { ActionIcon, createStyles, Textarea, TextInput, Tooltip } from '@mantine/core';
import { useClipboard } from '@mantine/hooks';
import { IconCopy, IconCheck } from '@tabler/icons';

interface CopyFieldProps {
  value: string;
  label: string;
  disabled: boolean;
  textArea?: boolean;
}

const useStyles = (copied: boolean) => {
  const handler = createStyles((theme) => ({
    label: {
      fontSize: '10px',
      textTransform: 'uppercase',
    },
    field: {
      backgroundColor: copied ? theme.colors.green[0] : '#edf2ff78',
      borderColor: copied ? theme.colors.green[6] : theme.colors.indigo[4],
      '&:focus': {
        borderColor: copied ? theme.colors.green[6] : theme.colors.indigo[4],
      },
    },
    disabled: {
      borderColor: theme.colors.gray[4],
    },
  }));

  return handler();
};

const CopyField: React.FC<CopyFieldProps> = ({ value, label, disabled, textArea = false }) => {
  const { copy, copied, reset } = useClipboard({ timeout: 1000 * 60 * 60 * 24 });
  const { classes } = useStyles(copied);

  useEffect(() => {
    if (!value) reset();
  }, [value])

  const Component = React.useMemo(() => (textArea ? Textarea : TextInput), [textArea]);

  const onCopy = (): void => {
    copy(value);
  };

  return (
    <Component
      readOnly
      label={label}
      value={value}
      disabled={disabled}
      classNames={{
        input: classes.field,
        label: classes.label,
        disabled: classes.disabled,
      }}
      size="xs"
      rightSection={
        disabled ? null : (
          <Tooltip label={copied ? 'Copied' : 'Copy'} withArrow position="right">
            <ActionIcon size="sm" color={copied ? 'green' : 'indigo'} onClick={onCopy}>
              {copied ? <IconCheck size={18} /> : <IconCopy size={18} />}
            </ActionIcon>
          </Tooltip>
        )
      }
    />
  );
};

export default CopyField;
