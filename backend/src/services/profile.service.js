import * as profileRepo from '../repositories/profile.repository.js';
import ApiError from '../utils/ApiError.js';

// Public info that anyone can see (no phone / room number).
export function toPublicProfile(profile) {
  if (!profile) return null;
  return {
    id: profile.id,
    fullName: profile.fullName,
    academicRole: profile.academicRole ?? null,
    hostelName: profile.hostelName ?? null,
    avatarUrl: profile.avatarUrl ?? null,
  };
}

// The logged-in user's own full profile.
function toPrivateProfile(profile) {
  return {
    ...toPublicProfile(profile),
    phone: profile.phone ?? null,
    roomNumber: profile.roomNumber ?? null,
  };
}

// Used by every service that needs the current user to exist.
export async function getCurrentProfileOrFail(userId) {
  const profile = await profileRepo.findById(userId);
  if (!profile) {
    throw ApiError.unauthorized('No profile found for this user');
  }
  return profile;
}

export async function getMe(userId) {
  return toPrivateProfile(await getCurrentProfileOrFail(userId));
}

export async function updateMe(userId, changes) {
  await getCurrentProfileOrFail(userId);
  return toPrivateProfile(await profileRepo.update(userId, changes));
}

export async function getPublicProfile(id) {
  const profile = await profileRepo.findById(id);
  if (!profile) throw ApiError.notFound('Profile');
  return toPublicProfile(profile);
}

// Returns a Map of id -> public profile, to avoid looking up the same user many times.
export async function getPublicProfileMap(ids) {
  const profiles = await profileRepo.findManyByIds([...new Set(ids)]);
  return new Map(profiles.map((p) => [p.id, toPublicProfile(p)]));
}
