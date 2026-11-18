
import bcrypt from 'bcrypt';
import { OAuth2Client } from 'google-auth-library';
import { SignJWT } from 'jose';
import { authRepository } from './auth.repository.js';
import env from './env.js';

const SALT_ROUNDS = 12;
const googleClient = new OAuth2Client(env.GOOGLE_CLIENT_ID);
const jwtSecret = new TextEncoder().encode(env.JWT_SECRET);

export function createAuthService(
  repository = authRepository,
  verifyGoogleToken = async (idToken) => {
    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: env.GOOGLE_CLIENT_ID,
    });

    return ticket.getPayload();
  }
) {
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

      return {
        id: account.id,
        fullName: account.full_name,
        email: account.email,
        role: account.role,
      };
    } catch (error) {
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

  async function generateAccessToken(user) {
    return new SignJWT({
      email: user.email,
      role: user.role,
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setSubject(user.id)
      .setIssuer(env.JWT_ISSUER)
      .setAudience(env.JWT_AUDIENCE)
      .setIssuedAt()
      .setExpirationTime(env.ACCESS_TOKEN_TTL)
      .sign(jwtSecret);
  }

  async function loginWithGoogle(idToken) {
    const googleUser = await verifyGoogleToken(idToken);

    if (!googleUser?.sub || !googleUser.email || !googleUser.email_verified) {
      throw new Error('Google account verification failed.');
    }

    let account = await repository.findGoogleIdentityBySubject(
      googleUser.sub
    );

    if (!account) {
      const existingIdentity = await repository.findIdentityByEmail(
        googleUser.email
      );

      if (existingIdentity) {
        const error = new Error(
          'An account with this email already exists. Please use your existing login method.'
        );
        error.statusCode = 409;
        error.code = 'ACCOUNT_ALREADY_EXISTS';
        throw error;
      }

      account = await repository.createGoogleAccount({
        fullName: googleUser.name || googleUser.email,
        email: googleUser.email,
        googleSubject: googleUser.sub,
      });
    }

    const user = {
      id: account.profile_id || account.id,
      fullName: account.full_name,
      email: account.email,
      role: account.role || 'STUDENT',
    };

    const accessToken = await generateAccessToken(user);

    return {
      user,
      accessToken,
    };
  }

  return {
    registerUser,
    loginWithGoogle,
  };
}

export const authService = createAuthService();
