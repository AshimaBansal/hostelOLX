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

  return {
    register,
  };
}

export const authController = createAuthController();
