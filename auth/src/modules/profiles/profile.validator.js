import { z } from 'zod';

export const updateProfileSchema = z.object({
  fullName: z.string().trim().min(2, 'Name must have at least 2 characters.').max(150).optional(),
  name: z.string().trim().min(2).max(150).optional(),
  phone: z.string().trim().max(20).optional().nullable(),
  hostel: z.string().trim().max(100).optional().nullable(),
  hostelName: z.string().trim().max(100).optional().nullable(),
  roomNo: z.string().trim().max(30).optional().nullable(),
  roomNumber: z.string().trim().max(30).optional().nullable(),
  program: z.string().trim().max(100).optional().nullable(),
  academicRole: z.string().trim().max(100).optional().nullable(),
  avatarUrl: z.string().trim().max(1000).optional().nullable(),
});

export function validateUpdateProfile(data) {
  return updateProfileSchema.safeParse(data);
}
