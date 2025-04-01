/**
 * Custom API Error class for handling API-specific errors
 * @extends Error
 */
class ApiError extends Error {
    /**
     * Create a new API Error
     * @param {number} statusCode - HTTP status code
     * @param {string} message - Error message
     * @param {Array} errors - Array of additional error details
     * @param {string} stack - Stack trace string
     */
    constructor(
        statusCode,
        message= "Something went wrong",
        errors = [],
        stack = ""
    ){
        super(message)
        // Set HTTP status code
        this.statusCode = statusCode
        // Initialize data as null
        this.data = null
        this.message = message
        // Mark the response as failed
        this.success = false;
        this.errors = errors

        // Handle stack trace
        if (stack) {
            this.stack = stack
        } else{
            Error.captureStackTrace(this, this.constructor)
        }

    }
}

export {ApiError}