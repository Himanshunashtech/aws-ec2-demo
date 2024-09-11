// apiError.js
class APIError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
        this.isOperational = true;
        
        Error.captureStackTrace(this, this.constructor);
    }
}

class ClientError extends APIError {
    constructor(message) {
        super(message || 'Client Error', 400);
    }
}

class ServerError extends APIError {
    constructor(message) {
        super(message || 'Internal Server Error', 500);
    }
}

export { APIError, ClientError, ServerError };
