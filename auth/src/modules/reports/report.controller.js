import { reportService } from './report.service.js';
import { validateCreateReport, validateUpdateReport } from './report.validator.js';
import { successResponse, errorResponse } from '../../utils/apiResponse.js';

export function createReportController(service = reportService) {
  async function submit(req, res) {
    const validation = validateCreateReport(req.body);
    if (!validation.success) {
      return errorResponse(res, 'Validation failed.', 400, validation.error.flatten().fieldErrors);
    }

    try {
      const report = await service.submitReport(req.user.id, validation.data);
      return successResponse(res, { report }, 201);
    } catch (error) {
      return errorResponse(res, error.message || 'Failed to submit report.', 500);
    }
  }

  async function getAdminReports(req, res) {
    try {
      const reports = await service.getAdminReports(req.query);
      return successResponse(res, { reports });
    } catch (error) {
      return errorResponse(res, error.message || 'Failed to fetch reports.', 500);
    }
  }

  async function updateAdminReport(req, res) {
    const validation = validateUpdateReport(req.body);
    if (!validation.success) {
      return errorResponse(res, 'Validation failed.', 400, validation.error.flatten().fieldErrors);
    }

    try {
      const updated = await service.updateReportStatus(req.params.id, req.user.id, validation.data);
      return successResponse(res, { report: updated });
    } catch (error) {
      const status = error.statusCode || 500;
      return errorResponse(res, error.message || 'Failed to update report.', status);
    }
  }

  return {
    submit,
    getAdminReports,
    updateAdminReport,
  };
}

export const reportController = createReportController();
