/**
 * Read header background image as base64
 */
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const getHeaderImageBase64 = () => {
  try {
    const imagePath = join(__dirname, 'header-bg-small.png');
    const imageBuffer = readFileSync(imagePath);
    return `data:image/png;base64,${imageBuffer.toString('base64')}`;
  } catch (error) {
    console.error('Failed to load header image:', error);
    // Fallback: return empty string
    return '';
  }
};
