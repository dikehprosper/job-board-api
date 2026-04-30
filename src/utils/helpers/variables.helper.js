
/**
 * HTTP Status Codes with Descriptions
 * @typedef {Object} HttpStatus
 * @property {Object} OK - 200 OK
 * @property {number} OK.code - The HTTP status code.
 * @property {string} OK.message - A message describing the status.
 * @property {Object} CREATED - 201 Created
 * @property {number} CREATED.code - The HTTP status code.
 * @property {string} CREATED.message - A message describing the status.
 * @property {Object} DELETED - 204 No Content
 * @property {number} DELETED.code - The HTTP status code.
 * @property {string} DELETED.message - A message describing the status.
 * @property {Object} BAD_REQUEST - 400 Bad Request
 * @property {number} BAD_REQUEST.code - The HTTP status code.
 * @property {string} BAD_REQUEST.message - A message describing the status.
 * @property {Object} UNAUTHORIZED - 401 Unauthorized
 * @property {number} UNAUTHORIZED.code - The HTTP status code.
 * @property {string} UNAUTHORIZED.message - A message describing the status.
 * @property {Object} FORBIDDEN - 403 Forbidden
 * @property {number} FORBIDDEN.code - The HTTP status code.
 * @property {string} FORBIDDEN.message - A message describing the status.
 * @property {Object} NOT_FOUND - 404 Not Found
 * @property {number} NOT_FOUND.code - The HTTP status code.
 * @property {string} NOT_FOUND.message - A message describing the status.
 * @property {Object} NOT_ALLOWED - 405 Method Not Allowed
 * @property {number} NOT_ALLOWED.code - The HTTP status code.
 * @property {string} NOT_ALLOWED.message - A message describing the status.
 * @property {Object} TOO_MANY_REQUESTS - 429 Too Many Requests
 * @property {number} TOO_MANY_REQUESTS.code - The HTTP status code.
 * @property {string} TOO_MANY_REQUESTS.message - A message describing the status.
 * @property {Object} SERVER_ERROR - 500 Internal Server Error
 * @property {number} SERVER_ERROR.code - The HTTP status code.
 * @property {string} SERVER_ERROR.message - A message describing the status.
 * @property {Object} NOT_IMPLEMENTED - 501 Not Implemented
 * @property {number} NOT_IMPLEMENTED.code - The HTTP status code.
 * @property {string} NOT_IMPLEMENTED.message - A message describing the status.
 * @property {Object} BAD_GATEWAY - 502 Bad Gateway
 * @property {number} BAD_GATEWAY.code - The HTTP status code.
 * @property {string} BAD_GATEWAY.message - A message describing the status.
 * @property {Object} SERVICE_UNAVAILABLE - 503 Service Unavailable
 * @property {number} SERVICE_UNAVAILABLE.code - The HTTP status code.
 * @property {string} SERVICE_UNAVAILABLE.message - A message describing the status.
 * @property {Object} GATEWAY_TIMEOUT - 504 Gateway Timeout
 * @property {number} GATEWAY_TIMEOUT.code - The HTTP status code.
 * @property {string} GATEWAY_TIMEOUT.message - A message describing the status.
 * @property {Object} HTTP_VERSION_NOT_SUPPORTED - 505 HTTP Version Not Supported
 * @property {number} HTTP_VERSION_NOT_SUPPORTED.code - The HTTP status code.
 * @property {string} HTTP_VERSION_NOT_SUPPORTED.message - A message describing the status.
 */
const httpStatus = {
    OK: { code: 200, message: 'OK' },
    CREATED: { code: 201, message: 'Created' },
    UPDATED: { code: 204, message: 'No Content' },
    BAD_REQUEST: { code: 400, message: 'Bad Request' },
    UNAUTHORIZED: { code: 401, message: 'Unauthorized' },
    FORBIDDEN: { code: 403, message: 'Forbidden' },
    NOT_FOUND: { code: 404, message: 'Not Found' },
    NOT_ALLOWED: { code: 405, message: 'Method Not Allowed' },
    CONFLICT: { code: 409, message: 'Conflict' },
    TOO_MANY_REQUESTS: { code: 429, message: 'Too Many Requests' },
    SERVER_ERROR: { code: 500, message: 'Internal Server Error' },
    NOT_IMPLEMENTED: { code: 501, message: 'Not Implemented' },
    BAD_GATEWAY: { code: 502, message: 'Bad Gateway' },
    SERVICE_UNAVAILABLE: { code: 503, message: 'Service Unavailable' },
    GATEWAY_TIMEOUT: { code: 504, message: 'Gateway Timeout' },
    HTTP_VERSION_NOT_SUPPORTED: { code: 505, message: 'HTTP Version Not Supported' }
}

const ContextualApiError = class extends Error {
    constructor(info, error) {
        super(info.customMessage || error?.message || 'ContextualApiError')
        this.statusCode = info.statusCode // Store the status code
        this.logLevel = info.logLevel
        this.data = error || null
        this.extras = info.extras || null
        this.message = info.customMessage || error?.message || 'ContextualApiError'
        this.customType = 'ContextualApiError'
        this.codePath = info.codePath || null

        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, ContextualApiError)
        }
    }
}

// Joi Parent Objects
const Joi = require('joi')

Joi.object({
    extract: function (key) {
        const fieldSchema = this._ids._byKey.get(key)
        return fieldSchema ? fieldSchema.schema : null
    }
})

const userSchemaParentJoiObject = Joi.object({
    id: Joi.string().uuid(),
    email: Joi.string().email(),
    name: Joi.string().min(1).max(100).required(),
    firstName: Joi.string().min(1).max(100).required(),
    password: Joi.string()
        .regex(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])[A-Za-z\d!@#$%^&*(),.?":{}|<>]{8,}$/)
        .message('Password must be at least 8 characters long and include at least one letter, one number, and one special character'),
    googleId: Joi.string(),
    input: Joi.string().min(1).max(200).required(),
    picture: Joi.string(),
    token: Joi.string().min(10).required()
})

module.exports = {
    httpStatus,
    userSchemaParentJoiObject,
    ContextualApiError
}
