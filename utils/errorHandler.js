import { ClientError, ServerError, APIError } from './apiError.js';


// Custom global error handler
const globalErrorHandler = (err, req, res, next) => {
    let error = { ...err };
    error.message = err.message;

    // Handle Mongoose validation errors
    if (err.name === 'ValidationError') {
        const message = Object.values(err.errors).map(val => val.message).join(', ');
        error = new ClientError(message, 400);
    }

    // Handle JSON Web Token errors
    if (err.name === 'JsonWebTokenError') {
        const message = 'Token is invalid. Try again.';
        error = new ClientError(message, 401);
    }

    // Handle token expiration errors
    if (err.name === 'TokenExpiredError') {
        const message = 'Token is expired. Try again.';
        error = new ClientError(message, 401);
    }

    // Handle Multer errors
    
        if (err.name === 'LIMIT_FILE_SIZE') {
            error = new ClientError('File size exceeds the limit.', 400);
            }
        if (err.name === 'LIMIT_UNEXPECTED_FILE') {
            error = new ClientError('Unexpected file upload.', 400);
        } 


    // Handle general server errors
    if (err instanceof APIError) {
        res.status(err.statusCode).json({
            status: err.status,
            message: err.message
        });
    } else {
        // For unknown errors, send a generic server error message
        console.error('Server Error:', err);
        res.status(500).json({
            status: 'error',
            message: 'An unexpected error occurred'
        });
    }
};

export { globalErrorHandler };
