import { reportRepository } from './report.repository.js';

export function createReportService(repository = reportRepository) {
  async function submitReport(reporterId, input) {
    return repository.create({
      reporterId,
      listingId: input.listingId,
      reportedUserId: input.reportedUserId,
      reason: input.reason,
      description: input.description,
    });
  }

  async function getAdminReports(filters = {}) {
    return repository.findAll(filters);
  }

  async function updateReportStatus(reportId, adminId, input) {
    const existing = await repository.findById(reportId);
    if (!existing) {
      const error = new Error('Report not found.');
      error.statusCode = 404;
      throw error;
    }

    return repository.updateStatus(reportId, {
      status: input.status,
      adminNotes: input.adminNotes,
      resolvedBy: adminId,
      removeListing: input.removeListing,
    });
  }

  return {
    submitReport,
    getAdminReports,
    updateReportStatus,
  };
}

export const reportService = createReportService();
