import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import fs from 'fs';
import path from 'path';
import { validatePhone, normalizePhone } from '../utils/phone.js';

const ajv = new Ajv({
  allErrors: true,
  removeAdditional: false, // Strict: Do NOT silently strip unknown properties
  allowUnionTypes: true
});

// Add standard formats (email, date-time, etc.) to Ajv
addFormats(ajv);

const schemasCache = {};

/**
 * Loads a JSON schema from the schemas/ folder, compiles it, and caches the validator.
 */
function getValidator(schemaName) {
  if (schemasCache[schemaName]) {
    return schemasCache[schemaName];
  }

  try {
    const schemaPath = path.join(process.cwd(), 'schemas', `${schemaName}.schema.json`);
    const schemaContent = fs.readFileSync(schemaPath, 'utf8');
    let schemaJson = JSON.parse(schemaContent);

    // Extract sub-schema if wrapper schema
    if (schemaName === 'payment' && schemaJson.properties && schemaJson.properties.initiationRequest) {
      schemaJson = schemaJson.properties.initiationRequest;
      schemaJson.$schema = "http://json-schema.org/draft-07/schema#";
    }

    if (schemaName === 'admin' && schemaJson.properties && schemaJson.properties.loginRequest) {
      schemaJson = schemaJson.properties.loginRequest;
      schemaJson.$schema = "http://json-schema.org/draft-07/schema#";
    }

    // Recursively set additionalProperties: false to enforce strict validation
    function setAdditionalPropertiesFalse(schema) {
      if (schema && typeof schema === 'object') {
        if (schema.type === 'object') {
          if (schema.additionalProperties === undefined) {
            schema.additionalProperties = false;
          }
        }
        if (schema.properties) {
          for (const key of Object.keys(schema.properties)) {
            setAdditionalPropertiesFalse(schema.properties[key]);
          }
        }
        if (schema.items) {
          setAdditionalPropertiesFalse(schema.items);
        }
        if (schema.anyOf) {
          schema.anyOf.forEach(setAdditionalPropertiesFalse);
        }
        if (schema.allOf) {
          schema.allOf.forEach(setAdditionalPropertiesFalse);
        }
        if (schema.oneOf) {
          schema.oneOf.forEach(setAdditionalPropertiesFalse);
        }
      }
    }
    setAdditionalPropertiesFalse(schemaJson);

    ajv.addSchema(schemaJson, schemaName);
    const validator = ajv.compile(schemaJson);
    schemasCache[schemaName] = validator;
    return validator;
  } catch (error) {
    console.error(`Failed to load or compile schema [${schemaName}]:`, error);
    throw error;
  }
}

/**
 * Express middleware generator that validates the request body against a specific JSON schema.
 */
export function validateBody(schemaName) {
  return (req, res, next) => {
    try {
      // Normalize phone numbers in the request body before schema validation
      if (req.body && typeof req.body.customerPhone === 'string') {
        if (validatePhone(req.body.customerPhone)) {
          req.body.customerPhone = normalizePhone(req.body.customerPhone);
        }
      }

      // Automatically supply server-side defaults for product timestamps/currency if missing
      if (schemaName === 'product' && req.body) {
        if (!req.body.createdAt) req.body.createdAt = new Date().toISOString();
        if (!req.body.updatedAt) req.body.updatedAt = new Date().toISOString();
        if (!req.body.currency) req.body.currency = 'TZS';
      }

      const validator = getValidator(schemaName);
      const valid = validator(req.body);

      if (!valid) {
        const details = validator.errors.map(err => {
          // clean up field path (e.g. /customerPhone -> customerPhone)
          const field = err.instancePath ? err.instancePath.substring(1) : err.params.missingProperty || 'body';
          return {
            field,
            issue: err.message
          };
        });

        // Write validation failure to audit log
        try {
          import('../config/database.js').then(({ default: db }) => {
            const stmt = db.prepare(`
              INSERT INTO audit_logs (action, details)
              VALUES (?, ?)
            `);
            stmt.run('REQUEST_VALIDATION_FAILURE', JSON.stringify({
              route: req.originalUrl,
              errors: details
            }));
          });
        } catch (logErr) {
          console.error('Failed to log validation error:', logErr);
        }

        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'One or more fields are invalid.',
            details
          }
        });
      }

      next();
    } catch (err) {
      next(err);
    }
  };
}
