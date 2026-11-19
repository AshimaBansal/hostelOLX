import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { createRequestService } from '../src/modules/requests/request.service.js';
import { validateCreateRequest } from '../src/modules/requests/request.validator.js';

describe('Student Requests Module', () => {
  const sampleRequest = {
    id: '1',
    userId: 'user-1',
    title: 'Looking for Electric Kettle',
    description: 'Under 1L, clean',
    category: 'Appliances',
    budget: 'Under ₹500',
    urgency: 'Needed this week',
    location: 'Hostel 1',
    status: 'active',
    requesterName: 'Ashi Bansal',
    requesterProgram: 'Tech 27',
    requesterHostel: 'Hostel 1',
  };

  function createMockRequestRepo(initial = [sampleRequest]) {
    let requests = [...initial];
    return {
      findAll: async () => ({ rows: requests, meta: { total: requests.length, page: 1, limit: 20 } }),
      findById: async (id) => requests.find((r) => String(r.id) === String(id)) ?? null,
      create: async (data) => {
        const item = {
          id: String(Date.now()),
          ...data,
          status: 'active',
          requesterName: 'Ashi Bansal',
          requesterProgram: 'Tech 27',
        };
        requests.push(item);
        return item;
      },
      update: async (id, updates) => {
        const idx = requests.findIndex((r) => String(r.id) === String(id));
        if (idx === -1) return null;
        requests[idx] = { ...requests[idx], ...updates };
        return requests[idx];
      },
      remove: async (id) => {
        const item = requests.find((r) => String(r.id) === String(id));
        if (item) item.status = 'closed';
        return item;
      },
    };
  }

  it('should create student request successfully', async () => {
    const repo = createMockRequestRepo();
    const service = createRequestService(repo);

    const created = await service.create('user-1', {
      title: 'Looking for Lab Coat Size M',
      description: 'Needed for physics practical',
      category: 'Study',
      budget: 'Under ₹300',
    });

    assert.equal(created.title, 'Looking for Lab Coat Size M');
    assert.equal(created.userId, 'user-1');
  });

  it('should validate request creation input', () => {
    const valid = validateCreateRequest({
      title: 'Looking for Foldable Bed Study Table',
      budget: 'Under ₹400',
    });
    assert.equal(valid.success, true);

    const invalid = validateCreateRequest({
      title: 'A',
    });
    assert.equal(invalid.success, false);
  });

  it('should update own request successfully', async () => {
    const repo = createMockRequestRepo();
    const service = createRequestService(repo);

    const updated = await service.update('1', 'user-1', 'STUDENT', {
      budget: 'Under ₹600',
      urgency: 'Urgent',
    });

    assert.equal(updated.budget, 'Under ₹600');
    assert.equal(updated.urgency, 'Urgent');
  });

  it('should prevent unauthorized updates to requests', async () => {
    const repo = createMockRequestRepo();
    const service = createRequestService(repo);

    await assert.rejects(
      () => service.update('1', 'user-2', 'STUDENT', { budget: '₹100' }),
      (err) => err.statusCode === 403
    );
  });

  it('should close request successfully', async () => {
    const repo = createMockRequestRepo();
    const service = createRequestService(repo);

    const result = await service.remove('1', 'user-1', 'STUDENT');
    assert.equal(result.status, 'closed');
  });

  it('should prevent deleting another users request', async () => {
    const repo = createMockRequestRepo();
    const service = createRequestService(repo);

    await assert.rejects(
      () => service.remove('1', 'user-2', 'STUDENT'),
      (err) => err.statusCode === 403
    );
  });
});
