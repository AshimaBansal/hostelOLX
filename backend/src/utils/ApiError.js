// A custom error that carries an HTTP status code.
// Throw it anywhere in a service and the error handler turns it into JSON.
export default class ApiError extends Error {
  constructor(statusCode, message, details = undefined) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
  }

  static badRequest(message, details) {
    return new ApiError(400, message, details);
  }

  static unauthorized(message = 'You need to be logged in to do this') {
    return new ApiError(401, message);
  }

  static forbidden(message = 'You are not allowed to do this') {
    return new ApiError(403, message);
  }

  static notFound(resource = 'Resource') {
    return new ApiError(404, `${resource} not found`);
  }

  static conflict(message) {
    return new ApiError(409, message);
  }
}
