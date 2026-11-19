import { uploadService } from './upload.service.js';
import { successResponse, errorResponse } from '../../utils/apiResponse.js';

export function createUploadController(service = uploadService) {
  async function upload(req, res) {
    const rawImage = req.body?.image || req.body?.file || req.body?.data;
    if (!rawImage) {
      return errorResponse(res, 'No image data provided. Send a base64 data URL in { image }.', 400);
    }

    try {
      const result = await service.saveBase64Image(rawImage);
      return successResponse(res, result, 201);
    } catch (error) {
      const status = error.statusCode || 500;
      return errorResponse(res, error.message || 'Image upload failed.', status);
    }
  }

  return {
    upload,
  };
}

export const uploadController = createUploadController();
