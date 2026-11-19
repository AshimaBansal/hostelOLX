import { requestRepository } from './request.repository.js';

function formatRequestOutput(req) {
  if (!req) return null;
  const program = req.requesterProgram || 'Student';
  return {
    ...req,
    id: String(req.id),
    requester: req.requesterName ? `${req.requesterName} (${program})` : 'Student',
    location: req.location || req.requesterHostel || 'Hostel 1',
  };
}

export function createRequestService(repository = requestRepository) {
  async function getAll(filters = {}) {
    const { rows, meta } = await repository.findAll(filters);
    return {
      requests: rows.map(formatRequestOutput),
      meta,
    };
  }

  async function getById(id) {
    const req = await repository.findById(id);
    if (!req) {
      const error = new Error('Request not found.');
      error.statusCode = 404;
      throw error;
    }
    return formatRequestOutput(req);
  }

  async function create(userId, input) {
    const created = await repository.create({
      userId,
      ...input,
    });
    return formatRequestOutput(created);
  }

  async function update(id, userId, userRole, input) {
    const existing = await repository.findById(id);
    if (!existing) {
      const error = new Error('Request not found.');
      error.statusCode = 404;
      throw error;
    }

    if (existing.userId !== userId && userRole !== 'ADMIN') {
      const error = new Error('You are not authorized to update this request.');
      error.statusCode = 403;
      error.code = 'FORBIDDEN';
      throw error;
    }

    const updated = await repository.update(id, input);
    return formatRequestOutput(updated);
  }

  async function remove(id, userId, userRole) {
    const existing = await repository.findById(id);
    if (!existing) {
      const error = new Error('Request not found.');
      error.statusCode = 404;
      throw error;
    }

    if (existing.userId !== userId && userRole !== 'ADMIN') {
      const error = new Error('You are not authorized to delete this request.');
      error.statusCode = 403;
      error.code = 'FORBIDDEN';
      throw error;
    }

    await repository.remove(id);
    return { id: String(id), status: 'closed' };
  }

  return {
    getAll,
    getById,
    create,
    update,
    remove,
  };
}

export const requestService = createRequestService();
