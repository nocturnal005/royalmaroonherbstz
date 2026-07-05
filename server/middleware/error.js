import db from '../config/database.js';

/**
 * Global Express Error Handling Middleware.
 * Sanitizes all exception messages and hides raw database errors, stack traces, and internal server paths.
 */
export function errorHandler(err, req, res, next) {
  // Always log the full stack trace to the server console for debugging
  console.error('--- Internal Server Error ---');
  console.error(err);
  console.error('-----------------------------');

  let statusCode = 500;
  let code = 'INTERNAL_SERVER_ERROR';
  let message = 'An unexpected error occurred on the server. Please try again later.';
  let details = [];

  // Categorize specific error types
  if (err.message && err.message.includes('Blocked by CORS policy')) {
    statusCode = 403;
    code = 'UNAUTHORIZED';
    message = err.message;
  } else if (err.code === 'SQLITE_CONSTRAINT') {
    // SQLite constraint failures (e.g. CHECK constraint or foreign key fail)
    statusCode = 400;
    code = 'VALIDATION_ERROR';
    message = 'Data check constraint or relational integrity failed.';
    details = [{ field: 'database', issue: 'Constraint checks failed on save.' }];
  } else if (err.status && err.status === 400) {
    statusCode = 400;
    code = 'VALIDATION_ERROR';
    message = 'Malformed JSON or request format.';
  }

  // Log error event to database audit logs
  try {
    const stmt = db.prepare(`
      INSERT INTO audit_logs (action, details)
      VALUES (?, ?)
    `);
    stmt.run('SERVER_ERROR_CAUGHT', JSON.stringify({
      route: req.originalUrl,
      errorName: err.name || 'Error',
      errorMessage: err.message || 'Unknown',
      code
    }));
  } catch (logErr) {
    console.error('Failed to log server exception to DB audit:', logErr);
  }

  res.status(statusCode).json({
    success: false,
    error: {
      code,
      message,
      details
    }
  });
}
