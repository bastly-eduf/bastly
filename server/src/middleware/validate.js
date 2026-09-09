import { HttpError } from '../utils/httpError.js';

export function validate(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      const fieldErrors = {};

      for (const issue of result.error.issues) {
        const field = issue.path[0] || 'form';
        if (!fieldErrors[field]) {
          fieldErrors[field] = issue.message;
        }
      }

      return next(new HttpError(400, 'Please check the form fields.', fieldErrors));
    }

    req.validatedBody = result.data;
    next();
  };
}
