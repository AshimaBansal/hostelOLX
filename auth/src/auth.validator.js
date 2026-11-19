import { z } from 'zod';
import { isAllowedEmailDomain, normalizeEmail, ALLOWED_EMAIL_DOMAINS } from './utils/email.js';

export { isAllowedEmailDomain, normalizeEmail, ALLOWED_EMAIL_DOMAINS };

export const registerSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, 'Full name must contain at least 2 characters.')
    .max(150, 'Full name cannot exceed 150 characters.'),

  email: z
    .string()
    .trim()
    .email('Please enter a valid email address.')
    .max(254, 'Email address is too long.')
    .refine(
      (email) => isAllowedEmailDomain(email),
      'Registration is restricted to institutional email addresses (@nst.rishihood.edu.in or @rishihood.edu.in).'
    ),

  password: z
    .string()
    .min(8, 'Password must contain at least 8 characters.')
    .refine(
      (password) => Buffer.byteLength(password, 'utf8') <= 72,
      'Password cannot exceed 72 bytes when encoded as UTF-8.'
    )
    .regex(/[a-z]/, 'Password must contain a lowercase letter.')
    .regex(/[A-Z]/, 'Password must contain an uppercase letter.')
    .regex(/[0-9]/, 'Password must contain a number.'),
});

export function validateRegistration(data) {
  return registerSchema.safeParse(data);
}
