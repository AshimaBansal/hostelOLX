export function successResponse(res, data = {}, status = 200, meta = null) {
  const payload = {
    success: true,
    data,
  };

  if (meta) {
    payload.meta = meta;
  }

  return res.status(status).json(payload);
}

export function errorResponse(res, message, status = 400, details = null, code = null) {
  const payload = {
    success: false,
    message,
  };

  if (details) {
    payload.details = details;
  }

  if (code) {
    payload.code = code;
  }

  return res.status(status).json(payload);
}
