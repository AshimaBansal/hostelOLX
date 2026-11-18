
import bcrypt from 'bcrypt';

import { authRepository } from '../repositories/auth.repository.js';

const SALT_ROUNDS = 12;

export function createAuthService(repository = authRepository) {
  async function registerUser({ fullName, email, password }) {
    const existingAccount = await repository.findLocalIdentityByEmail(email);

    if (existingAccount) {
      const error = new Error('An account with this email already exists.');
      error.statusCode = 409;
      error.code = 'EMAIL_ALREADY_EXISTS';
      throw error;
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    try {
      const account = await repository.createLocalAccount({
        fullName,
        email,
        passwordHash,
      });

      // Never return the password or password hash.
      return {
        id: account.id,
        fullName: account.full_name,
        email: account.email,
        role: account.role,
      };
    } catch (error) {
      // Handle a duplicate email created by a concurrent request.
      if (error.code === '23505') {
        const duplicateError = new Error(
          'An account with this email already exists.'
        );
        duplicateError.statusCode = 409;
        duplicateError.code = 'EMAIL_ALREADY_EXISTS';
        throw duplicateError;
      }

      throw error;
    }
  }

  return {
    registerUser,
  };
}

export const authService = createAuthService();
