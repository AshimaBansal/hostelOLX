import { profileRepository } from './profile.repository.js';

export function createProfileService(repository = profileRepository) {
  async function getProfile(profileId) {
    const profile = await repository.findProfileById(profileId);
    if (!profile) {
      const error = new Error('User profile not found.');
      error.statusCode = 404;
      throw error;
    }
    return profile;
  }

  async function updateProfile(profileId, updates) {
    const existing = await repository.findProfileById(profileId);
    if (!existing) {
      const error = new Error('User profile not found.');
      error.statusCode = 404;
      throw error;
    }

    const cleanedUpdates = {};
    if (updates.fullName !== undefined || updates.name !== undefined) {
      cleanedUpdates.fullName = updates.fullName ?? updates.name;
    }
    if (updates.phone !== undefined) {
      cleanedUpdates.phone = updates.phone;
    }
    if (updates.hostelName !== undefined || updates.hostel !== undefined) {
      cleanedUpdates.hostelName = updates.hostelName ?? updates.hostel;
    }
    if (updates.roomNumber !== undefined || updates.roomNo !== undefined) {
      cleanedUpdates.roomNumber = updates.roomNumber ?? updates.roomNo;
    }
    if (updates.program !== undefined || updates.academicRole !== undefined) {
      cleanedUpdates.program = updates.program ?? updates.academicRole;
    }
    if (updates.avatarUrl !== undefined) {
      cleanedUpdates.avatarUrl = updates.avatarUrl;
    }

    return repository.updateProfile(profileId, cleanedUpdates);
  }

  async function getPublicProfile(profileId) {
    const profile = await repository.findProfileById(profileId);
    if (!profile) {
      const error = new Error('User profile not found.');
      error.statusCode = 404;
      throw error;
    }

    return {
      id: profile.id,
      fullName: profile.fullName,
      program: profile.program,
      academicRole: profile.academicRole,
      hostelName: profile.hostelName,
      avatarUrl: profile.avatarUrl,
      role: profile.role,
      createdAt: profile.createdAt,
    };
  }

  return {
    getProfile,
    updateProfile,
    getPublicProfile,
  };
}

export const profileService = createProfileService();
