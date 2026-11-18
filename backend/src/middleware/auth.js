import ApiError from '../utils/ApiError.js';

/*
 * TEMPORARY AUTH PLACEHOLDER
 * --------------------------
 * Authentication is being built by another team member.
 * Until then, the frontend (or Postman) sends the logged-in user's id
 * in the `x-user-id` header, and we put it on `req.user`.
 *
 * When real auth is ready, ONLY this file needs to change:
 * verify the token, then set `req.user = { id: <profile uuid> }`.
 * Every route already reads the user from `req.user`.
 */

function readUserFromRequest(req) {
  const userId = req.header('x-user-id');
  return userId ? { id: userId.trim() } : null;
}

// Sets req.user if a user is present, but does not block the request.
export function optionalAuth(req, _res, next) {
  req.user = readUserFromRequest(req);
  next();
}

// Blocks the request with 401 if no user is present.
export function requireAuth(req, _res, next) {
  req.user = readUserFromRequest(req);
  if (!req.user) {
    return next(ApiError.unauthorized());
  }
  next();
}
