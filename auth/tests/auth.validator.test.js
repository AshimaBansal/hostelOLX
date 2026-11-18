
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { validateRegistration } from '../src/auth.validator.js';

describe('Registration validator', () => {
  it('should accept valid registration details', () => {
    const result = validateRegistration({
      fullName: 'Test Student',
      email: 'student@example.com',
      password: 'Student123',
    });

    assert.equal(result.success, true);
  });

  it('should reject an invalid email', () => {
    const result = validateRegistration({
      fullName: 'Test Student',
      email: 'invalid-email',
      password: 'Student123',
    });

    assert.equal(result.success, false);
  });

  it('should reject a short password', () => {
    const result = validateRegistration({
      fullName: 'Test Student',
      email: 'student@example.com',
      password: 'Ab1',
    });

    assert.equal(result.success, false);
  });

  it('should reject a missing uppercase letter', () => {
    const result = validateRegistration({
      fullName: 'Test Student',
      email: 'student@example.com',
      password: 'student123',
    });

    assert.equal(result.success, false);
  });

  it('should reject a missing lowercase letter', () => {
    const result = validateRegistration({
      fullName: 'Test Student',
      email: 'student@example.com',
      password: 'STUDENT123',
    });

    assert.equal(result.success, false);
  });

  it('should reject a missing number', () => {
    const result = validateRegistration({
      fullName: 'Test Student',
      email: 'student@example.com',
      password: 'StudentPass',
    });

    assert.equal(result.success, false);
  });

  it('should reject a name shorter than two characters', () => {
    const result = validateRegistration({
      fullName: 'A',
      email: 'student@example.com',
      password: 'Student123',
    });

    assert.equal(result.success, false);
  });

  it('should trim whitespace around the name and email', () => {
    const result = validateRegistration({
      fullName: '  Test Student  ',
      email: ' student@example.com ',
      password: 'Student123',
    });

    assert.equal(result.success, true);
    assert.equal(result.data.fullName, 'Test Student');
    assert.equal(result.data.email, 'student@example.com');
  });

  it('should reject passwords exceeding bcrypt byte limit', () => {
    const result = validateRegistration({
      fullName: 'Test Student',
      email: 'student@example.com',
      password: 'Aa1' + 'é'.repeat(35),
    });

    assert.equal(result.success, false);
  });
});
