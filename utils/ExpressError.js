class ExpressError extends Error {
    constructor(message,statuscoode){
        super();
        this.message = message;
        this.statuscoode = statuscoode;
    }
}

module.exports = ExpressError;