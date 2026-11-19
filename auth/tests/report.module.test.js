import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { createReportService } from '../src/modules/reports/report.service.js';
import { createRequireRoleMiddleware } from '../src/auth.middleware.js';

describe('Reports and Moderation Module', () => {
  const sampleReport = {
    id: '1',
    reporterId: 'user-reporter',
    listingId: '101',
    reportedUserId: 'user-seller',
    reason: 'fake_listing',
    description: 'Suspicious stock photo',
    status: 'pending',
    adminNotes: null,
    resolvedBy: null,
    createdAt: new Date().toISOString(),
  };

  function createMockReportRepo() {
    let reports = [{ ...sampleReport }];

    return {
      create: async (data) => {
        const item = {
          id: String(Date.now()),
          ...data,
          status: 'pending',
          createdAt: new Date().toISOString(),
        };
        reports.push(item);
        return item;
      },
      findAll: async (filters = {}) => {
        if (filters.status) {
          return reports.filter((r) => r.status === filters.status);
        }
        return reports;
      },
      findById: async (id) => reports.find((r) => String(r.id) === String(id)) ?? null,
      updateStatus: async (id, updates) => {
        const r = reports.find((item) => String(item.id) === String(id));
        if (!r) return null;
        Object.assign(r, updates);
        return r;
      },
    };
  }

  it('should submit a report successfully', async () => {
    const repo = createMockReportRepo();
    const service = createReportService(repo);

    const report = await service.submitReport('user-reporter', {
      listingId: 101,
      reason: 'inappropriate_content',
      description: 'Offensive description text',
    });

    assert.equal(report.reason, 'inappropriate_content');
    assert.equal(report.reporterId, 'user-reporter');
  });

  it('should allow ADMIN to retrieve reports list', async () => {
    const repo = createMockReportRepo();
    const service = createReportService(repo);

    const reports = await service.getAdminReports();
    assert.equal(reports.length, 1);
    assert.equal(reports[0].reason, 'fake_listing');
  });

  it('should allow ADMIN to update report status', async () => {
    const repo = createMockReportRepo();
    const service = createReportService(repo);

    const updated = await service.updateReportStatus('1', 'admin-user', {
      status: 'resolved',
      adminNotes: 'Listing reviewed and action taken',
      removeListing: true,
    });

    assert.equal(updated.status, 'resolved');
    assert.equal(updated.adminNotes, 'Listing reviewed and action taken');
    assert.equal(updated.resolvedBy, 'admin-user');
  });

  it('should reject non-admin users in requireRole middleware', () => {
    const requireAdmin = createRequireRoleMiddleware('ADMIN');

    let nextCalled = false;
    let statusCode = null;
    let responseBody = null;

    const res = {
      status: (code) => {
        statusCode = code;
        return {
          json: (body) => {
            responseBody = body;
          },
        };
      },
    };

    const studentReq = { user: { id: 'u1', role: 'STUDENT' } };
    requireAdmin(studentReq, res, () => {
      nextCalled = true;
    });

    assert.equal(nextCalled, false);
    assert.equal(statusCode, 403);
    assert.equal(responseBody.code, 'FORBIDDEN_ROLE');

    const adminReq = { user: { id: 'u2', role: 'ADMIN' } };
    let adminNextCalled = false;
    requireAdmin(adminReq, res, () => {
      adminNextCalled = true;
    });
    assert.equal(adminNextCalled, true);
  });
});
