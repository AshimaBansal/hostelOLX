import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { SignJWT } from 'jose';
import { createProfileService } from '../src/modules/profiles/profile.service.js';
import { createProfileController } from '../src/modules/profiles/profile.controller.js';
import { validateUpdateProfile } from '../src/modules/profiles/profile.validator.js';
import env from '../src/env.js';

describe('Profile Module', () => {
  const mockProfile = {
    id: 'user-uuid-1',
    fullName: 'Ashi Bansal',
    email: 'ashi@nst.rishihood.edu.in',
    phone: '9876543210',
    hostelName: 'Hostel 1',
    hostel: 'Hostel 1',
    roomNumber: '102',
    roomNo: '102',
    program: 'Tech 27',
    academicRole: 'Tech 27',
    avatarUrl: null,
    role: 'STUDENT',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  function createMockRepo(profile = mockProfile) {
    let currentProfile = { ...profile };
    return {
      findProfileById: async (id) => (id === currentProfile.id ? currentProfile : null),
      updateProfile: async (id, fields) => {
        if (id !== currentProfile.id) return null;
        currentProfile = { ...currentProfile, ...fields };
        return currentProfile;
      },
    };
  }

  it('should retrieve authenticated profile for valid user', async () => {
    const repo = createMockRepo();
    const service = createProfileService(repo);
    const profile = await service.getProfile('user-uuid-1');

    assert.equal(profile.id, 'user-uuid-1');
    assert.equal(profile.fullName, 'Ashi Bansal');
    assert.equal(profile.email, 'ashi@nst.rishihood.edu.in');
  });

  it('should throw 404 when profile does not exist', async () => {
    const repo = createMockRepo();
    const service = createProfileService(repo);

    await assert.rejects(
      () => service.getProfile('unknown-id'),
      (err) => err.statusCode === 404
    );
  });

  it('should update profile fields successfully', async () => {
    const repo = createMockRepo();
    const service = createProfileService(repo);
    const updated = await service.updateProfile('user-uuid-1', {
      hostel: 'Hostel 2',
      roomNo: '204',
      phone: '9998887776',
    });

    assert.equal(updated.hostelName, 'Hostel 2');
    assert.equal(updated.roomNumber, '204');
    assert.equal(updated.phone, '9998887776');
  });

  it('should return public profile with safe fields', async () => {
    const repo = createMockRepo();
    const service = createProfileService(repo);
    const pub = await service.getPublicProfile('user-uuid-1');

    assert.equal(pub.id, 'user-uuid-1');
    assert.equal(pub.fullName, 'Ashi Bansal');
    assert.equal(pub.phone, undefined);
    assert.equal(pub.roomNumber, undefined);
  });

  it('should validate profile update inputs correctly', () => {
    const valid = validateUpdateProfile({
      fullName: 'Valid Name',
      phone: '1234567890',
      roomNo: 'B-101',
    });
    assert.equal(valid.success, true);

    const invalid = validateUpdateProfile({
      fullName: 'A',
    });
    assert.equal(invalid.success, false);
  });
});
