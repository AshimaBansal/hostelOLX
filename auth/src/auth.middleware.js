import { jwtVerify } from 'jose';
import env from './env.js';

export function createAuthMiddleware(options = {}) {
  const secret = options.secretKey || new TextEncoder().encode(env.JWT_SECRET);
  const verifyToken =
    options.verifyToken ||
    ((token) =>
      jwtVerify(token, secret, {
        algorithms: ['HS256'],
        issuer: env.JWT_ISSUER,
        audience: env.JWT_AUDIENCE,
      }));

  return async function authenticate(req, res, next) {
    const authHeader = req.headers?.authorization;

    if (!authHeader || typeof authHeader !== 'string') {
      return res.status(401).json({
        message: 'Authentication token is required.',
      });
    }

    const parts = authHeader.trim().split(/\s+/);

    if (parts.length !== 2 || parts[0] !== 'Bearer' || !parts[1]) {
      return res.status(401).json({
        message: 'Authentication token is missing or invalid.',
      });
    }

    const token = parts[1];

    try {
      const { payload } = await verifyToken(token);

      if (!payload?.sub || !payload?.email || !payload?.role) {
        return res.status(401).json({
          message: 'Invalid or expired authentication token.',
        });
      }

      req.user = {
        id: payload.sub,
        email: payload.email,
        role: payload.role,
      };

      return next();
    } catch {
      return res.status(401).json({
        message: 'Invalid or expired authentication token.',
      });
    }
  };
}

export function createOptionalAuthMiddleware(options = {}) {
  const secret = options.secretKey || new TextEncoder().encode(env.JWT_SECRET);
  const verifyToken =
    options.verifyToken ||
    ((token) =>
      jwtVerify(token, secret, {
        algorithms: ['HS256'],
        issuer: env.JWT_ISSUER,
        audience: env.JWT_AUDIENCE,
      }));

  return async function optionalAuthenticate(req, _res, next) {
    const authHeader = req.headers?.authorization;

    if (!authHeader || typeof authHeader !== 'string') {
      return next();
    }

    const parts = authHeader.trim().split(/\s+/);
    if (parts.length !== 2 || parts[0] !== 'Bearer' || !parts[1]) {
      return next();
    }

    try {
      const { payload } = await verifyToken(parts[1]);
      if (payload?.sub && payload?.email && payload?.role) {
        req.user = {
          id: payload.sub,
          email: payload.email,
          role: payload.role,
        };
      }
    } catch {
    }

    return next();
  };
}

export function createRequireRoleMiddleware(role) {
  return function requireRole(req, res, next) {
    if (!req.user || req.user.role !== role) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: requires ${role} role.`,
        code: 'FORBIDDEN_ROLE',
      });
    }
    return next();
  };
}

export const authenticate = createAuthMiddleware();
export const optionalAuthenticate = createOptionalAuthMiddleware();
export const requireAdmin = createRequireRoleMiddleware('ADMIN');
export default authenticate;
