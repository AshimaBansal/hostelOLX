import { z } from 'zod';

export const updateProfileBody = z
  .object({
    fullName: z.string().trim().min(1).max(150),
    phone: z
      .string()
      .trim()
      .regex(/^\+?[0-9\s-]{7,20}$/, { message: 'Invalid phone number' }),
    academicRole: z.string().trim().max(100),
    hostelName: z.string().trim().max(100),
    roomNumber: z.string().trim().max(30),
    avatarUrl: z.string().trim().max(500),
  })
  .partial()
  .strict()
  .refine((data) => Object.keys(data).length > 0, { message: 'Send at least one field to update' });
