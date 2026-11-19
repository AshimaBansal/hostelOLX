import fs from 'node:fs';
import path from 'node:path';
import { randomUUID } from 'node:crypto';

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_MIME_TYPES = Object.freeze({
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
});

const uploadsDir = path.resolve(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

export function createUploadService(storageDir = uploadsDir) {
  async function saveBase64Image(dataUriString) {
    if (!dataUriString || typeof dataUriString !== 'string') {
      const error = new Error('Invalid image payload.');
      error.statusCode = 400;
      throw error;
    }

    const matches = dataUriString.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-+.]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      if (dataUriString.startsWith('/images/') || dataUriString.startsWith('http')) {
        return {
          url: dataUriString,
          filename: path.basename(dataUriString),
          size: 0,
          mimeType: 'image/preset',
        };
      }

      const error = new Error('Invalid image data URL format.');
      error.statusCode = 400;
      throw error;
    }

    const mimeType = matches[1].toLowerCase();
    const ext = ALLOWED_MIME_TYPES[mimeType];

    if (!ext) {
      const error = new Error(`Unsupported image format: ${mimeType}. Allowed: JPEG, PNG, WEBP, GIF.`);
      error.statusCode = 400;
      throw error;
    }

    const buffer = Buffer.from(matches[2], 'base64');

    if (buffer.length > MAX_FILE_SIZE) {
      const error = new Error(`Image size exceeds 5MB limit (${(buffer.length / 1024 / 1024).toFixed(2)} MB).`);
      error.statusCode = 400;
      throw error;
    }

    const filename = `${randomUUID()}.${ext}`;
    const destination = path.join(storageDir, filename);

    await fs.promises.writeFile(destination, buffer);

    return {
      url: `/uploads/${filename}`,
      filename,
      size: buffer.length,
      mimeType,
    };
  }

  async function deleteImage(imageUrl) {
    if (!imageUrl || typeof imageUrl !== 'string' || !imageUrl.startsWith('/uploads/')) {
      return false;
    }

    const filename = path.basename(imageUrl);
    const filePath = path.join(storageDir, filename);

    try {
      if (fs.existsSync(filePath)) {
        await fs.promises.unlink(filePath);
        return true;
      }
    } catch {
      return false;
    }

    return false;
  }

  return {
    saveBase64Image,
    deleteImage,
  };
}

export const uploadService = createUploadService();
