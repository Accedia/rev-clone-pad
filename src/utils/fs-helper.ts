import fs from 'fs';

export const createDir = (path: string): void => {
  if (fs.existsSync(path)) {
    return;
  }

  fs.mkdirSync(path);
}

export const getFileExtension = (name: string): string | null => {
  if (!name.includes('.')) {
    return null;
  }

  const nameParts = name.split('.');
  return nameParts[nameParts.length - 1];
};