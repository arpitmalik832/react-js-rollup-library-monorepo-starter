/* eslint-disable no-console */
/**
 * Generates a list of icon files.
 * @file The file is saved as `generate_icons_list.js`.
 */
import { resolve, join, dirname, sep } from 'path';
import { readdir, writeFile } from 'fs/promises';
import { fileURLToPath } from 'url';

import commonPaths from '../build_utils/config/commonPaths.mjs';

const filename = fileURLToPath(import.meta.url);
const dirName = dirname(filename);

/**
 * Retrieves a list of icon files from the specified directory.
 * @param {string} dir - The directory to search for icons.
 * @returns {Promise<string[]>} A promise that resolves to an array of icon file paths.
 * @example
 * // Example usage:
 * const icons = await getIcons('/path/to/icons');
 */
async function getIcons(dir) {
  const dirents = await readdir(dir, { withFileTypes: true });
  const files = await Promise.all(
    dirents.map(dirent => {
      const res = resolve(dir, dirent.name);
      return dirent.isDirectory()
        ? getIcons(res)
        : res?.split(`${sep}icons${sep}`)[1];
    }),
  );
  return Array.prototype.concat(...files);
}

/**
 * Processes icon files in the specified directory.
 * @param {string} dir - The directory containing the icon files.
 * @example
 * // Example usage:
 * await processIcons('/path/to/icons');
 */
async function processIcons(dir) {
  const files = await getIcons(dir);
  const filesNew = files.map(i => i.replace('\\', '/'));
  const content = `// Do not edit directly.
// Last generated on ${new Date()}

const list = ${JSON.stringify(filesNew, null, 2)}

export default list;
`;
  await writeFile(join(dirName, '..', commonPaths.icons_list), content);
}

processIcons(join(dirName, '..', commonPaths.icons))
  .then(() => {
    console.log('\x1b[42m%s\x1b[0m', 'Successfully generated icons list');
  })
  .catch(e => {
    console.error('\x1b[41m%s: %s\x1b[0m', 'Failed to process icons', e);
  });
