import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import {
  validateRegistration,
  isAllowedEmailDomain,
  normalizeEmail,
} from '../src/auth.validator.js';

describe('Registration validator', () => {
  it('should accept valid registration details', () => {
    const result = validateRegistration({
      fullName: 'Test Student',
      email: 'student@rishihood.edu.in',
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
      email: 'student@rishihood.edu.in',
      password: 'Ab1',
    });

    assert.equal(result.success, false);
  });

  it('should reject a missing uppercase letter', () => {
    const result = validateRegistration({
      fullName: 'Test Student',
      email: 'student@rishihood.edu.in',
      password: 'student123',
    });

    assert.equal(result.success, false);
  });

  it('should reject a missing lowercase letter', () => {
    const result = validateRegistration({
      fullName: 'Test Student',
      email: 'student@rishihood.edu.in',
      password: 'STUDENT123',
    });

    assert.equal(result.success, false);
  });

  it('should reject a missing number', () => {
    const result = validateRegistration({
      fullName: 'Test Student',
      email: 'student@rishihood.edu.in',
      password: 'StudentPass',
    });

    assert.equal(result.success, false);
  });

  it('should reject a name shorter than two characters', () => {
    const result = validateRegistration({
      fullName: 'A',
      email: 'student@rishihood.edu.in',
      password: 'Student123',
    });

    assert.equal(result.success, false);
  });

  it('should trim whitespace around the name and email', () => {
    const result = validateRegistration({
      fullName: '  Test Student  ',
      email: ' student@rishihood.edu.in ',
      password: 'Student123',
    });

    assert.equal(result.success, true);
    assert.equal(result.data.fullName, 'Test Student');
    assert.equal(result.data.email, 'student@rishihood.edu.in');
  });

  it('should reject passwords exceeding bcrypt byte limit', () => {
    const result = validateRegistration({
      fullName: 'Test Student',
      email: 'student@rishihood.edu.in',
      password: 'Aa1' + 'é'.repeat(35),
    });

    assert.equal(result.success, false);
  });

  it('should accept registration with @nst.rishihood.edu.in domain', () => {
    const result = validateRegistration({
      fullName: 'NST Student',
      email: 'student@nst.rishihood.edu.in',
      password: 'Student123',
    });

    assert.equal(result.success, true);
  });

  it('should accept registration with uppercase email address', () => {
    const result = validateRegistration({
      fullName: 'Uppercase Student',
      email: 'STUDENT@NST.RISHIHOOD.EDU.IN',
      password: 'Student123',
    });

    assert.equal(result.success, true);
  });

  it('should reject registration with personal Gmail address', () => {
    const result = validateRegistration({
      fullName: 'Gmail Student',
      email: 'student@gmail.com',
      password: 'Student123',
    });

    assert.equal(result.success, false);
  });

  it('should reject registration with similar but unauthorized domain', () => {
    const result = validateRegistration({
      fullName: 'Fake Domain Student',
      email: 'student@nst.rishihood.edu.in.example.com',
      password: 'Student123',
    });

    assert.equal(result.success, false);
  });
});

describe('Email domain validator helper', () => {
  it('should accept rishihood.edu.in domain', () => {
    assert.equal(isAllowedEmailDomain('user@rishihood.edu.in'), true);
  });

  it('should accept nst.rishihood.edu.in domain', () => {
    assert.equal(isAllowedEmailDomain('user@nst.rishihood.edu.in'), true);
  });

  it('should accept uppercase allowed domain emails', () => {
    assert.equal(isAllowedEmailDomain('USER@RISHIHOOD.EDU.IN'), true);
    assert.equal(isAllowedEmailDomain('USER@NST.RISHIHOOD.EDU.IN'), true);
  });

  it('should reject personal Gmail addresses', () => {
    assert.equal(isAllowedEmailDomain('user@gmail.com'), false);
    assert.equal(isAllowedEmailDomain('user@googlemail.com'), false);
  });

  it('should reject similar domains with extra suffixes or subdomains', () => {
    assert.equal(isAllowedEmailDomain('user@nst.rishihood.edu.in.example.com'), false);
    assert.equal(isAllowedEmailDomain('user@rishihood.edu.in.attacker.org'), false);
    assert.equal(isAllowedEmailDomain('user@sub.rishihood.edu.in'), false);
    assert.equal(isAllowedEmailDomain('user@otherrishihood.edu.in'), false);
  });

  it('should reject malformed or non-string inputs', () => {
    assert.equal(isAllowedEmailDomain(''), false);
    assert.equal(isAllowedEmailDomain('not-an-email'), false);
    assert.equal(isAllowedEmailDomain('@rishihood.edu.in'), false);
    assert.equal(isAllowedEmailDomain(null), false);
    assert.equal(isAllowedEmailDomain(undefined), false);
    assert.equal(isAllowedEmailDomain(123), false);
  });

  it('should normalize email to lowercase and trim whitespace', () => {
    assert.equal(normalizeEmail('  User@Rishihood.Edu.IN  '), 'user@rishihood.edu.in');
    assert.equal(normalizeEmail(null), '');
  });
});
