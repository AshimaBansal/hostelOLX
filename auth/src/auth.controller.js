import { authService } from './auth.service.js';
import { validateRegistration } from './auth.validator.js';

export function createAuthController(service = authService) {
  async function register(req, res) {
    const validation = validateRegistration(req.body);

    if (!validation.success) {
      return res.status(400).json({
        message: 'Invalid registration details.',
        errors: validation.error.issues.map((issue) => ({
          field: issue.path.join('.'),
          message: issue.message,
        })),
      });
    }

    try {
      const user = await service.registerUser(validation.data);

      return res.status(201).json({
        message: 'Account created successfully.',
        user,
      });
    } catch (error) {
      if (error.statusCode === 403) {
        return res.status(403).json({
          message: error.message,
          code: error.code || 'UNAUTHORIZED_EMAIL_DOMAIN',
        });
      }

      if (error.statusCode === 409) {
        return res.status(409).json({
          message: error.message,
          code: error.code,
        });
      }

      console.error('Registration failed:', error.message);

      return res.status(500).json({
        message: 'Something went wrong while creating your account.',
      });
    }
  }

  async function googleLogin(req, res) {
    const { idToken } = req.body || {};

    if (typeof idToken !== 'string' || !idToken.trim()) {
      return res.status(400).json({
        message: 'Google ID token is required.',
      });
    }

    try {
      const result = await service.loginWithGoogle(idToken);

      return res.status(200).json({
        message: 'Google login successful.',
        ...result,
      });
    } catch (error) {
      if (error.statusCode === 403) {
        return res.status(403).json({
          message: error.message,
          code: error.code || 'UNAUTHORIZED_EMAIL_DOMAIN',
        });
      }

      if (error.statusCode === 409) {
        return res.status(409).json({
          message: error.message,
          code: error.code,
        });
      }

      if (error.statusCode === 401) {
        return res.status(401).json({
          message: 'Google authentication failed.',
        });
      }

      console.error('Google login failed:', error.message);

      return res.status(500).json({
        message: 'Something went wrong during Google login.',
      });
    }
  }

  async function me(req, res) {
    if (!req.user) {
      return res.status(401).json({
        message: 'Authentication token is required.',
      });
    }

    return res.status(200).json({
      user: {
        id: req.user.id,
        email: req.user.email,
        role: req.user.role,
      },
    });
  }

  return {
    register,
    googleLogin,
    me,
    getMe: me,
  };
}

export const authController = createAuthController();
