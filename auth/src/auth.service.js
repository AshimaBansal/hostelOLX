import bcrypt from 'bcrypt';
import { OAuth2Client } from 'google-auth-library';
import { SignJWT } from 'jose';
import { authRepository } from './auth.repository.js';
import env from './env.js';
import { isAllowedEmailDomain, normalizeEmail } from './utils/email.js';

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
    const normalizedEmail = normalizeEmail(email);

    if (!isAllowedEmailDomain(normalizedEmail)) {
      const error = new Error(
        'Registration is restricted to institutional email addresses (@nst.rishihood.edu.in or @rishihood.edu.in).'
      );
      error.statusCode = 403;
      error.code = 'UNAUTHORIZED_EMAIL_DOMAIN';
      throw error;
    }

    const existingIdentity = repository.findIdentityByEmail
      ? await repository.findIdentityByEmail(normalizedEmail)
      : await repository.findLocalIdentityByEmail(normalizedEmail);

    if (existingIdentity) {
      const error = new Error(
        existingIdentity.provider === 'google'
          ? 'An account with this email already exists. Please sign in with Google.'
          : 'An account with this email already exists.'
      );
      error.statusCode = 409;
      error.code = 'EMAIL_ALREADY_EXISTS';
      throw error;
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    try {
      const account = await repository.createLocalAccount({
        fullName,
        email: normalizedEmail,
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
      fullName: user.fullName || user.full_name || '',
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
    let googleUser;

    try {
      googleUser = await verifyGoogleToken(idToken);
    } catch {
      const error = new Error('Google account verification failed.');
      error.statusCode = 401;
      error.code = 'GOOGLE_AUTH_FAILED';
      throw error;
    }

    if (!googleUser?.sub || !googleUser.email || googleUser.email_verified !== true) {
      const error = new Error('Google account verification failed.');
      error.statusCode = 401;
      error.code = 'GOOGLE_AUTH_FAILED';
      throw error;
    }

    const normalizedEmail = normalizeEmail(googleUser.email);

    if (!isAllowedEmailDomain(normalizedEmail)) {
      const error = new Error(
        'Access restricted to institutional email addresses (@nst.rishihood.edu.in or @rishihood.edu.in).'
      );
      error.statusCode = 403;
      error.code = 'UNAUTHORIZED_EMAIL_DOMAIN';
      throw error;
    }

    let account = await repository.findGoogleIdentityBySubject(
      googleUser.sub
    );

    if (account && !isAllowedEmailDomain(account.email)) {
      const error = new Error(
        'Access restricted to institutional email addresses (@nst.rishihood.edu.in or @rishihood.edu.in).'
      );
      error.statusCode = 403;
      error.code = 'UNAUTHORIZED_EMAIL_DOMAIN';
      throw error;
    }

    if (!account) {
      const existingIdentity = await repository.findIdentityByEmail(
        normalizedEmail
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
        fullName: googleUser.name || normalizedEmail,
        email: normalizedEmail,
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

  async function loginWithEmail({ email, password }) {
    if (!email || !password) {
      const error = new Error('Email and password are required.');
      error.statusCode = 400;
      throw error;
    }

    const normalizedEmail = normalizeEmail(email);

    if (!isAllowedEmailDomain(normalizedEmail)) {
      const error = new Error(
        'Login is restricted to institutional email addresses (@nst.rishihood.edu.in or @rishihood.edu.in).'
      );
      error.statusCode = 403;
      error.code = 'UNAUTHORIZED_EMAIL_DOMAIN';
      throw error;
    }

    const identity = await repository.findLocalIdentityByEmail(normalizedEmail);
    if (!identity || !identity.password_hash) {
      const existingGoogle = repository.findIdentityByEmail
        ? await repository.findIdentityByEmail(normalizedEmail)
        : null;
      if (existingGoogle && existingGoogle.provider === 'google') {
        const error = new Error(
          'This email is registered using Google Sign-In. Please sign in with Google.'
        );
        error.statusCode = 401;
        error.code = 'USE_GOOGLE_LOGIN';
        throw error;
      }

      const error = new Error('Invalid email or password.');
      error.statusCode = 401;
      error.code = 'INVALID_CREDENTIALS';
      throw error;
    }

    const isMatch = await bcrypt.compare(password, identity.password_hash);
    if (!isMatch) {
      const error = new Error('Invalid email or password.');
      error.statusCode = 401;
      error.code = 'INVALID_CREDENTIALS';
      throw error;
    }

    const user = {
      id: identity.profile_id,
      fullName: identity.full_name,
      email: identity.email,
      role: identity.role || 'STUDENT',
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
    loginWithEmail,
    generateAccessToken,
  };
}

export const authService = createAuthService();
