import ApiError from '../utils/ApiError.js';

/*
 * Validates req.body / req.query / req.params with zod schemas.
 * Usage: router.post('/', validate({ body: createListingSchema }), controller)
 * The parsed (cleaned + type-converted) values are stored on req.valid.
 */
export default function validate(schemas) {
  return (req, _res, next) => {
    req.valid = {};

    for (const part of ['params', 'query', 'body']) {
      if (!schemas[part]) continue;

      const result = schemas[part].safeParse(req[part] ?? {});
      if (!result.success) {
        const details = result.error.issues.map((issue) => ({
          field: issue.path.join('.') || part,
          message: issue.message,
        }));
        return next(ApiError.badRequest('Validation failed', details));
      }
      req.valid[part] = result.data;
    }

    next();
  };
}
