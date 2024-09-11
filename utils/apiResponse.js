
class APIResponse {
    constructor(success, message, data = null) {
        this.success = success;
        this.message = message;
        this.data = data;
    }

    static success(message, data = null) {
        return new APIResponse(true, message, data);
    }

    static failure(message) {
        return new APIResponse(false, message);
    }
}

export {APIResponse};
