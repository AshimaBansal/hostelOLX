import ApiError from '../utils/ApiError.js';
import env from '../config/env.js';

export function notFoundHandler(req, _res, next) {
  next(new ApiError(404, `Route ${req.method} ${req.originalUrl} not found`));
}

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, _req, res, _next) {
  // Broken JSON in the request body
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ success: false, message: 'Invalid JSON in request body' });
  }

  const statusCode = err instanceof ApiError ? err.statusCode : 500;
  const message = statusCode === 500 && env.isProduction ? 'Something went wrong' : err.message;

  if (statusCode === 500 && !env.isTest) {
    console.error(err);
  }

  const body = { success: false, message };
  if (err.details) body.details = err.details;

  res.status(statusCode).json(body);
}
