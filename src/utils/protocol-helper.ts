import { APP_PROTOCOL } from '../shared/constants';

export const resolveProtocolUrl = (argv: string[]): string => {
  const prefix = `${APP_PROTOCOL}://`;
  const url = argv.find((arg) => arg.startsWith(prefix));
  if (!url) {
    return '';
  }

  let replaced = url.replace(prefix, '');
  if (replaced.endsWith('/')) {
    replaced = replaced.slice(0, -1);
  }

  return decodeURI(replaced);
};